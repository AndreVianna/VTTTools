namespace VttTools.Admin.Services;

public sealed class EncounterAdminService(
    IOptions<PublicLibraryOptions> options,
    ApplicationDbContext dbContext,
    UserManager<User> userManager,
    ILogger<EncounterAdminService> logger)
    : LibraryAdminService(options, dbContext, userManager, logger), IEncounterAdminService {

    public async Task<LibraryContentSearchResponse> SearchEncountersAsync(
        LibrarySearchRequest request,
        CancellationToken ct = default) {
        try {
            var query = DbContext.Encounters
                .Include(e => e.Adventure)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(request.Search)) {
                var searchTerm = request.Search.Trim().ToLowerInvariant();
                query = query.Where(e =>
                    e.Name.Contains(searchTerm, StringComparison.CurrentCultureIgnoreCase) ||
                    e.Description.Contains(searchTerm, StringComparison.CurrentCultureIgnoreCase));
            }

            if (request.OwnerId.HasValue)
                query = query.Where(e => e.Adventure.OwnerId == request.OwnerId.Value);

            if (!string.IsNullOrWhiteSpace(request.OwnerType)) {
                var ownerType = request.OwnerType.ToLowerInvariant();
                query = ownerType switch {
                    "master" => query.Where(e => e.Adventure.OwnerId == MasterUserId),
                    "user" => query.Where(e => e.Adventure.OwnerId != MasterUserId),
                    _ => query
                };
            }

            if (request.IsPublished.HasValue)
                query = query.Where(e => e.IsPublished == request.IsPublished.Value);

            var totalCount = await query.CountAsync(ct);

            var (skip, take) = GetPagination(request);

            var sortBy = request.SortBy?.ToLowerInvariant() ?? "name";
            var sortOrder = request.SortOrder?.ToLowerInvariant() ?? "asc";

            query = sortBy switch {
                "name" => sortOrder == "desc"
                    ? query.OrderByDescending(e => e.Name)
                    : query.OrderBy(e => e.Name),
                _ => sortOrder == "desc"
                    ? query.OrderByDescending(e => e.Name)
                    : query.OrderBy(e => e.Name)
            };

            var encounters = await query
                .Skip(skip)
                .Take(take + 1)
                .ToListAsync(ct);

            var hasMore = encounters.Count > take;
            if (hasMore) {
                encounters = [.. encounters.Take(take)];
            }

            var owners = await GetOwnerDictionaryAsync(encounters.Select(e => e.Adventure.OwnerId), ct);

            var content = new List<LibraryContentResponse>();
            foreach (var encounter in encounters) {
                var ownerName = owners.GetValueOrDefault(encounter.Adventure.OwnerId);
                content.Add(MapToContentResponse(encounter, encounter.Adventure.OwnerId, ownerName));
            }

            Logger.LogInformation(
                "Encounter search completed: {Count} encounters found (Skip: {Skip}, Take: {Take}, Total: {Total})",
                content.Count, skip, take, totalCount);

            return new LibraryContentSearchResponse {
                Content = content.AsReadOnly(),
                TotalCount = totalCount,
                HasMore = hasMore
            };
        }
        catch (Exception ex) {
            Logger.LogError(ex, "Error searching encounters");
            throw;
        }
    }

    public async Task<LibraryContentResponse?> GetEncounterByIdAsync(Guid id, CancellationToken ct = default) {
        try {
            var encounter = await DbContext.Encounters
                .Include(e => e.Adventure)
                .FirstOrDefaultAsync(e => e.Id == id, ct);

            if (encounter is null) return null;

            var ownerName = await GetOwnerNameAsync(encounter.Adventure.OwnerId);
            return MapToContentResponse(encounter, encounter.Adventure.OwnerId, ownerName);
        }
        catch (Exception ex) {
            Logger.LogError(ex, "Error retrieving encounter {EncounterId}", id);
            throw;
        }
    }

    public async Task<LibraryContentResponse> CreateEncounterAsync(
        string name,
        string description,
        CancellationToken ct = default) {
        try {
            ArgumentException.ThrowIfNullOrWhiteSpace(name, nameof(name));

            var defaultAdventure = await DbContext.Adventures
                .Where(a => a.OwnerId == MasterUserId)
                .OrderBy(a => a.Name)
                .FirstOrDefaultAsync(ct) ?? throw new InvalidOperationException("No default adventure found for master user");

            var encounter = new Encounter {
                AdventureId = defaultAdventure.Id,
                Name = name,
                Description = description,
                IsPublished = false
            };

            DbContext.Encounters.Add(encounter);
            await DbContext.SaveChangesAsync(ct);

            Logger.LogInformation("Created encounter {EncounterId} with name '{Name}'", encounter.Id, encounter.Name);

            var ownerName = await GetOwnerNameAsync(defaultAdventure.OwnerId);
            return MapToContentResponse(encounter, defaultAdventure.OwnerId, ownerName);
        }
        catch (Exception ex) {
            Logger.LogError(ex, "Error creating encounter with name '{Name}'", name);
            throw;
        }
    }

    public async Task<LibraryContentResponse> UpdateEncounterAsync(
        Guid id,
        string? name,
        string? description,
        bool? isPublished,
        CancellationToken ct = default) {
        try {
            var encounter = await DbContext.Encounters
                .Include(e => e.Adventure)
                .FirstOrDefaultAsync(e => e.Id == id, ct) ?? throw new InvalidOperationException($"Encounter with ID {id} not found");

            if (name is not null) {
                encounter.Name = name;
            }

            if (description is not null) {
                encounter.Description = description;
            }

            if (isPublished.HasValue) {
                encounter.IsPublished = isPublished.Value;
            }

            await DbContext.SaveChangesAsync(ct);

            Logger.LogInformation("Updated encounter {EncounterId}", id);

            var ownerName = await GetOwnerNameAsync(encounter.Adventure.OwnerId);
            return MapToContentResponse(encounter, encounter.Adventure.OwnerId, ownerName);
        }
        catch (Exception ex) {
            Logger.LogError(ex, "Error updating encounter {EncounterId}", id);
            throw;
        }
    }

    public async Task DeleteEncounterAsync(Guid id, CancellationToken ct = default) {
        try {
            var encounter = await DbContext.Encounters.FindAsync([id], ct);
            if (encounter is null) {
                Logger.LogWarning("Attempted to delete non-existent encounter {EncounterId}", id);
                return;
            }

            DbContext.Encounters.Remove(encounter);
            await DbContext.SaveChangesAsync(ct);

            Logger.LogInformation("Deleted encounter {EncounterId}", id);
        }
        catch (Exception ex) {
            Logger.LogError(ex, "Error deleting encounter {EncounterId}", id);
            throw;
        }
    }

    public async Task TransferEncounterOwnershipAsync(
        Guid id,
        TransferOwnershipRequest request,
        CancellationToken ct = default) {
        try {
            var encounter = await DbContext.Encounters
                .Include(e => e.Adventure)
                .FirstOrDefaultAsync(e => e.Id == id, ct) ?? throw new InvalidOperationException($"Encounter with ID {id} not found");

            var newOwnerId = request.Action.ToLowerInvariant() switch {
                "take" => MasterUserId,
                "grant" => request.TargetUserId ?? throw new InvalidOperationException("TargetUserId is required for 'grant' action"),
                _ => throw new InvalidOperationException($"Invalid action: {request.Action}")
            };

            encounter.Adventure.OwnerId = newOwnerId;
            await DbContext.SaveChangesAsync(ct);

            Logger.LogInformation(
                "Transferred encounter {EncounterId} ownership to user {UserId} via action '{Action}'",
                id, newOwnerId, request.Action);
        }
        catch (Exception ex) {
            Logger.LogError(ex, "Error transferring ownership of encounter {EncounterId}", id);
            throw;
        }
    }

    private static LibraryContentResponse MapToContentResponse(Encounter encounter, Guid ownerId, string? ownerName)
        => new() {
            Id = encounter.Id,
            OwnerId = ownerId,
            OwnerName = ownerName,
            Name = encounter.Name,
            Description = encounter.Description,
            IsPublished = encounter.IsPublished,
            IsPublic = false,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = null
        };
}
