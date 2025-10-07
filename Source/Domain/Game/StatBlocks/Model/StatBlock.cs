namespace VttTools.Game.StatBlocks.Model;

/// <summary>
/// Stub entity for character/creature stat blocks
/// Full implementation will be added in a future phase
/// </summary>
public record StatBlock {
    /// <summary>
    /// Unique identifier for the stat block
    /// </summary>
    public Guid Id { get; init; } = Guid.CreateVersion7();

    /// <summary>
    /// Name of the stat block (e.g., "Goblin", "Red Dragon", "Fighter Level 5")
    /// </summary>
    public string Name { get; init; } = string.Empty;

    /// <summary>
    /// When the stat block was created
    /// </summary>
    public DateTime CreatedAt { get; init; }

    // TODO: Add full stat block properties in future phase
    // - Ability scores (STR, DEX, CON, INT, WIS, CHA)
    // - HP, AC, Speed
    // - Skills, saves, proficiencies
    // - Actions, reactions, legendary actions
    // - Spells, equipment
    // - etc.
}
