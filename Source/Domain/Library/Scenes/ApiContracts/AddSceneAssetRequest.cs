namespace VttTools.Library.Scenes.ApiContracts;

public record AddSceneAssetRequest {
    // Overridable properties
    public Optional<string> Name { get; init; }
    public Optional<string> Description { get; init; }
    public Optional<Guid> ResourceId { get; init; }

    // Instance-specific properties
    public Position Position { get; init; } = Position.Zero;
    public NamedSize Size { get; init; } = NamedSize.Zero;
    public Frame Frame { get; init; } = new Frame();
    public float Rotation { get; init; }
    public float Elevation { get; init; }
}