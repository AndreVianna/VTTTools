using Adventure = VttTools.Library.Adventures.Model.Adventure;
using AdventureEntity = VttTools.Data.Library.Entities.Adventure;
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
            ImageId = entity.ImageId,
            IsPublic = entity.IsPublic,
            IsPublished = entity.IsPublished,
            Scenes = entity.Scenes.AsQueryable().Select(AsScene!).ToList()!,
        };

    internal static Expression<Func<SceneEntity, Scene>> AsScene = entity
        => new() {
            Id = entity.Id,
            Name = entity.Name,
            Description = entity.Description,
            Stage = entity.Stage,
            SceneAssets = entity.SceneAssets.AsQueryable().Select(AsSceneAsset!).ToList()!,
        };

    internal static Expression<Func<SceneAssetEntity, SceneAsset>> AsSceneAsset = entity
        => new() {
            Id = entity.Asset.Id,
            Description = entity.Asset.Description,
            Type = entity.Asset.Type,
            Number = entity.Number,
            Name = entity.Name,
            Position = entity.Position,
            Scale = entity.Scale,
            Shape = entity.Asset.Shape,
            IsLocked = entity.IsLocked,
            ControlledBy = entity.ControlledBy,
        };

    internal static Adventure? ToModel(this AdventureEntity? entity)
        => entity == null ? null : new() {
            OwnerId = entity.OwnerId,
            CampaignId = entity.CampaignId,
            Id = entity.Id,
            Name = entity.Name,
            Description = entity.Description,
            Type = entity.Type,
            ImageId = entity.ImageId,
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
            ImageId = model.ImageId,
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
        entity.ImageId = model.ImageId;
        entity.IsPublic = model.IsPublic;
        entity.IsPublished = model.IsPublished;
        var existingScenes = entity.Scenes.Join(model.Scenes, se => se.Id, sm => sm.Id, UpdateFrom);
        var newScenes = model.Scenes.Where(sm => entity.Scenes.All(se => se.Id != sm.Id)).Select(s => s.ToEntity(model.Id));
        entity.Scenes = [.. existingScenes.Union(newScenes)];
    }

    internal static Scene? ToModel(this SceneEntity? scene)
        => scene is null ? null : new() {
            Id = scene.Id,
            Name = scene.Name,
            Description = scene.Description,
            Stage = scene.Stage,
            SceneAssets = [..scene.SceneAssets.Select(sa => sa.ToModel()!)],
        };

    internal static SceneEntity ToEntity(this Scene model, Guid? adventureId = null)
        => new() {
            Id = model.Id,
            AdventureId = adventureId,
            Name = model.Name,
            Description = model.Description,
            IsPublished = model.IsPublished,
            Stage = model.Stage,
            SceneAssets = model.SceneAssets.ConvertAll<SceneAssetEntity>(sa => ToEntity(sa, model.Id)),
        };

    internal static SceneEntity UpdateFrom(this SceneEntity entity, Scene model) {
        entity.Id = model.Id;
        entity.Name = model.Name;
        entity.Description = model.Description;
        entity.IsPublished = model.IsPublished;
        entity.Stage = model.Stage;
        var existingAssets = entity.SceneAssets.Join<SceneAssetEntity, SceneAsset, Guid, SceneAssetEntity>(model.SceneAssets, esa => esa.AssetId, msa => msa.Id, (esa, msa) => UpdateFrom(esa, entity.Id, msa));
        var newAssets = model.SceneAssets.Where(sa => entity.SceneAssets.All(ea => ea.AssetId != sa.Id)).Select<SceneAsset, SceneAssetEntity>(msa => ToEntity(msa, entity.Id));
        entity.SceneAssets = [.. existingAssets.Union(newAssets)];
        return entity;
    }

    internal static SceneAsset? ToModel(this SceneAssetEntity? entity)
        => entity == null ? null : new() {
            Id = entity.Asset.Id,
            Description = entity.Asset.Description,
            Type = entity.Asset.Type,
            Number = entity.Number,
            Name = entity.Name,
            Position = entity.Position,
            Scale = entity.Scale,
            Shape = entity.Asset.Shape,
            IsLocked = entity.IsLocked,
            ControlledBy = entity.ControlledBy,
        };

    internal static SceneAssetEntity ToEntity(this SceneAsset model, Guid sceneId)
        => new() {
            SceneId = sceneId,
            AssetId = model.Id,
            Number = model.Number,
            Name = model.Name,
            Position = model.Position,
            Scale = model.Scale,
            Elevation = model.Elevation,
            Rotation = model.Rotation,
            IsLocked = model.IsLocked,
            ControlledBy = model.ControlledBy,
        };

    internal static SceneAssetEntity UpdateFrom(this SceneAssetEntity entity, Guid sceneId, SceneAsset model) {
        entity.SceneId = sceneId;
        entity.AssetId = model.Id;
        entity.Number = model.Number;
        entity.Name = model.Name;
        entity.Position = model.Position;
        entity.Scale = model.Scale;
        entity.Elevation = model.Elevation;
        entity.Rotation = model.Rotation;
        entity.IsLocked = model.IsLocked;
        entity.ControlledBy = model.ControlledBy;
        return entity;
    }
}
