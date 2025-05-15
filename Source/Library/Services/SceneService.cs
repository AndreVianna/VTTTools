namespace VttTools.Library.Services;

public class SceneService(ISceneStorage sceneStorage, IAssetStorage assetStorage)
    : ISceneService {
    /// <inheritdoc />
    public Task<Scene[]> GetScenesAsync(CancellationToken ct = default)
        => sceneStorage.GetAllAsync(ct);

    /// <inheritdoc />
    public Task<Scene?> GetSceneByIdAsync(Guid id, CancellationToken ct = default)
        => sceneStorage.GetByIdAsync(id, ct);

    /// <inheritdoc />
    public async Task<Result<Scene>> UpdateSceneAsync(Guid userId, Guid id, UpdateSceneData data, CancellationToken ct = default) {
        var scene = await sceneStorage.GetByIdAsync(id, ct);
        if (scene is null) return Result.Failure("NotFound");
        if (scene.OwnerId != userId) return Result.Failure("NotAllowed");
        var result = data.Validate();
        if (result.HasErrors) return result;
        if (data.AdventureId.IsSet) scene.AdventureId = data.AdventureId.Value;
        if (data.Name.IsSet) scene.Name = data.Name.Value;
        if (data.Description.IsSet) scene.Description = data.Description.Value;
        if (data.Stage.IsSet) scene.Stage = data.Stage.Value;
        if (data.IsListed.IsSet) scene.IsListed = data.IsListed.Value;
        if (data.IsPublic.IsSet) scene.IsPublic = data.IsPublic.Value;
        await sceneStorage.UpdateAsync(scene, ct);
        return scene;
    }

    /// <inheritdoc />
    public async Task<SceneAsset[]> GetAssetsAsync(Guid id, CancellationToken ct = default) {
        var scene = await sceneStorage.GetByIdAsync(id, ct);
        return scene?.SceneAssets.ToArray() ?? [];
    }

    /// <inheritdoc />
    public async Task<Result<SceneAsset>> AddNewAssetAsync(Guid userId, Guid id, AddNewAssetData data, CancellationToken ct = default) {
        var scene = await sceneStorage.GetByIdAsync(id, ct);
        if (scene is null) return Result.Failure("NotFound");
        if (scene.OwnerId != userId) return Result.Failure("NotAllowed");
        var result = data.Validate();
        if (result.HasErrors) return result;
        var asset = new Asset {
            OwnerId = userId,
            Name = data.Name,
            Type = data.Type,
            Description = data.Description,
            Display = data.Display,
        };
        await assetStorage.AddAsync(asset, ct);
        var sceneAsset = new SceneAsset {
            SceneId = scene.Id,
            AssetId = asset.Id,
            Number = 1,
            Name = data.Name,
            Position = data.Position,
            Scale = data.Scale,
            ControlledBy = userId,
        };
        scene.SceneAssets.Add(sceneAsset);
        await sceneStorage.UpdateAsync(scene, ct);
        return sceneAsset;
    }

    public async Task<Result<SceneAsset>> AddAssetAsync(Guid userId, Guid id, AddAssetData data, CancellationToken ct = default) {
        var scene = await sceneStorage.GetByIdAsync(id, ct);
        if (scene is null) return Result.Failure("NotFound");
        if (scene.OwnerId != userId) return Result.Failure("NotAllowed");
        var asset = await assetStorage.GetByIdAsync(data.AssetId, ct);
        if (asset is null) return Result.Failure("NotFound");
        if (asset.OwnerId != userId || asset is { IsPublic: true, IsListed: true }) return Result.Failure("NotAllowed");
        var result = data.Validate();
        if (result.HasErrors) return result;
        var sceneAsset = new SceneAsset {
            SceneId = scene.Id,
            AssetId = asset.Id,
            Number = scene.SceneAssets.Where(sa => sa.AssetId == asset.Id).Max(sa => sa.Number) + 1,
            Name = data.Name.IsSet ? data.Name.Value : asset.Name,
            Display = data.Display.IsSet ? data.Display.Value : asset.Display,
            Position = data.Position.IsSet ? data.Position.Value : new(),
            Scale = data.Scale.IsSet ? data.Scale.Value : 1.0d,
            ControlledBy = userId,
        };
        scene.SceneAssets.Add(sceneAsset);
        await sceneStorage.UpdateAsync(scene, ct);
        return sceneAsset;
    }

    public async Task<Result<SceneAsset>> AddClonedAssetAsync(Guid userId, Guid id, AddClonedAssetData data, CancellationToken ct = default) {
        var scene = await sceneStorage.GetByIdAsync(id, ct);
        if (scene is null) return Result.Failure("NotFound");
        if (scene.OwnerId != userId) return Result.Failure("NotAllowed");
        var original = await assetStorage.GetByIdAsync(data.TemplateId, ct);
        if (original is null) return Result.Failure("NotFound");
        if (original.OwnerId != userId || original is { IsPublic: true, IsListed: true }) return Result.Failure("NotAllowed");
        var result = data.Validate();
        if (result.HasErrors) return result;
        var clone = Cloner.CloneAsset(original, userId, data);
        await assetStorage.AddAsync(clone, ct);
        var sceneAsset = new SceneAsset {
            SceneId = scene.Id,
            AssetId = clone.Id,
            Number = 1,
            Name = clone.Name,
            Display = clone.Display,
            Position = data.Position.IsSet ? data.Position.Value : new(),
            Scale = data.Scale.IsSet ? data.Scale.Value : 1.0d,
            ControlledBy = userId,
        };
        scene.SceneAssets.Add(sceneAsset);
        await sceneStorage.UpdateAsync(scene, ct);
        return sceneAsset;
    }

    /// <inheritdoc />
    public async Task<Result<SceneAsset>> UpdateAssetAsync(Guid userId, Guid id, UpdateSceneAssetData data, CancellationToken ct = default) {
        var scene = await sceneStorage.GetByIdAsync(id, ct);
        if (scene is null) return Result.Failure("NotFound");
        if (scene.OwnerId != userId) return Result.Failure("NotAllowed");
        var sceneAsset = scene.SceneAssets.FirstOrDefault(a => a.AssetId == data.AssetId && a.Number == data.Number);
        if (sceneAsset == null) return Result.Failure("NotFound");
        var result = data.Validate();
        if (result.HasErrors) return result;
        if (data.Name.IsSet) sceneAsset.Name = data.Name.Value;
        if (data.Position.IsSet) sceneAsset.Position = data.Position.Value;
        if (data.Scale.IsSet) sceneAsset.Scale = data.Scale.Value;
        if (data.IsLocked.IsSet) sceneAsset.IsLocked = data.IsLocked.Value;
        if (data.ControlledBy.IsSet) sceneAsset.ControlledBy = data.ControlledBy.Value;
        await sceneStorage.UpdateAsync(scene, ct);
        return sceneAsset;
    }

    /// <inheritdoc />
    public async Task<Result> RemoveAssetAsync(Guid userId, Guid id, Guid assetId, uint number, CancellationToken ct = default) {
        var scene = await sceneStorage.GetByIdAsync(id, ct);
        if (scene is null) return Result.Failure("NotFound");
        if (scene.OwnerId != userId) return Result.Failure("NotAllowed");
        scene.SceneAssets.RemoveAll(a => a.AssetId == assetId && a.Number == number);
        await sceneStorage.UpdateAsync(scene, ct);
        return Result.Success();
    }
}