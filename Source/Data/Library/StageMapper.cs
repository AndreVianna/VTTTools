using Stage = VttTools.Library.Stages.Model.Stage;
using StageDecorationEntity = VttTools.Data.Library.Stages.Entities.StageElement;
using StageElement = VttTools.Library.Stages.Model.StageElement;
using StageEntity = VttTools.Data.Library.Stages.Entities.Stage;
using StageLight = VttTools.Library.Stages.Model.StageLight;
using StageLightEntity = VttTools.Data.Library.Stages.Entities.StageLight;
using StageRegion = VttTools.Library.Stages.Model.StageRegion;
using StageRegionEntity = VttTools.Data.Library.Stages.Entities.StageRegion;
using StageRegionVertexEntity = VttTools.Data.Library.Stages.Entities.StageRegionVertex;
using StageSound = VttTools.Library.Stages.Model.StageSound;
using StageSoundEntity = VttTools.Data.Library.Stages.Entities.StageSound;
using StageWall = VttTools.Library.Stages.Model.StageWall;
using StageWallEntity = VttTools.Data.Library.Stages.Entities.StageWall;
using StageWallSegment = VttTools.Library.Stages.Model.StageWallSegment;
using StageWallSegmentEntity = VttTools.Data.Library.Stages.Entities.StageWallSegment;

namespace VttTools.Data.Library;

internal static class StageMapper {
    internal static Expression<Func<StageEntity, Stage>> AsStage = entity
        => new() {
            Id = entity.Id,
            OwnerId = entity.OwnerId,
            Name = entity.Name,
            Description = entity.Description,
            IsPublished = entity.IsPublished,
            IsPublic = entity.IsPublic,
            Settings = new() {
                MainBackground = entity.MainBackground.ToModel(),
                AlternateBackground = entity.AlternateBackground.ToModel(),
                UseAlternateBackground = entity.UseAlternateBackground,
                AmbientLight = entity.AmbientLight,
                AmbientSound = entity.AmbientSound.ToModel(),
                AmbientSoundSource = entity.AmbientSoundSource,
                AmbientSoundVolume = entity.AmbientSoundVolume,
                AmbientSoundLoop = entity.AmbientSoundLoop,
                AmbientSoundIsPlaying = entity.AmbientSoundIsPlaying,
                ZoomLevel = entity.ZoomLevel,
                Panning = entity.Panning,
                Weather = entity.Weather,
            },
            Grid = new() {
                Type = entity.GridType,
                CellSize = entity.GridCellSize,
                Offset = entity.GridOffset,
                Scale = entity.GridScale,
            },
            Walls = entity.Walls.AsQueryable().Select(AsStageWall!).ToList(),
            Regions = entity.Regions.AsQueryable().Select(AsStageRegion!).ToList(),
            Lights = entity.Lights.AsQueryable().Select(AsStageLight!).ToList(),
            Elements = entity.Elements.AsQueryable().Select(AsStageDecoration!).ToList(),
            Sounds = entity.Sounds.AsQueryable().Select(AsStageSound!).ToList(),
        };

    internal static Expression<Func<StageWallEntity, StageWall>> AsStageWall = entity
        => new() {
            Index = entity.Index,
            Segments = entity.Segments.AsQueryable().Select(s => s.ToModel()).ToList(),
        };

    internal static Expression<Func<StageRegionEntity, StageRegion>> AsStageRegion = entity
        => new() {
            Index = entity.Index,
            Name = entity.Name,
            Type = entity.Type,
            Vertices = entity.Vertices.OrderBy(v => v.Index).Select(v => new StageRegionVertex(v.X, v.Y)).ToList(),
            Value = entity.Value,
        };

    internal static Expression<Func<StageLightEntity, StageLight>> AsStageLight = entity
        => new() {
            Index = entity.Index,
            Name = entity.Name,
            Type = entity.Type,
            Position = entity.Position,
            Direction = entity.Direction,
            Range = entity.Range,
            Arc = entity.Arc,
            Color = entity.Color,
            IsOn = entity.IsOn,
        };

    internal static Expression<Func<StageDecorationEntity, StageElement>> AsStageDecoration = entity
        => new() {
            Index = entity.Index,
            Name = entity.Name,
            Display = entity.Display.ToModel(),
            Position = entity.Position,
            Rotation = entity.Rotation,
            Elevation = entity.Elevation,
            Size = new Dimension((float)entity.DisplaySize.Width, (float)entity.DisplaySize.Height),
            Opacity = entity.Opacity,
        };

