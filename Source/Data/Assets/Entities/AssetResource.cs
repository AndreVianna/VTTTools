using Resource = VttTools.Data.Media.Entities.Resource;

namespace VttTools.Data.Assets.Entities;

/// <summary>
/// Join table entity representing the many-to-many relationship between Assets and Resources
/// Includes role information (Token, Display, or both)
/// </summary>
public class AssetResource {
    /// <summary>
    /// Foreign key to Asset
    /// </summary>
    public Guid AssetId { get; set; }

    /// <summary>
    /// Navigation property to owning Asset
    /// </summary>
    public Asset Asset { get; set; } = null!;

    /// <summary>
    /// Foreign key to Resource
    /// </summary>
    public Guid ResourceId { get; set; }

    /// <summary>
    /// Navigation property to Resource entity
    /// </summary>
    public Resource Resource { get; set; } = null!;

    /// <summary>
    /// Role this resource plays for this asset (Token, Display, or both)
    /// </summary>
    public ResourceRole Role { get; set; }
}