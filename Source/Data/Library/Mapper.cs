
using AdventureEntity = VttTools.Data.Library.Entities.Adventure;
using ResourceEntity = VttTools.Data.Media.Entities.Resource;
using SceneAssetEntity = VttTools.Data.Library.Entities.SceneAsset;
using SceneEffectEntity = VttTools.Data.Library.Entities.SceneEffect;
using SceneEntity = VttTools.Data.Library.Entities.Scene;
using SceneRegionEntity = VttTools.Data.Library.Entities.SceneRegion;
using SceneSourceEntity = VttTools.Data.Library.Entities.SceneSource;
using SceneWallEntity = VttTools.Data.Library.Entities.SceneWall;

namespace VttTools.Data.Library;

internal static class Mapper {
    internal static Expression<Func<AdventureEntity, Adventure>> AsAdventure = entity
        => new() {
            OwnerId = entity.OwnerId,
            CampaignId = entity.CampaignId,
            Id = entity.Id,
            Name = entity.Name,
            Description = entity.Description,
            Style = entity.Style,
            Background = entity.Background != null ? entity.Background.ToModel() : null,
            IsOneShot = entity.IsOneShot,
            IsPublic = entity.IsPublic,
            IsPublished = entity.IsPublished,
            Scenes = entity.Scenes.AsQueryable().Select(AsScene!).ToList(),
        };

    internal static Expression<Func<SceneEntity, Scene>> AsScene = entity
        => new() {
            Id = entity.Id,
            Name = entity.Name,
            Description = entity.Description,
            Adventure = entity.Adventure != null ? entity.Adventure.ToModel() : null!,
            Stage = new() {
                Background = entity.Background != null ? entity.Background.ToModel() : null,
                ZoomLevel = entity.ZoomLevel,
                Panning = entity.Panning,
            },
            Grid = entity.Grid,
            DefaultDisplayName = entity.DefaultDisplayName,
            DefaultLabelPosition = entity.DefaultLabelPosition,
            Assets = entity.SceneAssets.AsQueryable().Select(AsSceneAsset!).ToList(),
            Walls = entity.Walls.AsQueryable().Select(AsSceneWall!).ToList(),
            Regions = entity.Regions.AsQueryable().Select(AsSceneRegion!).ToList(),
            Sources = entity.Sources.AsQueryable().Select(AsSceneSource!).ToList(),
            Effects = entity.SceneEffects.AsQueryable().Select(AsSceneEffect!).ToList(),
        };

    internal static Expression<Func<SceneAssetEntity, SceneAsset>> AsSceneAsset = entity
        => new() {
            AssetId = entity.AssetId,
            Index = entity.Index,
            Number = entity.Number,
            Name = entity.Name,
            Description = entity.Description,
            ResourceId = entity.ResourceId,
            Size = entity.Size,
            Position = entity.Position,
            Elevation = entity.Elevation,
            Rotation = entity.Rotation,
            Frame = entity.Frame,
            IsLocked = entity.IsLocked,
            ControlledBy = entity.ControlledBy,
            DisplayName = entity.DisplayName,
            LabelPosition = entity.LabelPosition,
        };

    [return: NotNullIfNotNull(nameof(entity))]
    internal static Resource? ToModel(this ResourceEntity? entity)
        => entity == null ? null : new() {
            Id = entity.Id,
            Type = entity.Type,
            Path = entity.Path,
            Metadata = new() {
                ContentType = entity.ContentType,
                FileName = entity.FileName,
                FileLength = entity.FileLength,
                ImageSize = entity.ImageSize,
                Duration = entity.Duration,
            },
            Tags = entity.Tags,
        };

    [return: NotNullIfNotNull(nameof(entity))]
    internal static Adventure? ToModel(this AdventureEntity? entity)
        => entity == null ? null : new() {
            OwnerId = entity.OwnerId,
            CampaignId = entity.CampaignId,
            Id = entity.Id,
            Name = entity.Name,
            Description = entity.Description,
            Style = entity.Style,
            Background = entity.Background?.ToModel(),
            IsOneShot = entity.IsOneShot,
            IsPublic = entity.IsPublic,
            IsPublished = entity.IsPublished,
            Scenes = entity.Scenes.Select(ToModel).ToList()!,
        };

