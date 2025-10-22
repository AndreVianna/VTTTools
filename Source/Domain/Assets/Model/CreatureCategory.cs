namespace VttTools.Assets.Model;

/// <summary>
/// Categorizes creatures for filtering and organization in the UI
/// </summary>
[JsonConverter(typeof(JsonStringEnumConverter))]
public enum CreatureCategory {
    /// <summary>
    /// Player characters and friendly NPCs
    /// </summary>
    Character,

    /// <summary>
    /// Monsters and hostile creatures
    /// </summary>
    Monster
}