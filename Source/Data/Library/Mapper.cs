
using AdventureEntity = VttTools.Data.Library.Entities.Adventure;
using CampaignEntity = VttTools.Data.Library.Entities.Campaign;
using EncounterAssetEntity = VttTools.Data.Library.Entities.EncounterAsset;
using EncounterEntity = VttTools.Data.Library.Entities.Encounter;
using EncounterLightSourceEntity = VttTools.Data.Library.Entities.EncounterLight;
using EncounterRegionEntity = VttTools.Data.Library.Entities.EncounterRegion;
using EncounterSoundSourceEntity = VttTools.Data.Library.Entities.EncounterSound;
using EncounterWallEntity = VttTools.Data.Library.Entities.EncounterWall;
using EncounterWallSegmentEntity = VttTools.Data.Library.Entities.EncounterWallSegment;
using WorldEntity = VttTools.Data.Library.Entities.World;

namespace VttTools.Data.Library;

internal static class Mapper {
    internal static Expression<Func<WorldEntity, World>> AsWorld = entity
        => new() {
            OwnerId = entity.OwnerId,
            Id = entity.Id,
            Name = entity.Name,
            Description = entity.Description,
            Background = entity.Background != null ? entity.Background.ToModel() : null,
            IsPublished = entity.IsPublished,
            IsPublic = entity.IsPublic,
            Campaigns = entity.Campaigns.AsQueryable().Select(AsChildCampaign!).ToList(),
            Adventures = entity.Adventures.AsQueryable().Select(AsChildAdventure!).ToList(),
        };

    internal static Expression<Func<CampaignEntity, Campaign>> AsCampaign = entity
        => new() {
            OwnerId = entity.OwnerId,
            World = entity.World != null ? entity.World.ToModel() : null,
            Id = entity.Id,
            Name = entity.Name,
            Description = entity.Description,
            Background = entity.Background != null ? entity.Background.ToModel() : null,
            IsPublished = entity.IsPublished,
            IsPublic = entity.IsPublic,
            Adventures = entity.Adventures.AsQueryable().Select(AsChildAdventure!).ToList(),
        };

    internal static Expression<Func<CampaignEntity, Campaign>> AsChildCampaign = entity
        => new() {
            OwnerId = entity.OwnerId,
            Id = entity.Id,
            Name = entity.Name,
            Description = entity.Description,
            Background = entity.Background != null ? entity.Background.ToModel() : null,
            IsPublished = entity.IsPublished,
            IsPublic = entity.IsPublic,
            Adventures = entity.Adventures.AsQueryable().Select(AsAdventure!).ToList(),
        };

    internal static Expression<Func<AdventureEntity, Adventure>> AsChildAdventure = entity
        => new() {
            OwnerId = entity.OwnerId,
            Id = entity.Id,
            Name = entity.Name,
            Description = entity.Description,
            Style = entity.Style,
            Background = entity.Background != null ? entity.Background.ToModel() : null,
            IsOneShot = entity.IsOneShot,
            IsPublic = entity.IsPublic,
            IsPublished = entity.IsPublished,
            Encounters = entity.Encounters.AsQueryable().Select(AsChildEncounter!).ToList(),
        };

    internal static Expression<Func<AdventureEntity, Adventure>> AsAdventure = entity
        => new() {
            OwnerId = entity.OwnerId,
            World = entity.World != null ? entity.World.ToModel() : null,
            Campaign = entity.Campaign != null ? entity.Campaign.ToModel() : null,
            Id = entity.Id,
            Name = entity.Name,
            Description = entity.Description,
            Style = entity.Style,
            Background = entity.Background != null ? entity.Background.ToModel() : null,
            IsOneShot = entity.IsOneShot,
            IsPublic = entity.IsPublic,
            IsPublished = entity.IsPublished,
            Encounters = entity.Encounters.AsQueryable().Select(AsChildEncounter!).ToList(),
        };

