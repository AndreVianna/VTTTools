namespace VttTools.WebApp.Server.Clients;

public static class AdventuresMapper {
    internal static AdventureListItem ToListItem(this Adventure adventure)
        => new() {
            Id = adventure.Id,
            Name = adventure.Name,
            Description = adventure.Description,
            Type = adventure.Type,
            IsPublished = adventure.IsPublished,
            IsPublic = adventure.IsPublic,
            OwnerId = adventure.OwnerId,
            ScenesCount = adventure.Scenes.Count,
        };

    [return: NotNullIfNotNull(nameof(adventure))]
    internal static AdventureDetails? ToDetails(this Adventure? adventure)
        => adventure is null ? null : new() {
            Name = adventure.Name,
            Description = adventure.Description,
            Type = adventure.Type,
            IsPublished = adventure.IsPublished,
            IsPublic = adventure.IsPublic,
            OwnerId = adventure.OwnerId,
            Scenes = [.. adventure.Scenes.Select(scene => scene.ToListItem())],
        };

    internal static SceneListItem ToListItem(this Scene scene)
        => new() {
            Id = scene.Id,
            Name = scene.Name,
        };
    [return: NotNullIfNotNull(nameof(scene))]
    internal static SceneDetails? ToDetails(this Scene? scene)
        => scene is null ? null : new() {
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
            ZoomLevel = scene.ZoomLevel,
            Assets = [.. scene.Assets.Select(asset => new SceneAssetDetails {
                                                                                                                Id = asset.Id,
                                                                                                                Name = asset.Name,
                                                                                                            })],
        };
}
