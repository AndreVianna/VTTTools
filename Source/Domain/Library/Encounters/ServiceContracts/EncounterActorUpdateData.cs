namespace VttTools.Library.Encounters.ServiceContracts;

public record EncounterActorUpdateData
    : Data {
    public Optional<string?> Name { get; init; }

    public Optional<Position> Position { get; init; }
    public Optional<float> Rotation { get; init; }
    public Optional<float> Elevation { get; init; }
    public Optional<NamedSize> Size { get; init; }

    public Optional<Guid?> DisplayId { get; init; }
    public Optional<Frame> Frame { get; init; }

    public Optional<Guid?> ControlledBy { get; init; }
    public Optional<bool> IsHidden { get; init; }
    public Optional<bool> IsLocked { get; init; }

    public override Result Validate(IMap? context = null) {
        var result = base.Validate(context);
        if (Name is { IsSet: true, Value.Length: > 128 })
            result += new Error("Name must not exceed 128 characters.", nameof(Name));
        return result;
    }
}