    internal static Expression<Func<StageSoundEntity, StageSound>> AsStageSound = entity
        => new() {
            Index = entity.Index,
            Name = entity.Name,
            Media = entity.Media.ToModel(),
            Position = entity.Position,
            Radius = entity.Radius,
            Volume = entity.Volume,
            Loop = entity.Loop,
            IsPlaying = entity.IsPlaying,
        };

    [return: NotNullIfNotNull(nameof(entity))]
    internal static Stage? ToModel(this StageEntity? entity) {
        if (entity is null)
            return null;
        var grid = new Grid {
            Type = entity.GridType,
            CellSize = entity.GridCellSize,
            Offset = entity.GridOffset,
            Scale = entity.GridScale,
        };
        return new() {
            Id = entity.Id,
            OwnerId = entity.OwnerId,
            Name = entity.Name,
            Description = entity.Description,
            IsPublished = entity.IsPublished,
            IsPublic = entity.IsPublic,
            Settings = new() {
                MainBackground = entity.MainBackground.ToModel(),
                AlternateBackground = entity.AlternateBackground.ToModel(),
                UseAlternateBackground = entity.UseAlternateBackground,
                AmbientLight = entity.AmbientLight,
                AmbientSound = entity.AmbientSound.ToModel(),
                AmbientSoundSource = entity.AmbientSoundSource,
                AmbientSoundVolume = entity.AmbientSoundVolume,
                AmbientSoundLoop = entity.AmbientSoundLoop,
                AmbientSoundIsPlaying = entity.AmbientSoundIsPlaying,
                ZoomLevel = entity.ZoomLevel,
                Panning = entity.Panning,
                Weather = entity.Weather,
            },
            Grid = new() {
                Type = entity.GridType,
                CellSize = entity.GridCellSize,
                Offset = entity.GridOffset,
                Scale = entity.GridScale,
            },
            Walls = [.. entity.Walls.Select(w => w.ToModel(grid))],
            Regions = [.. entity.Regions.Select(r => r.ToModel(grid))],
            Lights = [.. entity.Lights.Select(l => l.ToModel(grid))],
            Elements = [.. entity.Elements.Select(d => d.ToModel(grid))],
            Sounds = [.. entity.Sounds.Select(s => s.ToModel(grid))],
        };
    }

    internal static StageEntity ToEntity(this Stage model) {
        var entity = new StageEntity {
            Id = model.Id,
            OwnerId = model.OwnerId,
            Name = model.Name,
            Description = model.Description ?? string.Empty,
            IsPublished = model.IsPublished,
            IsPublic = model.IsPublic,
            // Only set FK IDs, NOT navigation properties - prevents corrupting Resource table
            MainBackgroundId = model.Settings.MainBackground?.Id,
            AlternateBackgroundId = model.Settings.AlternateBackground?.Id,
            UseAlternateBackground = model.Settings.UseAlternateBackground,
            AmbientLight = model.Settings.AmbientLight,
            AmbientSoundId = model.Settings.AmbientSound?.Id,
            AmbientSoundSource = model.Settings.AmbientSoundSource,
            AmbientSoundVolume = model.Settings.AmbientSoundVolume,
            AmbientSoundLoop = model.Settings.AmbientSoundLoop,
            AmbientSoundIsPlaying = model.Settings.AmbientSoundIsPlaying,
            ZoomLevel = model.Settings.ZoomLevel,
            Panning = model.Settings.Panning,
            Weather = model.Settings.Weather,
            GridType = model.Grid.Type,
            GridCellSize = model.Grid.CellSize,
            GridOffset = model.Grid.Offset,
            GridScale = model.Grid.Scale,
            Walls = [.. model.Walls.Select(w => w.ToEntity(model.Id, model.Grid))],
            Regions = [.. model.Regions.Select(r => r.ToEntity(model.Id, model.Grid))],
            Lights = [.. model.Lights.Select(l => l.ToEntity(model.Id, model.Grid))],
            Elements = [.. model.Elements.Select(d => d.ToEntity(model.Id, model.Grid))],
            Sounds = [.. model.Sounds.Select(s => s.ToEntity(model.Id, model.Grid))],
        };
        return entity;
    }

