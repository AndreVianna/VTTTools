using AdventureModel = VttTools.Library.Adventures.Model.Adventure;
using CampaignModel = VttTools.Library.Campaigns.Model.Campaign;

namespace VttTools.Admin.Library.Services;

public sealed class CampaignAdminService(
    IOptions<PublicLibraryOptions> options,
    ICampaignStorage campaignStorage,
    IAdventureStorage adventureStorage,
    UserManager<User> userManager,
    ILogger<CampaignAdminService> logger)
    : LibraryAdminService(options, userManager, logger), ICampaignAdminService {

    public async Task<LibraryContentSearchResponse> SearchCampaignsAsync(
        LibrarySearchRequest request,
        CancellationToken ct = default) {
        try {
            (var skip, var take) = GetPagination(request);
            var filter = new LibrarySearchFilter {
                Search = request.Search,
                OwnerId = request.OwnerId,
                OwnerType = request.OwnerType,
                IsPublished = request.IsPublished,
                IsPublic = request.IsPublic,
                SortBy = request.SortBy,
                SortOrder = request.SortOrder,
                Skip = skip,
                Take = take + 1
            };

            (var campaigns, var totalCount) = await campaignStorage.SearchAsync(MasterUserId, filter, ct);

            var hasMore = campaigns.Length > take;
            if (hasMore)
                campaigns = [.. campaigns.Take(take)];

            var owners = await GetOwnerDictionaryAsync(campaigns.Select(c => c.OwnerId), ct);

            var content = new List<LibraryContentResponse>();
            foreach (var campaign in campaigns) {
                var ownerName = owners.GetValueOrDefault(campaign.OwnerId);
                content.Add(MapToContentResponse(campaign, ownerName));
            }

            Logger.LogInformation(
                "Campaign search completed: {Count} campaigns found (Skip: {Skip}, Take: {Take}, Total: {Total})",
                content.Count, skip, take, totalCount);

            return new LibraryContentSearchResponse {
                Content = content.AsReadOnly(),
                TotalCount = totalCount,
                HasMore = hasMore
            };
        }
        catch (Exception ex) {
            Logger.LogError(ex, "Error searching campaigns");
            throw;
        }
    }

    public async Task<LibraryContentResponse?> GetCampaignByIdAsync(Guid id, CancellationToken ct = default) {
        try {
            var campaign = await campaignStorage.GetByIdAsync(id, ct);
            if (campaign is null)
                return null;
            var ownerName = await GetOwnerNameAsync(campaign.OwnerId);
            return MapToContentResponse(campaign, ownerName);
        }
        catch (Exception ex) {
            Logger.LogError(ex, "Error retrieving campaign {CampaignId}", id);
            throw;
        }
    }

    public async Task<LibraryContentResponse> CreateCampaignAsync(
        string name,
        string description,
        CancellationToken ct = default) {
        try {
            ArgumentException.ThrowIfNullOrWhiteSpace(name, nameof(name));

            var campaign = new CampaignModel {
                Id = Guid.CreateVersion7(),
                OwnerId = MasterUserId,
                Name = name,
                Description = description,
                IsPublished = false,
                IsPublic = false
            };

            await campaignStorage.AddAsync(campaign, ct);

            Logger.LogInformation("Created campaign {CampaignId} with name '{Name}'", campaign.Id, campaign.Name);

            var ownerName = await GetOwnerNameAsync(campaign.OwnerId);
            return MapToContentResponse(campaign, ownerName);
        }
        catch (Exception ex) {
            Logger.LogError(ex, "Error creating campaign with name '{Name}'", name);
            throw;
        }
    }

    public async Task<LibraryContentResponse> UpdateCampaignAsync(
        Guid id,
        string? name,
        string? description,
        bool? isPublished,
        bool? isPublic,
        CancellationToken ct = default) {
        try {
            var campaign = await campaignStorage.GetByIdAsync(id, ct)
                ?? throw new InvalidOperationException($"Campaign with ID {id} not found");

            var updatedCampaign = campaign with {
                Name = name ?? campaign.Name,
                Description = description ?? campaign.Description,
                IsPublished = isPublished ?? campaign.IsPublished,
                IsPublic = isPublic ?? campaign.IsPublic
            };

            await campaignStorage.UpdateAsync(updatedCampaign, ct);

            Logger.LogInformation("Updated campaign {CampaignId}", id);

            var ownerName = await GetOwnerNameAsync(updatedCampaign.OwnerId);
            return MapToContentResponse(updatedCampaign, ownerName);
        }
        catch (Exception ex) {
            Logger.LogError(ex, "Error updating campaign {CampaignId}", id);
            throw;
        }
    }

    public async Task DeleteCampaignAsync(Guid id, CancellationToken ct = default) {
        try {
            var deleted = await campaignStorage.DeleteAsync(id, ct);
            if (!deleted) {
                Logger.LogWarning("Attempted to delete non-existent campaign {CampaignId}", id);
                return;
            }

            Logger.LogInformation("Deleted campaign {CampaignId}", id);
        }
        catch (Exception ex) {
            Logger.LogError(ex, "Error deleting campaign {CampaignId}", id);
            throw;
        }
    }

    public async Task TransferCampaignOwnershipAsync(
        Guid id,
        TransferOwnershipRequest request,
        CancellationToken ct = default) {
        try {
            var campaign = await campaignStorage.GetByIdAsync(id, ct)
                ?? throw new InvalidOperationException($"Campaign with ID {id} not found");

            var newOwnerId = request.Action.ToLowerInvariant() switch {
                "take" => MasterUserId,
                "grant" => request.TargetUserId ?? throw new InvalidOperationException("TargetUserId is required for 'grant' action"),
                _ => throw new InvalidOperationException($"Invalid action: {request.Action}")
            };

            var updatedCampaign = campaign with { OwnerId = newOwnerId };
            await campaignStorage.UpdateAsync(updatedCampaign, ct);

            Logger.LogInformation(
                "Transferred campaign {CampaignId} ownership to user {UserId} via action '{Action}'",
                id, newOwnerId, request.Action);
        }
        catch (Exception ex) {
            Logger.LogError(ex, "Error transferring ownership of campaign {CampaignId}", id);
            throw;
        }
    }

    public async Task<IReadOnlyList<LibraryContentResponse>> GetAdventuresByCampaignIdAsync(
        Guid campaignId,
        CancellationToken ct = default) {
        try {
            var adventures = await adventureStorage.GetByCampaignIdAsync(campaignId, ct);

            var owners = await GetOwnerDictionaryAsync(adventures.Select(a => a.OwnerId), ct);

            var result = new List<LibraryContentResponse>();
            foreach (var adventure in adventures) {
                var ownerName = owners.GetValueOrDefault(adventure.OwnerId);
                result.Add(MapAdventureToContentResponse(adventure, ownerName));
            }

            Logger.LogInformation("Retrieved {Count} adventures for campaign {CampaignId}", result.Count, campaignId);
            return result.AsReadOnly();
        }
        catch (Exception ex) {
            Logger.LogError(ex, "Error retrieving adventures for campaign {CampaignId}", campaignId);
            throw;
        }
    }

    public async Task<LibraryContentResponse> CreateAdventureForCampaignAsync(
        Guid campaignId,
        string name,
        string description,
        CancellationToken ct = default) {
        try {
            ArgumentException.ThrowIfNullOrWhiteSpace(name, nameof(name));

            var campaign = await campaignStorage.GetByIdAsync(campaignId, ct)
                ?? throw new KeyNotFoundException($"Campaign with ID {campaignId} not found");

            var adventure = new AdventureModel {
                Id = Guid.CreateVersion7(),
                OwnerId = campaign.OwnerId,
                Name = name,
                Description = description,
                IsPublished = false,
                IsPublic = false
            };

            await adventureStorage.AddAsync(adventure, ct);

            Logger.LogInformation("Created adventure {AdventureId} '{Name}' for campaign {CampaignId}", adventure.Id, name, campaignId);

            var ownerName = await GetOwnerNameAsync(adventure.OwnerId);
            return MapAdventureToContentResponse(adventure, ownerName);
        }
        catch (Exception ex) {
            Logger.LogError(ex, "Error creating adventure for campaign {CampaignId}", campaignId);
            throw;
        }
    }

    public async Task<LibraryContentResponse> CloneAdventureAsync(
        Guid campaignId,
        Guid adventureId,
        string? newName,
        CancellationToken ct = default) {
        try {
            var adventure = await adventureStorage.GetByIdAsync(adventureId, ct)
                ?? throw new KeyNotFoundException($"Adventure {adventureId} not found");

            var clonedAdventure = adventure with {
                Id = Guid.CreateVersion7(),
                Name = newName ?? $"{adventure.Name} (Copy)",
                IsPublished = false,
                IsPublic = false
            };

            await adventureStorage.AddAsync(clonedAdventure, ct);

            Logger.LogInformation("Cloned adventure {AdventureId} to {ClonedId} for campaign {CampaignId}", adventureId, clonedAdventure.Id, campaignId);

            var ownerName = await GetOwnerNameAsync(clonedAdventure.OwnerId);
            return MapAdventureToContentResponse(clonedAdventure, ownerName);
        }
        catch (Exception ex) {
            Logger.LogError(ex, "Error cloning adventure {AdventureId} in campaign {CampaignId}", adventureId, campaignId);
            throw;
        }
    }

    public async Task RemoveAdventureFromCampaignAsync(
        Guid campaignId,
        Guid adventureId,
        CancellationToken ct = default) {
        try {
            var adventure = await adventureStorage.GetByIdAsync(adventureId, ct)
                ?? throw new KeyNotFoundException($"Adventure {adventureId} not found");

            await adventureStorage.DeleteAsync(adventureId, ct);

            Logger.LogInformation("Removed adventure {AdventureId} from campaign {CampaignId}", adventureId, campaignId);
        }
        catch (Exception ex) {
            Logger.LogError(ex, "Error removing adventure {AdventureId} from campaign {CampaignId}", adventureId, campaignId);
            throw;
        }
    }

    private static LibraryContentResponse MapToContentResponse(CampaignModel campaign, string? ownerName)
        => new() {
            Id = campaign.Id,
            OwnerId = campaign.OwnerId,
            OwnerName = ownerName,
            Name = campaign.Name,
            Description = campaign.Description,
            IsPublished = campaign.IsPublished,
            IsPublic = campaign.IsPublic,
        };

    private static LibraryContentResponse MapAdventureToContentResponse(AdventureModel adventure, string? ownerName)
        => new() {
            Id = adventure.Id,
            OwnerId = adventure.OwnerId,
            OwnerName = ownerName,
            Name = adventure.Name,
            Description = adventure.Description,
            IsPublished = adventure.IsPublished,
            IsPublic = adventure.IsPublic,
        };
}
