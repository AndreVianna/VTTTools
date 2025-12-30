namespace VttTools.Library.Encounters.ApiContracts;

public record EncounterEffectAddRequest {
    public string? Name { get; init; }

    public Position Position { get; init; } = Position.Zero;
    public float Rotation { get; init; }

    public EffectState State { get; init; } = EffectState.Enabled;

    public bool IsHidden { get; init; }

    public Shape? TriggerRegion { get; init; }

    public Guid? DisplayId { get; init; }
    public Guid? EnabledDisplayId { get; init; }
    public Guid? DisabledDisplayId { get; init; }
    public Guid? OnTriggerDisplayId { get; init; }
    public Guid? TriggeredDisplayId { get; init; }
}
