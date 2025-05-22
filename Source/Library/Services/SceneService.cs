using UpdateAssetData = VttTools.Library.Scenes.ServiceContracts.UpdateAssetData;

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
        var result = data.Validate();
        if (result.HasErrors) return result;
        scene = scene with {
            Name = data.Name.IsSet ? data.Name.Value : scene.Name,
            Description = data.Description.IsSet ? data.Description.Value : scene.Description,
            Stage = data.Stage.IsSet ? data.Stage.Value : scene.Stage,
        };
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
        var result = data.Validate();
        if (result.HasErrors) return result;
        var asset = new Asset {
            OwnerId = userId,
            Name = data.Name,
            Type = data.Type,
            Description = data.Description,
            Shape = data.Shape,
        };
        await assetStorage.AddAsync(asset, ct);
        var sceneAsset = new SceneAsset {
            Id = asset.Id,
            Number = 1,
            Name = data.Name,
            Position = data.Position,
            Scale = data.Scale,
            Rotation = data.Rotation,
            Elevation = data.Elevation,
            ControlledBy = userId,
        };
        scene.SceneAssets.Add(sceneAsset);
        await sceneStorage.UpdateAsync(scene, ct);
        return sceneAsset;
    }

    public async Task<Result<SceneAsset>> AddAssetAsync(Guid userId, Guid id, AddAssetData data, CancellationToken ct = default) {
        var scene = await sceneStorage.GetByIdAsync(id, ct);
        if (scene is null) return Result.Failure("NotFound");
        var asset = await assetStorage.GetByIdAsync(data.AssetId, ct);
        if (asset is null) return Result.Failure("NotFound");
        if (asset.OwnerId != userId || asset is { IsPublic: true, IsPublished: true }) return Result.Failure("NotAllowed");
        var result = data.Validate();
        if (result.HasErrors) return result;
        var sceneAsset = new SceneAsset {
            Number = scene.SceneAssets.Where(sa => sa.Id == asset.Id).Max(sa => sa.Number) + 1,
            Name = data.Name.IsSet ? data.Name.Value : asset.Name,
            Shape = asset.Shape,
            Position = data.Position.IsSet ? data.Position.Value : new(),
            Scale = data.Scale.IsSet ? data.Scale.Value : new(),
            Rotation = data.Rotation.IsSet ? data.Rotation.Value : 0f,
            Elevation = data.Elevation.IsSet ? data.Elevation.Value : 0f,
            ControlledBy = userId,
        };
        scene.SceneAssets.Add(sceneAsset);
        await sceneStorage.UpdateAsync(scene, ct);
        return sceneAsset;
    }

    public async Task<Result<SceneAsset>> AddClonedAssetAsync(Guid userId, Guid id, Guid templateId, AddClonedAssetData data, CancellationToken ct = default) {
        var scene = await sceneStorage.GetByIdAsync(id, ct);
        if (scene is null) return Result.Failure("NotFound");
        var original = await assetStorage.GetByIdAsync(templateId, ct);
        if (original is null) return Result.Failure("NotFound");
        if (original.OwnerId != userId || original is { IsPublic: true, IsPublished: true }) return Result.Failure("NotAllowed");
        var result = data.Validate();
        if (result.HasErrors) return result;
        var clone = Cloner.CloneAsset(original, userId, data);
        await assetStorage.AddAsync(clone, ct);
        var sceneAsset = new SceneAsset {
            Id = clone.Id,
            Number = 1,
            Name = clone.Name,
            Shape = clone.Shape,
            Position = data.Position.IsSet ? data.Position.Value : new(),
            Scale = data.Scale.IsSet ? data.Scale.Value : new(),
            Rotation = data.Rotation.IsSet ? data.Rotation.Value : 0f,
            Elevation = data.Elevation.IsSet ? data.Elevation.Value : 0f,
            ControlledBy = userId,
        };
        scene.SceneAssets.Add(sceneAsset);
        await sceneStorage.UpdateAsync(scene, ct);
        return sceneAsset;
    }

    /// <inheritdoc />
    public async Task<Result<SceneAsset>> UpdateAssetAsync(Guid userId, Guid id, UpdateAssetData data, CancellationToken ct = default) {
        var scene = await sceneStorage.GetByIdAsync(id, ct);
        if (scene is null) return Result.Failure("NotFound");
        var sceneAsset = scene.SceneAssets.FirstOrDefault(a => a.Id == data.AssetId && a.Number == data.Number);
        if (sceneAsset == null) return Result.Failure("NotFound");
        var result = data.Validate();
        if (result.HasErrors) return result;
        sceneAsset = sceneAsset with {
            Name = data.Name.IsSet ? data.Name.Value : sceneAsset.Name,
            Position = data.Position.IsSet ? data.Position.Value : sceneAsset.Position,
            Scale = data.Scale.IsSet ? data.Scale.Value : sceneAsset.Scale,
            Rotation = data.Rotation.IsSet ? data.Rotation.Value : 0f,
            Elevation = data.Elevation.IsSet ? data.Elevation.Value : 0f,
            IsLocked = data.IsLocked.IsSet ? data.IsLocked.Value : sceneAsset.IsLocked,
            ControlledBy = data.ControlledBy.IsSet ? data.ControlledBy.Value : sceneAsset.ControlledBy,
        };
        await sceneStorage.UpdateAsync(scene, ct);
        return sceneAsset;
    }

    /// <inheritdoc />
    public async Task<Result> RemoveAssetAsync(Guid userId, Guid id, Guid assetId, int number, CancellationToken ct = default) {
        var scene = await sceneStorage.GetByIdAsync(id, ct);
        if (scene is null) return Result.Failure("NotFound");
        scene.SceneAssets.RemoveAll(a => a.Id == assetId && a.Number == number);
        await sceneStorage.UpdateAsync(scene, ct);
        return Result.Success();
    }
}