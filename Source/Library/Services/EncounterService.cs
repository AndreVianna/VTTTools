
using EncounterAssetBulkUpdateData = VttTools.Library.Encounters.ServiceContracts.EncounterAssetBulkUpdateData;
using EncounterAssetUpdateData = VttTools.Library.Encounters.ServiceContracts.EncounterAssetUpdateData;

namespace VttTools.Library.Services;

public partial class EncounterService(IEncounterStorage encounterStorage, IAssetStorage assetStorage, IMediaStorage mediaStorage)
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
        var encounter = new Encounter {
            Id = id,
            Name = data.Name,
            Description = data.Description,
            Stage = new() { Background = data.BackgroundId.HasValue ? new() { Id = data.BackgroundId.Value } : null },
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
            encounter = await SetBackground(encounter, data.Stage.Value.BackgroundId.Value, ct);
        if (data.Stage.Value.SoundId.IsSet)
            encounter = await SetSound(encounter, data.Stage.Value.SoundId.Value, ct);
        return encounter;
    }

    private async Task<Encounter> SetBackground(Encounter encounter, Guid? backgroundId, CancellationToken ct) {
        if (backgroundId is null)
            return encounter with { Stage = encounter.Stage with { Background = null } };
        var media = await mediaStorage.FindByIdAsync(backgroundId.Value, ct);
        if (media is null)
            return encounter with { Stage = encounter.Stage with { Background = null } };
        var background = new ResourceMetadata { Id = media.Id };
        return encounter with { Stage = encounter.Stage with { Background = background } };
    }

    private async Task<Encounter> SetSound(Encounter encounter, Guid? soundId, CancellationToken ct) {
        if (soundId is null)
            return encounter with { Stage = encounter.Stage with { Sound = null } };
        var media = await mediaStorage.FindByIdAsync(soundId.Value, ct);
        if (media is null)
            return encounter with { Stage = encounter.Stage with { Sound = null } };
        var background = new ResourceMetadata { Id = media.Id };
        return encounter with { Stage = encounter.Stage with { Sound = background } };
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

    private static string GenerateAssetInstanceName(AssetKind kind, string name, uint number) => kind == AssetKind.Creature ? $"{name} #{number}" : name;

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

        var name = data.Name ?? asset.Name;
        var number = encounter.Assets.Count != 0
            ? encounter.Assets.Max(sa => ExtractAssetNumberOrDefault(sa.Name, name)) + 1
            : 1;

        var encounterAsset = new EncounterAsset {
            AssetId = assetId,
            Index = encounter.Assets.Count != 0 ? encounter.Assets.Max(sa => sa.Index) + 1 : 0,
            Name = GenerateAssetInstanceName(asset.Classification.Kind, name, number),
            Image = imageId is null ? null : new ResourceMetadata { Id = imageId.Value },
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

        var name = ExtractAssetNameOrDefault(asset.Name);
        var number = encounter.Assets.Max(sa => ExtractAssetNumberOrDefault(sa.Name, name!)) + 1;
        var encounterAsset = asset.Clone() with {
            Index = encounter.Assets.Max(sa => sa.Index) + 1,
            Name = $"{name} #{number}",
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
            Image = imageId == encounterAsset.Image?.Id ? encounterAsset.Image : (imageId is null ? null : new ResourceMetadata { Id = imageId.Value }),
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
            var encounterAsset = asset.Clone() with {
                Index = ++currentMaxIndex,
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
            var name = data.Name ?? asset.Name;
            var number = encounter.Assets.Max(sa => ExtractAssetNumberOrDefault(sa.Name, name)) + 1;
            var encounterAsset = new EncounterAsset {
                AssetId = assetId,
                Index = ++currentMaxIndex,
                Name = GenerateAssetInstanceName(asset.Classification.Kind, name, number),
                Notes = data.Notes,
                Image = imageId is null ? null : new ResourceMetadata { Id = imageId.Value },
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
        var wall = new EncounterWall {
            Index = index,
            Segments = data.Segments,
        };

        await encounterStorage.AddWallAsync(id, wall, ct);
        return wall;
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
        var region = new EncounterRegion {
            Index = index,
            Name = data.Name ?? $"Region {index + 1}",
            Vertices = data.Vertices,
            Type = data.Type,
            Value = data.Value,
        };

        await encounterStorage.AddRegionAsync(id, region, ct);
        return region;
    }

    /// <inheritdoc />
    public async Task<Result> UpdateRegionAsync(Guid userId, Guid id, uint index, EncounterRegionUpdateData data, CancellationToken ct = default) {
        var encounter = await encounterStorage.GetByIdAsync(id, ct);
        if (encounter is null)
            return Result.Failure("NotFound");
        var region = encounter.Regions.FirstOrDefault(b => b.Index == index);
        if (region is null)
            return Result.Failure("NotFound");
        if (encounter.Adventure.OwnerId != userId)
            return Result.Failure("NotAllowed");

        region = region with {
            Index = index,
            Name = data.Name.IsSet ? data.Name.Value : region.Name,
            Vertices = data.Vertices.IsSet ? data.Vertices.Value : region.Vertices,
            Value = data.Value.IsSet ? data.Value.Value : region.Value,
            Type = data.Type.IsSet ? data.Type.Value : region.Type,
        };

        await encounterStorage.UpdateRegionAsync(id, region, ct);
        return Result.Success();
    }

    /// <inheritdoc />
    public async Task<Result> RemoveRegionAsync(Guid userId, Guid id, uint index, CancellationToken ct = default) {
        var encounter = await encounterStorage.GetByIdAsync(id, ct);
        if (encounter is null)
            return Result.Failure("NotFound");
        var region = encounter.Regions.FirstOrDefault(b => b.Index == index);
        if (region is null)
            return Result.Failure("NotFound");
        if (encounter.Adventure.OwnerId != userId)
            return Result.Failure("NotAllowed");

        await encounterStorage.DeleteRegionAsync(id, index, ct);
        return Result.Success();
    }

    /// <inheritdoc />
    public async Task<Result<EncounterLight>> AddLightSourceAsync(Guid userId, Guid id, EncounterLightAddData data, CancellationToken ct = default) {
        var encounter = await encounterStorage.GetByIdAsync(id, ct);
        if (encounter is null)
            return Result.Failure("NotFound");
        if (encounter.Adventure.OwnerId != userId)
            return Result.Failure("NotAllowed");

        var result = data.Validate();
        if (result.HasErrors)
            return result;

        var index = encounter.LightSources.Count != 0 ? encounter.LightSources.Max(ss => ss.Index) + 1 : 0;
        var light = new EncounterLight {
            Index = index,
            Name = data.Name ?? $"LightSource {index + 1}",
            Type = data.Type,
            Position = data.Position,
            Range = data.Range,
            Direction = data.Direction,
            Arc = data.Arc,
            Color = data.Color,
            IsOn = data.IsOn,
        };

        await encounterStorage.AddLightSourceAsync(id, light, ct);
        return light;
    }

    /// <inheritdoc />
    public async Task<Result> UpdateLightSourceAsync(Guid userId, Guid id, uint index, EncounterLightUpdateData data, CancellationToken ct = default) {
        var encounter = await encounterStorage.GetByIdAsync(id, ct);
        if (encounter is null)
            return Result.Failure("NotFound");
        var light = encounter.LightSources.FirstOrDefault(b => b.Index == index);
        if (light is null)
            return Result.Failure("NotFound");
        if (encounter.Adventure.OwnerId != userId)
            return Result.Failure("NotAllowed");

        var result = data.Validate();
        if (result.HasErrors)
            return result;

        light = light with {
            Index = index,
            Type = data.Type.IsSet ? data.Type.Value : light.Type,
            Name = data.Name.IsSet ? data.Name.Value : light.Name,
            Position = data.Position.IsSet ? data.Position.Value : light.Position,
            Range = data.Range.IsSet ? data.Range.Value : light.Range,
            Direction = data.Direction.IsSet ? data.Direction.Value : light.Direction,
            Arc = data.Arc.IsSet ? data.Arc.Value : light.Arc,
            Color = data.Color.IsSet ? data.Color.Value : light.Color,
            IsOn = data.IsOn.IsSet ? data.IsOn.Value : light.IsOn,
        };

        await encounterStorage.UpdateLightSourceAsync(id, light, ct);
        return Result.Success();
    }

    /// <inheritdoc />
    public async Task<Result> RemoveLightSourceAsync(Guid userId, Guid id, uint index, CancellationToken ct = default) {
        var encounter = await encounterStorage.GetByIdAsync(id, ct);
        if (encounter is null)
            return Result.Failure("NotFound");
        var encounterLightSource = encounter.LightSources.FirstOrDefault(b => b.Index == index);
        if (encounterLightSource is null)
            return Result.Failure("NotFound");
        if (encounter.Adventure.OwnerId != userId)
            return Result.Failure("NotAllowed");

        await encounterStorage.DeleteLightSourceAsync(id, index, ct);
        return Result.Success();
    }
    /// <inheritdoc />
    public async Task<Result<EncounterSound>> AddSoundSourceAsync(Guid userId, Guid id, EncounterSoundAddData data, CancellationToken ct = default) {
        var encounter = await encounterStorage.GetByIdAsync(id, ct);
        if (encounter is null)
            return Result.Failure("NotFound");
        if (encounter.Adventure.OwnerId != userId)
            return Result.Failure("NotAllowed");

        var result = data.Validate();
        if (result.HasErrors)
            return result;

        var index = encounter.SoundSources.Count != 0 ? encounter.SoundSources.Max(ss => ss.Index) + 1 : 0;
        var encounterSoundSource = new EncounterSound {
            Index = index,
            Name = data.Name ?? $"SoundSource {index + 1}",
            Position = data.Position,
            Range = data.Range,
            IsPlaying = data.IsPlaying,
            Loop = data.Loop,
            Resource = data.ResourceId.HasValue ? new ResourceMetadata { Id = data.ResourceId.Value } : null,
        };

        await encounterStorage.AddSoundSourceAsync(id, encounterSoundSource, ct);
        return encounterSoundSource;
    }

    /// <inheritdoc />
    public async Task<Result> UpdateSoundSourceAsync(Guid userId, Guid id, uint index, EncounterSoundUpdateData data, CancellationToken ct = default) {
        var encounter = await encounterStorage.GetByIdAsync(id, ct);
        if (encounter is null)
            return Result.Failure("NotFound");
        var sound = encounter.SoundSources.FirstOrDefault(b => b.Index == index);
        if (sound is null)
            return Result.Failure("NotFound");
        if (encounter.Adventure.OwnerId != userId)
            return Result.Failure("NotAllowed");

        var result = data.Validate();
        if (result.HasErrors)
            return result;

        sound = sound with {
            Index = index,
            Name = data.Name.IsSet ? data.Name.Value : sound.Name,
            Position = data.Position.IsSet ? data.Position.Value : sound.Position,
            Range = data.Range.IsSet ? data.Range.Value : sound.Range,
            IsPlaying = data.IsPlaying.IsSet ? data.IsPlaying.Value : sound.IsPlaying,
            Loop = data.Loop.IsSet ? data.Loop.Value : sound.Loop,
            Resource = data.ResourceId.IsSet ? (data.ResourceId.Value.HasValue ? new ResourceMetadata { Id = data.ResourceId.Value.Value } : null) : sound.Resource,
        };

        await encounterStorage.UpdateSoundSourceAsync(id, sound, ct);
        return Result.Success();
    }

    /// <inheritdoc />
    public async Task<Result> RemoveSoundSourceAsync(Guid userId, Guid id, uint index, CancellationToken ct = default) {
        var encounter = await encounterStorage.GetByIdAsync(id, ct);
        if (encounter is null)
            return Result.Failure("NotFound");
        var sound = encounter.SoundSources.FirstOrDefault(b => b.Index == index);
        if (sound is null)
            return Result.Failure("NotFound");
        if (encounter.Adventure.OwnerId != userId)
            return Result.Failure("NotAllowed");

        await encounterStorage.DeleteSoundSourceAsync(id, index, ct);
        return Result.Success();
    }

    [GeneratedRegex(@" #(?<number>\d+)$", RegexOptions.Compiled | RegexOptions.CultureInvariant)]
    private static partial Regex AssetNumber();

    private static uint ExtractAssetNumberOrDefault(string? input, string prefix) {
        if (string.IsNullOrEmpty(input))
            return 0;
        if (!input.StartsWith(prefix))
            return 0;
        var match = AssetNumber().Match(input);
        if (!match.Success)
            return 0;
        var value = match.Groups["number"].Value;
        uint.TryParse(value, CultureInfo.InvariantCulture, out var number);
        return number;
    }

    [return: NotNullIfNotNull(nameof(input))]
    private static string? ExtractAssetNameOrDefault(string? input) {
        if (string.IsNullOrWhiteSpace(input))
            return null;
        var match = AssetNumber().Match(input);
        return !match.Success
            ? input
            : input[..match.Index].TrimEnd();
    }
}