namespace VttTools.Library.Services;

/// <summary>
/// Service for managing Campaign templates and their nested Adventures.
/// </summary>
public class CampaignService(ICampaignStorage campaignStorage, IAdventureStorage adventureStorage, IMediaStorage mediaStorage, ILogger<CampaignService> logger)
    : ICampaignService {
    /// <inheritdoc />
    public async Task<Campaign[]> GetCampaignsAsync(CancellationToken ct = default) {
        try {
            return await campaignStorage.GetAllAsync(ct);
        }
        catch (Exception ex) {
            logger.LogError(ex, "Failed to retrieve campaigns");
            return [];
        }
    }

    /// <inheritdoc />
    public async Task<Campaign[]> GetCampaignsAsync(string filterDefinition, CancellationToken ct = default) {
        try {
            return await campaignStorage.GetManyAsync(filterDefinition, ct);
        }
        catch (Exception ex) {
            logger.LogError(ex, "Failed to retrieve campaigns with filter: {FilterDefinition}", filterDefinition);
            return [];
        }
    }

    /// <inheritdoc />
    public Task<Campaign?> GetCampaignByIdAsync(Guid id, CancellationToken ct = default)
        => campaignStorage.GetByIdAsync(id, ct);

    /// <inheritdoc />
    public async Task<Result<Campaign>> CreateCampaignAsync(Guid userId, CreateCampaignData data, CancellationToken ct = default) {
        var result = data.Validate();
        if (result.HasErrors)
            return result;
        var campaign = new Campaign {
            OwnerId = userId,
            World = data.WorldId.HasValue
                        ? new World { Id = data.WorldId.Value }
                        : null,
            Name = data.Name,
            Description = data.Description,
            Background = data.BackgroundId.HasValue
                ? await mediaStorage.FindByIdAsync(data.BackgroundId.Value, ct)
                : null,
            IsPublished = data.IsPublished,
            IsPublic = data.IsPublic,
        };
        await campaignStorage.AddAsync(campaign, ct);
        return campaign;
    }

    /// <inheritdoc />
    public async Task<Result<Campaign>> CloneCampaignAsync(Guid userId, Guid templateId, CancellationToken ct = default) {
        var original = await campaignStorage.GetByIdAsync(templateId, ct);
        if (original is null)
            return Result.Failure("NotFound");
        if (original.OwnerId != userId && !(original is { IsPublic: true, IsPublished: true }))
            return Result.Failure("NotAllowed");

        var allCampaigns = await GetCampaignsAsync($"AvailableTo:{userId}", ct);
        var existingNames = allCampaigns.Select(c => c.Name);

        var (newOriginalName, cloneName) = NamingHelper.GenerateCloneNames(original.Name, existingNames);

        if (newOriginalName != original.Name && original.OwnerId == userId) {
            var renamedOriginal = original with { Name = newOriginalName };
            await campaignStorage.UpdateAsync(renamedOriginal, ct);
        }

        var clone = original.Clone(userId, cloneName);
        await campaignStorage.AddAsync(clone, ct);
        return clone;
    }

    /// <inheritdoc />
    public async Task<Result<Campaign>> UpdateCampaignAsync(Guid userId, Guid id, UpdatedCampaignData data, CancellationToken ct = default) {
        var campaign = await campaignStorage.GetByIdAsync(id, ct);
        if (campaign is null)
            return Result.Failure("NotFound");
        if (campaign.OwnerId != userId)
            return Result.Failure("NotAllowed");
        var result = data.Validate();
        if (result.HasErrors)
            return result;
        campaign = campaign with {
            Name = data.Name.IsSet ? data.Name.Value : campaign.Name,
            Description = data.Description.IsSet ? data.Description.Value : campaign.Description,
            Background = data.BackgroundId.IsSet
                ? data.BackgroundId.Value.HasValue
                    ? await mediaStorage.FindByIdAsync(data.BackgroundId.Value.Value, ct)
                    : null
                : campaign.Background,
            IsPublished = data.IsPublished.IsSet ? data.IsPublished.Value : campaign.IsPublished,
            IsPublic = data.IsPublic.IsSet ? data.IsPublic.Value : campaign.IsPublic,
            World = data.WorldId.IsSet
                        ? data.WorldId.Value.HasValue
                            ? new World { Id = data.WorldId.Value.Value }
                            : null
                        : campaign.World,
        };
        await campaignStorage.UpdateAsync(campaign, ct);
        return campaign;
    }

    /// <inheritdoc />
    public async Task<Result> DeleteCampaignAsync(Guid userId, Guid id, CancellationToken ct = default) {
        var campaign = await campaignStorage.GetByIdAsync(id, ct);
        if (campaign is null)
            return Result.Failure("NotFound");
        if (campaign.OwnerId != userId)
            return Result.Failure("NotAllowed");
        await campaignStorage.DeleteAsync(id, ct);
        return Result.Success();
    }

    /// <inheritdoc />
    public async Task<Adventure[]> GetAdventuresAsync(Guid id, CancellationToken ct = default) {
        var campaign = await campaignStorage.GetByIdAsync(id, ct);
        return campaign?.Adventures.ToArray() ?? [];
    }

    /// <inheritdoc />
    public async Task<Result<Adventure>> AddNewAdventureAsync(Guid userId, Guid id, CancellationToken ct = default) {
        var campaign = await campaignStorage.GetByIdAsync(id, ct);
        if (campaign is null)
            return Result.Failure("NotFound");
        if (campaign.OwnerId != userId)
            return Result.Failure("NotAllowed");

        var adventure = new Adventure {
            OwnerId = userId,
            Campaign = campaign,
        };
        var updatedCampaign = campaign with {
            Adventures = [.. campaign.Adventures, adventure]
        };
        await campaignStorage.UpdateAsync(updatedCampaign, ct);
        return adventure;
    }

    /// <inheritdoc />
    public async Task<Result<Adventure>> AddClonedAdventureAsync(Guid userId, Guid id, Guid templateId, CancellationToken ct = default) {
        var campaign = await campaignStorage.GetByIdAsync(id, ct);
        if (campaign is null)
            return Result.Failure("NotFound");
        if (campaign.OwnerId != userId)
            return Result.Failure("NotAllowed");

        var original = await adventureStorage.GetByIdAsync(templateId, ct);
        if (original is null)
            return Result.Failure("NotFound");

        var existingNames = campaign.Adventures.Select(a => a.Name);

        var (newOriginalName, cloneName) = NamingHelper.GenerateCloneNames(original.Name, existingNames);

        if (newOriginalName != original.Name && original.OwnerId == userId) {
            var renamedOriginal = original with { Name = newOriginalName };
            await adventureStorage.UpdateAsync(renamedOriginal, ct);
            original = renamedOriginal;
        }

        var clone = original.Clone(userId, cloneName) with { Campaign = campaign };
        var updatedCampaign = campaign with {
            Adventures = [.. campaign.Adventures, clone]
        };
        await campaignStorage.UpdateAsync(updatedCampaign, ct);
        return clone;
    }

    /// <inheritdoc />
    public async Task<Result> RemoveAdventureAsync(Guid userId, Guid id, Guid adventureId, CancellationToken ct = default) {
        var campaign = await campaignStorage.GetByIdAsync(id, ct);
        if (campaign is null)
            return Result.Failure("NotFound");
        if (campaign.OwnerId != userId)
            return Result.Failure("NotAllowed");

        var adventure = campaign.Adventures.FirstOrDefault(a => a.Id == adventureId);
        if (adventure is null)
            return Result.Failure("NotFound");

        var updatedCampaign = campaign with {
            Adventures = [.. campaign.Adventures.Where(a => a.Id != adventureId)]
        };
        await campaignStorage.UpdateAsync(updatedCampaign, ct);
        return Result.Success();
    }
}
