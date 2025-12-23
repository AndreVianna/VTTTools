namespace VttTools.Assets.Model;

/// <summary>
/// Represents a single stat entry in an asset's stat block for a specific game system and level.
/// </summary>
public record StatEntry {
    public Guid AssetId { get; init; }

    public Guid GameSystemId { get; init; }
    public string GameSystemCode { get; init; } = string.Empty; // Denormalized for convenience

    public int Level { get; init; }
    public string Key { get; init; } = string.Empty;
    public string? Value { get; init; }
    public StatEntryType Type { get; init; }

    public string? Description { get; init; }
    public StatModifier[]? Modifiers { get; init; }
}
