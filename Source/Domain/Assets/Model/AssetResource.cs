namespace VttTools.Assets.Model;

/// <summary>
/// Associates a Resource with an Asset and defines its role(s)
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
    /// Role(s) this resource plays (Token, Portrait, or both)
    /// </summary>
    public ResourceRole Role { get; init; }

    /// <summary>
    /// Whether this is the default resource for its role(s)
    /// Each role should have exactly one default resource
    /// </summary>
    public bool IsDefault { get; init; }
}
