namespace VttTools.Library.Services;

public static class Cloner {
    internal static Adventure CloneAdventure(Adventure original, Guid ownerId, ClonedAdventureData? data = null) {
        var clone = new Adventure {
            OwnerId = ownerId,
            CampaignId = data?.CampaignId.IsSet ?? false ? data.CampaignId.Value : original.CampaignId,
            Name = data?.Name.IsSet ?? false ? data.Name.Value : $"{original.Name} (Copy)",
            Description = data?.Description.IsSet ?? false ? data.Description.Value : original.Description,
            Type = data?.Type.IsSet ?? false ? data.Type.Value : original.Type,
            ImageId = data?.ImageId.IsSet ?? false ? data.ImageId.Value : original.ImageId,
        };
        if (data?.IncludeScenes != true) return clone;
        clone.Scenes.AddRange(original.Scenes.Select(ep => CloneScene(ep, ownerId)));
        return clone;
    }

    internal static Scene CloneScene(Scene original, Guid ownerId, ClonedSceneData? data = null) {
        var clone = new Scene {
            Name = data?.Name.IsSet ?? false ? data.Name.Value : $"{original.Name} (Copy)",
            Description = data?.Description.IsSet ?? false ? data.Description.Value : original.Description,
            Stage = data?.Stage.IsSet ?? false ? data.Stage.Value : original.Stage,
        };
        clone.SceneAssets.AddRange(original.SceneAssets.Select(sa => CloneSceneAsset(sa, ownerId)));
        return clone;
    }

    internal static SceneAsset CloneSceneAsset(SceneAsset original, Guid ownerId)
        => new() {
            Id = original.Id,
            Number = original.Number,
            Name = original.Name,
            Shape = original.Shape,
            Position = original.Position,
            Scale = original.Scale,
            Rotation = original.Rotation,
            Elevation = original.Elevation,
            ControlledBy = ownerId,
        };

    internal static Asset CloneAsset(Asset original, Guid ownerId, CloneAssetData data)
        => new() {
            OwnerId = ownerId,
            Name = data.Name.IsSet ? data.Name.Value : $"{original.Name} (Copy)",
            Description = data.Description.IsSet ? data.Description.Value : original.Description,
            Type = original.Type,
            Shape = data.Shape.IsSet ? data.Shape.Value : original.Shape,
        };
}