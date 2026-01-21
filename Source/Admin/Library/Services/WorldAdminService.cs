namespace VttTools.Admin.Library.Services;

public sealed class WorldAdminService(
    IOptions<PublicLibraryOptions> options,
    IWorldStorage worldStorage,
    ICampaignStorage campaignStorage,
    IUserStorage userStorage,
    ILogger<WorldAdminService> logger)
    : LibraryAdminService(options, userStorage, logger), IWorldAdminService {

    public async Task<LibraryContentSearchResponse> SearchWorldsAsync(
        LibrarySearchRequest request,
        CancellationToken ct = default) {
        try {
            var filter = new LibrarySearchFilter {
                Search = request.Search,
                OwnerId = request.OwnerId,
                OwnerType = request.OwnerType,
                IsPublished = request.IsPublished,
                IsPublic = request.IsPublic,
                SortBy = request.SortBy,
                SortOrder = request.SortOrder,
                Skip = request.Skip ?? 0,
                Take = request.Take ?? 20
            };

            (var worlds, var totalCount) = await worldStorage.SearchAsync(MasterUserId, filter, ct);

            var hasMore = worlds.Length > filter.Take;
            var worldsToReturn = hasMore ? worlds[..filter.Take] : worlds;

            var owners = await GetOwnerDictionaryAsync(worldsToReturn.Select(w => w.OwnerId), ct);

            var content = new List<LibraryContentResponse>();
            foreach (var world in worldsToReturn) {
                var ownerName = owners.GetValueOrDefault(world.OwnerId);
                content.Add(MapToContentResponse(world, ownerName));
            }

            Logger.LogInformation(
                "World search completed: {Count} worlds found (Skip: {Skip}, Take: {Take}, Total: {Total})",
                content.Count, filter.Skip, filter.Take, totalCount);

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
            var world = await worldStorage.GetByIdAsync(id, ct);
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
            var world = new VttTools.Library.Worlds.Model.World {
                OwnerId = MasterUserId,
                Name = name,
                Description = description,
                IsPublished = false,
                IsPublic = false
            };

            await worldStorage.AddAsync(world, ct);

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
            var world = await worldStorage.GetByIdAsync(id, ct) ?? throw new InvalidOperationException($"World with ID {id} not found");

            var updatedWorld = world with {
                Name = name ?? world.Name,
                Description = description ?? world.Description,
                IsPublished = isPublished ?? world.IsPublished,
                IsPublic = isPublic ?? world.IsPublic
            };

            await worldStorage.UpdateAsync(updatedWorld, ct);

            Logger.LogInformation("Updated world {WorldId}", id);
            var ownerName = await GetOwnerNameAsync(updatedWorld.OwnerId);
            return MapToContentResponse(updatedWorld, ownerName);
        }
        catch (Exception ex) {
            Logger.LogError(ex, "Error updating world {WorldId}", id);
            throw;
        }
    }

    public async Task DeleteWorldAsync(Guid id, CancellationToken ct = default) {
        try {
            var deleted = await worldStorage.DeleteAsync(id, ct);
            if (!deleted) {
                Logger.LogWarning("Attempted to delete non-existent world {WorldId}", id);
                return;
            }

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
            var world = await worldStorage.GetByIdAsync(id, ct) ?? throw new InvalidOperationException($"World with ID {id} not found");

            var newOwnerId = request.Action.ToLowerInvariant() switch {
                "take" => MasterUserId,
                "grant" => request.TargetUserId ?? throw new InvalidOperationException("TargetUserId is required for 'grant' action"),
                _ => throw new InvalidOperationException($"Invalid action: {request.Action}")
            };

            var updatedWorld = world with { OwnerId = newOwnerId };
            await worldStorage.UpdateAsync(updatedWorld, ct);

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
            var campaigns = await campaignStorage.GetByWorldIdAsync(worldId, ct);

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

            var world = await worldStorage.GetByIdAsync(worldId, ct)
                ?? throw new KeyNotFoundException($"World with ID {worldId} not found");

            var campaign = new VttTools.Library.Campaigns.Model.Campaign {
                World = new VttTools.Library.Worlds.Model.World { Id = worldId },
                OwnerId = world.OwnerId,
                Name = name,
                Description = description,
                IsPublished = false,
                IsPublic = false
            };

            await campaignStorage.AddAsync(campaign, ct);

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
            var campaign = await campaignStorage.GetByIdAsync(campaignId, ct)
                ?? throw new KeyNotFoundException($"Campaign {campaignId} not found");

            if (campaign.World?.Id != worldId)
                throw new KeyNotFoundException($"Campaign {campaignId} not found in world {worldId}");

            var clonedCampaign = new VttTools.Library.Campaigns.Model.Campaign {
                World = new VttTools.Library.Worlds.Model.World { Id = worldId },
                OwnerId = campaign.OwnerId,
                Name = newName ?? $"{campaign.Name} (Copy)",
                Description = campaign.Description,
                IsPublished = false,
                IsPublic = false
            };

            await campaignStorage.AddAsync(clonedCampaign, ct);

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
            var campaign = await campaignStorage.GetByIdAsync(campaignId, ct)
                ?? throw new KeyNotFoundException($"Campaign {campaignId} not found");

            if (campaign.World?.Id != worldId)
                throw new KeyNotFoundException($"Campaign {campaignId} not found in world {worldId}");

            await campaignStorage.DeleteAsync(campaignId, ct);

            Logger.LogInformation("Removed campaign {CampaignId} from world {WorldId}", campaignId, worldId);
        }
        catch (Exception ex) {
            Logger.LogError(ex, "Error removing campaign {CampaignId} from world {WorldId}", campaignId, worldId);
            throw;
        }
    }

    private static LibraryContentResponse MapToContentResponse(VttTools.Library.Worlds.Model.World world, string? ownerName)
        => new() {
            Id = world.Id,
            OwnerId = world.OwnerId,
            OwnerName = ownerName,
            Name = world.Name,
            Description = world.Description,
            IsPublished = world.IsPublished,
            IsPublic = world.IsPublic,
        };

    private static LibraryContentResponse MapCampaignToContentResponse(VttTools.Library.Campaigns.Model.Campaign campaign, string? ownerName)
        => new() {
            Id = campaign.Id,
            OwnerId = campaign.OwnerId,
            OwnerName = ownerName,
            Name = campaign.Name,
            Description = campaign.Description,
            IsPublished = campaign.IsPublished,
            IsPublic = campaign.IsPublic,
        };
}