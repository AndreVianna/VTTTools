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
    /// Full image for asset details page and stat blocks (4:3, 1:1, or 3:4 aspect ratio)
    /// Never displayed on encounter maps - use TopDown, Miniature, or Photo instead
    /// </summary>
    public Resource? Portrait { get; init; }

    /// <summary>
    /// Bird's eye view token for square/HexV/HexH grids (transparent background)
    /// Used when ViewMode is MapView and MapType is not Isometric
    /// </summary>
    public Resource? TopDown { get; init; }

    /// <summary>
    /// Isometric view token for isometric maps (transparent background)
    /// Used when ViewMode is MapView and MapType is Isometric
    /// </summary>
    public Resource? Miniature { get; init; }

    /// <summary>
    /// 3/4 face view with frame for Portrait Mode on encounters
    /// Only available for creatures and characters (NOT for objects)
    /// Used when ViewMode is Portrait
    /// </summary>
    public Resource? Photo { get; init; }

    /// <summary>
    /// Gets or sets the named size value for the element.
    /// </summary>
    /// <remarks>Use this property to specify a predefined size from the <see cref="NamedSize"/> record.</remarks>
    public NamedSize Size { get; set; } = NamedSize.Default;
}