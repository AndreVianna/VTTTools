namespace VttTools.Data.Assets.Entities;

/// <summary>
/// EF Core entity for Creature assets (characters, NPCs, monsters)
/// </summary>
public class CreatureAsset : Asset {
    /// <summary>
    /// Creature-specific properties (stored as JSON)
    /// </summary>
    public CreatureProperties Properties { get; set; } = new();
}

/// <summary>
/// Properties for Creature assets (serialized to JSON column)
/// </summary>
public class CreatureProperties {
    public double CellSize { get; set; } = 1;
    public Guid? StatBlockId { get; set; }
    public CreatureCategory Category { get; set; } = CreatureCategory.Character;
    public TokenStyle? TokenStyle { get; set; }
}

/// <summary>
/// Token visual styling (nested in CreatureProperties JSON)
/// </summary>
public class TokenStyle {
    public string? BorderColor { get; set; }
    public string? BackgroundColor { get; set; }
    public TokenShape Shape { get; set; } = TokenShape.Circle;
}