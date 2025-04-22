namespace VttTools.GameService.Services.Game;

public static class Cloner {
    internal static Adventure CloneAdventure(Adventure original, Guid? campaignId, Guid ownerId) {
        var clone = new Adventure {
            OwnerId = ownerId,
            ParentId = campaignId,
            Name = original.Name,
            Visibility = original.Visibility,
            TemplateId = original.Id,
        };
        foreach (var ep in original.Episodes)
            clone.Episodes.Add(CloneEpisode(ep, clone.Id, ownerId));
        return clone;
    }

    internal static Episode CloneEpisode(Episode original, Guid adventureId, Guid ownerId) {
        var clone = new Episode {
            OwnerId = ownerId,
            ParentId = adventureId,
            Name = original.Name,
            Visibility = original.Visibility,
            TemplateId = original.Id,
            Stage = CloneStage(original.Stage),
        };
        foreach (var ea in original.EpisodeAssets)
            clone.EpisodeAssets.Add(CloneEpisodeAsset(original, ea));
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

    internal static EpisodeAsset CloneEpisodeAsset(Episode ep, EpisodeAsset ea)
        => new() {
            EpisodeId = ep.Id,
            AssetId = ea.AssetId,
            Name = ea.Name,
            Position = ClonePosition(ea.Position),
            Scale = ea.Scale,
            IsLocked = ea.IsLocked,
            ControlledBy = ea.ControlledBy,
        };
}