    internal static Expression<Func<EncounterEntity, Encounter>> AsChildEncounter = entity
        => new() {
            Id = entity.Id,
            Name = entity.Name,
            Description = entity.Description,
            Stage = new() {
                Background = entity.Background != null ? entity.Background.ToModel() : null,
                ZoomLevel = entity.ZoomLevel,
                Panning = entity.Panning,
                Light = entity.AmbientLight,
                Weather = entity.Weather,
                Elevation = entity.GroundElevation,
                Sound = entity.AmbientSound != null ? entity.AmbientSound.ToModel() : null,
            },
            Grid = entity.Grid,
            Assets = entity.EncounterAssets.AsQueryable().Select(AsEncounterAsset!).ToList(),
            Walls = entity.Walls.AsQueryable().Select(AsEncounterWall!).ToList(),
            Regions = entity.Regions.AsQueryable().Select(AsEncounterRegion!).ToList(),
            LightSources = entity.LightSources.AsQueryable().Select(AsEncounterLightSource!).ToList(),
            SoundSources = entity.SoundSources.AsQueryable().Select(AsEncounterSoundSource!).ToList(),
        };

    internal static Expression<Func<EncounterEntity, Encounter>> AsEncounter = entity
        => new() {
            Id = entity.Id,
            Name = entity.Name,
            Description = entity.Description,
            Adventure = entity.Adventure.ToModel(),
            Stage = new() {
                Background = entity.Background != null ? entity.Background.ToModel() : null,
                ZoomLevel = entity.ZoomLevel,
                Panning = entity.Panning,
                Light = entity.AmbientLight,
                Weather = entity.Weather,
                Elevation = entity.GroundElevation,
                Sound = entity.AmbientSound != null ? entity.AmbientSound.ToModel() : null,
            },
            Grid = entity.Grid,
            Assets = entity.EncounterAssets.AsQueryable().Select(AsEncounterAsset!).ToList(),
            Walls = entity.Walls.AsQueryable().Select(AsEncounterWall!).ToList(),
            Regions = entity.Regions.AsQueryable().Select(AsEncounterRegion!).ToList(),
            LightSources = entity.LightSources.AsQueryable().Select(AsEncounterLightSource!).ToList(),
            SoundSources = entity.SoundSources.AsQueryable().Select(AsEncounterSoundSource!).ToList(),
        };

    internal static Expression<Func<EncounterAssetEntity, EncounterAsset>> AsEncounterAsset = entity
        => new() {
            AssetId = entity.AssetId,
            Index = entity.Index,
            Name = entity.Name,
            Notes = entity.Notes,
            Image = entity.Image == null ? null : entity.Image.ToModel(),
            Size = entity.Size,
            Position = entity.Position,
            Elevation = entity.Elevation,
            Rotation = entity.Rotation,
            Frame = entity.Frame,
            IsLocked = entity.IsLocked,
            ControlledBy = entity.ControlledBy,
        };

    [return: NotNullIfNotNull(nameof(entity))]
    internal static World? ToModel(this WorldEntity? entity)
        => entity == null ? null : new() {
            OwnerId = entity.OwnerId,
            Id = entity.Id,
            Name = entity.Name,
            Description = entity.Description,
            Background = entity.Background?.ToModel()!,
            IsPublished = entity.IsPublished,
            IsPublic = entity.IsPublic,
            Campaigns = entity.Campaigns.Select(ToModel).ToList()!,
            Adventures = entity.Adventures.Select(ToModel).ToList()!,
        };

    internal static WorldEntity ToEntity(this World model)
        => new() {
            OwnerId = model.OwnerId,
            Id = model.Id,
            Name = model.Name,
            Description = model.Description,
            BackgroundId = model.Background?.Id,
            IsPublished = model.IsPublished,
            IsPublic = model.IsPublic,
            Campaigns = model.Campaigns.ConvertAll(c => c.ToEntity()),
            Adventures = model.Adventures.ConvertAll(c => c.ToEntity()),
        };

    internal static void UpdateFrom(this WorldEntity entity, World model) {
        entity.OwnerId = model.OwnerId;
        entity.Id = model.Id;
        entity.Name = model.Name;
        entity.Description = model.Description;
        entity.BackgroundId = model.Background?.Id;
        entity.IsPublished = model.IsPublished;
        entity.IsPublic = model.IsPublic;
        entity.Campaigns = model.Campaigns.ConvertAll(a => a.ToEntity());
        entity.Adventures = model.Adventures.ConvertAll(a => a.ToEntity());
    }

