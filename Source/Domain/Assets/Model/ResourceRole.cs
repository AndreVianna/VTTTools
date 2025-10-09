namespace VttTools.Assets.Model;

/// <summary>
/// Flag enum defining the role(s) a resource plays for an asset
/// A single resource can serve multiple roles (e.g., same image used as token and portrait)
/// </summary>
[Flags]
public enum ResourceRole {
    /// <summary>
    /// No role assigned (invalid state)
    /// </summary>
    None = 0,

    /// <summary>
    /// Token image - small icon for map placement
    /// </summary>
    Token = 1,

    /// <summary>
    /// Portrait image - larger image for character sheets and dialogs
    /// </summary>
    Portrait = 2
}
