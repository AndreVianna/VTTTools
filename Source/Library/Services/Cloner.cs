namespace VttTools.Library.Services;

public static class Cloner {
    internal static Adventure CloneAdventure(Adventure original, Guid ownerId, CloneAdventureData? data = null) {
        var clone = new Adventure {
            OwnerId = ownerId,
            CampaignId = original.CampaignId,
            Name = $"{original.Name} (Copy)",
            Description = original.Description,
            Type = original.Type,
            ImageId = original.ImageId,
        };
        if (data is null) return clone;
        if (data.CampaignId.IsSet) clone.CampaignId = data.CampaignId.Value;
        if (data.Name.IsSet) clone.Name = data.Name.Value;
        if (data.Description.IsSet) clone.Description = data.Description.Value;
        if (data.Type.IsSet) clone.Type = data.Type.Value;
        if (data.ImageId.IsSet) clone.ImageId = data.ImageId.Value;
        if (!data.IncludeScenes) return clone;
        clone.Scenes.AddRange(original.Scenes.Select(ep => CloneScene(ep, ownerId, clone.Id)));
        return clone;
    }

    internal static Scene CloneScene(Scene original, Guid ownerId, Guid adventureId, AddClonedSceneData? data = null) {
        var clone = new Scene {
            OwnerId = ownerId,
            AdventureId = adventureId,
            Name = $"{original.Name} (Copy)",
            Stage = original.Stage,
        };
        clone.SceneAssets.AddRange(original.SceneAssets.Select(sa => CloneSceneAsset(sa, clone.Id, ownerId)));
        if (data is null) return clone;
        if (data.Name.IsSet) clone.Name = data.Name.Value;
        if (data.Description.IsSet) clone.Description = data.Description.Value;
        if (data.Stage.IsSet) clone.Stage = data.Stage.Value;
        return clone;
    }

    internal static SceneAsset CloneSceneAsset(SceneAsset original, Guid sceneId, Guid ownerId)
        => new() {
            SceneId = sceneId,
            AssetId = original.AssetId,
            Number = original.Number,
            Name = original.Name,
            Display = original.Display,
            Position = original.Position,
            Scale = original.Scale,
            ControlledBy = ownerId,
        };

    internal static Asset CloneAsset(Asset original, Guid ownerId, CloneAssetData data) {
        var clone = new Asset {
            OwnerId = ownerId,
            Name = $"{original.Name} (Copy)",
            Description = original.Description,
            Type = original.Type,
            Display = original.Display,
        };
        if (data.Name.IsSet) clone.Name = data.Name.Value;
        if (data.Display.IsSet) clone.Display = data.Display.Value;
        if (data.Description.IsSet) clone.Description = data.Description.Value;
        if (data.Display.IsSet) clone.Display = data.Display.Value;
        return clone;
    }
}