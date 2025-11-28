namespace VttTools.Admin.Services;

public sealed class CampaignAdminService(
    IOptions<PublicLibraryOptions> options,
    ApplicationDbContext dbContext,
    UserManager<User> userManager,
    ILogger<CampaignAdminService> logger)
    : LibraryAdminService(options, dbContext, userManager, logger), ICampaignAdminService {

    public async Task<LibraryContentSearchResponse> SearchCampaignsAsync(
        LibrarySearchRequest request,
        CancellationToken ct = default) {
        try {
            var query = DbContext.Campaigns.AsQueryable();

            query = ApplySearchFilters(
                query,
                request,
                MasterUserId,
                c => c.Name,
                c => c.Description,
                c => c.OwnerId,
                c => c.IsPublished,
                c => c.IsPublic);

            var totalCount = await query.CountAsync(ct);

            var (skip, take) = GetPagination(request);

            query = ApplySorting(query, request, c => c.Name);

            var campaigns = await query
                .Skip(skip)
                .Take(take + 1)
                .ToListAsync(ct);

            var hasMore = campaigns.Count > take;
            if (hasMore) {
                campaigns = [.. campaigns.Take(take)];
            }

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
            var campaign = await DbContext.Campaigns.FindAsync([id], ct);
            if (campaign is null) return null;
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
            var campaign = new Campaign {
                OwnerId = MasterUserId,
                Name = name,
                Description = description,
                IsPublished = false,
                IsPublic = false
            };

            DbContext.Campaigns.Add(campaign);
            await DbContext.SaveChangesAsync(ct);

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
            var campaign = await DbContext.Campaigns.FindAsync([id], ct) ?? throw new InvalidOperationException($"Campaign with ID {id} not found");

            if (name is not null) campaign.Name = name;
            if (description is not null) campaign.Description = description;
            if (isPublished.HasValue) campaign.IsPublished = isPublished.Value;
            if (isPublic.HasValue) campaign.IsPublic = isPublic.Value;

            await DbContext.SaveChangesAsync(ct);

            Logger.LogInformation("Updated campaign {CampaignId}", id);

            var ownerName = await GetOwnerNameAsync(campaign.OwnerId);
            return MapToContentResponse(campaign, ownerName);
        }
        catch (Exception ex) {
            Logger.LogError(ex, "Error updating campaign {CampaignId}", id);
            throw;
        }
    }

    public async Task DeleteCampaignAsync(Guid id, CancellationToken ct = default) {
        try {
            var campaign = await DbContext.Campaigns.FindAsync([id], ct);
            if (campaign is null) {
                Logger.LogWarning("Attempted to delete non-existent campaign {CampaignId}", id);
                return;
            }

            DbContext.Campaigns.Remove(campaign);
            await DbContext.SaveChangesAsync(ct);

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
            var campaign = await DbContext.Campaigns.FindAsync([id], ct) ?? throw new InvalidOperationException($"Campaign with ID {id} not found");

            var newOwnerId = request.Action.ToLowerInvariant() switch {
                "take" => MasterUserId,
                "grant" => request.TargetUserId ?? throw new InvalidOperationException("TargetUserId is required for 'grant' action"),
                _ => throw new InvalidOperationException($"Invalid action: {request.Action}")
            };

            campaign.OwnerId = newOwnerId;
            await DbContext.SaveChangesAsync(ct);

            Logger.LogInformation(
                "Transferred campaign {CampaignId} ownership to user {UserId} via action '{Action}'",
                id, newOwnerId, request.Action);
        }
        catch (Exception ex) {
            Logger.LogError(ex, "Error transferring ownership of campaign {CampaignId}", id);
            throw;
        }
    }

    private static LibraryContentResponse MapToContentResponse(Campaign campaign, string? ownerName)
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
