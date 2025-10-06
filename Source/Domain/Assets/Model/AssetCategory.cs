namespace VttTools.Assets.Model;

/// <summary>
/// Asset behavioral categories - determines placement and interaction rules in scene editor
/// </summary>
public enum AssetCategory
{
    /// <summary>
    /// Structural/environmental assets, locked in place (walls, doors, terrain, light sources)
    /// </summary>
    Static,

    /// <summary>
    /// Manipulable objects (furniture, items, containers)
    /// </summary>
    Passive,

    /// <summary>
    /// Autonomous entities with actions (characters, NPCs, monsters)
    /// </summary>
    Active
}
