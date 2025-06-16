namespace VttTools.Library.Services;

/// <summary>
/// Implements IAdventureService using EF Core storage.
/// </summary>
public class AdventureService(IAdventureStorage adventureStorage, ISceneStorage sceneStorage, IMediaStorage mediaStorage)
    : IAdventureService {
    /// <inheritdoc />
    public async Task<Adventure[]> GetAdventuresAsync(CancellationToken ct = default) {
        try {
            return await adventureStorage.GetAllAsync(ct);
        }
        catch (Exception ex) {
            Console.WriteLine(ex);
            return [];
        }
    }

    /// <inheritdoc />
    public async Task<Adventure[]> GetAdventuresAsync(string filterDefinition, CancellationToken ct = default) {
        try {
            return await adventureStorage.GetManyAsync(filterDefinition, ct);
        }
        catch (Exception ex) {
            Console.WriteLine(ex);
            return [];
        }
    }

    /// <inheritdoc />
    public Task<Adventure?> GetAdventureByIdAsync(Guid id, CancellationToken ct = default)
        => adventureStorage.GetByIdAsync(id, ct);

    private static readonly Resource _defaultAssetDisplay = new() {
        Type = ResourceType.Image,
        Path = "assets/default-asset-display",
        Metadata = new ResourceMetadata {
            ContentType = "image/png",
            ImageSize = new(50, 50),
        },
    };

    /// <inheritdoc />
    public async Task<Result<Adventure>> CreateAdventureAsync(Guid userId, CreateAdventureData data, CancellationToken ct = default) {
        var result = data.Validate();
        if (result.HasErrors)
            return result;
        var adventure = new Adventure {
            OwnerId = userId,
            CampaignId = data.CampaignId,
            Name = data.Name,
            Description = data.Description,
            Type = data.Type,
            Background = data.BackgroundId is not null
                ? await mediaStorage.GetByIdAsync(data.BackgroundId.Value, ct) ?? _defaultAssetDisplay
                : _defaultAssetDisplay,
        };
        await adventureStorage.AddAsync(adventure, ct);
        return adventure;
    }

    /// <inheritdoc />
    public async Task<Result<Adventure>> CloneAdventureAsync(Guid userId, Guid templateId, CancellationToken ct = default) {
        var original = await adventureStorage.GetByIdAsync(templateId, ct);
        if (original is null)
            return Result.Failure("NotFound");
        if (original.OwnerId != userId || original is { IsPublic: true, IsPublished: true })
            return Result.Failure("NotAllowed");
        var clone = original.Clone(userId);
        await adventureStorage.AddAsync(clone, ct);
        return clone;
    }

    /// <inheritdoc />
    public async Task<Result<Adventure>> UpdateAdventureAsync(Guid userId, Guid id, UpdatedAdventureData data, CancellationToken ct = default) {
        var adventure = await adventureStorage.GetByIdAsync(id, ct);
        if (adventure is null)
            return Result.Failure("NotFound");
        if (adventure.OwnerId != userId)
            return Result.Failure("NotAllowed");
        var result = data.Validate();
        if (result.HasErrors)
            return result;
        adventure = adventure with {
            Name = data.Name.IsSet ? data.Name.Value : adventure.Name,
            Description = data.Description.IsSet ? data.Description.Value : adventure.Description,
            Type = data.Type.IsSet ? data.Type.Value : adventure.Type,
            Background = data.BackgroundId.IsSet
                ? await mediaStorage.GetByIdAsync(data.BackgroundId.Value, ct) ?? adventure.Background
                : adventure.Background,
            IsPublished = data.IsListed.IsSet ? data.IsListed.Value : adventure.IsPublished,
            IsPublic = data.IsPublic.IsSet ? data.IsPublic.Value : adventure.IsPublic,
            CampaignId = data.CampaignId.IsSet ? data.CampaignId.Value : adventure.CampaignId,
        };
        await adventureStorage.UpdateAsync(adventure, ct);
        return adventure;
    }

    /// <inheritdoc />
    public async Task<Result> DeleteAdventureAsync(Guid userId, Guid id, CancellationToken ct = default) {
        var adventure = await adventureStorage.GetByIdAsync(id, ct);
        if (adventure is null)
            return Result.Failure("NotFound");
        if (adventure.OwnerId != userId)
            return Result.Failure("NotAllowed");
        await adventureStorage.DeleteAsync(id, ct);
        return Result.Success();
    }

    /// <inheritdoc />
    public Task<Scene[]> GetScenesAsync(Guid id, CancellationToken ct = default)
        => sceneStorage.GetByParentIdAsync(id, ct);

    /// <inheritdoc />
    public async Task<Result<Scene>> AddNewSceneAsync(Guid userId, Guid id, CancellationToken ct = default) {
        var adventure = await adventureStorage.GetByIdAsync(id, ct);
        if (adventure is null)
            return Result.Failure("NotFound");
        if (adventure.OwnerId != userId)
            return Result.Failure("NotAllowed");
        var scene = new Scene();
        await sceneStorage.AddAsync(scene, id, ct);
        return scene;
    }

    /// <inheritdoc />
    public async Task<Result<Scene>> AddClonedSceneAsync(Guid userId, Guid id, Guid templateId, CancellationToken ct = default) {
        var adventure = await adventureStorage.GetByIdAsync(id, ct);
        if (adventure is null)
            return Result.Failure("NotFound");
        if (adventure.OwnerId != userId)
            return Result.Failure("NotAllowed");
        var original = await sceneStorage.GetByIdAsync(templateId, ct);
        if (original is null)
            return Result.Failure("NotFound");
        var clone = original.Clone();
        await sceneStorage.AddAsync(clone, id, ct);
        return clone;
    }

    /// <inheritdoc />
    public async Task<Result> RemoveSceneAsync(Guid userId, Guid id, Guid sceneId, CancellationToken ct = default) {
        var adventure = await adventureStorage.GetByIdAsync(id, ct);
        if (adventure is null)
            return Result.Failure("NotFound");
        if (adventure.OwnerId != userId)
            return Result.Failure("NotAllowed");
        await sceneStorage.DeleteAsync(sceneId, ct);
        return Result.Success();
    }
}