namespace VttTools.Assets.Model;

/// <summary>
/// Properties specific to Object assets (furniture, traps, environmental items)
/// Inherits Size from AssetProperties
/// </summary>
public record ObjectProperties : AssetProperties {
    /// <summary>
    /// Whether the object can be moved after placement
    /// </summary>
    public bool IsMovable { get; init; } = true;

    /// <summary>
    /// Whether the object blocks line of sight and light
    /// </summary>
    public bool IsOpaque { get; init; }

    /// <summary>
    /// Optional reference to an Effect that triggers when interacted with (for traps)
    /// </summary>
    public Guid? TriggerEffectId { get; init; }
}