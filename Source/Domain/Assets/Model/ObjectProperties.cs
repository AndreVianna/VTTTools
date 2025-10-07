namespace VttTools.Assets.Model;

/// <summary>
/// Properties specific to Object assets (furniture, traps, environmental items)
/// </summary>
public record ObjectProperties {
    /// <summary>
    /// Width in grid cells
    /// </summary>
    public int CellWidth { get; init; } = 1;

    /// <summary>
    /// Height in grid cells
    /// </summary>
    public int CellHeight { get; init; } = 1;

    /// <summary>
    /// Whether the object can be moved after placement
    /// </summary>
    public bool IsMovable { get; init; } = true;

    /// <summary>
    /// Whether the object blocks line of sight and light
    /// </summary>
    public bool IsOpaque { get; init; } = false;

    /// <summary>
    /// Whether the object is visible to players (false for secret doors, hidden traps)
    /// </summary>
    public bool IsVisible { get; init; } = true;

    /// <summary>
    /// Optional reference to an Effect that triggers when interacted with (for traps)
    /// </summary>
    public Guid? TriggerEffectId { get; init; }
}
