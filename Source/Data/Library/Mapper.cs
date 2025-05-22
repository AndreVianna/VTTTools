using Adventure = VttTools.Library.Adventures.Model.Adventure;
using AdventureEntity = VttTools.Data.Library.Entities.Adventure;
using Scene = VttTools.Library.Scenes.Model.Scene;
using SceneAsset = VttTools.Library.Scenes.Model.SceneAsset;
using SceneAssetEntity = VttTools.Data.Library.Entities.SceneAsset;
using SceneEntity = VttTools.Data.Library.Entities.Scene;

namespace VttTools.Data.Library;

internal static class Mapper {
    [return: NotNullIfNotNull(nameof(entity))]
    internal static Adventure? ToModel(this AdventureEntity? entity)
#pragma warning disable RCS1077, IDE0305 // Simplify collection initialization
        => entity is null ? null : new Adventure {
            OwnerId = entity.OwnerId,
            CampaignId = entity.CampaignId,
            Id = entity.Id,
            Name = entity.Name,
            Description = entity.Description,
            Type = entity.Type,
            ImageId = entity.ImageId,
            IsPublic = entity.IsPublic,
            IsPublished = entity.IsPublished,
            Scenes = entity.Scenes.Select(s => new Scene {
                Id = s.Id,
                Name = s.Name,
                Description = s.Description,
                Stage = s.Stage,
                SceneAssets = s.SceneAssets.Select(sa => new SceneAsset {
                    Id = sa.Asset.Id,
                    Description = sa.Asset.Description,
                    Type = sa.Asset.Type,
                    Shape = sa.Asset.Shape,
                    Number = sa.Number,
                    Name = sa.Name,
                    Position = sa.Position,
                    Scale = sa.Scale,
                    Elevation = sa.Elevation,
                    Rotation = sa.Rotation,
                    IsLocked = sa.IsLocked,
                    ControlledBy = sa.ControlledBy,
                }).ToList(),
            }).ToList(),
        };
#pragma warning restore RCS1077, IDE0305 // Simplify collection initialization

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
            Scenes = model.Scenes.ConvertAll(ToEntity),
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
        var newScenes = model.Scenes.Where(sm => entity.Scenes.All(se => se.Id != sm.Id)).Select(ToEntity);
        entity.Scenes = [.. existingScenes.Union(newScenes)];
    }

    internal static SceneEntity ToEntity(this Scene model)
        => new() {
            Id = model.Id,
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
