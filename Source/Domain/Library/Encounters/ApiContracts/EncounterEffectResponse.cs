namespace VttTools.Library.Encounters.ApiContracts;

public record EncounterEffectResponse {
    public Guid AssetId { get; init; }
    public ushort Index { get; init; }

    public string? Name { get; init; }

    public Position Position { get; init; } = Position.Zero;
    public float Rotation { get; init; }

    public EffectState State { get; init; } = EffectState.Enabled;

    public bool IsHidden { get; init; }

    public Shape? TriggerRegion { get; init; }

    public ResourceMetadata? Display { get; init; }
    public ResourceMetadata? EnabledDisplay { get; init; }
    public ResourceMetadata? DisabledDisplay { get; init; }
    public ResourceMetadata? OnTriggerDisplay { get; init; }
    public ResourceMetadata? TriggeredDisplay { get; init; }
}