    internal static AdventureEntity ToEntity(this Adventure model)
        => new() {
            OwnerId = model.OwnerId,
            CampaignId = model.CampaignId,
            Id = model.Id,
            Name = model.Name,
            Description = model.Description,
            Style = model.Style,
            BackgroundId = model.Background?.Id,
            IsOneShot = model.IsOneShot,
            IsPublic = model.IsPublic,
            IsPublished = model.IsPublished,
            Scenes = model.Scenes.ConvertAll(s => s.ToEntity(model.Id)),
        };

    internal static void UpdateFrom(this AdventureEntity entity, Adventure model) {
        entity.OwnerId = model.OwnerId;
        entity.CampaignId = model.CampaignId;
        entity.Id = model.Id;
        entity.Name = model.Name;
        entity.Description = model.Description;
        entity.Style = model.Style;
        entity.BackgroundId = model.Background?.Id;
        entity.IsPublic = model.IsPublic;
        entity.IsPublished = model.IsPublished;
        entity.IsOneShot = model.IsOneShot;
        var existingScenes = entity.Scenes.Join(model.Scenes, se => se.Id, sm => sm.Id, UpdateFrom);
        var newScenes = model.Scenes.Where(sm => entity.Scenes.All(se => se.Id != sm.Id)).Select(s => s.ToEntity(model.Id));
        entity.Scenes = [.. existingScenes.Union(newScenes)];
    }

