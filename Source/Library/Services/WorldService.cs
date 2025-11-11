namespace VttTools.Library.Services;

/// <summary>
/// Service for managing World templates and their nested Campaigns.
/// </summary>
public class WorldService(IWorldStorage worldStorage, ICampaignStorage campaignStorage, IMediaStorage mediaStorage, ILogger<WorldService> logger)
    : IWorldService {
    /// <inheritdoc />
    public async Task<World[]> GetWorldsAsync(CancellationToken ct = default) {
        try {
            return await worldStorage.GetAllAsync(ct);
        }
        catch (Exception ex) {
            logger.LogError(ex, "Failed to retrieve worlds");
            return [];
        }
    }

    /// <inheritdoc />
    public async Task<World[]> GetWorldsAsync(string filterDefinition, CancellationToken ct = default) {
        try {
            return await worldStorage.GetManyAsync(filterDefinition, ct);
        }
        catch (Exception ex) {
            logger.LogError(ex, "Failed to retrieve worlds with filter: {FilterDefinition}", filterDefinition);
            return [];
        }
    }

    /// <inheritdoc />
    public Task<World?> GetWorldByIdAsync(Guid id, CancellationToken ct = default)
        => worldStorage.GetByIdAsync(id, ct);

    /// <inheritdoc />
    public async Task<Result<World>> CreateWorldAsync(Guid userId, CreateWorldData data, CancellationToken ct = default) {
        var result = data.Validate();
        if (result.HasErrors)
            return result;
        var world = new World {
            OwnerId = userId,
            Name = data.Name,
            Description = data.Description,
            Background = data.BackgroundId.HasValue
                ? await mediaStorage.GetByIdAsync(data.BackgroundId.Value, ct)
                : null,
            IsPublished = data.IsPublished,
            IsPublic = data.IsPublic,
        };
        await worldStorage.AddAsync(world, ct);
        return world;
    }

    /// <inheritdoc />
    public async Task<Result<World>> CloneWorldAsync(Guid userId, Guid templateId, CancellationToken ct = default) {
        var original = await worldStorage.GetByIdAsync(templateId, ct);
        if (original is null)
            return Result.Failure("NotFound");
        if (original.OwnerId != userId && !(original is { IsPublic: true, IsPublished: true }))
            return Result.Failure("NotAllowed");

        var allWorlds = await GetWorldsAsync($"AvailableTo:{userId}", ct);
        var existingNames = allWorlds.Select(e => e.Name);

        var (newOriginalName, cloneName) = NamingHelper.GenerateCloneNames(original.Name, existingNames);

        if (newOriginalName != original.Name && original.OwnerId == userId) {
            var renamedOriginal = original with { Name = newOriginalName };
            await worldStorage.UpdateAsync(renamedOriginal, ct);
        }

        var clone = original.Clone(userId, cloneName);
        await worldStorage.AddAsync(clone, ct);
        return clone;
    }

    /// <inheritdoc />
    public async Task<Result<World>> UpdateWorldAsync(Guid userId, Guid id, UpdatedWorldData data, CancellationToken ct = default) {
        var world = await worldStorage.GetByIdAsync(id, ct);
        if (world is null)
            return Result.Failure("NotFound");
        if (world.OwnerId != userId)
            return Result.Failure("NotAllowed");
        var result = data.Validate();
        if (result.HasErrors)
            return result;
        world = world with {
            Name = data.Name.IsSet ? data.Name.Value : world.Name,
            Description = data.Description.IsSet ? data.Description.Value : world.Description,
            Background = data.BackgroundId.IsSet
                ? data.BackgroundId.Value.HasValue
                    ? await mediaStorage.GetByIdAsync(data.BackgroundId.Value.Value, ct)
                    : null
                : world.Background,
            IsPublished = data.IsPublished.IsSet ? data.IsPublished.Value : world.IsPublished,
            IsPublic = data.IsPublic.IsSet ? data.IsPublic.Value : world.IsPublic,
        };
        await worldStorage.UpdateAsync(world, ct);
        return world;
    }

    /// <inheritdoc />
    public async Task<Result> DeleteWorldAsync(Guid userId, Guid id, CancellationToken ct = default) {
        var world = await worldStorage.GetByIdAsync(id, ct);
        if (world is null)
            return Result.Failure("NotFound");
        if (world.OwnerId != userId)
            return Result.Failure("NotAllowed");
        await worldStorage.DeleteAsync(id, ct);
        return Result.Success();
    }

    /// <inheritdoc />
    public async Task<Campaign[]> GetCampaignsAsync(Guid id, CancellationToken ct = default) {
        var world = await worldStorage.GetByIdAsync(id, ct);
        return world?.Campaigns.ToArray() ?? [];
    }

    /// <inheritdoc />
    public async Task<Result<Campaign>> AddNewCampaignAsync(Guid userId, Guid id, CancellationToken ct = default) {
        var world = await worldStorage.GetByIdAsync(id, ct);
        if (world is null)
            return Result.Failure("NotFound");
        if (world.OwnerId != userId)
            return Result.Failure("NotAllowed");

        var campaign = new Campaign {
            OwnerId = userId,
            World = world,
        };
        var updatedWorld = world with {
            Campaigns = [.. world.Campaigns, campaign]
        };
        await worldStorage.UpdateAsync(updatedWorld, ct);
        return campaign;
    }

    /// <inheritdoc />
    public async Task<Result<Campaign>> AddClonedCampaignAsync(Guid userId, Guid id, Guid templateId, CancellationToken ct = default) {
        var world = await worldStorage.GetByIdAsync(id, ct);
        if (world is null)
            return Result.Failure("NotFound");
        if (world.OwnerId != userId)
            return Result.Failure("NotAllowed");

        var original = await campaignStorage.GetByIdAsync(templateId, ct);
        if (original is null)
            return Result.Failure("NotFound");

        var existingNames = world.Campaigns.Select(c => c.Name);

        var (newOriginalName, cloneName) = NamingHelper.GenerateCloneNames(original.Name, existingNames);

        if (newOriginalName != original.Name && original.OwnerId == userId) {
            var renamedOriginal = original with { Name = newOriginalName };
            await campaignStorage.UpdateAsync(renamedOriginal, ct);
            original = renamedOriginal;
        }

        var clone = original.Clone(userId, cloneName) with { World = world };
        var updatedWorld = world with {
            Campaigns = [.. world.Campaigns, clone]
        };
        await worldStorage.UpdateAsync(updatedWorld, ct);
        return clone;
    }

    /// <inheritdoc />
    public async Task<Result> RemoveCampaignAsync(Guid userId, Guid id, Guid campaignId, CancellationToken ct = default) {
        var world = await worldStorage.GetByIdAsync(id, ct);
        if (world is null)
            return Result.Failure("NotFound");
        if (world.OwnerId != userId)
            return Result.Failure("NotAllowed");

        var campaign = world.Campaigns.FirstOrDefault(c => c.Id == campaignId);
        if (campaign is null)
            return Result.Failure("NotFound");

        var updatedWorld = world with {
            Campaigns = [.. world.Campaigns.Where(c => c.Id != campaignId)]
        };
        await worldStorage.UpdateAsync(updatedWorld, ct);
        return Result.Success();
    }
}
