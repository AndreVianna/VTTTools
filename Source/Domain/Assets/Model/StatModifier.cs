namespace VttTools.Assets.Model;

public record StatModifier {
    public string Condition { get; init; } = string.Empty;  // e.g., "vs undead", "when raging"
    public string Source { get; init; } = string.Empty;     // e.g., "Belt of Giant Strength", "Weapon of Warning"
    public decimal Bonus { get; init; }
}