using EncounterAssetBulkUpdateData = VttTools.Library.Encounters.ServiceContracts.EncounterAssetBulkUpdateData;
using EncounterAssetUpdateData = VttTools.Library.Encounters.ServiceContracts.EncounterAssetUpdateData;

namespace VttTools.Library.Services;

public class EncounterService(IEncounterStorage encounterStorage, IAssetStorage assetStorage, IMediaStorage mediaStorage)
    : IEncounterService {
    /// <inheritdoc />
    public Task<Encounter[]> GetEncountersAsync(CancellationToken ct = default)
        => encounterStorage.GetAllAsync(ct);

    /// <inheritdoc />
    public Task<Encounter?> GetEncounterByIdAsync(Guid id, CancellationToken ct = default)
        => encounterStorage.GetByIdAsync(id, ct);

    /// <inheritdoc />
    public async Task<Result<Encounter>> CreateEncounterAsync(Guid userId, EncounterAddData data, CancellationToken ct = default) {
        var result = data.Validate();
        if (result.HasErrors)
            return result;
        var id = Guid.CreateVersion7();
        var stageId = data.BackgroundId ?? Guid.Empty;
        var background = await mediaStorage.FindByIdAsync(stageId, ct);
        var encounter = new Encounter {
            Id = id,
            Name = data.Name,
            Description = data.Description,
            Stage = new() {
                Background = new() {
                    Id = stageId,
                    Type = background?.Type ?? ResourceType.Undefined,
                    Description = background?.Description ?? string.Empty,
                    ContentType = background?.ContentType ?? string.Empty,

                    Path = background?.Path ?? string.Empty,
                    Features = background?.Features ?? [],
                    FileName = background?.FileName ?? string.Empty,
                    FileLength = background?.FileLength ?? 0,
                    Size = background?.Size ?? Size.Zero,
                    Duration = background?.Duration ?? TimeSpan.Zero,

                    OwnerId = background?.OwnerId ?? Guid.Empty,
                    IsPublished = background?.IsPublished ?? false,
                    IsPublic = background?.IsPublic ?? false,
                },
            },
            Grid = data.Grid,
        };
        await encounterStorage.UpdateAsync(encounter, ct);
        return encounter;
    }

    /// <inheritdoc />
    public async Task<Result> UpdateEncounterAsync(Guid userId, Guid id, EncounterUpdateData data, CancellationToken ct = default) {
        var encounter = await encounterStorage.GetByIdAsync(id, ct);
        if (encounter is null)
            return Result.Failure("NotFound");
        if (encounter.Adventure.OwnerId != userId)
            return Result.Failure("NotAllowed");
        var result = data.Validate();
        if (result.HasErrors)
            return result;

        encounter = encounter with {
            Name = data.Name.IsSet ? data.Name.Value : encounter.Name,
            Description = data.Description.IsSet ? data.Description.Value : encounter.Description,
            IsPublished = data.IsPublished.IsSet ? data.IsPublished.Value : encounter.IsPublished,
        };

        if (data.Stage.IsSet)
            encounter = await SetStage(encounter, data, ct);
        if (data.Grid.IsSet)
            encounter = SetGrid(encounter, data);
        await encounterStorage.UpdateAsync(encounter, ct);
        return Result.Success();
    }

    private static Encounter SetGrid(Encounter encounter, EncounterUpdateData data)
        => encounter with {
            Grid = encounter.Grid with {
                Type = data.Grid.Value.Type.IsSet ? data.Grid.Value.Type.Value : encounter.Grid.Type,
                CellSize = data.Grid.Value.CellSize.IsSet ? data.Grid.Value.CellSize.Value : encounter.Grid.CellSize,
                Offset = data.Grid.Value.Offset.IsSet ? data.Grid.Value.Offset.Value : encounter.Grid.Offset,
                Scale = data.Grid.Value.Scale.IsSet ? data.Grid.Value.Scale.Value : encounter.Grid.Scale,
            },
        };

    private async Task<Encounter> SetStage(Encounter encounter, EncounterUpdateData data, CancellationToken ct) {
        encounter = encounter with {
            Stage = encounter.Stage with {
                ZoomLevel = data.Stage.Value.ZoomLevel.IsSet ? data.Stage.Value.ZoomLevel.Value : encounter.Stage.ZoomLevel,
                Panning = data.Stage.Value.Panning.IsSet ? data.Stage.Value.Panning.Value : encounter.Stage.Panning,
                Light = data.Stage.Value.Light.IsSet ? data.Stage.Value.Light.Value : encounter.Stage.Light,
                Weather = data.Stage.Value.Weather.IsSet ? data.Stage.Value.Weather.Value : encounter.Stage.Weather,
                Elevation = data.Stage.Value.Elevation.IsSet ? data.Stage.Value.Elevation.Value : encounter.Stage.Elevation,
            }
        };
        if (data.Stage.Value.BackgroundId.IsSet)
            encounter = await SetBackground(encounter, data, ct);
        if (data.Stage.Value.SoundId.IsSet)
            encounter = await SetSound(encounter, data, ct);
        return encounter;
    }

    private async Task<Encounter> SetBackground(Encounter encounter, EncounterUpdateData data, CancellationToken ct) {
        var backgroundId = data.Stage.Value.BackgroundId.Value ?? Guid.Empty;
        var background = await mediaStorage.FindByIdAsync(backgroundId, ct);
        return encounter with {
            Stage = encounter.Stage with {
                Background = new() {
                    Id = background?.Id ?? Guid.Empty,
                    Type = background?.Type ?? ResourceType.Undefined,
                    Description = background?.Description ?? string.Empty,
                    ContentType = background?.ContentType ?? string.Empty,

                    Path = background?.Path ?? string.Empty,
                    Features = background?.Features ?? [],
                    FileName = background?.FileName ?? string.Empty,
                    FileLength = background?.FileLength ?? 0,
                    Size = background?.Size ?? Size.Zero,
                    Duration = background?.Duration ?? TimeSpan.Zero,

                    OwnerId = background?.OwnerId ?? Guid.Empty,
                    IsPublished = background?.IsPublished ?? false,
                    IsPublic = background?.IsPublic ?? false,
                },
            },
        };
    }

    private async Task<Encounter> SetSound(Encounter encounter, EncounterUpdateData data, CancellationToken ct) {
        var soundId = data.Stage.Value.SoundId.Value;
        if (soundId is null) {
            return encounter with {
                Stage = encounter.Stage with {
                    Sound = null,
                },
            };
        }
        var sound = await mediaStorage.FindByIdAsync(soundId.Value, ct);
        return encounter with {
            Stage = encounter.Stage with {
                Sound = new() {
                    Id = sound?.Id ?? Guid.Empty,
                    Type = sound?.Type ?? ResourceType.Audio,
                    Description = sound?.Description ?? string.Empty,
                    ContentType = sound?.ContentType ?? string.Empty,

                    Path = sound?.Path ?? string.Empty,
                    Features = sound?.Features ?? [],
                    FileName = sound?.FileName ?? string.Empty,
                    FileLength = sound?.FileLength ?? 0,
                    Size = sound?.Size ?? Size.Zero,
                    Duration = sound?.Duration ?? TimeSpan.Zero,

                    OwnerId = sound?.OwnerId ?? Guid.Empty,
                    IsPublished = sound?.IsPublished ?? false,
                    IsPublic = sound?.IsPublic ?? false,
                },
            },
        };
    }

    /// <inheritdoc />
    public async Task<Result> DeleteEncounterAsync(Guid userId, Guid id, CancellationToken ct = default) {
        var encounter = await encounterStorage.GetByIdAsync(id, ct);
        if (encounter is null)
            return Result.Failure("NotFound");
        if (encounter.Adventure.OwnerId != userId)
            return Result.Failure("NotAllowed");
        await encounterStorage.DeleteAsync(id, ct);
        return Result.Success();
    }

    /// <inheritdoc />
    public async Task<EncounterAsset[]> GetAssetsAsync(Guid id, CancellationToken ct = default) {
        var encounter = await encounterStorage.GetByIdAsync(id, ct);
        return encounter?.Assets.ToArray() ?? [];
    }

    private static string GenerateAssetInstanceName(Asset asset, uint number) => asset.Classification.Kind == AssetKind.Creature ? $"{asset.Name} #{number}" : asset.Name;

    /// <inheritdoc />
    public async Task<Result<EncounterAsset>> AddAssetAsync(Guid userId, Guid id, Guid assetId, EncounterAssetAddData data, CancellationToken ct = default) {
        var encounter = await encounterStorage.GetByIdAsync(id, ct);
        if (encounter is null)
            return Result.Failure("NotFound");
        var asset = await assetStorage.FindByIdAsync(userId, assetId, ct);
        if (asset is null)
            return Result.Failure("NotFound");
        if (asset.OwnerId != userId && !(asset is { IsPublic: true, IsPublished: true }))
            return Result.Failure("NotAllowed");
        var result = data.Validate();
        if (result.HasErrors)
            return result;

        var imageId = data.ImageId;

        var number = encounter.Assets.Any(sa => sa.AssetId == assetId)
            ? encounter.Assets.Where(sa => sa.AssetId == assetId).Max(sa => sa.Number) + 1
            : 1u;

        var encounterAsset = new EncounterAsset {
            AssetId = assetId,
            Index = encounter.Assets.Count != 0 ? encounter.Assets.Max(sa => sa.Index) + 1 : 0,
            Number = number,
            Name = data.Name ?? GenerateAssetInstanceName(asset, number),
            Image = imageId is null ? null : new Resource { Id = imageId.Value },
            Position = data.Position,
            Size = data.Size,
            Frame = data.Frame,
            Rotation = data.Rotation,
            Elevation = data.Elevation,
            ControlledBy = userId,
            Notes = data.Notes,
        };
        encounter.Assets.Add(encounterAsset);
        await encounterStorage.UpdateAsync(encounter, ct);
        return encounterAsset;
    }

    /// <inheritdoc />
    public async Task<Result<EncounterAsset>> CloneAssetAsync(Guid userId, Guid id, int index, CancellationToken ct = default) {
        if (index < 0)
            return Result.Failure("NotFound");
        var encounter = await encounterStorage.GetByIdAsync(id, ct);
        if (encounter is null)
            return Result.Failure("NotFound");
        if (encounter.Adventure.OwnerId != userId)
            return Result.Failure("NotAllowed");
        var asset = encounter.Assets.FirstOrDefault(sa => sa.Index == index);
        if (asset is null)
            return Result.Failure("NotFound");
        var encounterAsset = asset.Clone() with {
            Index = encounter.Assets.Max(sa => sa.Index) + 1,
            Number = encounter.Assets.Where(sa => sa.AssetId == asset.AssetId).Max(sa => sa.Number) + 1,
            ControlledBy = userId,
            Position = new Position(0, 0),
            IsLocked = false,
        };
        encounter.Assets.Add(encounterAsset);
        await encounterStorage.UpdateAsync(encounter, ct);
        return encounterAsset;
    }

    /// <inheritdoc />
    public async Task<Result> UpdateAssetAsync(Guid userId, Guid id, int index, EncounterAssetUpdateData data, CancellationToken ct = default) {
        if (index < 0)
            return Result.Failure("NotFound");
        var encounter = await encounterStorage.GetByIdAsync(id, ct);
        if (encounter is null)
            return Result.Failure("NotFound");
        if (encounter.Adventure.OwnerId != userId)
            return Result.Failure("NotAllowed");
        var encounterAsset = encounter.Assets.FirstOrDefault(a => a.Index == index);
        if (encounterAsset == null)
            return Result.Failure("NotFound");
        var result = data.Validate();
        if (result.HasErrors)
            return result;

        var imageId = data.ImageId.IsSet
                        ? data.ImageId.Value
                        : encounterAsset.Image?.Id;

        encounterAsset = encounterAsset with {
            Name = data.Name.IsSet ? data.Name.Value : encounterAsset.Name,
            Image = imageId == encounterAsset.Image?.Id ? encounterAsset.Image : (imageId is null ? null : new Resource { Id = imageId.Value }),
            Position = data.Position.IsSet ? data.Position.Value : encounterAsset.Position,
            Size = data.Size.IsSet ? data.Size.Value : encounterAsset.Size,
            Rotation = data.Rotation.IsSet ? data.Rotation.Value : encounterAsset.Rotation,
            Elevation = data.Elevation.IsSet ? data.Elevation.Value : encounterAsset.Elevation,
            IsLocked = data.IsLocked.IsSet ? data.IsLocked.Value : encounterAsset.IsLocked,
            ControlledBy = data.ControlledBy.IsSet ? data.ControlledBy.Value : encounterAsset.ControlledBy,
            Notes = data.Notes.IsSet ? data.Notes.Value : encounterAsset.Notes,
        };
        await encounterStorage.UpdateAsync(id, encounterAsset, ct);
        return Result.Success();
    }

    /// <inheritdoc />
    public async Task<Result> BulkUpdateAssetsAsync(Guid userId, Guid id, EncounterAssetBulkUpdateData data, CancellationToken ct = default) {
        var encounter = await encounterStorage.GetByIdAsync(id, ct);
        if (encounter is null)
            return Result.Failure("NotFound");
        if (encounter.Adventure.OwnerId != userId)
            return Result.Failure("NotAllowed");

        var result = data.Validate();
        if (result.HasErrors)
            return result;

        // Validate all indices exist before applying any updates
        var indices = data.Updates.Select(u => u.Index).ToHashSet();
        var invalidIndices = indices.Where(idx => !encounter.Assets.Any(a => a.Index == idx)).ToList();
        if (invalidIndices.Count > 0)
            return Result.Failure($"Assets with indices {string.Join(", ", invalidIndices)} not found");

        // Apply all updates
        foreach (var update in data.Updates) {
            var assetIndex = encounter.Assets.FindIndex(a => a.Index == update.Index);
            if (assetIndex >= 0) {
                var encounterAsset = encounter.Assets[assetIndex];
                encounter.Assets[assetIndex] = encounterAsset with {
                    Position = update.Position.IsSet ? update.Position.Value : encounterAsset.Position,
                    Size = update.Size.IsSet ? update.Size.Value : encounterAsset.Size,
                    Rotation = update.Rotation.IsSet ? update.Rotation.Value : encounterAsset.Rotation,
                    Elevation = update.Elevation.IsSet ? update.Elevation.Value : encounterAsset.Elevation,
                };
            }
        }

        await encounterStorage.UpdateAsync(encounter, ct);
        return Result.Success();
    }

    /// <inheritdoc />
    public async Task<Result> BulkCloneAssetsAsync(Guid userId, Guid id, List<uint> assetIndices, CancellationToken ct = default) {
        var encounter = await encounterStorage.GetByIdAsync(id, ct);
        if (encounter is null)
            return Result.Failure("NotFound");
        if (encounter.Adventure.OwnerId != userId)
            return Result.Failure("NotAllowed");

        // Validate all indices exist before cloning any
        var invalidIndices = assetIndices.Where(idx => !encounter.Assets.Any(a => a.Index == idx)).ToList();
        if (invalidIndices.Count > 0)
            return Result.Failure($"Assets with indices {string.Join(", ", invalidIndices)} not found");

        // Track the current max index to ensure unique indices for clones
        var currentMaxIndex = encounter.Assets.Count != 0 ? encounter.Assets.Max(sa => sa.Index) : 0;

        // Clone each asset
        foreach (var index in assetIndices) {
            var asset = encounter.Assets.First(sa => sa.Index == index);
            var currentMaxNumber = encounter.Assets.Where(sa => sa.AssetId == asset.AssetId).Max(sa => sa.Number);

            var encounterAsset = asset.Clone() with {
                Index = ++currentMaxIndex,
                Number = currentMaxNumber + 1,
                ControlledBy = userId,
                Position = new Position(0, 0),
                IsLocked = false,
            };
            encounter.Assets.Add(encounterAsset);
        }

        await encounterStorage.UpdateAsync(encounter, ct);
        return Result.Success();
    }

    /// <inheritdoc />
    public async Task<Result> BulkDeleteAssetsAsync(Guid userId, Guid id, List<uint> assetIndices, CancellationToken ct = default) {
        var encounter = await encounterStorage.GetByIdAsync(id, ct);
        if (encounter is null)
            return Result.Failure("NotFound");
        if (encounter.Adventure.OwnerId != userId)
            return Result.Failure("NotAllowed");

        // Validate all indices exist before deleting any
        var invalidIndices = assetIndices.Where(idx => !encounter.Assets.Any(a => a.Index == idx)).ToList();
        if (invalidIndices.Count > 0)
            return Result.Failure($"Assets with indices {string.Join(", ", invalidIndices)} not found");

        // Remove all assets with matching indices
        encounter.Assets.RemoveAll(a => assetIndices.Contains(a.Index));

        await encounterStorage.UpdateAsync(encounter, ct);
        return Result.Success();
    }

    /// <inheritdoc />
    public async Task<Result> BulkAddAssetsAsync(Guid userId, Guid id, List<AssetToAdd> assetsToAdd, CancellationToken ct = default) {
        var encounter = await encounterStorage.GetByIdAsync(id, ct);
        if (encounter is null)
            return Result.Failure("NotFound");
        if (encounter.Adventure.OwnerId != userId)
            return Result.Failure("NotAllowed");

        var currentMaxIndex = encounter.Assets.Count != 0 ? encounter.Assets.Max(sa => sa.Index) : 0;

        foreach (var (assetId, data) in assetsToAdd) {
            var result = data.Validate();
            if (result.HasErrors)
                return result;

            var asset = await assetStorage.FindByIdAsync(userId, assetId, ct);
            if (asset is null)
                return Result.Failure("Asset not found");
            if (asset.OwnerId != userId && !(asset is { IsPublic: true, IsPublished: true }))
                return Result.Failure("NotAllowed");

            var imageId = data.ImageId;

            var number = encounter.Assets.Any(sa => sa.AssetId == assetId)
                ? encounter.Assets.Where(sa => sa.AssetId == assetId).Max(sa => sa.Number) + 1
                : 1u;

            var encounterAsset = new EncounterAsset {
                AssetId = assetId,
                Index = ++currentMaxIndex,
                Number = number,
                Name = data.Name ?? GenerateAssetInstanceName(asset, number),
                Notes = data.Notes,
                Image = imageId is null ? null : new Resource { Id = imageId.Value },
                Position = data.Position,
                Size = data.Size,
                Frame = data.Frame,
                Rotation = data.Rotation,
                Elevation = data.Elevation,
                ControlledBy = userId,
            };
            encounter.Assets.Add(encounterAsset);
        }

        await encounterStorage.UpdateAsync(encounter, ct);
        return Result.Success();
    }

    /// <inheritdoc />
    public async Task<Result> RemoveAssetAsync(Guid userId, Guid id, int index, CancellationToken ct = default) {
        if (index < 0)
            return Result.Failure("NotFound");
        var encounter = await encounterStorage.GetByIdAsync(id, ct);
        if (encounter is null)
            return Result.Failure("NotFound");
        if (encounter.Adventure.OwnerId != userId)
            return Result.Failure("NotAllowed");
        encounter.Assets.RemoveAll(a => a.Index == index);
        await encounterStorage.UpdateAsync(encounter, ct);
        return Result.Success();
    }

    /// <inheritdoc />
    public async Task<Result<EncounterWall>> AddWallAsync(Guid userId, Guid id, EncounterWallAddData data, CancellationToken ct = default) {
        var encounter = await encounterStorage.GetByIdAsync(id, ct);
        if (encounter is null)
            return Result.Failure("NotFound");
        if (encounter.Adventure.OwnerId != userId)
            return Result.Failure("NotAllowed");

        var index = encounter.Walls.Count != 0 ? encounter.Walls.Max(sw => sw.Index) + 1 : 0;
        var encounterWall = new EncounterWall {
            Index = index,
            Name = data.Name ?? $"Wall {index + 1}",
            Segments = data.Segments,
        };

        await encounterStorage.AddWallAsync(id, encounterWall, ct);
        return encounterWall;
    }

    /// <inheritdoc />
    public async Task<Result> UpdateWallAsync(Guid userId, Guid id, uint index, EncounterWallUpdateData data, CancellationToken ct = default) {
        var encounter = await encounterStorage.GetByIdAsync(id, ct);
        if (encounter is null)
            return Result.Failure("NotFound");
        var wall = encounter.Walls.FirstOrDefault(b => b.Index == index);
        if (wall is null)
            return Result.Failure("NotFound");
        if (encounter.Adventure.OwnerId != userId)
            return Result.Failure("NotAllowed");

        wall = wall with {
            Index = index,
            Name = data.Name.IsSet ? data.Name.Value : wall.Name,
            Segments = data.Segments.IsSet ? data.Segments.Value : wall.Segments,
        };

        await encounterStorage.UpdateWallAsync(id, wall, ct);
        return Result.Success();
    }

    /// <inheritdoc />
    public async Task<Result> RemoveWallAsync(Guid userId, Guid id, uint index, CancellationToken ct = default) {
        var encounter = await encounterStorage.GetByIdAsync(id, ct);
        if (encounter is null)
            return Result.Failure("NotFound");
        var encounterWall = encounter.Walls.FirstOrDefault(b => b.Index == index);
        if (encounterWall is null)
            return Result.Failure("NotFound");
        if (encounter.Adventure.OwnerId != userId)
            return Result.Failure("NotAllowed");

        await encounterStorage.DeleteWallAsync(id, index, ct);
        return Result.Success();
    }

    /// <inheritdoc />
    public async Task<Result<EncounterRegion>> AddRegionAsync(Guid userId, Guid id, EncounterRegionAddData data, CancellationToken ct = default) {
        var encounter = await encounterStorage.GetByIdAsync(id, ct);
        if (encounter is null)
            return Result.Failure("NotFound");
        if (encounter.Adventure.OwnerId != userId)
            return Result.Failure("NotAllowed");

        var index = encounter.Regions.Count != 0 ? encounter.Regions.Max(sr => sr.Index) + 1 : 0;
        var encounterRegion = new EncounterRegion {
            Index = index,
            Name = data.Name ?? $"Region {index + 1}",
            Vertices = data.Vertices,
            Type = data.Type,
            Value = data.Value,
        };

        await encounterStorage.AddRegionAsync(id, encounterRegion, ct);
        return encounterRegion;
    }

    /// <inheritdoc />
    public async Task<Result> UpdateRegionAsync(Guid userId, Guid id, uint index, EncounterRegionUpdateData data, CancellationToken ct = default) {
        var encounter = await encounterStorage.GetByIdAsync(id, ct);
        if (encounter is null)
            return Result.Failure("NotFound");
        var encounterRegion = encounter.Regions.FirstOrDefault(b => b.Index == index);
        if (encounterRegion is null)
            return Result.Failure("NotFound");
        if (encounter.Adventure.OwnerId != userId)
            return Result.Failure("NotAllowed");

        encounterRegion = encounterRegion with {
            Index = index,
            Name = data.Name.IsSet ? data.Name.Value : encounterRegion.Name,
            Vertices = data.Vertices.IsSet ? data.Vertices.Value : encounterRegion.Vertices,
            Value = data.Value.IsSet ? data.Value.Value : encounterRegion.Value,
            Type = data.Type.IsSet ? data.Type.Value : encounterRegion.Type,
        };

        await encounterStorage.UpdateRegionAsync(id, encounterRegion, ct);
        return Result.Success();
    }

    /// <inheritdoc />
    public async Task<Result> RemoveRegionAsync(Guid userId, Guid id, uint index, CancellationToken ct = default) {
        var encounter = await encounterStorage.GetByIdAsync(id, ct);
        if (encounter is null)
            return Result.Failure("NotFound");
        var encounterRegion = encounter.Regions.FirstOrDefault(b => b.Index == index);
        if (encounterRegion is null)
            return Result.Failure("NotFound");
        if (encounter.Adventure.OwnerId != userId)
            return Result.Failure("NotAllowed");

        await encounterStorage.DeleteRegionAsync(id, index, ct);
        return Result.Success();
    }

    /// <inheritdoc />
    public async Task<Result<EncounterSource>> AddSourceAsync(Guid userId, Guid id, EncounterSourceAddData data, CancellationToken ct = default) {
        var encounter = await encounterStorage.GetByIdAsync(id, ct);
        if (encounter is null)
            return Result.Failure("NotFound");
        if (encounter.Adventure.OwnerId != userId)
            return Result.Failure("NotAllowed");

        var result = data.Validate();
        if (result.HasErrors)
            return result;

        var index = encounter.Sources.Count != 0 ? encounter.Sources.Max(ss => ss.Index) + 1 : 0;
        var encounterSource = new EncounterSource {
            Index = index,
            Name = data.Name ?? $"Source {index + 1}",
            Type = data.Type,
            Position = data.Position,
            IsDirectional = data.IsDirectional,
            Direction = data.Direction,
            Range = data.Range,
            Spread = data.Spread,
            Intensity = data.Intensity,
            HasGradient = data.HasGradient,
        };

        await encounterStorage.AddSourceAsync(id, encounterSource, ct);
        return encounterSource;
    }

    /// <inheritdoc />
    public async Task<Result> UpdateSourceAsync(Guid userId, Guid id, uint index, EncounterSourceUpdateData data, CancellationToken ct = default) {
        var encounter = await encounterStorage.GetByIdAsync(id, ct);
        if (encounter is null)
            return Result.Failure("NotFound");
        var encounterSource = encounter.Sources.FirstOrDefault(b => b.Index == index);
        if (encounterSource is null)
            return Result.Failure("NotFound");
        if (encounter.Adventure.OwnerId != userId)
            return Result.Failure("NotAllowed");

        var result = data.Validate();
        if (result.HasErrors)
            return result;

        encounterSource = encounterSource with {
            Index = index,
            Type = data.Type.IsSet ? data.Type.Value : encounterSource.Type,
            Name = data.Name.IsSet ? data.Name.Value : encounterSource.Name,
            Position = data.Position.IsSet ? data.Position.Value : encounterSource.Position,
            IsDirectional = data.IsDirectional.IsSet ? data.IsDirectional.Value : encounterSource.IsDirectional,
            Direction = data.Direction.IsSet ? data.Direction.Value : encounterSource.Direction,
            Range = data.Range.IsSet ? data.Range.Value : encounterSource.Range,
            Spread = data.Spread.IsSet ? data.Spread.Value : encounterSource.Spread,
            HasGradient = data.HasGradient.IsSet ? data.HasGradient.Value : encounterSource.HasGradient,
            Intensity = data.Intensity.IsSet ? data.Intensity.Value : encounterSource.Intensity,
        };

        await encounterStorage.UpdateSourceAsync(id, encounterSource, ct);
        return Result.Success();
    }

    /// <inheritdoc />
    public async Task<Result> RemoveSourceAsync(Guid userId, Guid id, uint index, CancellationToken ct = default) {
        var encounter = await encounterStorage.GetByIdAsync(id, ct);
        if (encounter is null)
            return Result.Failure("NotFound");
        var encounterSource = encounter.Sources.FirstOrDefault(b => b.Index == index);
        if (encounterSource is null)
            return Result.Failure("NotFound");
        if (encounter.Adventure.OwnerId != userId)
            return Result.Failure("NotAllowed");

        await encounterStorage.DeleteSourceAsync(id, index, ct);
        return Result.Success();
    }
}