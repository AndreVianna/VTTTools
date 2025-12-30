namespace VttTools.Library.Encounters.ApiContracts;

public record EncounterObjectUpdateRequest {
    public Optional<string?> Name { get; init; }

    public Optional<Position> Position { get; init; }
    public Optional<float> Rotation { get; init; }
    public Optional<float> Elevation { get; init; }

    public Optional<NamedSize> Size { get; init; }

    public Optional<Guid?> DisplayId { get; init; }
    public Optional<Guid?> ClosedDisplayId { get; init; }
    public Optional<Guid?> OpenedDisplayId { get; init; }
    public Optional<Guid?> DestroyedDisplayId { get; init; }

    public Optional<ObjectState> State { get; init; }

    public Optional<bool> IsHidden { get; init; }
    public Optional<bool> IsLocked { get; init; }
}
