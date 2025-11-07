namespace VttTools.Assets.Model;

/// <summary>
/// Associates a Token with an Asset and defines its role(s)
/// Tokens are selected by role flag (Token for scene placement, Display for UI)
/// When multiple resources have the same role, first in collection is used
/// </summary>
public record AssetToken {
    /// <summary>
    /// The Token entity (loaded via navigation property)
    /// </summary>
    public Resource Token { get; init; } = null!;

    /// <summary>
    /// IsDefault(s) this defines the default token
    /// </summary>
    public bool IsDefault { get; init; }
}