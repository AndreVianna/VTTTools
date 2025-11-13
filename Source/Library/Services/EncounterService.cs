using EncounterAssetBulkUpdateData = VttTools.Library.Encounters.ServiceContracts.EncounterAssetBulkUpdateData;
using EncounterAssetUpdateData = VttTools.Library.Encounters.ServiceContracts.EncounterAssetUpdateData;
using EncounterOpeningAddData = VttTools.Library.Encounters.ServiceContracts.EncounterOpeningAddData;
using EncounterOpeningUpdateData = VttTools.Library.Encounters.ServiceContracts.EncounterOpeningUpdateData;

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
        var background = await mediaStorage.GetByIdAsync(stageId, ct);
        var encounter = new Encounter {
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
                Snap = data.Grid.Value.Snap.IsSet ? data.Grid.Value.Snap.Value : encounter.Grid.Snap,
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
        var background = await mediaStorage.GetByIdAsync(backgroundId, ct);
        return encounter with {
            Stage = encounter.Stage with {
                Background = new() {
                    Id = background?.Id ?? Guid.Empty,
                    Type = background?.Type ?? ResourceType.Image,
                    Path = background?.Path ?? string.Empty,
                    Metadata = background?.Metadata ?? new(),
                    Tags = background?.Tags ?? [],
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
        var sound = await mediaStorage.GetByIdAsync(soundId.Value, ct);
        return encounter with {
            Stage = encounter.Stage with {
                Sound = new() {
                    Id = sound?.Id ?? Guid.Empty,
                    Type = sound?.Type ?? ResourceType.Audio,
                    Path = sound?.Path ?? string.Empty,
                    Metadata = sound?.Metadata ?? new(),
                    Tags = sound?.Tags ?? [],
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

    private static string GenerateAssetInstanceName(Asset asset, uint number) => asset.Kind == AssetKind.Creature ? $"{asset.Name} #{number}" : asset.Name;

    /// <inheritdoc />
    public async Task<Result<EncounterAsset>> AddAssetAsync(Guid userId, Guid id, Guid assetId, EncounterAssetAddData data, CancellationToken ct = default) {
        var encounter = await encounterStorage.GetByIdAsync(id, ct);
        if (encounter is null)
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

        var number = encounter.Assets.Any(sa => sa.AssetId == assetId)
            ? encounter.Assets.Where(sa => sa.AssetId == assetId).Max(sa => sa.Number) + 1
            : 1u;

        var encounterAsset = new EncounterAsset {
            AssetId = assetId,
            Index = encounter.Assets.Count != 0 ? encounter.Assets.Max(sa => sa.Index) + 1 : 0,
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

        var tokenId = data.TokenId.IsSet
                        ? data.TokenId.Value
                        : encounterAsset.Token?.Id;

        var portraitId = data.PortraitId.IsSet
                        ? data.PortraitId.Value
                        : encounterAsset.Portrait?.Id;

        encounterAsset = encounterAsset with {
            Name = data.Name.IsSet ? data.Name.Value : encounterAsset.Name,
            Token = tokenId == encounterAsset.Token?.Id ? encounterAsset.Token : (tokenId is null ? null : new Resource { Id = tokenId.Value }),
            Portrait = portraitId == encounterAsset.Portrait?.Id ? encounterAsset.Portrait : (portraitId is null ? null : new Resource { Id = portraitId.Value }),
            Position = data.Position.IsSet ? data.Position.Value : encounterAsset.Position,
            Size = data.Size.IsSet ? data.Size.Value : encounterAsset.Size,
            Rotation = data.Rotation.IsSet ? data.Rotation.Value : encounterAsset.Rotation,
            Elevation = data.Elevation.IsSet ? data.Elevation.Value : encounterAsset.Elevation,
            IsLocked = data.IsLocked.IsSet ? data.IsLocked.Value : encounterAsset.IsLocked,
            ControlledBy = data.ControlledBy.IsSet ? data.ControlledBy.Value : encounterAsset.ControlledBy,
            Notes = data.Notes.IsSet ? data.Notes.Value : null,
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

            var asset = await assetStorage.GetByIdAsync(assetId, ct);
            if (asset is null)
                return Result.Failure("Asset not found");
            if (asset.OwnerId != userId && !(asset is { IsPublic: true, IsPublished: true }))
                return Result.Failure("NotAllowed");

            var tokenId = data.TokenId ?? asset.Tokens.FirstOrDefault(r => r.IsDefault)?.Token.Id;
            var portraitId = data.PortraitId ?? asset.Portrait?.Id;

            var number = encounter.Assets.Any(sa => sa.AssetId == assetId)
                ? encounter.Assets.Where(sa => sa.AssetId == assetId).Max(sa => sa.Number) + 1
                : 1u;

            var encounterAsset = new EncounterAsset {
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

        var index = encounter.Walls.Count != 0 ? encounter.Walls.Max(sw => sw.Index) + 1 : 1;
        var encounterWall = new EncounterWall {
            Index = index,
            Name = data.Name ?? $"Wall {index}",
            IsClosed = data.IsClosed,
            Visibility = data.Visibility,
            Poles = data.Poles,
            Material = data.Material,
            Color = data.Color,
        };

        await encounterStorage.AddWallAsync(id, encounterWall, ct);
        return encounterWall;
    }

    /// <inheritdoc />
    public async Task<Result> UpdateWallAsync(Guid userId, Guid id, uint index, EncounterWallUpdateData data, CancellationToken ct = default) {
        var encounter = await encounterStorage.GetByIdAsync(id, ct);
        if (encounter is null)
            return Result.Failure("NotFound");
        var encounterWall = encounter.Walls.FirstOrDefault(b => b.Index == index);
        if (encounterWall is null)
            return Result.Failure("NotFound");
        if (encounter.Adventure.OwnerId != userId)
            return Result.Failure("NotAllowed");

        encounterWall = encounterWall with {
            Index = index,
            Name = data.Name.IsSet ? data.Name.Value : encounterWall.Name,
            Poles = data.Poles.IsSet ? data.Poles.Value : encounterWall.Poles,
            IsClosed = data.IsClosed.IsSet ? data.IsClosed.Value : encounterWall.IsClosed,
            Visibility = data.Visibility.IsSet ? data.Visibility.Value : encounterWall.Visibility,
            Material = data.Material.IsSet ? data.Material.Value : encounterWall.Material,
            Color = data.Color.IsSet ? data.Color.Value : encounterWall.Color,
        };

        await encounterStorage.UpdateWallAsync(id, encounterWall, ct);
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
    public async Task<Result<EncounterOpening>> PlaceOpeningAsync(Guid userId, Guid id, EncounterOpeningAddData data, CancellationToken ct = default) {
        var encounter = await encounterStorage.GetByIdAsync(id, ct);
        if (encounter is null)
            return Result.Failure("NotFound");
        if (encounter.Adventure.OwnerId != userId)
            return Result.Failure("NotAllowed");

        var validationResult = data.Validate();
        if (validationResult.HasErrors)
            return validationResult;

        var wall = encounter.Walls.FirstOrDefault(w => w.Index == data.WallIndex);
        if (wall is null)
            return Result.Failure($"Wall with index {data.WallIndex} not found");
        if (wall.Poles.Count < 2)
            return Result.Failure($"Wall with index {data.WallIndex} must have at least 2 poles");

        var (startPoleIndex, endPoleIndex, updatedPoles) = FindOrInsertPoles(wall.Poles, data.CenterPosition, data.Width);

        var openingIndex = encounter.Openings.Count != 0 ? encounter.Openings.Max(o => o.Index) + 1 : 1;
        var opening = new EncounterOpening {
            Index = openingIndex,
            Name = data.Name ?? $"{data.Type} {openingIndex}",
            Description = data.Description,
            Type = data.Type,
            WallIndex = data.WallIndex,
            StartPoleIndex = startPoleIndex,
            EndPoleIndex = endPoleIndex,
            Size = new Dimension(data.Width, data.Height),
            Visibility = data.Visibility,
            State = data.State,
            Opacity = data.Opacity,
            Material = data.Material,
            Color = data.Color,
        };

        if (updatedPoles.Count != wall.Poles.Count) {
            var updatedWall = wall with { Poles = updatedPoles };
            await encounterStorage.UpdateWallAsync(id, updatedWall, ct);
        }

        await encounterStorage.AddOpeningAsync(id, opening, ct);
        return opening;
    }

    private static (uint startPoleIndex, uint endPoleIndex, List<Pole> updatedPoles) FindOrInsertPoles(
        IReadOnlyList<Pole> existingPoles,
        double centerPosition,
        double openingWidth) {

        const double poleTolerance = 0.5;
        var poles = existingPoles.ToList();
        var halfWidth = openingWidth / 2.0;
        var startPosition = centerPosition - halfWidth;
        var endPosition = centerPosition + halfWidth;

        uint startPoleIndex = FindOrCreatePole(poles, startPosition, poleTolerance);
        uint endPoleIndex = FindOrCreatePole(poles, endPosition, poleTolerance);

        return (startPoleIndex, endPoleIndex, poles);
    }

    private static uint FindOrCreatePole(List<Pole> poles, double targetPosition, double tolerance) {
        for (var i = 0; i < poles.Count; i++) {
            var distance = Math.Abs(poles[i].X - targetPosition);
            if (distance < tolerance)
                return (uint)i;
        }

        if (poles.Count == 0)
            throw new InvalidOperationException("Cannot create pole on wall with no existing poles");

        var newPole = new Pole(targetPosition, poles[0].Y, poles[0].H);

        if (targetPosition < poles[0].X) {
            poles.Insert(0, newPole);
            return 0;
        }

        for (var i = 0; i < poles.Count - 1; i++) {
            if (poles[i].X < targetPosition && targetPosition < poles[i + 1].X) {
                poles.Insert(i + 1, newPole);
                return (uint)(i + 1);
            }
        }

        poles.Add(newPole);
        return (uint)(poles.Count - 1);
    }

    /// <inheritdoc />
    public async Task<Result> UpdateOpeningAsync(Guid userId, Guid id, uint index, EncounterOpeningUpdateData data, CancellationToken ct = default) {
        var encounter = await encounterStorage.GetByIdAsync(id, ct);
        if (encounter is null)
            return Result.Failure("NotFound");
        var opening = encounter.Openings.FirstOrDefault(o => o.Index == index);
        if (opening is null)
            return Result.Failure("NotFound");
        if (encounter.Adventure.OwnerId != userId)
            return Result.Failure("NotAllowed");

        var validationResult = data.Validate();
        if (validationResult.HasErrors)
            return validationResult;

        opening = opening with {
            Name = data.Name.IsSet ? data.Name.Value : opening.Name,
            Description = data.Description.IsSet ? data.Description.Value : opening.Description,
            Type = data.Type.IsSet ? data.Type.Value : opening.Type,
            Size = new Dimension(
                data.Width.IsSet ? data.Width.Value : opening.Size.Width,
                data.Height.IsSet ? data.Height.Value : opening.Size.Height
            ),
            Visibility = data.Visibility.IsSet ? data.Visibility.Value : opening.Visibility,
            State = data.State.IsSet ? data.State.Value : opening.State,
            Opacity = data.Opacity.IsSet ? data.Opacity.Value : opening.Opacity,
            Material = data.Material.IsSet ? data.Material.Value : opening.Material,
            Color = data.Color.IsSet ? data.Color.Value : opening.Color,
        };

        await encounterStorage.UpdateOpeningAsync(id, opening, ct);
        return Result.Success();
    }

    /// <inheritdoc />
    public async Task<Result> RemoveOpeningAsync(Guid userId, Guid id, uint index, CancellationToken ct = default) {
        var encounter = await encounterStorage.GetByIdAsync(id, ct);
        if (encounter is null)
            return Result.Failure("NotFound");
        var opening = encounter.Openings.FirstOrDefault(o => o.Index == index);
        if (opening is null)
            return Result.Failure("NotFound");
        if (encounter.Adventure.OwnerId != userId)
            return Result.Failure("NotAllowed");

        await encounterStorage.DeleteOpeningAsync(id, index, ct);
        return Result.Success();
    }

    /// <inheritdoc />
    public async Task<Result<EncounterRegion>> AddRegionAsync(Guid userId, Guid id, EncounterRegionAddData data, CancellationToken ct = default) {
        var encounter = await encounterStorage.GetByIdAsync(id, ct);
        if (encounter is null)
            return Result.Failure("NotFound");
        if (encounter.Adventure.OwnerId != userId)
            return Result.Failure("NotAllowed");

        var index = encounter.Regions.Count != 0 ? encounter.Regions.Max(sr => sr.Index) + 1 : 1;
        var encounterRegion = new EncounterRegion {
            Index = index,
            Name = data.Name ?? $"Region {index}",
            Vertices = data.Vertices,
            Type = data.Type,
            Value = data.Value,
            Label = data.Label,
            Color = data.Color,
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
            Label = data.Label.IsSet ? data.Label.Value : encounterRegion.Label,
            Color = data.Color.IsSet ? data.Color.Value : encounterRegion.Color,
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

        var index = encounter.Sources.Count != 0 ? encounter.Sources.Max(ss => ss.Index) + 1 : 1;
        var encounterSource = new EncounterSource {
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
            Color = data.Color.IsSet ? data.Color.Value : encounterSource.Color,
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