namespace VttTools.WebApp.WebAssembly.Clients;

public static class Mapper {
    internal static SceneDetails ToViewModel(this Scene scene)
        => new() {
            Id = scene.Id,
            Name = scene.Name,
            Description = scene.Description,
            IsPublished = scene.IsPublished,
            Stage = new() {
                FileName = scene.Stage.FileName ?? scene.Id.ToString(),
                Type = scene.Stage.Type,
                Size = scene.Stage.Size,
                ZoomLevel = scene.ZoomLevel,
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
            ResourceType = asset.Display.Type,
            DisplayId = asset.Display.FileName ?? asset.Id.ToString(),
            Position = asset.Position,
            Size = asset.Display.Size,
            Scale = asset.Scale,
            Rotation = asset.Rotation,
            Elevation = asset.Elevation,
            IsLocked = false,
        };
}
