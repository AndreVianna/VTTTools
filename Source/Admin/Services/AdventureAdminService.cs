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
}
