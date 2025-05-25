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

    public async Task<Result<SceneAsset>> AddAssetAsync(Guid userId, Guid id, Guid assetId, AddAssetData data, CancellationToken ct = default) {
        var scene = await sceneStorage.GetByIdAsync(id, ct);
        if (scene is null) return Result.Failure("NotFound");
        var asset = await assetStorage.GetByIdAsync(assetId, ct);
        if (asset is null) return Result.Failure("NotFound");
        if (asset.OwnerId != userId || asset is { IsPublic: true, IsPublished: true }) return Result.Failure("NotAllowed");
        var result = data.Validate();
        if (result.HasErrors) return result;
        var number = scene.SceneAssets.Where(sa => sa.Id == asset.Id).Max(sa => sa.Number) + 1;
        var name = data.Name.IsSet ? data.Name.Value : asset.Name;
        var sceneAsset = new SceneAsset {
            Number = number,
            Name = name,
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

    /// <inheritdoc />
    public async Task<Result<SceneAsset>> UpdateAssetAsync(Guid userId, Guid id, Guid assetId, int number, UpdateAssetData data, CancellationToken ct = default) {
        if (number < 0) return Result.Failure("NotFound");
        var scene = await sceneStorage.GetByIdAsync(id, ct);
        if (scene is null) return Result.Failure("NotFound");
        var sceneAsset = scene.SceneAssets.FirstOrDefault(a => a.Id == assetId && a.Number == number);
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
        if (number < 0) return Result.Failure("NotFound");
        var scene = await sceneStorage.GetByIdAsync(id, ct);
        if (scene is null) return Result.Failure("NotFound");
        scene.SceneAssets.RemoveAll(a => a.Id == assetId && a.Number == number);
        await sceneStorage.UpdateAsync(scene, ct);
        return Result.Success();
    }
}