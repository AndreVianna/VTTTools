namespace VttTools.Library.Encounters.ApiContracts;

public record EncounterObjectResponse {
    public Guid AssetId { get; init; }
    public ushort Index { get; init; }

    public string? Name { get; init; }

    public Position Position { get; init; } = Position.Zero;
    public float Rotation { get; init; }
    public float Elevation { get; init; }

    public NamedSize Size { get; init; } = NamedSize.Default;

    public ResourceMetadata? Display { get; init; }
    public ResourceMetadata? ClosedDisplay { get; init; }
    public ResourceMetadata? OpenedDisplay { get; init; }
    public ResourceMetadata? DestroyedDisplay { get; init; }

    public ObjectState State { get; init; }

    public bool IsHidden { get; init; }
    public bool IsLocked { get; init; }
}