    internal static StageEntity UpdateFrom(this StageEntity entity, Stage model) {
        entity.OwnerId = model.OwnerId;
        entity.Name = model.Name;
        entity.Description = model.Description ?? string.Empty;
        entity.IsPublished = model.IsPublished;
        entity.IsPublic = model.IsPublic;
        // Only update FK IDs, NOT navigation properties - prevents corrupting Resource table
        entity.MainBackgroundId = model.Settings.MainBackground?.Id;
        entity.AlternateBackgroundId = model.Settings.AlternateBackground?.Id;
        entity.UseAlternateBackground = model.Settings.UseAlternateBackground;
        entity.AmbientLight = model.Settings.AmbientLight;
        entity.AmbientSoundId = model.Settings.AmbientSound?.Id;
        entity.AmbientSoundSource = model.Settings.AmbientSoundSource;
        entity.AmbientSoundVolume = model.Settings.AmbientSoundVolume;
        entity.AmbientSoundLoop = model.Settings.AmbientSoundLoop;
        entity.AmbientSoundIsPlaying = model.Settings.AmbientSoundIsPlaying;

        entity.ZoomLevel = model.Settings.ZoomLevel;
        entity.Panning = model.Settings.Panning;
        entity.Weather = model.Settings.Weather;
        entity.GridCellSize = model.Grid.CellSize;
        entity.GridOffset = model.Grid.Offset;
        entity.GridScale = model.Grid.Scale;
        entity.GridType = model.Grid.Type;

        // Update Walls
        var wallIndices = model.Walls.Select(w => w.Index).ToHashSet();
        foreach (var wallToRemove in entity.Walls.Where(w => !wallIndices.Contains(w.Index)).ToList())
            entity.Walls.Remove(wallToRemove);
        foreach (var modelWall in model.Walls) {
            var existingWall = entity.Walls.FirstOrDefault(w => w.Index == modelWall.Index);
            if (existingWall is not null)
                existingWall.UpdateFrom(entity.Id, modelWall, model.Grid);
            else
                entity.Walls.Add(modelWall.ToEntity(entity.Id, model.Grid));
        }

        // Update Regions
        var regionIndices = model.Regions.Select(r => r.Index).ToHashSet();
        foreach (var regionToRemove in entity.Regions.Where(r => !regionIndices.Contains(r.Index)).ToList())
            entity.Regions.Remove(regionToRemove);
        foreach (var modelRegion in model.Regions) {
            var existingRegion = entity.Regions.FirstOrDefault(r => r.Index == modelRegion.Index);
            if (existingRegion is not null)
                existingRegion.UpdateFrom(entity.Id, modelRegion, model.Grid);
            else
                entity.Regions.Add(modelRegion.ToEntity(entity.Id, model.Grid));
        }

        // Update Lights
        var lightIndices = model.Lights.Select(l => l.Index).ToHashSet();
        foreach (var lightToRemove in entity.Lights.Where(l => !lightIndices.Contains(l.Index)).ToList())
            entity.Lights.Remove(lightToRemove);
        foreach (var modelLight in model.Lights) {
            var existingLight = entity.Lights.FirstOrDefault(l => l.Index == modelLight.Index);
            if (existingLight is not null)
                existingLight.UpdateFrom(entity.Id, modelLight, model.Grid);
            else
                entity.Lights.Add(modelLight.ToEntity(entity.Id, model.Grid));
        }

        // Update Elements
        var decorationIndices = model.Elements.Select(d => d.Index).ToHashSet();
        foreach (var decorationToRemove in entity.Elements.Where(d => !decorationIndices.Contains(d.Index)).ToList())
            entity.Elements.Remove(decorationToRemove);
        foreach (var modelDecoration in model.Elements) {
            var existingDecoration = entity.Elements.FirstOrDefault(d => d.Index == modelDecoration.Index);
            if (existingDecoration is not null)
                existingDecoration.UpdateFrom(modelDecoration, model.Grid);
            else
                entity.Elements.Add(modelDecoration.ToEntity(entity.Id, model.Grid));
        }

        // Update Sounds
        var soundIndices = model.Sounds.Select(s => s.Index).ToHashSet();
        foreach (var soundToRemove in entity.Sounds.Where(s => !soundIndices.Contains(s.Index)).ToList())
            entity.Sounds.Remove(soundToRemove);
        foreach (var modelSound in model.Sounds) {
            var existingSound = entity.Sounds.FirstOrDefault(s => s.Index == modelSound.Index);
            if (existingSound is not null)
                existingSound.UpdateFrom(modelSound, model.Grid);
            else
                entity.Sounds.Add(modelSound.ToEntity(entity.Id, model.Grid));
        }

        return entity;
    }

