namespace VttTools.Library.Encounters.ApiContracts;

public record EncounterObjectAddRequest {
    public string? Name { get; init; }

    public Position Position { get; init; } = Position.Zero;
    public float Rotation { get; init; }
    public float Elevation { get; init; }

    public NamedSize Size { get; init; } = NamedSize.Default;

    public Guid DisplayId { get; init; }
    public Guid ClosedDisplayId { get; init; }
    public Guid? OpenedDisplayId { get; init; }
    public Guid? DestroyedDisplayId { get; init; }

    public ObjectState State { get; init; } = ObjectState.Closed;

    public bool IsHidden { get; init; }
    public bool IsLocked { get; init; }
}
