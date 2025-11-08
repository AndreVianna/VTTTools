using SceneAssetBulkUpdateData = VttTools.Library.Scenes.ServiceContracts.SceneAssetBulkUpdateData;
using SceneAssetUpdateData = VttTools.Library.Scenes.ServiceContracts.SceneAssetUpdateData;

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
    public async Task<Result<Scene>> CreateSceneAsync(Guid userId, SceneAddData data, CancellationToken ct = default) {
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
    public async Task<Result> UpdateSceneAsync(Guid userId, Guid id, SceneUpdateData data, CancellationToken ct = default) {
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

    private static Scene SetGrid(Scene scene, SceneUpdateData data)
        => scene with {
            Grid = scene.Grid with {
                Type = data.Grid.Value.Type.IsSet ? data.Grid.Value.Type.Value : scene.Grid.Type,
                CellSize = data.Grid.Value.CellSize.IsSet ? data.Grid.Value.CellSize.Value : scene.Grid.CellSize,
                Offset = data.Grid.Value.Offset.IsSet ? data.Grid.Value.Offset.Value : scene.Grid.Offset,
                Snap = data.Grid.Value.Snap.IsSet ? data.Grid.Value.Snap.Value : scene.Grid.Snap,
            },
        };

    private async Task<Scene> SetStage(Scene scene, SceneUpdateData data, CancellationToken ct) {
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

    private async Task<Scene> SetBackground(Scene scene, SceneUpdateData data, CancellationToken ct) {
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

    private static string GenerateAssetInstanceName(Asset asset, uint number) => asset.Kind == AssetKind.Creature ? $"{asset.Name} #{number}" : asset.Name;

    /// <inheritdoc />
    public async Task<Result<SceneAsset>> AddAssetAsync(Guid userId, Guid id, Guid assetId, SceneAssetAddData data, CancellationToken ct = default) {
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

        var tokenId = data.TokenId ?? asset.Tokens.FirstOrDefault(r => r.IsDefault)?.Token.Id;
        var portraitId = data.PortraitId ?? asset.Portrait?.Id;

        var number = scene.Assets.Any(sa => sa.AssetId == assetId)
            ? scene.Assets.Where(sa => sa.AssetId == assetId).Max(sa => sa.Number) + 1
            : 1u;

        var sceneAsset = new SceneAsset {
            AssetId = assetId,
            Index = scene.Assets.Count != 0 ? scene.Assets.Max(sa => sa.Index) + 1 : 0,
            Number = number,
            Name = data.Name ?? GenerateAssetInstanceName(asset, number),
            Token = tokenId is null ? null : new Resource { Id = tokenId.Value },
            Portrait = portraitId is null ? null : new Resource { Id = portraitId.Value },
            Position = data.Position,
            Size = data.Size,
            Frame = data.Frame,
            Rotation = data.Rotation,
            Elevation = data.Elevation,
            ControlledBy = userId,
            Notes = data.Notes,
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
    public async Task<Result> UpdateAssetAsync(Guid userId, Guid id, int index, SceneAssetUpdateData data, CancellationToken ct = default) {
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

        var tokenId = data.TokenId.IsSet
                        ? data.TokenId.Value
                        : sceneAsset.Token?.Id;

        var portraitId = data.PortraitId.IsSet
                        ? data.PortraitId.Value
                        : sceneAsset.Portrait?.Id;

        sceneAsset = sceneAsset with {
            Name = data.Name.IsSet ? data.Name.Value : sceneAsset.Name,
            Token = tokenId == sceneAsset.Token?.Id ? sceneAsset.Token : (tokenId is null ? null : new Resource { Id = tokenId.Value }),
            Portrait = portraitId == sceneAsset.Portrait?.Id ? sceneAsset.Portrait : (portraitId is null ? null : new Resource { Id = portraitId.Value }),
            Position = data.Position.IsSet ? data.Position.Value : sceneAsset.Position,
            Size = data.Size.IsSet ? data.Size.Value : sceneAsset.Size,
            Rotation = data.Rotation.IsSet ? data.Rotation.Value : sceneAsset.Rotation,
            Elevation = data.Elevation.IsSet ? data.Elevation.Value : sceneAsset.Elevation,
            IsLocked = data.IsLocked.IsSet ? data.IsLocked.Value : sceneAsset.IsLocked,
            ControlledBy = data.ControlledBy.IsSet ? data.ControlledBy.Value : sceneAsset.ControlledBy,
            Notes = data.Notes.IsSet ? data.Notes.Value : null,
        };
        await sceneStorage.UpdateAsync(id, sceneAsset, ct);
        return Result.Success();
    }

    /// <inheritdoc />
    public async Task<Result> BulkUpdateAssetsAsync(Guid userId, Guid id, SceneAssetBulkUpdateData data, CancellationToken ct = default) {
        var scene = await sceneStorage.GetByIdAsync(id, ct);
        if (scene is null)
            return Result.Failure("NotFound");
        if (scene.Adventure.OwnerId != userId)
            return Result.Failure("NotAllowed");

        var result = data.Validate();
        if (result.HasErrors)
            return result;

        // Validate all indices exist before applying any updates
        var indices = data.Updates.Select(u => u.Index).ToHashSet();
        var invalidIndices = indices.Where(idx => !scene.Assets.Any(a => a.Index == idx)).ToList();
        if (invalidIndices.Count > 0)
            return Result.Failure($"Assets with indices {string.Join(", ", invalidIndices)} not found");

        // Apply all updates
        foreach (var update in data.Updates) {
            var assetIndex = scene.Assets.FindIndex(a => a.Index == update.Index);
            if (assetIndex >= 0) {
                var sceneAsset = scene.Assets[assetIndex];
                scene.Assets[assetIndex] = sceneAsset with {
                    Position = update.Position.IsSet ? update.Position.Value : sceneAsset.Position,
                    Size = update.Size.IsSet ? update.Size.Value : sceneAsset.Size,
                    Rotation = update.Rotation.IsSet ? update.Rotation.Value : sceneAsset.Rotation,
                    Elevation = update.Elevation.IsSet ? update.Elevation.Value : sceneAsset.Elevation,
                };
            }
        }

        await sceneStorage.UpdateAsync(scene, ct);
        return Result.Success();
    }

    /// <inheritdoc />
    public async Task<Result> BulkCloneAssetsAsync(Guid userId, Guid id, List<uint> assetIndices, CancellationToken ct = default) {
        var scene = await sceneStorage.GetByIdAsync(id, ct);
        if (scene is null)
            return Result.Failure("NotFound");
        if (scene.Adventure.OwnerId != userId)
            return Result.Failure("NotAllowed");

        // Validate all indices exist before cloning any
        var invalidIndices = assetIndices.Where(idx => !scene.Assets.Any(a => a.Index == idx)).ToList();
        if (invalidIndices.Count > 0)
            return Result.Failure($"Assets with indices {string.Join(", ", invalidIndices)} not found");

        // Track the current max index to ensure unique indices for clones
        var currentMaxIndex = scene.Assets.Count != 0 ? scene.Assets.Max(sa => sa.Index) : 0;

        // Clone each asset
        foreach (var index in assetIndices) {
            var asset = scene.Assets.First(sa => sa.Index == index);
            var currentMaxNumber = scene.Assets.Where(sa => sa.AssetId == asset.AssetId).Max(sa => sa.Number);

            var sceneAsset = asset.Clone() with {
                Index = ++currentMaxIndex,
                Number = currentMaxNumber + 1,
                ControlledBy = userId,
                Position = new Position(0, 0),
                IsLocked = false,
            };
            scene.Assets.Add(sceneAsset);
        }

        await sceneStorage.UpdateAsync(scene, ct);
        return Result.Success();
    }

    /// <inheritdoc />
    public async Task<Result> BulkDeleteAssetsAsync(Guid userId, Guid id, List<uint> assetIndices, CancellationToken ct = default) {
        var scene = await sceneStorage.GetByIdAsync(id, ct);
        if (scene is null)
            return Result.Failure("NotFound");
        if (scene.Adventure.OwnerId != userId)
            return Result.Failure("NotAllowed");

        // Validate all indices exist before deleting any
        var invalidIndices = assetIndices.Where(idx => !scene.Assets.Any(a => a.Index == idx)).ToList();
        if (invalidIndices.Count > 0)
            return Result.Failure($"Assets with indices {string.Join(", ", invalidIndices)} not found");

        // Remove all assets with matching indices
        scene.Assets.RemoveAll(a => assetIndices.Contains(a.Index));

        await sceneStorage.UpdateAsync(scene, ct);
        return Result.Success();
    }

    /// <inheritdoc />
    public async Task<Result> BulkAddAssetsAsync(Guid userId, Guid id, List<AssetToAdd> assetsToAdd, CancellationToken ct = default) {
        var scene = await sceneStorage.GetByIdAsync(id, ct);
        if (scene is null)
            return Result.Failure("NotFound");
        if (scene.Adventure.OwnerId != userId)
            return Result.Failure("NotAllowed");

        var currentMaxIndex = scene.Assets.Count != 0 ? scene.Assets.Max(sa => sa.Index) : 0;

        foreach (var (assetId, data) in assetsToAdd) {
            var result = data.Validate();
            if (result.HasErrors)
                return result;

            var asset = await assetStorage.GetByIdAsync(assetId, ct);
            if (asset is null)
                return Result.Failure("Asset not found");
            if (asset.OwnerId != userId && !(asset is { IsPublic: true, IsPublished: true }))
                return Result.Failure("NotAllowed");

            var tokenId = data.TokenId ?? asset.Tokens.FirstOrDefault(r => r.IsDefault)?.Token.Id;
            var portraitId = data.PortraitId ?? asset.Portrait?.Id;

            var number = scene.Assets.Any(sa => sa.AssetId == assetId)
                ? scene.Assets.Where(sa => sa.AssetId == assetId).Max(sa => sa.Number) + 1
                : 1u;

            var sceneAsset = new SceneAsset {
                AssetId = assetId,
                Index = ++currentMaxIndex,
                Number = number,
                Name = data.Name ?? GenerateAssetInstanceName(asset, number),
                Notes = data.Notes,
                Token = tokenId is null ? null : new Resource { Id = tokenId.Value },
                Portrait = portraitId is null ? null : new Resource { Id = portraitId.Value },
                Position = data.Position,
                Size = data.Size,
                Frame = data.Frame,
                Rotation = data.Rotation,
                Elevation = data.Elevation,
                ControlledBy = userId,
            };
            scene.Assets.Add(sceneAsset);
        }

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

    /// <inheritdoc />
    public async Task<Result<SceneWall>> AddWallAsync(Guid userId, Guid id, SceneWallAddData data, CancellationToken ct = default) {
        var scene = await sceneStorage.GetByIdAsync(id, ct);
        if (scene is null)
            return Result.Failure("NotFound");
        if (scene.Adventure.OwnerId != userId)
            return Result.Failure("NotAllowed");

        var index = scene.Walls.Count != 0 ? scene.Walls.Max(sw => sw.Index) + 1 : 1;
        var sceneWall = new SceneWall {
            Index = index,
            Name = data.Name ?? $"Wall {index}",
            IsClosed = data.IsClosed,
            Visibility = data.Visibility,
            Poles = data.Poles,
            Material = data.Material,
            Color = data.Color,
        };

        await sceneStorage.AddWallAsync(id, sceneWall, ct);
        return sceneWall;
    }

    /// <inheritdoc />
    public async Task<Result> UpdateWallAsync(Guid userId, Guid id, uint index, SceneWallUpdateData data, CancellationToken ct = default) {
        var scene = await sceneStorage.GetByIdAsync(id, ct);
        if (scene is null)
            return Result.Failure("NotFound");
        var sceneWall = scene.Walls.FirstOrDefault(b => b.Index == index);
        if (sceneWall is null)
            return Result.Failure("NotFound");
        if (scene.Adventure.OwnerId != userId)
            return Result.Failure("NotAllowed");

        sceneWall = sceneWall with {
            Index = index,
            Name = data.Name.IsSet ? data.Name.Value : sceneWall.Name,
            Poles = data.Poles.IsSet ? data.Poles.Value : sceneWall.Poles,
            IsClosed = data.IsClosed.IsSet ? data.IsClosed.Value : sceneWall.IsClosed,
            Visibility = data.Visibility.IsSet ? data.Visibility.Value : sceneWall.Visibility,
            Material = data.Material.IsSet ? data.Material.Value : sceneWall.Material,
            Color = data.Color.IsSet ? data.Color.Value : sceneWall.Color,
        };

        await sceneStorage.UpdateWallAsync(id, sceneWall, ct);
        return Result.Success();
    }

    /// <inheritdoc />
    public async Task<Result> RemoveWallAsync(Guid userId, Guid id, uint index, CancellationToken ct = default) {
        var scene = await sceneStorage.GetByIdAsync(id, ct);
        if (scene is null)
            return Result.Failure("NotFound");
        var sceneWall = scene.Walls.FirstOrDefault(b => b.Index == index);
        if (sceneWall is null)
            return Result.Failure("NotFound");
        if (scene.Adventure.OwnerId != userId)
            return Result.Failure("NotAllowed");

        await sceneStorage.DeleteWallAsync(id, index, ct);
        return Result.Success();
    }

    /// <inheritdoc />
    public async Task<Result<SceneRegion>> AddRegionAsync(Guid userId, Guid id, SceneRegionAddData data, CancellationToken ct = default) {
        var scene = await sceneStorage.GetByIdAsync(id, ct);
        if (scene is null)
            return Result.Failure("NotFound");
        if (scene.Adventure.OwnerId != userId)
            return Result.Failure("NotAllowed");

        var index = scene.Regions.Count != 0 ? scene.Regions.Max(sr => sr.Index) + 1 : 1;
        var sceneRegion = new SceneRegion {
            Index = index,
            Name = data.Name ?? $"Region {index}",
            Vertices = data.Vertices,
            Type = data.Type,
            Value = data.Value,
            Label = data.Label,
            Color = data.Color,
        };

        await sceneStorage.AddRegionAsync(id, sceneRegion, ct);
        return sceneRegion;
    }

    /// <inheritdoc />
    public async Task<Result> UpdateRegionAsync(Guid userId, Guid id, uint index, SceneRegionUpdateData data, CancellationToken ct = default) {
        var scene = await sceneStorage.GetByIdAsync(id, ct);
        if (scene is null)
            return Result.Failure("NotFound");
        var sceneRegion = scene.Regions.FirstOrDefault(b => b.Index == index);
        if (sceneRegion is null)
            return Result.Failure("NotFound");
        if (scene.Adventure.OwnerId != userId)
            return Result.Failure("NotAllowed");

        sceneRegion = sceneRegion with {
            Index = index,
            Name = data.Name.IsSet ? data.Name.Value : sceneRegion.Name,
            Vertices = data.Vertices.IsSet ? data.Vertices.Value : sceneRegion.Vertices,
            Value = data.Value.IsSet ? data.Value.Value : sceneRegion.Value,
            Type = data.Type.IsSet ? data.Type.Value : sceneRegion.Type,
            Label = data.Label.IsSet ? data.Label.Value : sceneRegion.Label,
            Color = data.Color.IsSet ? data.Color.Value : sceneRegion.Color,
        };

        await sceneStorage.UpdateRegionAsync(id, sceneRegion, ct);
        return Result.Success();
    }

    /// <inheritdoc />
    public async Task<Result> RemoveRegionAsync(Guid userId, Guid id, uint index, CancellationToken ct = default) {
        var scene = await sceneStorage.GetByIdAsync(id, ct);
        if (scene is null)
            return Result.Failure("NotFound");
        var sceneRegion = scene.Regions.FirstOrDefault(b => b.Index == index);
        if (sceneRegion is null)
            return Result.Failure("NotFound");
        if (scene.Adventure.OwnerId != userId)
            return Result.Failure("NotAllowed");

        await sceneStorage.DeleteRegionAsync(id, index, ct);
        return Result.Success();
    }

    /// <inheritdoc />
    public async Task<Result<SceneSource>> AddSourceAsync(Guid userId, Guid id, SceneSourceAddData data, CancellationToken ct = default) {
        var scene = await sceneStorage.GetByIdAsync(id, ct);
        if (scene is null)
            return Result.Failure("NotFound");
        if (scene.Adventure.OwnerId != userId)
            return Result.Failure("NotAllowed");

        var result = data.Validate();
        if (result.HasErrors)
            return result;

        var index = scene.Sources.Count != 0 ? scene.Sources.Max(ss => ss.Index) + 1 : 1;
        var sceneSource = new SceneSource {
            Index = index,
            Name = data.Name ?? $"Source {index}",
            Type = data.Type,
            Position = data.Position,
            IsDirectional = data.IsDirectional,
            Direction = data.Direction,
            Range = data.Range,
            Spread = data.Spread,
            Intensity = data.Intensity,
            Color = data.Color,
            HasGradient = data.HasGradient,
        };

        await sceneStorage.AddSourceAsync(id, sceneSource, ct);
        return sceneSource;
    }

    /// <inheritdoc />
    public async Task<Result> UpdateSourceAsync(Guid userId, Guid id, uint index, SceneSourceUpdateData data, CancellationToken ct = default) {
        var scene = await sceneStorage.GetByIdAsync(id, ct);
        if (scene is null)
            return Result.Failure("NotFound");
        var sceneSource = scene.Sources.FirstOrDefault(b => b.Index == index);
        if (sceneSource is null)
            return Result.Failure("NotFound");
        if (scene.Adventure.OwnerId != userId)
            return Result.Failure("NotAllowed");

        var result = data.Validate();
        if (result.HasErrors)
            return result;

        sceneSource = sceneSource with {
            Index = index,
            Type = data.Type.IsSet ? data.Type.Value : sceneSource.Type,
            Name = data.Name.IsSet ? data.Name.Value : sceneSource.Name,
            Position = data.Position.IsSet ? data.Position.Value : sceneSource.Position,
            IsDirectional = data.IsDirectional.IsSet ? data.IsDirectional.Value : sceneSource.IsDirectional,
            Direction = data.Direction.IsSet ? data.Direction.Value : sceneSource.Direction,
            Range = data.Range.IsSet ? data.Range.Value : sceneSource.Range,
            Spread = data.Spread.IsSet ? data.Spread.Value : sceneSource.Spread,
            HasGradient = data.HasGradient.IsSet ? data.HasGradient.Value : sceneSource.HasGradient,
            Intensity = data.Intensity.IsSet ? data.Intensity.Value : sceneSource.Intensity,
            Color = data.Color.IsSet ? data.Color.Value : sceneSource.Color,
        };

        await sceneStorage.UpdateSourceAsync(id, sceneSource, ct);
        return Result.Success();
    }

    /// <inheritdoc />
    public async Task<Result> RemoveSourceAsync(Guid userId, Guid id, uint index, CancellationToken ct = default) {
        var scene = await sceneStorage.GetByIdAsync(id, ct);
        if (scene is null)
            return Result.Failure("NotFound");
        var sceneSource = scene.Sources.FirstOrDefault(b => b.Index == index);
        if (sceneSource is null)
            return Result.Failure("NotFound");
        if (scene.Adventure.OwnerId != userId)
            return Result.Failure("NotAllowed");

        await sceneStorage.DeleteSourceAsync(id, index, ct);
        return Result.Success();
    }
}