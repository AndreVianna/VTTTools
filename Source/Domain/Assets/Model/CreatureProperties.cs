namespace VttTools.Assets.Model;

/// <summary>
/// Properties specific to Creature assets (characters, NPCs, monsters)
/// Inherits Size from AssetProperties
/// </summary>
public record CreatureProperties : AssetProperties {

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