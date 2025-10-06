namespace VttTools.WebApp.Clients;

public static class ScenesMapper {
    internal static SceneDetails ToViewModel(this Scene scene)
        => new() {
            Id = scene.Id,
            Name = scene.Name,
            Description = scene.Description,
            IsPublished = scene.IsPublished,
            Stage = new() {
                Id = scene.Stage.Background.Id,
                Type = scene.Stage.Background.Type,
                Path = scene.Stage.Background.Path,
                ImageSize = scene.Stage.Background.Metadata.ImageSize,
                ZoomLevel = scene.Stage.ZoomLevel,
                Panning = scene.Stage.Panning,
            },
            Grid = new() {
                Type = scene.Grid.Type,
                CellSize = scene.Grid.CellSize,
                Offset = scene.Grid.Offset,
                Snap = scene.Grid.Snap,
            },
            Assets = scene.Assets.ConvertAll(a => new SceneAssetDetails {
                Id = a.Id,
                Name = a.Name,
                Number = a.Number,
                Type = a.Type,
            }),
        };
    internal static SceneAssetDetails ToViewModel(this SceneAsset asset)
        => new() {
            Id = asset.Id,
            Name = asset.Name,
            Number = asset.Number,
            Type = asset.Type,
            Position = asset.Position,
            Size = asset.Size,
            Rotation = asset.Rotation,
            Elevation = asset.Elevation,
            DisplayType = asset.Resource?.Type ?? ResourceType.Undefined,
            DisplayPath = asset.Resource?.Path ?? string.Empty,
            ControlledBy = asset.ControlledBy,
            IsLocked = false,
        };
}