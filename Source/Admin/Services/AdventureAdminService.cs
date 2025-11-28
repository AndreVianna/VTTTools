namespace VttTools.Admin.Services;

public sealed class AdventureAdminService(
    IOptions<PublicLibraryOptions> options,
    ApplicationDbContext dbContext,
    UserManager<User> userManager,
    ILogger<AdventureAdminService> logger)
    : LibraryAdminService(options, dbContext, userManager, logger), IAdventureAdminService {

    public async Task<LibraryContentSearchResponse> SearchAdventuresAsync(
        LibrarySearchRequest request,
        CancellationToken ct = default) {
        try {
            var query = DbContext.Adventures.AsQueryable();

            query = ApplySearchFilters(
                query,
                request,
                MasterUserId,
                a => a.Name,
                a => a.Description,
                a => a.OwnerId,
                a => a.IsPublished,
                a => a.IsPublic);

            var totalCount = await query.CountAsync(ct);

            var (skip, take) = GetPagination(request);

            query = ApplySorting(query, request, a => a.Name);

            var adventures = await query
                .Skip(skip)
                .Take(take + 1)
                .ToListAsync(ct);

            var hasMore = adventures.Count > take;
            if (hasMore) adventures = [.. adventures.Take(take)];

            var owners = await GetOwnerDictionaryAsync(adventures.Select(a => a.OwnerId), ct);

            var content = new List<LibraryContentResponse>();
            foreach (var adventure in adventures) {
                var ownerName = owners.GetValueOrDefault(adventure.OwnerId);
                content.Add(MapToContentResponse(adventure, ownerName));
            }

            Logger.LogInformation(
                "Adventure search completed: {Count} adventures found (Skip: {Skip}, Take: {Take}, Total: {Total})",
                content.Count, skip, take, totalCount);

            return new LibraryContentSearchResponse {
                Content = content.AsReadOnly(),
                TotalCount = totalCount,
                HasMore = hasMore
            };
        }
        catch (Exception ex) {
            Logger.LogError(ex, "Error searching adventures");
            throw;
        }
    }

    public async Task<LibraryContentResponse?> GetAdventureByIdAsync(Guid id, CancellationToken ct = default) {
        try {
            var adventure = await DbContext.Adventures.FindAsync([id], ct);
            if (adventure is null) return null;
            var ownerName = await GetOwnerNameAsync(adventure.OwnerId);
            return MapToContentResponse(adventure, ownerName);
        }
        catch (Exception ex) {
            Logger.LogError(ex, "Error retrieving adventure {AdventureId}", id);
            throw;
        }
    }

    public async Task<LibraryContentResponse> CreateAdventureAsync(
        string name,
        string description,
        CancellationToken ct = default) {
        try {
            ArgumentException.ThrowIfNullOrWhiteSpace(name, nameof(name));

            var adventure = new Adventure {
                OwnerId = MasterUserId,
                Name = name,
                Description = description,
                IsPublished = false,
                IsPublic = false
            };

            DbContext.Adventures.Add(adventure);
            await DbContext.SaveChangesAsync(ct);

            Logger.LogInformation("Created adventure {AdventureId} with name '{Name}'", adventure.Id, adventure.Name);

            var ownerName = await GetOwnerNameAsync(adventure.OwnerId);
            return MapToContentResponse(adventure, ownerName);
        }
        catch (Exception ex) {
            Logger.LogError(ex, "Error creating adventure with name '{Name}'", name);
            throw;
        }
    }

    public async Task<LibraryContentResponse> UpdateAdventureAsync(
        Guid id,
        string? name,
        string? description,
        bool? isPublished,
        bool? isPublic,
        CancellationToken ct = default) {
        try {
            var adventure = await DbContext.Adventures.FindAsync([id], ct) ?? throw new InvalidOperationException($"Adventure with ID {id} not found");

            if (name is not null) adventure.Name = name;
            if (description is not null) adventure.Description = description;
            if (isPublished.HasValue) adventure.IsPublished = isPublished.Value;
            if (isPublic.HasValue) adventure.IsPublic = isPublic.Value;

            await DbContext.SaveChangesAsync(ct);

            Logger.LogInformation("Updated adventure {AdventureId}", id);

            var ownerName = await GetOwnerNameAsync(adventure.OwnerId);
            return MapToContentResponse(adventure, ownerName);
        }
        catch (Exception ex) {
            Logger.LogError(ex, "Error updating adventure {AdventureId}", id);
            throw;
        }
    }

    public async Task DeleteAdventureAsync(Guid id, CancellationToken ct = default) {
        try {
            var adventure = await DbContext.Adventures.FindAsync([id], ct);
            if (adventure is null) {
                Logger.LogWarning("Attempted to delete non-existent adventure {AdventureId}", id);
                return;
            }

            DbContext.Adventures.Remove(adventure);
            await DbContext.SaveChangesAsync(ct);

            Logger.LogInformation("Deleted adventure {AdventureId}", id);
        }
        catch (Exception ex) {
            Logger.LogError(ex, "Error deleting adventure {AdventureId}", id);
            throw;
        }
    }

    public async Task TransferAdventureOwnershipAsync(
        Guid id,
        TransferOwnershipRequest request,
        CancellationToken ct = default) {
        try {
            var adventure = await DbContext.Adventures.FindAsync([id], ct) ?? throw new InvalidOperationException($"Adventure with ID {id} not found");

            var newOwnerId = request.Action.ToLowerInvariant() switch {
                "take" => MasterUserId,
                "grant" => request.TargetUserId ?? throw new InvalidOperationException("TargetUserId is required for 'grant' action"),
                _ => throw new InvalidOperationException($"Invalid action: {request.Action}")
            };

            adventure.OwnerId = newOwnerId;
            await DbContext.SaveChangesAsync(ct);

            Logger.LogInformation(
                "Transferred adventure {AdventureId} ownership to user {UserId} via action '{Action}'",
                id, newOwnerId, request.Action);
        }
        catch (Exception ex) {
            Logger.LogError(ex, "Error transferring ownership of adventure {AdventureId}", id);
            throw;
        }
    }

    public async Task<IReadOnlyList<LibraryContentResponse>> GetEncountersByAdventureIdAsync(
        Guid adventureId,
        CancellationToken ct = default) {
        try {
            var encounters = await DbContext.Encounters
                .Where(e => e.AdventureId == adventureId)
                .ToListAsync(ct);

            var result = encounters.ConvertAll(MapEncounterToContentResponse)
;

            Logger.LogInformation("Retrieved {Count} encounters for adventure {AdventureId}", result.Count, adventureId);
            return result.AsReadOnly();
        }
        catch (Exception ex) {
            Logger.LogError(ex, "Error retrieving encounters for adventure {AdventureId}", adventureId);
            throw;
        }
    }

    public async Task<LibraryContentResponse> CreateEncounterForAdventureAsync(
        Guid adventureId,
        string name,
        string description,
        CancellationToken ct = default) {
        try {
            ArgumentException.ThrowIfNullOrWhiteSpace(name, nameof(name));

            var adventure = await DbContext.Adventures.FindAsync([adventureId], ct)
                ?? throw new KeyNotFoundException($"Adventure with ID {adventureId} not found");

            var encounter = new Encounter {
                AdventureId = adventureId,
                Name = name,
                Description = description,
                IsPublished = false
            };

            DbContext.Encounters.Add(encounter);
            await DbContext.SaveChangesAsync(ct);

            Logger.LogInformation("Created encounter {EncounterId} '{Name}' for adventure {AdventureId}", encounter.Id, name, adventureId);

            return MapEncounterToContentResponse(encounter);
        }
        catch (Exception ex) {
            Logger.LogError(ex, "Error creating encounter for adventure {AdventureId}", adventureId);
            throw;
        }
    }

    public async Task<LibraryContentResponse> CloneEncounterAsync(
        Guid adventureId,
        Guid encounterId,
        string? newName,
        CancellationToken ct = default) {
        try {
            var encounter = await DbContext.Encounters
                .FirstOrDefaultAsync(e => e.Id == encounterId && e.AdventureId == adventureId, ct)
                ?? throw new KeyNotFoundException($"Encounter {encounterId} not found in adventure {adventureId}");

            var clonedEncounter = new Encounter {
                AdventureId = adventureId,
                Name = newName ?? $"{encounter.Name} (Copy)",
                Description = encounter.Description,
                IsPublished = false
            };

            DbContext.Encounters.Add(clonedEncounter);
            await DbContext.SaveChangesAsync(ct);

            Logger.LogInformation("Cloned encounter {EncounterId} to {ClonedId} for adventure {AdventureId}", encounterId, clonedEncounter.Id, adventureId);

            return MapEncounterToContentResponse(clonedEncounter);
        }
        catch (Exception ex) {
            Logger.LogError(ex, "Error cloning encounter {EncounterId} in adventure {AdventureId}", encounterId, adventureId);
            throw;
        }
    }

    public async Task RemoveEncounterFromAdventureAsync(
        Guid adventureId,
        Guid encounterId,
        CancellationToken ct = default) {
        try {
            var encounter = await DbContext.Encounters
                .FirstOrDefaultAsync(e => e.Id == encounterId && e.AdventureId == adventureId, ct)
                ?? throw new KeyNotFoundException($"Encounter {encounterId} not found in adventure {adventureId}");

            DbContext.Encounters.Remove(encounter);
            await DbContext.SaveChangesAsync(ct);

            Logger.LogInformation("Removed encounter {EncounterId} from adventure {AdventureId}", encounterId, adventureId);
        }
        catch (Exception ex) {
            Logger.LogError(ex, "Error removing encounter {EncounterId} from adventure {AdventureId}", encounterId, adventureId);
            throw;
        }
    }

    private static LibraryContentResponse MapToContentResponse(Adventure adventure, string? ownerName)
        => new() {
            Id = adventure.Id,
            OwnerId = adventure.OwnerId,
            OwnerName = ownerName,
            Name = adventure.Name,
            Description = adventure.Description,
            IsPublished = adventure.IsPublished,
            IsPublic = adventure.IsPublic,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = null
    };

    private static LibraryContentResponse MapEncounterToContentResponse(Encounter encounter)
        => new() {
            Id = encounter.Id,
            OwnerId = Guid.Empty,
            OwnerName = null,
            Name = encounter.Name,
            Description = encounter.Description,
            IsPublished = encounter.IsPublished,
            IsPublic = false,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = null
    };
}
