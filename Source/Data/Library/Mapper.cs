using Adventure = VttTools.Library.Adventures.Model.Adventure;
using AdventureEntity = VttTools.Data.Library.Entities.Adventure;
using ResourceEntity = VttTools.Data.Media.Entities.Resource;
using Scene = VttTools.Library.Scenes.Model.Scene;
using SceneAsset = VttTools.Library.Scenes.Model.SceneAsset;
using SceneAssetEntity = VttTools.Data.Library.Entities.SceneAsset;
using SceneEntity = VttTools.Data.Library.Entities.Scene;

namespace VttTools.Data.Library;

internal static class Mapper {
    internal static Expression<Func<AdventureEntity, Adventure>> AsAdventure = entity
        => new() {
            OwnerId = entity.OwnerId,
            CampaignId = entity.CampaignId,
            Id = entity.Id,
            Name = entity.Name,
            Description = entity.Description,
            Type = entity.Type,
            Background = entity.Background.ToModel(),
            IsPublic = entity.IsPublic,
            IsPublished = entity.IsPublished,
            Scenes = entity.Scenes.AsQueryable().Select(AsScene!).ToList(),
        };

    internal static Expression<Func<SceneEntity, Scene>> AsScene = entity
        => new() {
            Id = entity.Id,
            Name = entity.Name,
            Description = entity.Description,
            Stage = entity.Stage.ToModel(entity),
            Assets = entity.SceneAssets.AsQueryable().Select(AsSceneAsset!).ToList(),
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
            Type = entity.Type,
            Background = entity.Background.ToModel(),
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
            Type = model.Type,
            BackgroundId = model.Background.Id,
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
        entity.Type = model.Type;
        entity.BackgroundId = model.Background.Id;
        entity.IsPublic = model.IsPublic;
        entity.IsPublished = model.IsPublished;
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
            Stage = entity.Stage.ToModel(entity),
            Grid = entity.Grid,
            Assets = [.. entity.SceneAssets.Select(sa => sa.ToModel()!)],
        };

    internal static SceneEntity ToEntity(this Scene model, Guid? adventureId = null)
        => new() {
            Id = model.Id,
            AdventureId = adventureId,
            Name = model.Name,
            Description = model.Description,
            IsPublished = model.IsPublished,
            StageId = model.Stage.Background.Id,
            ZoomLevel = model.Stage.ZoomLevel,
            Panning = model.Stage.Panning,
            Grid = model.Grid,
            SceneAssets = model.Assets.ConvertAll(sa => ToEntity(sa, model.Id)),
        };

    internal static SceneEntity UpdateFrom(this SceneEntity entity, Scene model) {
        entity.Id = model.Id;
        entity.Name = model.Name;
        entity.Description = model.Description;
        entity.IsPublished = model.IsPublished;
        entity.StageId = model.Stage.Background.Id;
        entity.ZoomLevel = model.Stage.ZoomLevel;
        entity.Panning = model.Stage.Panning;
        entity.Grid = model.Grid;
        var existingAssets = entity.SceneAssets.Join(model.Assets, esa => esa.AssetId, msa => msa.AssetId, (esa, msa) => UpdateFrom(esa, entity.Id, msa));
        var newAssets = model.Assets.Where(sa => entity.SceneAssets.All(ea => ea.AssetId != sa.AssetId)).Select(msa => ToEntity(msa, entity.Id));
        entity.SceneAssets = [.. existingAssets.Union(newAssets)];
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
        return entity;
    }

    internal static Stage ToModel(this ResourceEntity background, SceneEntity scene)
        => new() {
            Background = background.ToModel(),
            ZoomLevel = scene.ZoomLevel,
            Panning = scene.Panning,
        };
}