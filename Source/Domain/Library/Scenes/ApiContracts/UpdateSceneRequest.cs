namespace VttTools.Library.Scenes.ApiContracts;

public record UpdateSceneRequest
    : Request {
    public Optional<Guid> AdventureId { get; init; }
    public Optional<string> Name { get; init; }
    public Optional<string> Description { get; init; }
    public Optional<bool> IsPublished { get; init; }
    public Optional<StageUpdate> Stage { get; init; }
    public Optional<GridUpdate> Grid { get; init; }

    public record StageUpdate {
        public Optional<Guid?> BackgroundId { get; init; }
        public Optional<float> ZoomLevel { get; init; }
        public Optional<Point> Panning { get; init; }
    }

    public record GridUpdate {
        public Optional<GridType> Type { get; init; }
        public Optional<CellSize> CellSize { get; init; }
        public Optional<Offset> Offset { get; init; }
        public Optional<bool> Snap { get; init; }
    }
}