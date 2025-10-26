using VttTools.Assets.Model;

using UpdateSceneAssetData = VttTools.Library.Scenes.ServiceContracts.UpdateSceneAssetData;

namespace VttTools.Library.Services;

public class SceneService(ISceneStorage sceneStorage, IAssetStorage assetStorage, IMediaStorage mediaStorage)
    : ISceneService {
    /// <inheritdoc />
    public Task<Scene[]> GetScenesAsync(CancellationToken ct = default)
        => sceneStorage.GetAllAsync(ct);

    /// <inheritdoc />
    public Task<Scene?> GetSceneByIdAsync(Guid id, CancellationToken ct = default)
        => sceneStorage.GetByIdAsync(id, ct);

    /// <inheritdoc />
    public async Task<Result<Scene>> CreateSceneAsync(Guid userId, CreateSceneData data, CancellationToken ct = default) {
        var result = data.Validate();
        if (result.HasErrors)
            return result;
        var id = Guid.CreateVersion7();
        var stageId = data.BackgroundId ?? Guid.Empty;
        var background = await mediaStorage.GetByIdAsync(stageId, ct);
        var scene = new Scene {
            Id = id,
            Name = data.Name,
            Description = data.Description,
            Stage = new() {
                Background = new() {
                    Id = stageId,
                    Type = background?.Type ?? ResourceType.Undefined,
                    Path = background?.Path ?? string.Empty,
                    Metadata = background?.Metadata ?? new(),
                    Tags = background?.Tags ?? [],
                },
            },
            Grid = data.Grid,
        };
        await sceneStorage.UpdateAsync(scene, ct);
        return scene;
    }

    /// <inheritdoc />
    public async Task<Result> UpdateSceneAsync(Guid userId, Guid id, UpdateSceneData data, CancellationToken ct = default) {
        var scene = await sceneStorage.GetByIdAsync(id, ct);
        if (scene is null)
            return Result.Failure("NotFound");
        if (scene.Adventure.OwnerId != userId)
            return Result.Failure("NotAllowed");
        var result = data.Validate();
        if (result.HasErrors)
            return result;

        scene = scene with {
            Name = data.Name.IsSet ? data.Name.Value : scene.Name,
            Description = data.Description.IsSet ? data.Description.Value : scene.Description,
            IsPublished = data.IsPublished.IsSet ? data.IsPublished.Value : scene.IsPublished,
        };

        if (data.Stage.IsSet)
            scene = await SetStage(scene, data, ct);
        if (data.Grid.IsSet)
            scene = SetGrid(scene, data);
        await sceneStorage.UpdateAsync(scene, ct);
        return Result.Success();
    }

    private static Scene SetGrid(Scene scene, UpdateSceneData data)
        => scene with {
            Grid = scene.Grid with {
                Type = data.Grid.Value.Type.IsSet ? data.Grid.Value.Type.Value : scene.Grid.Type,
                CellSize = data.Grid.Value.CellSize.IsSet ? data.Grid.Value.CellSize.Value : scene.Grid.CellSize,
                Offset = data.Grid.Value.Offset.IsSet ? data.Grid.Value.Offset.Value : scene.Grid.Offset,
                Snap = data.Grid.Value.Snap.IsSet ? data.Grid.Value.Snap.Value : scene.Grid.Snap,
            },
        };

    private async Task<Scene> SetStage(Scene scene, UpdateSceneData data, CancellationToken ct) {
        scene = scene with {
            Stage = scene.Stage with {
                ZoomLevel = data.Stage.Value.ZoomLevel.IsSet ? data.Stage.Value.ZoomLevel.Value : scene.Stage.ZoomLevel,
                Panning = data.Stage.Value.Panning.IsSet ? data.Stage.Value.Panning.Value : scene.Stage.Panning,
            }
        };
        if (data.Stage.Value.BackgroundId.IsSet)
            scene = await SetBackground(scene, data, ct);
        return scene;
    }

    private async Task<Scene> SetBackground(Scene scene, UpdateSceneData data, CancellationToken ct) {
        var backgroundId = data.Stage.Value.BackgroundId.Value ?? Guid.Empty;
        var background = await mediaStorage.GetByIdAsync(backgroundId, ct);
        return scene with {
            Stage = scene.Stage with {
                Background = new() {
                    Id = background?.Id ?? Guid.Empty,
                    Type = background?.Type ?? ResourceType.Undefined,
                    Path = background?.Path ?? string.Empty,
                    Metadata = background?.Metadata ?? new(),
                    Tags = background?.Tags ?? [],
                },
            },
        };
    }

    /// <inheritdoc />
    public async Task<Result> DeleteSceneAsync(Guid userId, Guid id, CancellationToken ct = default) {
        var scene = await sceneStorage.GetByIdAsync(id, ct);
        if (scene is null)
            return Result.Failure("NotFound");
        if (scene.Adventure.OwnerId != userId)
            return Result.Failure("NotAllowed");
        await sceneStorage.DeleteAsync(id, ct);
        return Result.Success();
    }

    /// <inheritdoc />
    public async Task<SceneAsset[]> GetAssetsAsync(Guid id, CancellationToken ct = default) {
        var scene = await sceneStorage.GetByIdAsync(id, ct);
        return scene?.Assets.ToArray() ?? [];
    }

    /// <inheritdoc />
    public async Task<Result<SceneAsset>> AddAssetAsync(Guid userId, Guid id, Guid assetId, AddSceneAssetData data, CancellationToken ct = default) {
        var scene = await sceneStorage.GetByIdAsync(id, ct);
        if (scene is null)
            return Result.Failure("NotFound");
        var asset = await assetStorage.GetByIdAsync(assetId, ct);
        if (asset is null)
            return Result.Failure("NotFound");
        if (asset.OwnerId != userId && !(asset is { IsPublic: true, IsPublished: true }))
            return Result.Failure("NotAllowed");
        var result = data.Validate();
        if (result.HasErrors)
            return result;

        // ResourceId is required - select from Asset.Resources
        Guid? resourceId = data.ResourceId.IsSet ? data.ResourceId.Value : null;
        if (resourceId is null) {
            // If not provided, select the first token resource from the asset
            if (asset.Resources.Count == 0)
                return Result.Failure("Asset has no resources available");
            // Select first Token resource, fallback to first resource
            var tokenResource = asset.Resources.FirstOrDefault(r => r.Role == ResourceRole.Token);
            resourceId = tokenResource?.ResourceId ?? asset.Resources.First().ResourceId;
        }

        var sceneAsset = new SceneAsset {
            AssetId = assetId,
            Index = scene.Assets.Count != 0 ? scene.Assets.Max(sa => sa.Index) + 1 : 0,
            Number = scene.Assets.Any(sa => sa.AssetId == assetId)
                ? scene.Assets.Where(sa => sa.AssetId == assetId).Max(sa => sa.Number) + 1
                : 1,
            Name = data.Name.IsSet ? data.Name.Value : asset.Name,
            Description = data.Description.IsSet ? data.Description.Value : null,  // Override if provided
            ResourceId = resourceId.Value,
            Position = data.Position,
            Size = data.Size,
            Frame = data.Frame,
            Rotation = data.Rotation,
            Elevation = data.Elevation,
            ControlledBy = userId,
        };
        scene.Assets.Add(sceneAsset);
        await sceneStorage.UpdateAsync(scene, ct);
        return sceneAsset;
    }

    /// <inheritdoc />
    public async Task<Result<SceneAsset>> CloneAssetAsync(Guid userId, Guid id, int index, CancellationToken ct = default) {
        if (index < 0)
            return Result.Failure("NotFound");
        var scene = await sceneStorage.GetByIdAsync(id, ct);
        if (scene is null)
            return Result.Failure("NotFound");
        if (scene.Adventure.OwnerId != userId)
            return Result.Failure("NotAllowed");
        var asset = scene.Assets.FirstOrDefault(sa => sa.Index == index);
        if (asset is null)
            return Result.Failure("NotFound");
        var sceneAsset = asset.Clone() with {
            Index = scene.Assets.Max(sa => sa.Index) + 1,
            Number = scene.Assets.Where(sa => sa.AssetId == asset.AssetId).Max(sa => sa.Number) + 1,
            ControlledBy = userId,
            Position = new Position(0, 0),
            IsLocked = false,
        };
        scene.Assets.Add(sceneAsset);
        await sceneStorage.UpdateAsync(scene, ct);
        return sceneAsset;
    }

    /// <inheritdoc />
    public async Task<Result> UpdateAssetAsync(Guid userId, Guid id, int index, UpdateSceneAssetData data, CancellationToken ct = default) {
        if (index < 0)
            return Result.Failure("NotFound");
        var scene = await sceneStorage.GetByIdAsync(id, ct);
        if (scene is null)
            return Result.Failure("NotFound");
        if (scene.Adventure.OwnerId != userId)
            return Result.Failure("NotAllowed");
        var sceneAsset = scene.Assets.FirstOrDefault(a => a.Index == index);
        if (sceneAsset == null)
            return Result.Failure("NotFound");
        var result = data.Validate();
        if (result.HasErrors)
            return result;
        sceneAsset = sceneAsset with {
            Name = data.Name.IsSet ? data.Name.Value : sceneAsset.Name,
            Description = data.Description.IsSet ? data.Description.Value : sceneAsset.Description,
            ResourceId = data.ResourceId.IsSet ? data.ResourceId.Value : sceneAsset.ResourceId,
            Position = data.Position.IsSet ? data.Position.Value : sceneAsset.Position,
            Size = data.Size.IsSet ? data.Size.Value : sceneAsset.Size,
            Rotation = data.Rotation.IsSet ? data.Rotation.Value : sceneAsset.Rotation,
            Elevation = data.Elevation.IsSet ? data.Elevation.Value : sceneAsset.Elevation,
            IsLocked = data.IsLocked.IsSet ? data.IsLocked.Value : sceneAsset.IsLocked,
            ControlledBy = data.ControlledBy.IsSet ? data.ControlledBy.Value : sceneAsset.ControlledBy,
        };
        await sceneStorage.UpdateAsync(scene, ct);
        return Result.Success();
    }

    /// <inheritdoc />
    public async Task<Result> RemoveAssetAsync(Guid userId, Guid id, int index, CancellationToken ct = default) {
        if (index < 0)
            return Result.Failure("NotFound");
        var scene = await sceneStorage.GetByIdAsync(id, ct);
        if (scene is null)
            return Result.Failure("NotFound");
        if (scene.Adventure.OwnerId != userId)
            return Result.Failure("NotAllowed");
        scene.Assets.RemoveAll(a => a.Index == index);
        await sceneStorage.UpdateAsync(scene, ct);
        return Result.Success();
    }
}