    // Wall mappers
    [return: NotNullIfNotNull(nameof(entity))]
    internal static StageWall? ToModel(this StageWallEntity? entity, Grid grid)
        => entity is null ? null : new() {
            Index = entity.Index,
            Segments = entity.Segments.ConvertAll(s => s.ToModel(grid)),
        };

    internal static StageWallEntity ToEntity(this StageWall model, Guid stageId, Grid grid)
        => new() {
            StageId = stageId,
            Index = model.Index,
            Segments = [.. model.Segments.Select(s => new StageWallSegmentEntity {
                StageId = stageId,
                WallIndex = model.Index,
                Index = s.Index,
                Name = s.Name,
                StartPole = GridConverter.PoleToGrid(s.StartPole, grid),
                EndPole = GridConverter.PoleToGrid(s.EndPole, grid),
                Type = s.Type,
                IsOpaque = s.IsOpaque,
                State = s.State,
            })],
        };

    internal static StageWallEntity UpdateFrom(this StageWallEntity entity, Guid stageId, StageWall model, Grid grid) {
        entity.StageId = stageId;
        entity.Index = model.Index;
        entity.Segments = [.. model.Segments.Select(s => new StageWallSegmentEntity {
            StageId = stageId,
            WallIndex = model.Index,
            Index = s.Index,
            Name = s.Name,
            StartPole = GridConverter.PoleToGrid(s.StartPole, grid),
            EndPole = GridConverter.PoleToGrid(s.EndPole, grid),
            Type = s.Type,
            IsOpaque = s.IsOpaque,
            State = s.State,
        })];
        return entity;
    }

    [return: NotNullIfNotNull(nameof(entity))]
    internal static StageWallSegment? ToModel(this StageWallSegmentEntity? entity, Grid grid)
        => entity is null ? null : new() {
            Index = entity.Index,
            Name = entity.Name,
            StartPole = GridConverter.PoleToPixel(entity.StartPole, grid),
            EndPole = GridConverter.PoleToPixel(entity.EndPole, grid),
            Type = entity.Type,
            IsOpaque = entity.IsOpaque,
            State = entity.State,
        };

    [return: NotNullIfNotNull(nameof(entity))]
    internal static StageWallSegment? ToModel(this StageWallSegmentEntity? entity)
        => entity is null ? null : new() {
            Index = entity.Index,
            Name = entity.Name,
            StartPole = entity.StartPole,
            EndPole = entity.EndPole,
            Type = entity.Type,
            IsOpaque = entity.IsOpaque,
            State = entity.State,
        };

    // Region mappers
    [return: NotNullIfNotNull(nameof(entity))]
    internal static StageRegion? ToModel(this StageRegionEntity? entity, Grid grid)
        => entity is null ? null : new() {
            Index = entity.Index,
            Name = entity.Name,
            Type = entity.Type,
            Vertices = entity.Vertices
                .OrderBy(v => v.Index)
                .Select(v => GridConverter.PointToVertex(new(v.X, v.Y), grid))
                .ToList(),
            Value = entity.Value,
        };

    internal static StageRegionEntity ToEntity(this StageRegion model, Guid stageId, Grid grid)
        => new() {
            StageId = stageId,
            Index = model.Index,
            Name = model.Name,
            Type = model.Type,
            Vertices = [.. model.Vertices
                .Select((vertex, index) => {
                    var gridPoint = GridConverter.VertexToGrid(vertex, grid);
                    return new StageRegionVertexEntity {
                        StageId = stageId,
                        RegionIndex = model.Index,
                        Index = (ushort)index,
                        X = gridPoint.X,
                        Y = gridPoint.Y,
                    };
                })],
            Value = model.Value,
        };

    internal static StageRegionEntity UpdateFrom(this StageRegionEntity entity, Guid stageId, StageRegion model, Grid grid) {
        entity.StageId = stageId;
        entity.Index = model.Index;
        entity.Name = model.Name;
        entity.Type = model.Type;
        entity.Vertices = [.. model.Vertices
            .Select((vertex, index) => {
                var gridPoint = GridConverter.VertexToGrid(vertex, grid);
                return new StageRegionVertexEntity {
                    StageId = stageId,
                    RegionIndex = model.Index,
                    Index = (ushort)index,
                    X = gridPoint.X,
                    Y = gridPoint.Y,
                };
            })];
        entity.Value = model.Value;
        return entity;
    }

