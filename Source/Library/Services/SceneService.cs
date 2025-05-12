namespace VttTools.Library.Services;

public class SceneService(ISceneStorage sceneStorage)
    : ISceneService {
    /// <inheritdoc />
    public Task<Scene[]> GetScenesAsync(CancellationToken ct = default)
        => sceneStorage.GetAllAsync(ct);

    /// <inheritdoc />
    public Task<Scene?> GetSceneByIdAsync(Guid id, CancellationToken ct = default)
        => sceneStorage.GetByIdAsync(id, ct);

    /// <inheritdoc />
    public async Task<Scene?> UpdateSceneAsync(Guid userId, Guid id, UpdateSceneRequest data, CancellationToken ct = default) {
        var scene = await sceneStorage.GetByIdAsync(id, ct);
        if (scene?.OwnerId != userId)
            return null;
        if (data.Name.IsSet)
            scene.Name = data.Name.Value;
        if (data.Visibility.IsSet)
            scene.Visibility = data.Visibility.Value;
        return await sceneStorage.UpdateAsync(scene, ct);
    }

    /// <inheritdoc />
    public async Task<SceneAsset[]> GetAssetsAsync(Guid id, CancellationToken ct = default) {
        var scene = await sceneStorage.GetByIdAsync(id, ct);
        return scene?.SceneAssets.ToArray() ?? [];
    }

    /// <inheritdoc />
    public async Task<bool> AddAssetAsync(Guid userId, Guid id, AddSceneAssetData data, CancellationToken ct = default) {
        var scene = await sceneStorage.GetByIdAsync(id, ct);
        if (scene?.OwnerId != userId)
            return false;
        var sceneAsset = new SceneAsset {
            AssetId = data.AssetId,
            Name = data.Name.IsSet ? data.Name.Value : scene.Name,
            Position = data.Position.IsSet ? data.Position.Value : new(),
            Scale = data.Scale.IsSet ? data.Scale.Value : 1.0d,
            IsLocked = false,
        };
        scene.SceneAssets.Add(sceneAsset);
        await sceneStorage.UpdateAsync(scene, ct);
        return true;
    }

    /// <inheritdoc />
    public async Task<bool> RemoveAssetAsync(Guid userId, Guid id, Guid assetId, CancellationToken ct = default) {
        var scene = await sceneStorage.GetByIdAsync(id, ct);
        if (scene?.OwnerId != userId)
            return false;
        scene.SceneAssets.RemoveAll(a => a.AssetId == assetId);
        await sceneStorage.UpdateAsync(scene, ct);
        return true;
    }

    /// <inheritdoc />
    public async Task<bool> UpdateAssetAsync(Guid userId, Guid id, Guid assetId, UpdateSceneAssetData data, CancellationToken ct = default) {
        var scene = await sceneStorage.GetByIdAsync(id, ct);
        if (scene?.OwnerId != userId)
            return false;
        var sceneAsset = scene.SceneAssets.FirstOrDefault(a => a.AssetId == assetId);
        if (sceneAsset == null)
            return false;
        if (data.Position.IsSet)
            sceneAsset.Position = data.Position.Value;
        await sceneStorage.UpdateAsync(scene, ct);
        return true;
    }
}