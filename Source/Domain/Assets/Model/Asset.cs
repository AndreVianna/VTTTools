namespace VttTools.Assets.Model;

/// <summary>
/// Abstract base class for all asset types
/// </summary>
public abstract record Asset {
    /// <summary>
    /// Unique identifier for the asset
    /// </summary>
    public Guid Id { get; init; } = Guid.CreateVersion7();

    /// <summary>
    /// ID of the user who owns this asset
    /// </summary>
    public Guid OwnerId { get; init; }

    /// <summary>
    /// Discriminator for asset kind (Object or Entity)
    /// </summary>
    public AssetKind Kind { get; init; }

    /// <summary>
    /// Asset name (max 128 characters)
    /// </summary>
    [MaxLength(128)]
    public string Name { get; init; } = string.Empty;

    /// <summary>
    /// Asset description (max 4096 characters)
    /// </summary>
    [MaxLength(4096)]
    public string Description { get; init; } = string.Empty;

    /// <summary>
    /// Whether the asset is approved for use in game sessions
    /// </summary>
    public bool IsPublished { get; init; }

    /// <summary>
    /// Whether the asset is visible to all users (vs owner-only)
    /// </summary>
    public bool IsPublic { get; init; }

    /// <summary>
    /// Collection of visual resources (images/videos) associated with this asset
    /// Each resource can have one or more roles (Token, Portrait)
    /// </summary>
    public ICollection<AssetResource> Resources { get; init; } = [];

    /// <summary>
    /// When the asset was created
    /// </summary>
    public DateTime CreatedAt { get; init; }

    /// <summary>
    /// When the asset was last updated
    /// </summary>
    public DateTime UpdatedAt { get; init; }
}