    [return: NotNullIfNotNull(nameof(entity))]
    internal static Campaign? ToModel(this CampaignEntity? entity)
        => entity == null ? null : new() {
            OwnerId = entity.OwnerId,
            World = entity.World?.ToModel(),
            Id = entity.Id,
            Name = entity.Name,
            Description = entity.Description,
            Background = entity.Background?.ToModel()!,
            IsPublished = entity.IsPublished,
            IsPublic = entity.IsPublic,
            Adventures = entity.Adventures.Select(ToModel).ToList()!,
        };

    internal static CampaignEntity ToEntity(this Campaign model)
        => new() {
            OwnerId = model.OwnerId,
            WorldId = model.World?.Id,
            Id = model.Id,
            Name = model.Name,
            Description = model.Description,
            BackgroundId = model.Background?.Id,
            IsPublished = model.IsPublished,
            IsPublic = model.IsPublic,
            Adventures = model.Adventures.ConvertAll(a => a.ToEntity()),
        };

    internal static void UpdateFrom(this CampaignEntity entity, Campaign model) {
        entity.OwnerId = model.OwnerId;
        entity.WorldId = model.World?.Id;
        entity.Id = model.Id;
        entity.Name = model.Name;
        entity.Description = model.Description;
        entity.BackgroundId = model.Background?.Id;
        entity.IsPublished = model.IsPublished;
        entity.IsPublic = model.IsPublic;
        entity.Adventures = model.Adventures.ConvertAll(a => a.ToEntity());
    }

    [return: NotNullIfNotNull(nameof(entity))]
    internal static Adventure? ToModel(this AdventureEntity? entity)
        => entity == null ? null : new() {
            OwnerId = entity.OwnerId,
            World = entity.World?.ToModel(),
            Campaign = entity.Campaign?.ToModel(),
            Id = entity.Id,
            Name = entity.Name,
            Description = entity.Description,
            Style = entity.Style,
            Background = entity.Background?.ToModel(),
            IsOneShot = entity.IsOneShot,
            IsPublic = entity.IsPublic,
            IsPublished = entity.IsPublished,
            Encounters = entity.Encounters.Select(ToModel).ToList()!,
        };

    internal static AdventureEntity ToEntity(this Adventure model)
        => new() {
            OwnerId = model.OwnerId,
            WorldId = model.World?.Id,
            CampaignId = model.Campaign?.Id,
            Id = model.Id,
            Name = model.Name,
            Description = model.Description,
            Style = model.Style,
            BackgroundId = model.Background?.Id,
            IsOneShot = model.IsOneShot,
            IsPublic = model.IsPublic,
            IsPublished = model.IsPublished,
            Encounters = model.Encounters.ConvertAll(s => s.ToEntity(model.Id)),
        };

    internal static void UpdateFrom(this AdventureEntity entity, Adventure model) {
        entity.OwnerId = model.OwnerId;
        entity.WorldId = model.World?.Id;
        entity.CampaignId = model.Campaign?.Id;
        entity.Id = model.Id;
        entity.Name = model.Name;
        entity.Description = model.Description;
        entity.Style = model.Style;
        entity.BackgroundId = model.Background?.Id;
        entity.IsPublic = model.IsPublic;
        entity.IsPublished = model.IsPublished;
        entity.IsOneShot = model.IsOneShot;
        var existingEncounters = entity.Encounters.Join(model.Encounters, se => se.Id, sm => sm.Id, UpdateFrom);
        var newEncounters = model.Encounters.Where(sm => entity.Encounters.All(se => se.Id != sm.Id)).Select(s => s.ToEntity(model.Id));
        entity.Encounters = [.. existingEncounters.Union(newEncounters)];
    }

