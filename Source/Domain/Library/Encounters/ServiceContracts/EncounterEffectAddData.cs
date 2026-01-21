namespace VttTools.Library.Encounters.ServiceContracts;

public record EncounterEffectAddData
    : Data {
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

    public override Result Validate(IMap? context = null) {
        var result = base.Validate(context);
        if (Name?.Length > 128)
            result += new Error("Name must not exceed 128 characters.", nameof(Name));
        if (EnabledDisplayId == Guid.Empty)
            result += new Error("EnabledDisplayId is required.", nameof(EnabledDisplayId));
        return result;
    }
}