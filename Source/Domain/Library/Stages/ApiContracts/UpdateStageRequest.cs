namespace VttTools.Library.Stages.ApiContracts;

public record UpdateStageRequest : Request {
    [MaxLength(128)]
    public Optional<string> Name { get; init; }
    [MaxLength(4096)]
    public Optional<string> Description { get; init; }

    public Optional<bool> IsPublished { get; init; }
    public Optional<bool> IsPublic { get; init; }

    public Optional<SettingsUpdate> Settings { get; init; }
    public Optional<GridUpdate> Grid { get; init; }

    public record SettingsUpdate {
        public Optional<float> ZoomLevel { get; init; }
        public Optional<Point> Panning { get; init; }

        public Optional<Guid?> MainBackgroundId { get; init; }
        public Optional<Guid?> AlternateBackgroundId { get; init; }
        public Optional<Guid?> AmbientSoundId { get; init; }
        public Optional<float> AmbientSoundVolume { get; init; }
        public Optional<bool> AmbientSoundLoop { get; init; }
        public Optional<bool> AmbientSoundIsPlaying { get; init; }

        public Optional<AmbientLight> AmbientLight { get; init; }
        public Optional<Weather> Weather { get; init; }
    }

    public record GridUpdate {
        public Optional<GridType> Type { get; init; }
        public Optional<CellSize> CellSize { get; init; }
        public Optional<Offset> Offset { get; init; }
        public Optional<double> Scale { get; init; }
    }
}