    [return: NotNullIfNotNull(nameof(entity))]
    internal static Encounter? ToModel(this EncounterEntity? entity)
        => entity is null ? null : new() {
            Id = entity.Id,
            Name = entity.Name,
            Description = entity.Description,
            IsPublished = entity.IsPublished,
            Adventure = entity.Adventure != null ? new Adventure {
                Id = entity.Adventure.Id,
                OwnerId = entity.Adventure.OwnerId,
                Name = entity.Adventure.Name,
                Description = entity.Adventure.Description,
                Style = entity.Adventure.Style,
                Background = entity.Adventure.Background?.ToModel(),
                IsOneShot = entity.Adventure.IsOneShot,
                IsPublic = entity.Adventure.IsPublic,
                IsPublished = entity.Adventure.IsPublished,
                Encounters = [],
            } : null!,
            Stage = new() {
                Background = entity.Background?.ToModel(),
                ZoomLevel = entity.ZoomLevel,
                Panning = entity.Panning,
                Light = entity.AmbientLight,
                Weather = entity.Weather,
                Elevation = entity.GroundElevation,
                Sound = entity.AmbientSound?.ToModel(),
            },
            Grid = entity.Grid,
            Assets = [.. entity.EncounterAssets.Select(sa => sa.ToModel(entity.Grid)!)],
            Walls = [.. entity.Walls.Select(sb => sb.ToModel(entity.Grid)!)],
            Regions = [.. entity.Regions.Select(sr => sr.ToModel(entity.Grid)!)],
            LightSources = [.. entity.LightSources.Select(ss => ss.ToModel(entity.Grid)!)],
            SoundSources = [.. entity.SoundSources.Select(ss => ss.ToModel(entity.Grid)!)],
        };

    internal static EncounterEntity ToEntity(this Encounter model, Guid adventureId)
        => new() {
            Id = model.Id,
            AdventureId = adventureId,
            Name = model.Name,
            Description = model.Description,
            IsPublished = model.IsPublished,
            BackgroundId = model.Stage.Background?.Id,
            ZoomLevel = model.Stage.ZoomLevel,
            Panning = model.Stage.Panning,
            AmbientLight = model.Stage.Light,
            Weather = model.Stage.Weather,
            GroundElevation = model.Stage.Elevation,
            AmbientSoundId = model.Stage.Sound?.Id,
            Grid = model.Grid,
            EncounterAssets = model.Assets?.ConvertAll(sa => ToEntity(sa, model.Id, model.Grid)) ?? [],
            Walls = model.Walls?.ConvertAll(sw => ToEntity(sw, model.Id, model.Grid)) ?? [],
            Regions = model.Regions?.ConvertAll(sr => ToEntity(sr, model.Id, model.Grid)) ?? [],
            LightSources = model.LightSources?.ConvertAll(ss => ToEntity(ss, model.Id, model.Grid)) ?? [],
            SoundSources = model.SoundSources?.ConvertAll(ss => ToEntity(ss, model.Id, model.Grid)) ?? [],
        };

