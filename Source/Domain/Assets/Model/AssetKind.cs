namespace VttTools.Assets.Model;

/// <summary>
/// Defines the fundamental kind of asset for organizational purposes
/// </summary>
[JsonConverter(typeof(JsonStringEnumConverter))]
public enum AssetKind {
    /// <summary>
    /// Environmental objects (furniture, traps, containers, etc.)
    /// </summary>
    Object,

    /// <summary>
    /// Monsters and non-player creatures
    /// </summary>
    Monster,

    /// <summary>
    /// Player characters and important NPCs
    /// </summary>
    Character
}