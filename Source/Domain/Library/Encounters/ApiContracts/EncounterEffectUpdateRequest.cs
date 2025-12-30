namespace VttTools.Library.Encounters.ApiContracts;

public record EncounterEffectUpdateRequest {
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
}