    internal static EncounterEntity UpdateFrom(this EncounterEntity entity, Encounter model) {
        entity.Id = model.Id;
        entity.Name = model.Name;
        entity.Description = model.Description;
        entity.IsPublished = model.IsPublished;
        entity.BackgroundId = model.Stage.Background?.Id;
        entity.ZoomLevel = model.Stage.ZoomLevel;
        entity.Panning = model.Stage.Panning;
        entity.AmbientLight = model.Stage.Light;
        entity.Weather = model.Stage.Weather;
        entity.GroundElevation = model.Stage.Elevation;
        entity.AmbientSoundId = model.Stage.Sound?.Id;
        entity.Grid = model.Grid;

        // Update EncounterAssets
        var assetIndices = model.Assets.Select(sa => sa.Index).ToHashSet();
        foreach (var assetToRemove in entity.EncounterAssets.Where(ea => !assetIndices.Contains(ea.Index)).ToList()) {
            entity.EncounterAssets.Remove(assetToRemove);
        }
        foreach (var modelAsset in model.Assets) {
            var existingAsset = entity.EncounterAssets.FirstOrDefault(ea => ea.Index == modelAsset.Index);
            if (existingAsset != null) {
                UpdateFrom(existingAsset, entity.Id, modelAsset, model.Grid);
            }
            else {
                entity.EncounterAssets.Add(ToEntity(modelAsset, entity.Id, model.Grid));
            }
        }

        // Update Walls
        var wallIndices = model.Walls.Select(sw => sw.Index).ToHashSet();
        foreach (var wallToRemove in entity.Walls.Where(ew => !wallIndices.Contains(ew.Index)).ToList()) {
            entity.Walls.Remove(wallToRemove);
        }
        foreach (var modelWall in model.Walls) {
            var existingWall = entity.Walls.FirstOrDefault(ew => ew.Index == modelWall.Index);
            if (existingWall != null) {
                UpdateFrom(existingWall, entity.Id, modelWall, model.Grid);
            }
            else {
                entity.Walls.Add(ToEntity(modelWall, entity.Id, model.Grid));
            }
        }

        // Update Regions
        var regionIndices = model.Regions.Select(sr => sr.Index).ToHashSet();
        foreach (var regionToRemove in entity.Regions.Where(er => !regionIndices.Contains(er.Index)).ToList()) {
            entity.Regions.Remove(regionToRemove);
        }
        foreach (var modelRegion in model.Regions) {
            var existingRegion = entity.Regions.FirstOrDefault(er => er.Index == modelRegion.Index);
            if (existingRegion != null) {
                UpdateFrom(existingRegion, entity.Id, modelRegion, model.Grid);
            }
            else {
                entity.Regions.Add(ToEntity(modelRegion, entity.Id, model.Grid));
            }
        }

        // Update Light Sources
        var lightSourceIndices = model.LightSources.Select(ss => ss.Index).ToHashSet();
        foreach (var lightSourceToRemove in entity.LightSources.Where(es => !lightSourceIndices.Contains(es.Index)).ToList()) {
            entity.LightSources.Remove(lightSourceToRemove);
        }
        foreach (var modelLightSource in model.LightSources) {
            var existingLightSource = entity.LightSources.FirstOrDefault(es => es.Index == modelLightSource.Index);
            if (existingLightSource != null) {
                UpdateFrom(existingLightSource, entity.Id, modelLightSource, model.Grid);
            }
            else {
                entity.LightSources.Add(ToEntity(modelLightSource, entity.Id, model.Grid));
            }
        }

        // Update Sound Sources
        var soundSourceIndices = model.SoundSources.Select(ss => ss.Index).ToHashSet();
        foreach (var soundSourceToRemove in entity.SoundSources.Where(es => !soundSourceIndices.Contains(es.Index)).ToList()) {
            entity.SoundSources.Remove(soundSourceToRemove);
        }
        foreach (var modelSoundSource in model.SoundSources) {
            var existingSoundSource = entity.SoundSources.FirstOrDefault(es => es.Index == modelSoundSource.Index);
            if (existingSoundSource != null) {
                UpdateFrom(existingSoundSource, entity.Id, modelSoundSource, model.Grid);
            }
            else {
                entity.SoundSources.Add(ToEntity(modelSoundSource, entity.Id, model.Grid));
            }
        }

        return entity;
    }

    [return: NotNullIfNotNull(nameof(entity))]
    internal static EncounterAsset? ToModel(this EncounterAssetEntity? entity, Grid grid)
        => entity == null ? null : new() {
            AssetId = entity.AssetId,
            Index = entity.Index,
            Name = entity.Name,
            Notes = entity.Notes,
            Image = entity.Image?.ToModel(),
            Size = entity.Size,
            Position = GridConverter.PositionToPixel(entity.Position, grid),
            Elevation = entity.Elevation,
            Rotation = entity.Rotation,
            Frame = entity.Frame,
            IsLocked = entity.IsLocked,
            ControlledBy = entity.ControlledBy,
        };

    internal static EncounterAssetEntity ToEntity(this EncounterAsset model, Guid encounterId, Grid grid)
        => new() {
            EncounterId = encounterId,
            AssetId = model.AssetId,
            Index = model.Index,
            Name = model.Name,
            Notes = model.Notes,
            ImageId = model.Image?.Id,
            Frame = model.Frame,
            Size = model.Size,
            Position = GridConverter.PositionToGrid(model.Position, grid),
            Elevation = model.Elevation,
            Rotation = model.Rotation,
            IsLocked = model.IsLocked,
            ControlledBy = model.ControlledBy,
        };

