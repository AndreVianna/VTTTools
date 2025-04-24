namespace VttTools.GameService.Services.Game;

public static class Cloner {
    internal static Adventure CloneAdventure(Adventure original, Guid ownerId) {
        var clone = new Adventure {
            OwnerId = ownerId,
            ParentId = original.ParentId,
            Name = original.Name,
            Visibility = original.Visibility,
            TemplateId = original.Id,
        };
        foreach (var ep in original.Episodes)
            clone.Episodes.Add(CloneEpisode(ep, ownerId, clone.Id));
        return clone;
    }

    internal static Episode CloneEpisode(Episode original, Guid ownerId, Guid? parentId = null) {
        var clone = new Episode {
            OwnerId = ownerId,
            ParentId = parentId ?? original.ParentId,
            Name = original.Name,
            Visibility = original.Visibility,
            TemplateId = original.Id,
            Stage = CloneStage(original.Stage),
        };
        foreach (var ea in original.EpisodeAssets)
            clone.EpisodeAssets.Add(CloneEpisodeAsset(ea, clone.Id));
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

    internal static EpisodeAsset CloneEpisodeAsset(EpisodeAsset original, Guid? episodeId = null)
        => new() {
            EpisodeId = episodeId ?? original.EpisodeId,
            AssetId = original.AssetId,
            Name = original.Name,
            Position = ClonePosition(original.Position),
            Scale = original.Scale,
            IsLocked = original.IsLocked,
            ControlledBy = original.ControlledBy,
        };
}