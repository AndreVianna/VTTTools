namespace VttTools.Library.Encounters.ApiContracts;

public record EncounterActorAddRequest {
    public string? Name { get; init; }

    public Position Position { get; init; } = Position.Zero;
    public float Rotation { get; init; }
    public float Elevation { get; init; }

    public NamedSize Size { get; init; } = NamedSize.Default;

    public Guid? DisplayId { get; init; }
    public Frame Frame { get; init; } = new();

    public Guid? ControlledBy { get; init; }

    public bool IsHidden { get; init; }
    public bool IsLocked { get; init; }
}