    internal static EncounterAssetEntity UpdateFrom(this EncounterAssetEntity entity, Guid encounterId, EncounterAsset model, Grid grid) {
        entity.EncounterId = encounterId;
        entity.AssetId = model.AssetId;
        entity.Index = model.Index;
        entity.Name = model.Name;
        entity.Notes = model.Notes;
        entity.ImageId = model.Image?.Id;
        entity.Frame = model.Frame;
        entity.Size = model.Size;
        entity.Position = GridConverter.PositionToGrid(model.Position, grid);
        entity.Elevation = model.Elevation;
        entity.Rotation = model.Rotation;
        entity.IsLocked = model.IsLocked;
        entity.ControlledBy = model.ControlledBy;
        return entity;
    }

    internal static Expression<Func<EncounterWallEntity, EncounterWall>> AsEncounterWall = entity
        => new() {
            Index = entity.Index,
            Segments = entity.Segments.AsQueryable().Select(s => s.ToModel()!).ToList(),
        };

    [return: NotNullIfNotNull(nameof(entity))]
    internal static EncounterWall? ToModel(this EncounterWallEntity? entity, Grid grid)
        => entity == null ? null : new() {
            Index = entity.Index,
            Segments = entity.Segments.ConvertAll(s => s.ToModel(grid)),
        };

