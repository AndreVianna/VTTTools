namespace VttTools.Library.Services;

public static class Cloner {
    internal static Adventure CloneAdventure(Adventure original, Guid ownerId, ClonedAdventureData? data = null) {
        var clone = new Adventure {
            OwnerId = ownerId,
            CampaignId = data?.CampaignId.IsSet ?? false ? data.CampaignId.Value : original.CampaignId,
            Name = data?.Name.IsSet ?? false ? data.Name.Value : $"{original.Name} (Copy)",
            Description = data?.Description.IsSet ?? false ? data.Description.Value : original.Description,
            Type = data?.Type.IsSet ?? false ? data.Type.Value : original.Type,
            Display = data?.Display.IsSet ?? false ? data.Display.Value : original.Display,
        };
        if (data?.IncludeScenes != true)
            return clone;
        clone.Scenes.AddRange(original.Scenes.Select(ep => CloneScene(ep, ownerId)));
        return clone;
    }

    internal static Scene CloneScene(Scene original, Guid ownerId, ClonedSceneData? data = null) {
        var clone = new Scene {
            Name = data?.Name.IsSet ?? false ? data.Name.Value : $"{original.Name} (Copy)",
            Description = data?.Description.IsSet ?? false ? data.Description.Value : original.Description,
            Stage = data?.Stage.IsSet ?? false ? data.Stage.Value : original.Stage,
            ZoomLevel = data?.ZoomLevel.IsSet ?? false ? data.ZoomLevel.Value : original.ZoomLevel,
            Grid = data?.Grid.IsSet ?? false ? data.Grid.Value : original.Grid,
        };
        clone.Assets.AddRange(original.Assets.Select(sa => CloneSceneAsset(sa, ownerId)));
        return clone;
    }

    internal static SceneAsset CloneSceneAsset(SceneAsset original, Guid ownerId)
        => new() {
            Id = original.Id,
            Number = original.Number,
            Name = original.Name,
            Display = original.Display,
            Position = original.Position,
            Scale = original.Scale,
            Rotation = original.Rotation,
            Elevation = original.Elevation,
            ControlledBy = ownerId,
        };
}