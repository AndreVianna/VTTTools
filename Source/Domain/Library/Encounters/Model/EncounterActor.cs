namespace VttTools.Library.Encounters.Model;

public record EncounterActor {
    public Asset Asset { get; init; } = null!;
    public ushort Index { get; init; }
    public string? Name { get; init; }

    public Position Position { get; init; } = Position.Zero;
    public float Rotation { get; init; }
    public float Elevation { get; init; }

    public NamedSize Size { get; init; } = NamedSize.Default;
    public ResourceMetadata? Display { get; init; }
    public Frame Frame { get; init; } = new();

    public Guid? ControlledBy { get; init; }

    public bool IsHidden { get; init; }
    public bool IsLocked { get; init; }
}
