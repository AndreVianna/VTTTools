namespace VttTools.Library.Scenes.ServiceContracts;

public record UpdateSceneData
    : Data {
    public Optional<Guid> AdventureId { get; init; }
    public Optional<string> Name { get; init; }
    public Optional<string> Description { get; init; }
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

    public override Result Validate(IMap? context = null) {
        var result = base.Validate(context);
        if (Name.IsSet && string.IsNullOrWhiteSpace(Name.Value))
            result += new Error("When set, the scene name cannot be null or empty.", nameof(Name));
        if (Description.IsSet && string.IsNullOrWhiteSpace(Description.Value))
            result += new Error("When set, the scene description cannot be null or empty.", nameof(Description));
        return result;
    }
}