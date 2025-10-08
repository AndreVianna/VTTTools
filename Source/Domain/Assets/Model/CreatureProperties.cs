namespace VttTools.Assets.Model;

/// <summary>
/// Properties specific to Creature assets (characters, NPCs, monsters)
/// </summary>
public record CreatureProperties {
    /// <summary>
    /// Size in grid cells (typically 1, but large creatures can be 2+)
    /// </summary>
    public int CellSize { get; init; } = 1;

    /// <summary>
    /// Reference to the creature's stat block (to be implemented in future phase)
    /// </summary>
    public Guid? StatBlockId { get; init; }

    /// <summary>
    /// Category for UI filtering (Character vs Monster)
    /// </summary>
    public CreatureCategory Category { get; init; } = CreatureCategory.Character;

    /// <summary>
    /// Optional visual styling for the creature's token
    /// </summary>
    public TokenStyle? TokenStyle { get; init; }
}