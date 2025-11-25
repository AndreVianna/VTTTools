
using AdventureEntity = VttTools.Data.Library.Entities.Adventure;
using CampaignEntity = VttTools.Data.Library.Entities.Campaign;
using WorldEntity = VttTools.Data.Library.Entities.World;
using EncounterAssetEntity = VttTools.Data.Library.Entities.EncounterAsset;
using EncounterEffectEntity = VttTools.Data.Library.Entities.EncounterEffect;
using EncounterEntity = VttTools.Data.Library.Entities.Encounter;
using EncounterRegionEntity = VttTools.Data.Library.Entities.EncounterRegion;
using EncounterSourceEntity = VttTools.Data.Library.Entities.EncounterSource;
using EncounterWallEntity = VttTools.Data.Library.Entities.EncounterWall;
using EncounterOpeningEntity = VttTools.Data.Library.Entities.EncounterOpening;

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
            Campaigns = entity.Campaigns.AsQueryable().Select(AsCampaign!).ToList(),
            Adventures = entity.Adventures.AsQueryable().Select(AsAdventure!).ToList(),
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
            Adventures = entity.Adventures.AsQueryable().Select(AsAdventure!).ToList(),
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
                Light = entity.Light,
                Weather = entity.Weather,
                Elevation = entity.Elevation,
                Sound = entity.Sound != null ? entity.Sound.ToModel() : null,
            },
            Grid = entity.Grid,
            Assets = entity.EncounterAssets.AsQueryable().Select(AsEncounterAsset!).ToList(),
            Walls = entity.Walls.AsQueryable().Select(AsEncounterWall!).ToList(),
            Openings = entity.Openings.AsQueryable().Select(AsEncounterOpening!).ToList(),
            Regions = entity.Regions.AsQueryable().Select(AsEncounterRegion!).ToList(),
            Sources = entity.Sources.AsQueryable().Select(AsEncounterSource!).ToList(),
            Effects = entity.EncounterEffects.AsQueryable().Select(AsEncounterEffect!).ToList(),
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
                Light = entity.Light,
                Weather = entity.Weather,
                Elevation = entity.Elevation,
                Sound = entity.Sound != null ? entity.Sound.ToModel() : null,
            },
            Grid = entity.Grid,
            Assets = entity.EncounterAssets.AsQueryable().Select(AsEncounterAsset!).ToList(),
            Walls = entity.Walls.AsQueryable().Select(AsEncounterWall!).ToList(),
            Openings = entity.Openings.AsQueryable().Select(AsEncounterOpening!).ToList(),
            Regions = entity.Regions.AsQueryable().Select(AsEncounterRegion!).ToList(),
            Sources = entity.Sources.AsQueryable().Select(AsEncounterSource!).ToList(),
            Effects = entity.EncounterEffects.AsQueryable().Select(AsEncounterEffect!).ToList(),
        };

    internal static Expression<Func<EncounterAssetEntity, EncounterAsset>> AsEncounterAsset = entity
        => new() {
            AssetId = entity.AssetId,
            Index = entity.Index,
            Number = entity.Number,
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
                Light = entity.Light,
                Weather = entity.Weather,
                Elevation = entity.Elevation,
                Sound = entity.Sound?.ToModel(),
            },
            Grid = entity.Grid,
            Assets = [.. entity.EncounterAssets.Select(sa => sa.ToModel(entity.Grid)!)],
            Walls = [.. entity.Walls.Select(sb => sb.ToModel(entity.Grid)!)],
            Regions = [.. entity.Regions.Select(sr => sr.ToModel(entity.Grid)!)],
            Sources = [.. entity.Sources.Select(ss => ss.ToModel(entity.Grid)!)],
            Effects = [.. entity.EncounterEffects.Select(se => se.ToModel()!)],
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
            Light = model.Stage.Light,
            Weather = model.Stage.Weather,
            Elevation = model.Stage.Elevation,
            SoundId = model.Stage.Sound?.Id,
            Grid = model.Grid,
            EncounterAssets = model.Assets?.ConvertAll(sa => ToEntity(sa, model.Id, model.Grid)) ?? [],
            Walls = model.Walls?.ConvertAll(sw => ToEntity(sw, model.Id, model.Grid)) ?? [],
            Regions = model.Regions?.ConvertAll(sr => ToEntity(sr, model.Id, model.Grid)) ?? [],
            Sources = model.Sources?.ConvertAll(ss => ToEntity(ss, model.Id, model.Grid)) ?? [],
            EncounterEffects = model.Effects?.ConvertAll(se => ToEntity(se, model.Id)) ?? [],
        };

    internal static EncounterEntity UpdateFrom(this EncounterEntity entity, Encounter model) {
        entity.Id = model.Id;
        entity.Name = model.Name;
        entity.Description = model.Description;
        entity.IsPublished = model.IsPublished;
        entity.BackgroundId = model.Stage.Background?.Id;
        entity.ZoomLevel = model.Stage.ZoomLevel;
        entity.Panning = model.Stage.Panning;
        entity.Light = model.Stage.Light;
        entity.Weather = model.Stage.Weather;
        entity.Elevation = model.Stage.Elevation;
        entity.SoundId = model.Stage.Sound?.Id;
        entity.Grid = model.Grid;

        // Update EncounterAssets
        var assetIndices = model.Assets.Select(sa => sa.Index).ToHashSet();
        var assetsToRemove = entity.EncounterAssets.Where(ea => !assetIndices.Contains(ea.Index)).ToList();
        foreach (var assetToRemove in assetsToRemove) {
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
        var wallsToRemove = entity.Walls.Where(ew => !wallIndices.Contains(ew.Index)).ToList();
        foreach (var wallToRemove in wallsToRemove) {
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
        var regionsToRemove = entity.Regions.Where(er => !regionIndices.Contains(er.Index)).ToList();
        foreach (var regionToRemove in regionsToRemove) {
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

        // Update Sources
        var sourceIndices = model.Sources.Select(ss => ss.Index).ToHashSet();
        var sourcesToRemove = entity.Sources.Where(es => !sourceIndices.Contains(es.Index)).ToList();
        foreach (var sourceToRemove in sourcesToRemove) {
            entity.Sources.Remove(sourceToRemove);
        }
        foreach (var modelSource in model.Sources) {
            var existingSource = entity.Sources.FirstOrDefault(es => es.Index == modelSource.Index);
            if (existingSource != null) {
                UpdateFrom(existingSource, entity.Id, modelSource, model.Grid);
            }
            else {
                entity.Sources.Add(ToEntity(modelSource, entity.Id, model.Grid));
            }
        }

        // Update Effects
        var effectIndices = model.Effects.Select(se => se.Index).ToHashSet();
        var effectsToRemove = entity.EncounterEffects.Where(ee => !effectIndices.Contains(ee.Index)).ToList();
        foreach (var effectToRemove in effectsToRemove) {
            entity.EncounterEffects.Remove(effectToRemove);
        }
        foreach (var modelEffect in model.Effects) {
            var existingEffect = entity.EncounterEffects.FirstOrDefault(ee => ee.Index == modelEffect.Index);
            if (existingEffect != null) {
                UpdateFrom(existingEffect, entity.Id, modelEffect);
            }
            else {
                entity.EncounterEffects.Add(ToEntity(modelEffect, entity.Id));
            }
        }

        return entity;
    }

    [return: NotNullIfNotNull(nameof(entity))]
    internal static EncounterAsset? ToModel(this EncounterAssetEntity? entity, Grid grid)
        => entity == null ? null : new() {
            AssetId = entity.AssetId,
            Index = entity.Index,
            Number = entity.Number,
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
            Number = model.Number,
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
        entity.Number = model.Number;
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
            Name = entity.Name,
            Poles = entity.Poles,
            Visibility = entity.Visibility,
            IsClosed = entity.IsClosed,
            Material = entity.Material,
            Color = entity.Color,
        };

    [return: NotNullIfNotNull(nameof(entity))]
    internal static EncounterWall? ToModel(this EncounterWallEntity? entity, Grid grid)
        => entity == null ? null : new() {
            Index = entity.Index,
            Name = entity.Name,
            Poles = entity.Poles.ConvertAll(p => GridConverter.PoleToPixel(p, grid)),
            Visibility = entity.Visibility,
            IsClosed = entity.IsClosed,
            Material = entity.Material,
            Color = entity.Color,
        };

    internal static EncounterWallEntity ToEntity(this EncounterWall model, Guid encounterId, Grid grid)
        => new() {
            EncounterId = encounterId,
            Index = model.Index,
            Name = model.Name,
            Poles = [.. model.Poles.Select(p => GridConverter.PoleToGrid(p, grid))],
            Visibility = model.Visibility,
            IsClosed = model.IsClosed,
            Material = model.Material,
            Color = model.Color,
        };

    internal static EncounterWallEntity UpdateFrom(this EncounterWallEntity entity, Guid encounterId, EncounterWall model, Grid grid) {
        entity.EncounterId = encounterId;
        entity.Index = model.Index;
        entity.Name = model.Name;
        entity.Poles = [.. model.Poles.Select(p => GridConverter.PoleToGrid(p, grid))];
        entity.Visibility = model.Visibility;
        entity.IsClosed = model.IsClosed;
        entity.Material = model.Material;
        entity.Color = model.Color;
        return entity;
    }

    internal static Expression<Func<EncounterRegionEntity, EncounterRegion>> AsEncounterRegion = entity
        => new() {
            Index = entity.Index,
            Name = entity.Name,
            Type = entity.Type,
            Vertices = entity.Vertices,
            Value = entity.Value,
            Label = entity.Label,
            Color = entity.Color,
        };

    [return: NotNullIfNotNull(nameof(entity))]
    internal static EncounterRegion? ToModel(this EncounterRegionEntity? entity, Grid grid)
        => entity == null ? null : new() {
            Index = entity.Index,
            Name = entity.Name,
            Type = entity.Type,
            Vertices = entity.Vertices.ConvertAll(v => GridConverter.PointToPixel(v, grid)),
            Value = entity.Value,
            Label = entity.Label,
            Color = entity.Color,
        };

    internal static EncounterRegionEntity ToEntity(this EncounterRegion model, Guid encounterId, Grid grid)
        => new() {
            EncounterId = encounterId,
            Index = model.Index,
            Name = model.Name,
            Type = model.Type,
            Vertices = [.. model.Vertices.Select(v => GridConverter.PointToGrid(v, grid))],
            Value = model.Value,
            Label = model.Label,
            Color = model.Color,
        };

    internal static EncounterRegionEntity UpdateFrom(this EncounterRegionEntity entity, Guid encounterId, EncounterRegion model, Grid grid) {
        entity.EncounterId = encounterId;
        entity.Index = model.Index;
        entity.Name = model.Name;
        entity.Type = model.Type;
        entity.Vertices = [.. model.Vertices.Select(v => GridConverter.PointToGrid(v, grid))];
        entity.Value = model.Value;
        entity.Label = model.Label;
        entity.Color = model.Color;
        return entity;
    }

    internal static Expression<Func<EncounterSourceEntity, EncounterSource>> AsEncounterSource = entity
        => new() {
            Index = entity.Index,
            Name = entity.Name,
            Type = entity.Type,
            Position = entity.Position,
            IsDirectional = entity.IsDirectional,
            Direction = entity.Direction,
            Range = entity.Range,
            Spread = entity.Spread,
            Intensity = entity.Intensity,
            HasGradient = entity.HasGradient,
            Color = entity.Color,
        };

    [return: NotNullIfNotNull(nameof(entity))]
    internal static EncounterSource? ToModel(this EncounterSourceEntity? entity, Grid grid)
        => entity == null ? null : new() {
            Index = entity.Index,
            Name = entity.Name,
            Type = entity.Type,
            Position = GridConverter.PointToPixel(entity.Position, grid),
            IsDirectional = entity.IsDirectional,
            Direction = entity.Direction,
            Range = entity.Range,
            Spread = entity.Spread,
            Intensity = entity.Intensity,
            HasGradient = entity.HasGradient,
            Color = entity.Color,
        };

    internal static EncounterSourceEntity ToEntity(this EncounterSource model, Guid encounterId, Grid grid)
        => new() {
            EncounterId = encounterId,
            Index = model.Index,
            Name = model.Name,
            Type = model.Type,
            Position = GridConverter.PointToGrid(model.Position, grid),
            IsDirectional = model.IsDirectional,
            Direction = model.Direction,
            Range = model.Range,
            Spread = model.Spread,
            Intensity = model.Intensity,
            HasGradient = model.HasGradient,
            Color = model.Color,
        };

    internal static EncounterSourceEntity UpdateFrom(this EncounterSourceEntity entity, Guid encounterId, EncounterSource model, Grid grid) {
        entity.EncounterId = encounterId;
        entity.Index = model.Index;
        entity.Name = model.Name;
        entity.Type = model.Type;
        entity.Position = GridConverter.PointToGrid(model.Position, grid);
        entity.IsDirectional = model.IsDirectional;
        entity.Direction = model.Direction;
        entity.Range = model.Range;
        entity.Spread = model.Spread;
        entity.Intensity = model.Intensity;
        entity.HasGradient = model.HasGradient;
        entity.Color = model.Color;
        return entity;
    }

    internal static Expression<Func<EncounterOpeningEntity, EncounterOpening>> AsEncounterOpening = entity
        => new() {
            Index = entity.Index,
            Name = entity.Name,
            Description = entity.Description,
            Type = entity.Type,
            WallIndex = entity.WallIndex,
            StartPoleIndex = entity.StartPoleIndex,
            EndPoleIndex = entity.EndPoleIndex,
            Size = new Dimension(entity.Width, entity.Height),
            Visibility = entity.Visibility,
            State = entity.State,
            Opacity = entity.Opacity,
            Material = entity.Material,
            Color = entity.Color,
        };

    [return: NotNullIfNotNull(nameof(entity))]
    internal static EncounterOpening? ToModel(this EncounterOpeningEntity? entity)
        => entity == null ? null : new() {
            Index = entity.Index,
            Name = entity.Name,
            Description = entity.Description,
            Type = entity.Type,
            WallIndex = entity.WallIndex,
            StartPoleIndex = entity.StartPoleIndex,
            EndPoleIndex = entity.EndPoleIndex,
            Size = new Dimension(entity.Width, entity.Height),
            Visibility = entity.Visibility,
            State = entity.State,
            Opacity = entity.Opacity,
            Material = entity.Material,
            Color = entity.Color,
        };

    internal static EncounterOpeningEntity ToEntity(this EncounterOpening model, Guid encounterId)
        => new() {
            EncounterId = encounterId,
            Index = model.Index,
            Name = model.Name,
            Description = model.Description,
            Type = model.Type,
            WallIndex = model.WallIndex,
            StartPoleIndex = model.StartPoleIndex,
            EndPoleIndex = model.EndPoleIndex,
            Width = model.Size.Width,
            Height = model.Size.Height,
            Visibility = model.Visibility,
            State = model.State,
            Opacity = model.Opacity,
            Material = model.Material,
            Color = model.Color,
        };

    internal static EncounterOpeningEntity UpdateFrom(this EncounterOpeningEntity entity, Guid encounterId, EncounterOpening model) {
        entity.EncounterId = encounterId;
        entity.Index = model.Index;
        entity.Name = model.Name;
        entity.Description = model.Description;
        entity.Type = model.Type;
        entity.WallIndex = model.WallIndex;
        entity.StartPoleIndex = model.StartPoleIndex;
        entity.EndPoleIndex = model.EndPoleIndex;
        entity.Width = model.Size.Width;
        entity.Height = model.Size.Height;
        entity.Visibility = model.Visibility;
        entity.State = model.State;
        entity.Opacity = model.Opacity;
        entity.Material = model.Material;
        entity.Color = model.Color;
        return entity;
    }

    internal static Expression<Func<EncounterEffectEntity, EncounterEffect>> AsEncounterEffect = entity
        => new() {
            EffectId = entity.EffectId,
            Index = entity.Index,
            Name = entity.Name,
            Origin = entity.Origin,
            Size = entity.Size,
            Direction = entity.Direction,
        };

    [return: NotNullIfNotNull(nameof(entity))]
    internal static EncounterEffect? ToModel(this EncounterEffectEntity? entity)
        => entity == null ? null : new() {
            EffectId = entity.EffectId,
            Index = entity.Index,
            Name = entity.Name,
            Origin = entity.Origin,
            Size = entity.Size,
            Direction = entity.Direction,
        };

    internal static EncounterEffectEntity ToEntity(this EncounterEffect model, Guid encounterId)
        => new() {
            EncounterId = encounterId,
            EffectId = model.EffectId,
            Index = model.Index,
            Name = model.Name,
            Origin = model.Origin,
            Size = model.Size,
            Direction = model.Direction,
        };

    internal static EncounterEffectEntity UpdateFrom(this EncounterEffectEntity entity, Guid encounterId, EncounterEffect model) {
        entity.EncounterId = encounterId;
        entity.EffectId = model.EffectId;
        entity.Index = model.Index;
        entity.Name = model.Name;
        entity.Origin = model.Origin;
        entity.Size = model.Size;
        entity.Direction = model.Direction;
        return entity;
    }
}