    // AmbientLight mappers
    [return: NotNullIfNotNull(nameof(entity))]
    internal static StageLight? ToModel(this StageLightEntity? entity, Grid grid)
        => entity is null ? null : new() {
            Index = entity.Index,
            Name = entity.Name,
            Type = entity.Type,
            Position = GridConverter.PointToPixel(entity.Position, grid),
            Direction = entity.Direction,
            Range = entity.Range,
            Arc = entity.Arc,
            Color = entity.Color,
            IsOn = entity.IsOn,
        };

    internal static StageLightEntity ToEntity(this StageLight model, Guid stageId, Grid grid)
        => new() {
            StageId = stageId,
            Index = model.Index,
            Name = model.Name,
            Type = model.Type,
            Position = GridConverter.PointToGrid(model.Position, grid),
            Direction = model.Direction,
            Range = model.Range,
            Arc = model.Arc,
            Color = model.Color,
            IsOn = model.IsOn,
        };

    internal static StageLightEntity UpdateFrom(this StageLightEntity entity, Guid stageId, StageLight model, Grid grid) {
        entity.StageId = stageId;
        entity.Index = model.Index;
        entity.Name = model.Name;
        entity.Type = model.Type;
        entity.Position = GridConverter.PointToGrid(model.Position, grid);
        entity.Direction = model.Direction;
        entity.Range = model.Range;
        entity.Arc = model.Arc;
        entity.Color = model.Color;
        entity.IsOn = model.IsOn;
        return entity;
    }

    // Decoration mappers
    [return: NotNullIfNotNull(nameof(entity))]
    internal static StageElement? ToModel(this StageDecorationEntity? entity, Grid grid)
        => entity is null ? null : new() {
            Index = entity.Index,
            Name = entity.Name,
            Display = entity.Display.ToModel(),
            Position = GridConverter.PositionToPixel(entity.Position, grid),
            Rotation = entity.Rotation,
            Elevation = entity.Elevation,
            Size = new Dimension((float)entity.DisplaySize.Width, (float)entity.DisplaySize.Height),
            Opacity = entity.Opacity,
        };

    internal static StageDecorationEntity ToEntity(this StageElement model, Guid stageId, Grid grid)
        => new() {
            StageId = stageId,
            Index = model.Index,
            Name = model.Name,
            DisplayId = model.Display.Id,
            Position = GridConverter.PositionToGrid(model.Position, grid),
            Rotation = model.Rotation,
            Elevation = model.Elevation,
            DisplaySize = new NamedSize(model.Size.Width, model.Size.Height),
            Opacity = model.Opacity,
        };

    internal static StageDecorationEntity UpdateFrom(this StageDecorationEntity entity, StageElement model, Grid grid) {
        entity.Name = model.Name;
        entity.DisplayId = model.Display.Id;
        entity.Position = GridConverter.PositionToGrid(model.Position, grid);
        entity.Rotation = model.Rotation;
        entity.Elevation = model.Elevation;
        entity.DisplaySize = new NamedSize(model.Size.Width, model.Size.Height);
        entity.Opacity = model.Opacity;
        return entity;
    }

    // Sound mappers
    [return: NotNullIfNotNull(nameof(entity))]
    internal static StageSound? ToModel(this StageSoundEntity? entity, Grid grid)
        => entity is null ? null : new() {
            Index = entity.Index,
            Name = entity.Name,
            Media = entity.Media.ToModel(),
            Position = GridConverter.PointToPixel(entity.Position, grid),
            Radius = entity.Radius,
            Volume = entity.Volume,
            Loop = entity.Loop,
            IsPlaying = entity.IsPlaying,
        };

    internal static StageSoundEntity ToEntity(this StageSound model, Guid stageId, Grid grid)
        => new() {
            StageId = stageId,
            Index = model.Index,
            Name = model.Name,
            MediaId = model.Media.Id,
            Position = GridConverter.PointToGrid(model.Position, grid),
            Radius = model.Radius,
            Volume = model.Volume,
            Loop = model.Loop,
            IsPlaying = model.IsPlaying,
        };

    internal static StageSoundEntity UpdateFrom(this StageSoundEntity entity, StageSound model, Grid grid) {
        entity.Name = model.Name;
        entity.MediaId = model.Media.Id;
        entity.Position = GridConverter.PointToGrid(model.Position, grid);
        entity.Radius = model.Radius;
        entity.Volume = model.Volume;
        entity.Loop = model.Loop;
        entity.IsPlaying = model.IsPlaying;
        return entity;
    }
}
