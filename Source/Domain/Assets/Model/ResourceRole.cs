namespace VttTools.Assets.Model;

/// <summary>
/// Flag enum defining the role(s) a resource plays for an asset
/// A single resource can serve multiple roles (Token + Display)
/// </summary>
[Flags]
public enum ResourceRole {
    /// <summary>
    /// No role assigned (invalid state)
    /// </summary>
    None = 0,

    /// <summary>
    /// Token image - used for scene placement (map tokens)
    /// </summary>
    Token = 1,

    /// <summary>
    /// Display image - used in UI displays (dialogs, character sheets, asset library cards)
    /// </summary>
    Display = 2
}