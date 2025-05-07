namespace VttTools.Library.Services;

public static class Cloner {
    internal static Adventure CloneAdventure(Adventure original, Guid ownerId) {
        var clone = new Adventure {
            OwnerId = ownerId,
            ParentId = original.ParentId,
            Name = original.Name,
            Visibility = original.Visibility,
            TemplateId = original.Id,
        };
        foreach (var ep in original.Scenes)
            clone.Scenes.Add(CloneScene(ep, ownerId, clone.Id));
        return clone;
    }

    internal static Scene CloneScene(Scene original, Guid ownerId, Guid? parentId = null) {
        var clone = new Scene {
            OwnerId = ownerId,
            ParentId = parentId ?? original.ParentId,
            Name = original.Name,
            Visibility = original.Visibility,
            TemplateId = original.Id,
            Stage = CloneStage(original.Stage),
        };
        foreach (var ea in original.SceneAssets)
            clone.SceneAssets.Add(CloneSceneAsset(ea, clone.Id));
        return clone;
    }

    internal static Stage CloneStage(Stage original)
        => new() {
            MapType = original.MapType,
            Source = original.Source,
            Size = CloneSize(original.Size),
            Grid = CloneGrid(original.Grid),
        };

    internal static Grid CloneGrid(Grid original)
        => new() {
            Offset = ClonePosition(original.Offset),
            CellSize = CloneSize(original.CellSize),
        };

    internal static Size CloneSize(Size original)
        => new() {
            Width = original.Width,
            Height = original.Height,
        };

    internal static Position ClonePosition(Position original)
        => new() {
            Left = original.Left,
            Top = original.Top,
        };

    internal static SceneAsset CloneSceneAsset(SceneAsset original, Guid? sceneId = null)
        => new() {
            SceneId = sceneId ?? original.SceneId,
            AssetId = original.AssetId,
            Name = original.Name,
            Position = ClonePosition(original.Position),
            Scale = original.Scale,
            IsLocked = original.IsLocked,
            ControlledBy = original.ControlledBy,
        };
}