    [return: NotNullIfNotNull(nameof(entity))]
    internal static Scene? ToModel(this SceneEntity? entity)
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
                Scenes = [],
            } : null!,
            Stage = new() {
                Background = entity.Background?.ToModel(),
                ZoomLevel = entity.ZoomLevel,
                Panning = entity.Panning,
            },
            Grid = entity.Grid,
            DefaultDisplayName = entity.DefaultDisplayName,
            DefaultLabelPosition = entity.DefaultLabelPosition,
            Assets = [.. entity.SceneAssets.Select(sa => sa.ToModel()!)],
            Walls = [.. entity.Walls.Select(sb => sb.ToModel()!)],
            Regions = [.. entity.Regions.Select(sr => sr.ToModel()!)],
            Sources = [.. entity.Sources.Select(ss => ss.ToModel()!)],
            Effects = [.. entity.SceneEffects.Select(se => se.ToModel()!)],
        };

    internal static SceneEntity ToEntity(this Scene model, Guid adventureId)
        => new() {
            Id = model.Id,
            AdventureId = adventureId,
            Name = model.Name,
            Description = model.Description,
            IsPublished = model.IsPublished,
            BackgroundId = model.Stage.Background?.Id,
            ZoomLevel = model.Stage.ZoomLevel,
            Panning = model.Stage.Panning,
            Grid = model.Grid,
            DefaultDisplayName = model.DefaultDisplayName,
            DefaultLabelPosition = model.DefaultLabelPosition,
            SceneAssets = model.Assets?.ConvertAll(sa => ToEntity(sa, model.Id)) ?? [],
            Walls = model.Walls?.ConvertAll(sw => ToEntity(sw, model.Id)) ?? [],
            Regions = model.Regions?.ConvertAll(sr => ToEntity(sr, model.Id)) ?? [],
            Sources = model.Sources?.ConvertAll(ss => ToEntity(ss, model.Id)) ?? [],
            SceneEffects = model.Effects?.ConvertAll(se => ToEntity(se, model.Id)) ?? [],
        };

    internal static SceneEntity UpdateFrom(this SceneEntity entity, Scene model) {
        entity.Id = model.Id;
        entity.Name = model.Name;
        entity.Description = model.Description;
        entity.IsPublished = model.IsPublished;
        entity.BackgroundId = model.Stage.Background?.Id;
        entity.ZoomLevel = model.Stage.ZoomLevel;
        entity.Panning = model.Stage.Panning;
        entity.Grid = model.Grid;
        entity.DefaultDisplayName = model.DefaultDisplayName;
        entity.DefaultLabelPosition = model.DefaultLabelPosition;

        // Update SceneAssets
        var assetIndices = model.Assets.Select(sa => sa.Index).ToHashSet();
        var assetsToRemove = entity.SceneAssets.Where(ea => !assetIndices.Contains(ea.Index)).ToList();
        foreach (var assetToRemove in assetsToRemove) {
            entity.SceneAssets.Remove(assetToRemove);
        }
        foreach (var modelAsset in model.Assets) {
            var existingAsset = entity.SceneAssets.FirstOrDefault(ea => ea.Index == modelAsset.Index);
            if (existingAsset != null) {
                UpdateFrom(existingAsset, entity.Id, modelAsset);
            }
            else {
                entity.SceneAssets.Add(ToEntity(modelAsset, entity.Id));
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
                UpdateFrom(existingWall, entity.Id, modelWall);
            }
            else {
                entity.Walls.Add(ToEntity(modelWall, entity.Id));
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
                UpdateFrom(existingRegion, entity.Id, modelRegion);
            }
            else {
                entity.Regions.Add(ToEntity(modelRegion, entity.Id));
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
                UpdateFrom(existingSource, entity.Id, modelSource);
            }
            else {
                entity.Sources.Add(ToEntity(modelSource, entity.Id));
            }
        }

        // Update Effects
        var effectIndices = model.Effects.Select(se => se.Index).ToHashSet();
        var effectsToRemove = entity.SceneEffects.Where(ee => !effectIndices.Contains(ee.Index)).ToList();
        foreach (var effectToRemove in effectsToRemove) {
            entity.SceneEffects.Remove(effectToRemove);
        }
        foreach (var modelEffect in model.Effects) {
            var existingEffect = entity.SceneEffects.FirstOrDefault(ee => ee.Index == modelEffect.Index);
            if (existingEffect != null) {
                UpdateFrom(existingEffect, entity.Id, modelEffect);
            }
            else {
                entity.SceneEffects.Add(ToEntity(modelEffect, entity.Id));
            }
        }

        return entity;
    }

    [return: NotNullIfNotNull(nameof(entity))]
    internal static SceneAsset? ToModel(this SceneAssetEntity? entity)
        => entity == null ? null : new() {
            AssetId = entity.AssetId,
            Index = entity.Index,
            Number = entity.Number,
            Name = entity.Name,
            Description = entity.Description,
            ResourceId = entity.ResourceId,
            Size = entity.Size,
            Position = entity.Position,
            Elevation = entity.Elevation,
            Rotation = entity.Rotation,
            Frame = entity.Frame,
            IsLocked = entity.IsLocked,
            ControlledBy = entity.ControlledBy,
            DisplayName = entity.DisplayName,
            LabelPosition = entity.LabelPosition,
        };

    internal static SceneAssetEntity ToEntity(this SceneAsset model, Guid sceneId)
        => new() {
            SceneId = sceneId,
            AssetId = model.AssetId,
            Index = model.Index,
            Number = model.Number,
            Name = model.Name,
            Description = model.Description,
            ResourceId = model.ResourceId,
            Frame = model.Frame,
            Size = model.Size,
            Position = model.Position,
            Elevation = model.Elevation,
            Rotation = model.Rotation,
            IsLocked = model.IsLocked,
            ControlledBy = model.ControlledBy,
            DisplayName = model.DisplayName,
            LabelPosition = model.LabelPosition,
        };

    internal static SceneAssetEntity UpdateFrom(this SceneAssetEntity entity, Guid sceneId, SceneAsset model) {
        entity.SceneId = sceneId;
        entity.AssetId = model.AssetId;
        entity.Index = model.Index;
        entity.Number = model.Number;
        entity.Name = model.Name;
        entity.Description = model.Description;
        entity.ResourceId = model.ResourceId;
        entity.Frame = model.Frame;
        entity.Size = model.Size;
        entity.Position = model.Position;
        entity.Elevation = model.Elevation;
        entity.Rotation = model.Rotation;
        entity.IsLocked = model.IsLocked;
        entity.ControlledBy = model.ControlledBy;
        entity.DisplayName = model.DisplayName;
        entity.LabelPosition = model.LabelPosition;
        return entity;
    }

    internal static Expression<Func<SceneWallEntity, SceneWall>> AsSceneWall = entity
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
    internal static SceneWall? ToModel(this SceneWallEntity? entity)
        => entity == null ? null : new() {
            Index = entity.Index,
            Name = entity.Name,
            Poles = entity.Poles,
            Visibility = entity.Visibility,
            IsClosed = entity.IsClosed,
            Material = entity.Material,
            Color = entity.Color,
        };

    internal static SceneWallEntity ToEntity(this SceneWall model, Guid sceneId)
        => new() {
            SceneId = sceneId,
            Index = model.Index,
            Name = model.Name,
            Poles = [.. model.Poles],
            Visibility = model.Visibility,
            IsClosed = model.IsClosed,
            Material = model.Material,
            Color = model.Color,
        };

    internal static SceneWallEntity UpdateFrom(this SceneWallEntity entity, Guid sceneId, SceneWall model) {
        entity.SceneId = sceneId;
        entity.Index = model.Index;
        entity.Name = model.Name;
        entity.Poles = [.. model.Poles];
        entity.Visibility = model.Visibility;
        entity.IsClosed = model.IsClosed;
        entity.Material = model.Material;
        entity.Color = model.Color;
        return entity;
    }

    internal static Expression<Func<SceneRegionEntity, SceneRegion>> AsSceneRegion = entity
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
    internal static SceneRegion? ToModel(this SceneRegionEntity? entity)
        => entity == null ? null : new() {
            Index = entity.Index,
            Name = entity.Name,
            Type = entity.Type,
            Vertices = entity.Vertices,
            Value = entity.Value,
            Label = entity.Label,
            Color = entity.Color,
        };

    internal static SceneRegionEntity ToEntity(this SceneRegion model, Guid sceneId)
        => new() {
            SceneId = sceneId,
            Index = model.Index,
            Name = model.Name,
            Type = model.Type,
            Vertices = [.. model.Vertices],
            Value = model.Value,
            Label = model.Label,
            Color = model.Color,
        };

    internal static SceneRegionEntity UpdateFrom(this SceneRegionEntity entity, Guid sceneId, SceneRegion model) {
        entity.SceneId = sceneId;
        entity.Index = model.Index;
        entity.Name = model.Name;
        entity.Type = model.Type;
        entity.Vertices = [.. model.Vertices];
        entity.Value = model.Value;
        entity.Label = model.Label;
        entity.Color = model.Color;
        return entity;
    }

    internal static Expression<Func<SceneSourceEntity, SceneSource>> AsSceneSource = entity
        => new() {
            Index = entity.Index,
            Name = entity.Name,
            Type = entity.Type,
            Position = entity.Position,
            Direction = entity.Direction,
            Range = entity.Range,
            Intensity = entity.Intensity,
            HasGradient = entity.HasGradient,
        };

    [return: NotNullIfNotNull(nameof(entity))]
    internal static SceneSource? ToModel(this SceneSourceEntity? entity)
        => entity == null ? null : new() {
            Index = entity.Index,
            Name = entity.Name,
            Type = entity.Type,
            Position = entity.Position,
            Direction = entity.Direction,
            Range = entity.Range,
            Intensity = entity.Intensity,
            HasGradient = entity.HasGradient,
        };

    internal static SceneSourceEntity ToEntity(this SceneSource model, Guid sceneId)
        => new() {
            SceneId = sceneId,
            Index = model.Index,
            Name = model.Name,
            Type = model.Type,
            Position = model.Position,
            Direction = model.Direction,
            Range = model.Range,
            Intensity = model.Intensity,
            HasGradient = model.HasGradient,
        };

    internal static SceneSourceEntity UpdateFrom(this SceneSourceEntity entity, Guid sceneId, SceneSource model) {
        entity.SceneId = sceneId;
        entity.Index = model.Index;
        entity.Name = model.Name;
        entity.Type = model.Type;
        entity.Position = model.Position;
        entity.Direction = model.Direction;
        entity.Range = model.Range;
        entity.Intensity = model.Intensity;
        entity.HasGradient = model.HasGradient;
        return entity;
    }

    internal static Expression<Func<SceneEffectEntity, SceneEffect>> AsSceneEffect = entity
        => new() {
            EffectId = entity.EffectId,
            Index = entity.Index,
            Name = entity.Name,
            Origin = entity.Origin,
            Size = entity.Size,
            Direction = entity.Direction,
        };

    [return: NotNullIfNotNull(nameof(entity))]
    internal static SceneEffect? ToModel(this SceneEffectEntity? entity)
        => entity == null ? null : new() {
            EffectId = entity.EffectId,
            Index = entity.Index,
            Name = entity.Name,
            Origin = entity.Origin,
            Size = entity.Size,
            Direction = entity.Direction,
        };

    internal static SceneEffectEntity ToEntity(this SceneEffect model, Guid sceneId)
        => new() {
            SceneId = sceneId,
            EffectId = model.EffectId,
            Index = model.Index,
            Name = model.Name,
            Origin = model.Origin,
            Size = model.Size,
            Direction = model.Direction,
        };

    internal static SceneEffectEntity UpdateFrom(this SceneEffectEntity entity, Guid sceneId, SceneEffect model) {
        entity.SceneId = sceneId;
        entity.EffectId = model.EffectId;
        entity.Index = model.Index;
        entity.Name = model.Name;
        entity.Origin = model.Origin;
        entity.Size = model.Size;
        entity.Direction = model.Direction;
        return entity;
    }
}