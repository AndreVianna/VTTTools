namespace VttTools.Admin.Services;

public sealed class WorldAdminService(
    IOptions<PublicLibraryOptions> options,
    ApplicationDbContext dbContext,
    UserManager<User> userManager,
    ILogger<WorldAdminService> logger)
    : LibraryAdminService(options, dbContext, userManager, logger), IWorldAdminService {

    public async Task<LibraryContentSearchResponse> SearchWorldsAsync(
        LibrarySearchRequest request,
        CancellationToken ct = default) {
        try {
            var query = DbContext.Worlds.AsQueryable();

            query = ApplySearchFilters(
                query,
                request,
                MasterUserId,
                w => w.Name,
                w => w.Description,
                w => w.OwnerId,
                w => w.IsPublished,
                w => w.IsPublic);

            var totalCount = await query.CountAsync(ct);

            var (skip, take) = GetPagination(request);

            query = ApplySorting(query, request, w => w.Name);

            var worlds = await query
                .Skip(skip)
                .Take(take + 1)
                .ToListAsync(ct);

            var hasMore = worlds.Count > take;
            if (hasMore)
                worlds = [.. worlds.Take(take)];

            var owners = await GetOwnerDictionaryAsync(worlds.Select(w => w.OwnerId), ct);

            var content = new List<LibraryContentResponse>();
            foreach (var world in worlds) {
                var ownerName = owners.GetValueOrDefault(world.OwnerId);
                content.Add(MapToContentResponse(world, ownerName));
            }

            Logger.LogInformation(
                "World search completed: {Count} worlds found (Skip: {Skip}, Take: {Take}, Total: {Total})",
                content.Count, skip, take, totalCount);

            return new LibraryContentSearchResponse {
                Content = content.AsReadOnly(),
                TotalCount = totalCount,
                HasMore = hasMore
            };
        }
        catch (Exception ex) {
            Logger.LogError(ex, "Error searching worlds");
            throw;
        }
    }

    public async Task<LibraryContentResponse?> GetWorldByIdAsync(Guid id, CancellationToken ct = default) {
        try {
            var world = await DbContext.Worlds.FindAsync([id], ct);
            if (world is null)
                return null;
            var ownerName = await GetOwnerNameAsync(world.OwnerId);
            return MapToContentResponse(world, ownerName);
        }
        catch (Exception ex) {
            Logger.LogError(ex, "Error retrieving world {WorldId}", id);
            throw;
        }
    }

    public async Task<LibraryContentResponse> CreateWorldAsync(
        string name,
        string description,
        CancellationToken ct = default) {
        try {
            ArgumentException.ThrowIfNullOrWhiteSpace(name, nameof(name));
            var world = new World {
                OwnerId = MasterUserId,
                Name = name,
                Description = description,
                IsPublished = false,
                IsPublic = false
            };

            DbContext.Worlds.Add(world);
            await DbContext.SaveChangesAsync(ct);

            Logger.LogInformation("Created world {WorldId} with name '{Name}'", world.Id, world.Name);

            var ownerName = await GetOwnerNameAsync(world.OwnerId);
            return MapToContentResponse(world, ownerName);
        }
        catch (Exception ex) {
            Logger.LogError(ex, "Error creating world with name '{Name}'", name);
            throw;
        }
    }

    public async Task<LibraryContentResponse> UpdateWorldAsync(
        Guid id,
        string? name,
        string? description,
        bool? isPublished,
        bool? isPublic,
        CancellationToken ct = default) {
        try {
            var world = await DbContext.Worlds.FindAsync([id], ct) ?? throw new InvalidOperationException($"World with ID {id} not found");
            if (name is not null)
                world.Name = name;
            if (description is not null)
                world.Description = description;
            if (isPublished.HasValue)
                world.IsPublished = isPublished.Value;
            if (isPublic.HasValue)
                world.IsPublic = isPublic.Value;

            await DbContext.SaveChangesAsync(ct);

            Logger.LogInformation("Updated world {WorldId}", id);
            var ownerName = await GetOwnerNameAsync(world.OwnerId);
            return MapToContentResponse(world, ownerName);
        }
        catch (Exception ex) {
            Logger.LogError(ex, "Error updating world {WorldId}", id);
            throw;
        }
    }

    public async Task DeleteWorldAsync(Guid id, CancellationToken ct = default) {
        try {
            var world = await DbContext.Worlds.FindAsync([id], ct);
            if (world is null) {
                Logger.LogWarning("Attempted to delete non-existent world {WorldId}", id);
                return;
            }

            DbContext.Worlds.Remove(world);
            await DbContext.SaveChangesAsync(ct);

            Logger.LogInformation("Deleted world {WorldId}", id);
        }
        catch (Exception ex) {
            Logger.LogError(ex, "Error deleting world {WorldId}", id);
            throw;
        }
    }

    public async Task TransferWorldOwnershipAsync(
        Guid id,
        TransferOwnershipRequest request,
        CancellationToken ct = default) {
        try {
            var world = await DbContext.Worlds.FindAsync([id], ct) ?? throw new InvalidOperationException($"World with ID {id} not found");

            var newOwnerId = request.Action.ToLowerInvariant() switch {
                "take" => MasterUserId,
                "grant" => request.TargetUserId ?? throw new InvalidOperationException("TargetUserId is required for 'grant' action"),
                _ => throw new InvalidOperationException($"Invalid action: {request.Action}")
            };

            world.OwnerId = newOwnerId;
            await DbContext.SaveChangesAsync(ct);

            Logger.LogInformation(
                "Transferred world {WorldId} ownership to user {UserId} via action '{Action}'",
                id, newOwnerId, request.Action);
        }
        catch (Exception ex) {
            Logger.LogError(ex, "Error transferring ownership of world {WorldId}", id);
            throw;
        }
    }

    public async Task<IReadOnlyList<LibraryContentResponse>> GetCampaignsByWorldIdAsync(
        Guid worldId,
        CancellationToken ct = default) {
        try {
            var campaigns = await DbContext.Campaigns
                .Where(c => c.WorldId == worldId)
                .ToListAsync(ct);

            var owners = await GetOwnerDictionaryAsync(campaigns.Select(c => c.OwnerId), ct);

            var result = new List<LibraryContentResponse>();
            foreach (var campaign in campaigns) {
                var ownerName = owners.GetValueOrDefault(campaign.OwnerId);
                result.Add(MapCampaignToContentResponse(campaign, ownerName));
            }

            Logger.LogInformation("Retrieved {Count} campaigns for world {WorldId}", result.Count, worldId);
            return result.AsReadOnly();
        }
        catch (Exception ex) {
            Logger.LogError(ex, "Error retrieving campaigns for world {WorldId}", worldId);
            throw;
        }
    }

    public async Task<LibraryContentResponse> CreateCampaignForWorldAsync(
        Guid worldId,
        string name,
        string description,
        CancellationToken ct = default) {
        try {
            ArgumentException.ThrowIfNullOrWhiteSpace(name, nameof(name));

            var world = await DbContext.Worlds.FindAsync([worldId], ct)
                ?? throw new KeyNotFoundException($"World with ID {worldId} not found");

            var campaign = new Campaign {
                WorldId = worldId,
                OwnerId = world.OwnerId,
                Name = name,
                Description = description,
                IsPublished = false,
                IsPublic = false
            };

            DbContext.Campaigns.Add(campaign);
            await DbContext.SaveChangesAsync(ct);

            Logger.LogInformation("Created campaign {CampaignId} '{Name}' for world {WorldId}", campaign.Id, name, worldId);

            var ownerName = await GetOwnerNameAsync(campaign.OwnerId);
            return MapCampaignToContentResponse(campaign, ownerName);
        }
        catch (Exception ex) {
            Logger.LogError(ex, "Error creating campaign for world {WorldId}", worldId);
            throw;
        }
    }

    public async Task<LibraryContentResponse> CloneCampaignAsync(
        Guid worldId,
        Guid campaignId,
        string? newName,
        CancellationToken ct = default) {
        try {
            var campaign = await DbContext.Campaigns
                .FirstOrDefaultAsync(c => c.Id == campaignId && c.WorldId == worldId, ct)
                ?? throw new KeyNotFoundException($"Campaign {campaignId} not found in world {worldId}");

            var clonedCampaign = new Campaign {
                WorldId = worldId,
                OwnerId = campaign.OwnerId,
                Name = newName ?? $"{campaign.Name} (Copy)",
                Description = campaign.Description,
                IsPublished = false,
                IsPublic = false
            };

            DbContext.Campaigns.Add(clonedCampaign);
            await DbContext.SaveChangesAsync(ct);

            Logger.LogInformation("Cloned campaign {CampaignId} to {ClonedId} for world {WorldId}", campaignId, clonedCampaign.Id, worldId);

            var ownerName = await GetOwnerNameAsync(clonedCampaign.OwnerId);
            return MapCampaignToContentResponse(clonedCampaign, ownerName);
        }
        catch (Exception ex) {
            Logger.LogError(ex, "Error cloning campaign {CampaignId} in world {WorldId}", campaignId, worldId);
            throw;
        }
    }

    public async Task RemoveCampaignFromWorldAsync(
        Guid worldId,
        Guid campaignId,
        CancellationToken ct = default) {
        try {
            var campaign = await DbContext.Campaigns
                .FirstOrDefaultAsync(c => c.Id == campaignId && c.WorldId == worldId, ct)
                ?? throw new KeyNotFoundException($"Campaign {campaignId} not found in world {worldId}");

            DbContext.Campaigns.Remove(campaign);
            await DbContext.SaveChangesAsync(ct);

            Logger.LogInformation("Removed campaign {CampaignId} from world {WorldId}", campaignId, worldId);
        }
        catch (Exception ex) {
            Logger.LogError(ex, "Error removing campaign {CampaignId} from world {WorldId}", campaignId, worldId);
            throw;
        }
    }

    private static LibraryContentResponse MapToContentResponse(World world, string? ownerName)
        => new() {
            Id = world.Id,
            OwnerId = world.OwnerId,
            OwnerName = ownerName,
            Name = world.Name,
            Description = world.Description,
            IsPublished = world.IsPublished,
            IsPublic = world.IsPublic,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = null
        };

    private static LibraryContentResponse MapCampaignToContentResponse(Campaign campaign, string? ownerName)
        => new() {
            Id = campaign.Id,
            OwnerId = campaign.OwnerId,
            OwnerName = ownerName,
            Name = campaign.Name,
            Description = campaign.Description,
            IsPublished = campaign.IsPublished,
            IsPublic = campaign.IsPublic,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = null
        };
}