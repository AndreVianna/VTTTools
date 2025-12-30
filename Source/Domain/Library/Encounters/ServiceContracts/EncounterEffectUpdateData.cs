namespace VttTools.Library.Encounters.ServiceContracts;

public record EncounterEffectUpdateData
    : Data {
    public Optional<string?> Name { get; init; }

    public Optional<Position> Position { get; init; }
    public Optional<float> Rotation { get; init; }

    public Optional<EffectState> State { get; init; }

    public Optional<bool> IsHidden { get; init; }
    public Optional<Shape?> TriggerRegion { get; init; }

    public Optional<Guid?> DisplayId { get; init; }
    public Optional<Guid?> EnabledDisplayId { get; init; }
    public Optional<Guid?> DisabledDisplayId { get; init; }
    public Optional<Guid?> OnTriggerDisplayId { get; init; }
    public Optional<Guid?> TriggeredDisplayId { get; init; }

    public override Result Validate(IMap? context = null) {
        var result = base.Validate(context);
        if (Name is { IsSet: true, Value.Length: > 128 })
            result += new Error("Name must not exceed 128 characters.", nameof(Name));
        return result;
    }
}
