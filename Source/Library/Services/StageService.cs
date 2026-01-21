namespace VttTools.Library.Services;

public class StageService(IStageStorage stageStorage)
    : IStageService {
    public Task<Stage[]> GetAllAsync(CancellationToken ct = default)
        => stageStorage.GetAllAsync(ct);

    public Task<Stage[]> SearchAsync(string filterDefinition, CancellationToken ct = default)
        => stageStorage.GetManyAsync(filterDefinition, ct);

    public Task<Stage?> GetByIdAsync(Guid id, CancellationToken ct = default)
        => stageStorage.GetByIdAsync(id, ct);

    public async Task<Result<Stage>> CreateAsync(Guid userId, CreateStageData data, CancellationToken ct = default) {
        var result = data.Validate();
        if (result.HasErrors)
            return result;

        var id = Guid.CreateVersion7();
        var stage = new Stage {
            Id = id,
            OwnerId = userId,
            Name = data.Name,
            Description = data.Description,
            Grid = new(),
            Settings = new(),
        };

        await stageStorage.AddAsync(stage, ct);
        return stage;
    }

    public async Task<Result<Stage>> CloneAsync(Guid userId, Guid templateId, CancellationToken ct = default) {
        var template = await stageStorage.GetByIdAsync(templateId, ct);
        if (template is null)
            return Result.Failure("NotFound");

        if (template.OwnerId != userId && template is not { IsPublic: true, IsPublished: true })
            return Result.Failure("NotAllowed");

        var id = Guid.CreateVersion7();
        var clone = template with {
            Id = id,
            OwnerId = userId,
            Name = $"{template.Name} (Copy)",
            Settings = new() {
                MainBackground = template.Settings.MainBackground?.Clone(),
                AlternateBackground = template.Settings.AlternateBackground?.Clone(),
                UseAlternateBackground = template.Settings.UseAlternateBackground,
                AmbientSound = template.Settings.AmbientSound?.Clone(),
                AmbientSoundSource = template.Settings.AmbientSoundSource,
                AmbientSoundVolume = template.Settings.AmbientSoundVolume,
                AmbientSoundLoop = template.Settings.AmbientSoundLoop,
                AmbientSoundIsPlaying = template.Settings.AmbientSoundIsPlaying,
                Panning = template.Settings.Panning,
                ZoomLevel = template.Settings.ZoomLevel,
                AmbientLight = template.Settings.AmbientLight,
                Weather = template.Settings.Weather,
            },
            Grid = new() {
                Type = template.Grid.Type,
                CellSize = template.Grid.CellSize,
                Offset = template.Grid.Offset,
                Scale = template.Grid.Scale,
            },
            IsPublished = false,
            IsPublic = false,
            Walls = [.. template.Walls.Select((w, i) => w with { Index = (ushort)i })],
            Regions = [.. template.Regions.Select((r, i) => r with { Index = (ushort)i })],
            Lights = [.. template.Lights.Select((l, i) => l with { Index = (ushort)i })],
            Elements = [.. template.Elements.Select((d, i) => d with { Index = (ushort)i })],
            Sounds = [.. template.Sounds.Select((s, i) => s with { Index = (ushort)i })],
        };

        await stageStorage.AddAsync(clone, ct);
        return clone;
    }

    public async Task<Result> UpdateAsync(Guid userId, Guid id, UpdateStageData data, CancellationToken ct = default) {
        var stage = await stageStorage.GetByIdAsync(id, ct);
        if (stage is null)
            return Result.Failure("NotFound");
        if (stage.OwnerId != userId)
            return Result.Failure("NotAllowed");

        var result = data.Validate();
        if (result.HasErrors)
            return result;

        stage = stage with {
            Name = data.Name.IsSet ? data.Name.Value : stage.Name,
            Settings = data.Settings.IsSet ? stage.Settings with {
                Panning = data.Settings.Value.Panning.IsSet ? data.Settings.Value.Panning.Value : stage.Settings.Panning,
                ZoomLevel = data.Settings.Value.ZoomLevel.IsSet ? data.Settings.Value.ZoomLevel.Value : stage.Settings.ZoomLevel,
                MainBackground = data.Settings.Value.MainBackgroundId.IsSet
                    ? data.Settings.Value.MainBackgroundId.Value.HasValue
                          ? new ResourceMetadata { Id = data.Settings.Value.MainBackgroundId.Value.Value }
                          : null
                    : stage.Settings.MainBackground,
                AlternateBackground = data.Settings.Value.AlternateBackgroundId.IsSet
                    ? data.Settings.Value.AlternateBackgroundId.Value.HasValue
                          ? new ResourceMetadata { Id = data.Settings.Value.AlternateBackgroundId.Value.Value }
                          : null
                    : stage.Settings.AlternateBackground,
                UseAlternateBackground = data.Settings.Value.UseAlternateBackground.IsSet ? data.Settings.Value.UseAlternateBackground.Value : stage.Settings.UseAlternateBackground,
                AmbientSound = data.Settings.Value.AmbientSoundId.IsSet
                    ? data.Settings.Value.AmbientSoundId.Value.HasValue
                          ? new ResourceMetadata { Id = data.Settings.Value.AmbientSoundId.Value.Value }
                          : null
                    : stage.Settings.AmbientSound,
                AmbientSoundSource = data.Settings.Value.AmbientSoundSource.IsSet ? data.Settings.Value.AmbientSoundSource.Value : stage.Settings.AmbientSoundSource,
                AmbientSoundVolume = data.Settings.Value.AmbientSoundVolume.IsSet ? data.Settings.Value.AmbientSoundVolume.Value : stage.Settings.AmbientSoundVolume,
                AmbientSoundLoop = data.Settings.Value.AmbientSoundLoop.IsSet ? data.Settings.Value.AmbientSoundLoop.Value : stage.Settings.AmbientSoundLoop,
                AmbientSoundIsPlaying = data.Settings.Value.AmbientSoundIsPlaying.IsSet ? data.Settings.Value.AmbientSoundIsPlaying.Value : stage.Settings.AmbientSoundIsPlaying,
                AmbientLight = data.Settings.Value.AmbientLight.IsSet ? data.Settings.Value.AmbientLight.Value : stage.Settings.AmbientLight,
                Weather = data.Settings.Value.Weather.IsSet ? data.Settings.Value.Weather.Value : stage.Settings.Weather,
            } : stage.Settings,
            Description = data.Description.IsSet ? data.Description.Value : stage.Description,
            IsPublished = data.IsPublished.IsSet ? data.IsPublished.Value : stage.IsPublished,
            IsPublic = data.IsPublic.IsSet ? data.IsPublic.Value : stage.IsPublic,
            Grid = data.Grid.IsSet ? stage.Grid with {
                Type = data.Grid.Value.Type.IsSet ? data.Grid.Value.Type.Value : stage.Grid.Type,
                CellSize = data.Grid.Value.CellSize.IsSet ? data.Grid.Value.CellSize.Value : stage.Grid.CellSize,
                Offset = data.Grid.Value.Offset.IsSet ? data.Grid.Value.Offset.Value : stage.Grid.Offset,
                Scale = data.Grid.Value.Scale.IsSet ? data.Grid.Value.Scale.Value : stage.Grid.Scale,
            } : stage.Grid,
        };

        await stageStorage.UpdateAsync(stage, ct);
        return Result.Success();
    }

    public async Task<Result> DeleteAsync(Guid userId, Guid id, CancellationToken ct = default) {
        var stage = await stageStorage.GetByIdAsync(id, ct);
        if (stage is null)
            return Result.Failure("NotFound");
        if (stage.OwnerId != userId)
            return Result.Failure("NotAllowed");

        await stageStorage.DeleteAsync(id, ct);
        return Result.Success();
    }

    public async Task<Result<StageWall>> AddWallAsync(Guid userId, Guid stageId, StageWall wall, CancellationToken ct = default) {
        var stage = await stageStorage.GetByIdAsync(stageId, ct);
        if (stage is null)
            return Result.Failure("NotFound");
        if (stage.OwnerId != userId)
            return Result.Failure("NotAllowed");

        var nextIndex = stage.Walls.Count > 0 ? (ushort)(stage.Walls.Max(w => w.Index) + 1) : (ushort)0;
        var newWall = wall with { Index = nextIndex };
        var updatedStage = stage with { Walls = [.. stage.Walls, newWall] };

        await stageStorage.UpdateAsync(updatedStage, ct);
        return newWall;
    }

    public async Task<Result> UpdateWallAsync(Guid userId, Guid stageId, ushort index, StageWall wall, CancellationToken ct = default) {
        var stage = await stageStorage.GetByIdAsync(stageId, ct);
        if (stage is null)
            return Result.Failure("NotFound");
        if (stage.OwnerId != userId)
            return Result.Failure("NotAllowed");

        var existing = stage.Walls.FirstOrDefault(w => w.Index == index);
        if (existing is null)
            return Result.Failure("NotFound");

        var updatedWalls = stage.Walls.Select(w => w.Index == index ? wall with { Index = index } : w).ToList();
        var updatedStage = stage with { Walls = updatedWalls };

        await stageStorage.UpdateAsync(updatedStage, ct);
        return Result.Success();
    }

    public async Task<Result> RemoveWallAsync(Guid userId, Guid stageId, ushort index, CancellationToken ct = default) {
        var stage = await stageStorage.GetByIdAsync(stageId, ct);
        if (stage is null)
            return Result.Failure("NotFound");
        if (stage.OwnerId != userId)
            return Result.Failure("NotAllowed");

        var existing = stage.Walls.FirstOrDefault(w => w.Index == index);
        if (existing is null)
            return Result.Failure("NotFound");

        var updatedWalls = stage.Walls.Where(w => w.Index != index).ToList();
        var updatedStage = stage with { Walls = updatedWalls };

        await stageStorage.UpdateAsync(updatedStage, ct);
        return Result.Success();
    }

    public async Task<Result<StageRegion>> AddRegionAsync(Guid userId, Guid stageId, StageRegion region, CancellationToken ct = default) {
        var stage = await stageStorage.GetByIdAsync(stageId, ct);
        if (stage is null)
            return Result.Failure("NotFound");
        if (stage.OwnerId != userId)
            return Result.Failure("NotAllowed");

        var nextIndex = stage.Regions.Count > 0 ? (ushort)(stage.Regions.Max(r => r.Index) + 1) : (ushort)0;
        var newRegion = region with { Index = nextIndex };
        var updatedStage = stage with { Regions = [.. stage.Regions, newRegion] };

        await stageStorage.UpdateAsync(updatedStage, ct);
        return newRegion;
    }

    public async Task<Result> UpdateRegionAsync(Guid userId, Guid stageId, ushort index, StageRegion region, CancellationToken ct = default) {
        var stage = await stageStorage.GetByIdAsync(stageId, ct);
        if (stage is null)
            return Result.Failure("NotFound");
        if (stage.OwnerId != userId)
            return Result.Failure("NotAllowed");

        var existing = stage.Regions.FirstOrDefault(r => r.Index == index);
        if (existing is null)
            return Result.Failure("NotFound");

        var updatedRegions = stage.Regions.Select(r => r.Index == index ? region with { Index = index } : r).ToList();
        var updatedStage = stage with { Regions = updatedRegions };

        await stageStorage.UpdateAsync(updatedStage, ct);
        return Result.Success();
    }

    public async Task<Result> RemoveRegionAsync(Guid userId, Guid stageId, ushort index, CancellationToken ct = default) {
        var stage = await stageStorage.GetByIdAsync(stageId, ct);
        if (stage is null)
            return Result.Failure("NotFound");
        if (stage.OwnerId != userId)
            return Result.Failure("NotAllowed");

        var existing = stage.Regions.FirstOrDefault(r => r.Index == index);
        if (existing is null)
            return Result.Failure("NotFound");

        var updatedRegions = stage.Regions.Where(r => r.Index != index).ToList();
        var updatedStage = stage with { Regions = updatedRegions };

        await stageStorage.UpdateAsync(updatedStage, ct);
        return Result.Success();
    }

    public async Task<Result<StageLight>> AddLightAsync(Guid userId, Guid stageId, StageLight light, CancellationToken ct = default) {
        var stage = await stageStorage.GetByIdAsync(stageId, ct);
        if (stage is null)
            return Result.Failure("NotFound");
        if (stage.OwnerId != userId)
            return Result.Failure("NotAllowed");

        var nextIndex = stage.Lights.Count > 0 ? (ushort)(stage.Lights.Max(l => l.Index) + 1) : (ushort)0;
        var newLight = light with { Index = nextIndex };
        var updatedStage = stage with { Lights = [.. stage.Lights, newLight] };

        await stageStorage.UpdateAsync(updatedStage, ct);
        return newLight;
    }

    public async Task<Result> UpdateLightAsync(Guid userId, Guid stageId, ushort index, StageLight light, CancellationToken ct = default) {
        var stage = await stageStorage.GetByIdAsync(stageId, ct);
        if (stage is null)
            return Result.Failure("NotFound");
        if (stage.OwnerId != userId)
            return Result.Failure("NotAllowed");

        var existing = stage.Lights.FirstOrDefault(l => l.Index == index);
        if (existing is null)
            return Result.Failure("NotFound");

        var updatedLights = stage.Lights.Select(l => l.Index == index ? light with { Index = index } : l).ToList();
        var updatedStage = stage with { Lights = updatedLights };

        await stageStorage.UpdateAsync(updatedStage, ct);
        return Result.Success();
    }

    public async Task<Result> RemoveLightAsync(Guid userId, Guid stageId, ushort index, CancellationToken ct = default) {
        var stage = await stageStorage.GetByIdAsync(stageId, ct);
        if (stage is null)
            return Result.Failure("NotFound");
        if (stage.OwnerId != userId)
            return Result.Failure("NotAllowed");

        var existing = stage.Lights.FirstOrDefault(l => l.Index == index);
        if (existing is null)
            return Result.Failure("NotFound");

        var updatedLights = stage.Lights.Where(l => l.Index != index).ToList();
        var updatedStage = stage with { Lights = updatedLights };

        await stageStorage.UpdateAsync(updatedStage, ct);
        return Result.Success();
    }

    public async Task<Result<StageElement>> AddDecorationAsync(Guid userId, Guid stageId, StageElement decoration, CancellationToken ct = default) {
        var stage = await stageStorage.GetByIdAsync(stageId, ct);
        if (stage is null)
            return Result.Failure("NotFound");
        if (stage.OwnerId != userId)
            return Result.Failure("NotAllowed");

        var nextIndex = stage.Elements.Count > 0 ? (ushort)(stage.Elements.Max(d => d.Index) + 1) : (ushort)0;
        var newDecoration = decoration with { Index = nextIndex };
        var updatedStage = stage with { Elements = [.. stage.Elements, newDecoration] };

        await stageStorage.UpdateAsync(updatedStage, ct);
        return newDecoration;
    }

    public async Task<Result> UpdateDecorationAsync(Guid userId, Guid stageId, ushort index, StageElement decoration, CancellationToken ct = default) {
        var stage = await stageStorage.GetByIdAsync(stageId, ct);
        if (stage is null)
            return Result.Failure("NotFound");
        if (stage.OwnerId != userId)
            return Result.Failure("NotAllowed");

        var existing = stage.Elements.FirstOrDefault(d => d.Index == index);
        if (existing is null)
            return Result.Failure("NotFound");

        var updatedElements = stage.Elements.Select(d => d.Index == index ? decoration with { Index = index } : d).ToList();
        var updatedStage = stage with { Elements = updatedElements };

        await stageStorage.UpdateAsync(updatedStage, ct);
        return Result.Success();
    }

    public async Task<Result> RemoveDecorationAsync(Guid userId, Guid stageId, ushort index, CancellationToken ct = default) {
        var stage = await stageStorage.GetByIdAsync(stageId, ct);
        if (stage is null)
            return Result.Failure("NotFound");
        if (stage.OwnerId != userId)
            return Result.Failure("NotAllowed");

        var existing = stage.Elements.FirstOrDefault(d => d.Index == index);
        if (existing is null)
            return Result.Failure("NotFound");

        var updatedElements = stage.Elements.Where(d => d.Index != index).ToList();
        var updatedStage = stage with { Elements = updatedElements };

        await stageStorage.UpdateAsync(updatedStage, ct);
        return Result.Success();
    }

    public async Task<Result<StageSound>> AddSoundAsync(Guid userId, Guid stageId, StageSound sound, CancellationToken ct = default) {
        var stage = await stageStorage.GetByIdAsync(stageId, ct);
        if (stage is null)
            return Result.Failure("NotFound");
        if (stage.OwnerId != userId)
            return Result.Failure("NotAllowed");

        var nextIndex = stage.Sounds.Count > 0 ? (ushort)(stage.Sounds.Max(s => s.Index) + 1) : (ushort)0;
        var newSound = sound with { Index = nextIndex };
        var updatedStage = stage with { Sounds = [.. stage.Sounds, newSound] };

        await stageStorage.UpdateAsync(updatedStage, ct);
        return newSound;
    }

    public async Task<Result> UpdateSoundAsync(Guid userId, Guid stageId, ushort index, StageSound sound, CancellationToken ct = default) {
        var stage = await stageStorage.GetByIdAsync(stageId, ct);
        if (stage is null)
            return Result.Failure("NotFound");
        if (stage.OwnerId != userId)
            return Result.Failure("NotAllowed");

        var existing = stage.Sounds.FirstOrDefault(s => s.Index == index);
        if (existing is null)
            return Result.Failure("NotFound");

        var updatedSounds = stage.Sounds.Select(s => s.Index == index ? sound with { Index = index } : s).ToList();
        var updatedStage = stage with { Sounds = updatedSounds };

        await stageStorage.UpdateAsync(updatedStage, ct);
        return Result.Success();
    }

    public async Task<Result> RemoveSoundAsync(Guid userId, Guid stageId, ushort index, CancellationToken ct = default) {
        var stage = await stageStorage.GetByIdAsync(stageId, ct);
        if (stage is null)
            return Result.Failure("NotFound");
        if (stage.OwnerId != userId)
            return Result.Failure("NotAllowed");

        var existing = stage.Sounds.FirstOrDefault(s => s.Index == index);
        if (existing is null)
            return Result.Failure("NotFound");

        var updatedSounds = stage.Sounds.Where(s => s.Index != index).ToList();
        var updatedStage = stage with { Sounds = updatedSounds };

        await stageStorage.UpdateAsync(updatedStage, ct);
        return Result.Success();
    }
}