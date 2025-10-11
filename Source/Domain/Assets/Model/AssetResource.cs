namespace VttTools.Assets.Model;

/// <summary>
/// Associates a Resource with an Asset and defines its role(s)
/// Resources are selected by role flag (Token for scene placement, Display for UI)
/// When multiple resources have the same role, first in collection is used
/// </summary>
public record AssetResource {
    /// <summary>
    /// Reference to the Resource (image/video)
    /// </summary>
    public Guid ResourceId { get; init; }

    /// <summary>
    /// The Resource entity (loaded via navigation property)
    /// </summary>
    public Resource? Resource { get; init; }

    /// <summary>
    /// Role(s) this resource plays (Token for scenes, Display for UI, or both)
    /// </summary>
    public ResourceRole Role { get; init; }
}