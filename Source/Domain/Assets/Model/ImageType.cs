namespace VttTools.Assets.Model;

/// <summary>
/// Represents the type of image used for displaying assets in different contexts
/// </summary>
[JsonConverter(typeof(JsonStringEnumConverter))]
public enum ImageType {
    /// <summary>
    /// Full image for asset details page and stat blocks (4:3, 1:1, or 3:4 aspect ratio).
    /// Never displayed on encounter maps - use TopDown, Miniature, or Photo instead.
    /// </summary>
    Portrait,

    /// <summary>
    /// Bird's eye view token for square/HexV/HexH grids (transparent background).
    /// Used when ViewMode is MapView and MapType is not Isometric.
    /// </summary>
    TopDown,

    /// <summary>
    /// Isometric view token for isometric maps (transparent background).
    /// Used when ViewMode is MapView and MapType is Isometric.
    /// </summary>
    Miniature,

    /// <summary>
    /// 3/4 face view with frame for Portrait Mode on encounters.
    /// Only available for creatures and characters (NOT for objects).
    /// Used when ViewMode is Portrait.
    /// </summary>
    Photo
}
