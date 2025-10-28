namespace VttTools.Library.Scenes.ApiContracts;

public record UpdateSceneAssetRequest
    : Request {
    // Overridable properties
    public Optional<string> Name { get; init; }
    public Optional<string> Description { get; init; }
    public Optional<Guid> ResourceId { get; set; }

    // Instance-specific properties
    public Optional<Position> Position { get; init; }
    public Optional<NamedSize> Size { get; init; }
    public Optional<Frame> Frame { get; init; }
    public Optional<float> Rotation { get; init; }
    public Optional<float> Elevation { get; init; }
    public Optional<bool> IsLocked { get; set; }
    public Optional<Guid?> ControlledBy { get; set; }
    public Optional<DisplayName> DisplayName { get; init; } = Optional<DisplayName>.None;
    public Optional<LabelPosition> LabelPosition { get; init; } = Optional<LabelPosition>.None;
}