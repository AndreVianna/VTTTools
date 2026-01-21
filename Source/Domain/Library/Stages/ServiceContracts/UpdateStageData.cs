namespace VttTools.Library.Stages.ServiceContracts;

public record UpdateStageData : Data {
    public Optional<string> Name { get; init; }
    public Optional<string> Description { get; init; }
    public Optional<bool> IsPublished { get; init; }
    public Optional<bool> IsPublic { get; init; }

    public Optional<SettingsUpdate> Settings { get; init; }
    public Optional<GridUpdate> Grid { get; init; }

    public record SettingsUpdate {
        public Optional<Point> Panning { get; init; }
        public Optional<float> ZoomLevel { get; init; }

        public Optional<Guid?> MainBackgroundId { get; init; }
        public Optional<Guid?> AlternateBackgroundId { get; init; }
        public Optional<bool> UseAlternateBackground { get; init; }
        public Optional<Guid?> AmbientSoundId { get; init; }
        public Optional<AmbientSoundSource> AmbientSoundSource { get; init; }
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

    public override Result Validate(IMap? context = null) {
        var result = base.Validate(context);
        if (Name.IsSet && string.IsNullOrWhiteSpace(Name.Value))
            result += new Error("When set, the stage name cannot be null or empty.", nameof(Name));
        if (Description.IsSet && string.IsNullOrWhiteSpace(Description.Value))
            result += new Error("When set, the stage description cannot be null or empty.", nameof(Description));
        if (IsPublished is { IsSet: true, Value: true } && IsPublic is { IsSet: true, Value: false })
            result += new Error("A published stage must be public.", nameof(IsPublic));
        if (IsPublic is { IsSet: true, Value: false } && IsPublished is { IsSet: true, Value: true })
            result += new Error("A published stage must be public.", nameof(IsPublished));
        return result;
    }
}