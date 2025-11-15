namespace VttTools.Assets.Model;

/// <summary>
/// Abstract base class for all asset types
/// </summary>
[JsonPolymorphic(TypeDiscriminatorPropertyName = "kind")]
[JsonDerivedType(typeof(ObjectAsset), typeDiscriminator: "Object")]
[JsonDerivedType(typeof(MonsterAsset), typeDiscriminator: "Monster")]
[JsonDerivedType(typeof(CharacterAsset), typeDiscriminator: "Character")]
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
    public ICollection<AssetToken> Tokens { get; init; } = [];

    /// <summary>
    /// Collection of visual resources (images/videos) associated with this asset
    /// Each resource can have one or more roles (Token, Portrait)
    /// </summary>
    public Resource? Portrait { get; init; }

    /// <summary>
    /// Gets or sets the named size value for the element.
    /// </summary>
    /// <remarks>Use this property to specify a predefined size from the <see cref="NamedSize"/> record.</remarks>
    public NamedSize Size { get; set; } = NamedSize.Default;
}