    internal static EncounterWallEntity ToEntity(this EncounterWall model, Guid encounterId, Grid grid)
        => new() {
            EncounterId = encounterId,
            Index = model.Index,
            Segments = [.. model.Segments.Select(s => new EncounterWallSegmentEntity {
                EncounterId = encounterId,
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

    internal static EncounterWallEntity UpdateFrom(this EncounterWallEntity entity, Guid encounterId, EncounterWall model, Grid grid) {
        entity.EncounterId = encounterId;
        entity.Index = model.Index;
        entity.Segments = [.. model.Segments.Select(s => new EncounterWallSegmentEntity {
            EncounterId = encounterId,
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
    internal static EncounterWallSegment? ToModel(this EncounterWallSegmentEntity? entity, Grid grid)
        => entity == null ? null : new() {
            Index = entity.Index,
            Name = entity.Name,
            StartPole = GridConverter.PoleToPixel(entity.StartPole, grid),
            EndPole = GridConverter.PoleToPixel(entity.EndPole, grid),
            Type = entity.Type,
            IsOpaque = entity.IsOpaque,
            State = entity.State,
        };

    internal static EncounterWallSegmentEntity ToEntity(this EncounterWallSegment model, Guid encounterId, uint wallIndex, Grid grid)
        => new() {
            EncounterId = encounterId,
            WallIndex = wallIndex,
            Index = model.Index,
            StartPole = GridConverter.PoleToGrid(model.StartPole, grid),
            EndPole = GridConverter.PoleToGrid(model.EndPole, grid),
            Type = model.Type,
            IsOpaque = model.IsOpaque,
            State = model.State,
        };

    internal static EncounterWallSegmentEntity UpdateFrom(this EncounterWallSegmentEntity entity, Guid encounterId, uint wallIndex, EncounterWallSegment model, Grid grid) {
        entity.EncounterId = encounterId;
        entity.WallIndex = wallIndex;
        entity.Index = model.Index;
        entity.StartPole = GridConverter.PoleToGrid(model.StartPole, grid);
        entity.EndPole = GridConverter.PoleToGrid(model.EndPole, grid);
        entity.Type = model.Type;
        entity.IsOpaque = model.IsOpaque;
        entity.State = model.State;
        return entity;
    }

    [return: NotNullIfNotNull(nameof(entity))]
    internal static EncounterWallSegment? ToModel(this EncounterWallSegmentEntity? entity)
        => entity == null ? null : new() {
            Index = entity.Index,
            Name = entity.Name,
            StartPole = entity.StartPole,
            EndPole = entity.EndPole,
            Type = entity.Type,
            IsOpaque = entity.IsOpaque,
            State = entity.State,
        };

    internal static EncounterWallSegmentEntity ToEntity(this EncounterWallSegment model, Guid encounterId, uint wallIndex)
        => new() {
            EncounterId = encounterId,
            WallIndex = wallIndex,
            Index = model.Index,
            Name = model.Name,
            StartPole = model.StartPole,
            EndPole = model.EndPole,
            Type = model.Type,
            IsOpaque = model.IsOpaque,
            State = model.State,
        };

    internal static Expression<Func<EncounterRegionEntity, EncounterRegion>> AsEncounterRegion = entity
        => new() {
            Index = entity.Index,
            Name = entity.Name,
            Type = entity.Type,
            Vertices = entity.Vertices,
            Value = entity.Value,
        };

    [return: NotNullIfNotNull(nameof(entity))]
    internal static EncounterRegion? ToModel(this EncounterRegionEntity? entity, Grid grid)
        => entity == null ? null : new() {
            Index = entity.Index,
            Name = entity.Name,
            Type = entity.Type,
            Vertices = entity.Vertices.ConvertAll(v => GridConverter.PointToPixel(v, grid)),
            Value = entity.Value,
        };

    internal static EncounterRegionEntity ToEntity(this EncounterRegion model, Guid encounterId, Grid grid)
        => new() {
            EncounterId = encounterId,
            Index = model.Index,
            Name = model.Name,
            Type = model.Type,
            Vertices = [.. model.Vertices.Select(v => GridConverter.PointToGrid(v, grid))],
            Value = model.Value,
        };

    internal static EncounterRegionEntity UpdateFrom(this EncounterRegionEntity entity, Guid encounterId, EncounterRegion model, Grid grid) {
        entity.EncounterId = encounterId;
        entity.Index = model.Index;
        entity.Name = model.Name;
        entity.Type = model.Type;
        entity.Vertices = [.. model.Vertices.Select(v => GridConverter.PointToGrid(v, grid))];
        entity.Value = model.Value;
        return entity;
    }

    internal static Expression<Func<EncounterLightSourceEntity, EncounterLight>> AsEncounterLightSource = entity
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

    [return: NotNullIfNotNull(nameof(entity))]
    internal static EncounterLight? ToModel(this EncounterLightSourceEntity? entity, Grid grid)
        => entity == null ? null : new() {
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

    internal static EncounterLightSourceEntity ToEntity(this EncounterLight model, Guid encounterId, Grid grid)
        => new() {
            EncounterId = encounterId,
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

    internal static EncounterLightSourceEntity UpdateFrom(this EncounterLightSourceEntity entity, Guid encounterId, EncounterLight model, Grid grid) {
        entity.EncounterId = encounterId;
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

    internal static Expression<Func<EncounterSoundSourceEntity, EncounterSound>> AsEncounterSoundSource = entity
        => new() {
            Index = entity.Index,
            Name = entity.Name,
            Position = entity.Position,
            Range = entity.Range,
            Resource = entity.Resource != null ? entity.Resource.ToModel() : null,
            IsPlaying = entity.IsPlaying,
            Loop = entity.Loop,
        };

    [return: NotNullIfNotNull(nameof(entity))]
    internal static EncounterSound? ToModel(this EncounterSoundSourceEntity? entity, Grid grid)
        => entity == null ? null : new() {
            Index = entity.Index,
            Name = entity.Name,
            Position = GridConverter.PointToPixel(entity.Position, grid),
            Range = entity.Range,
            Resource = entity.Resource?.ToModel(),
            IsPlaying = entity.IsPlaying,
            Loop = entity.Loop,
        };

    internal static EncounterSoundSourceEntity ToEntity(this EncounterSound model, Guid encounterId, Grid grid)
        => new() {
            EncounterId = encounterId,
            Index = model.Index,
            Name = model.Name,
            Position = GridConverter.PointToGrid(model.Position, grid),
            Range = model.Range,
            ResourceId = model.Resource?.Id,
            IsPlaying = model.IsPlaying,
            Loop = model.Loop,
        };

    internal static EncounterSoundSourceEntity UpdateFrom(this EncounterSoundSourceEntity entity, Guid encounterId, EncounterSound model, Grid grid) {
        entity.EncounterId = encounterId;
        entity.Index = model.Index;
        entity.Name = model.Name;
        entity.Position = GridConverter.PointToGrid(model.Position, grid);
        entity.Range = model.Range;
        entity.ResourceId = model.Resource?.Id;
        entity.IsPlaying = model.IsPlaying;
        entity.Loop = model.Loop;
        return entity;
    }
}