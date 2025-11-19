namespace VttTools.Assets.ServiceContracts;

public record UpdateAssetData
    : Data {
    public Optional<string> Name { get; init; }
    public Optional<string> Description { get; init; }
    public Optional<NamedSize> Size { get; init; }

    /// <summary>
    /// Full image for details and stat blocks.
    /// </summary>
    public Optional<Guid?> PortraitId { get; init; }

    /// <summary>
    /// Bird's eye view token image.
    /// </summary>
    public Optional<Guid?> TopDownId { get; init; }

    /// <summary>
    /// Isometric view token image.
    /// </summary>
    public Optional<Guid?> MiniatureId { get; init; }

    /// <summary>
    /// Face view image with frame (not applicable for objects).
    /// </summary>
    public Optional<Guid?> PhotoId { get; init; }

    public Optional<bool> IsPublished { get; set; }
    public Optional<bool> IsPublic { get; set; }

    public Optional<ObjectData> ObjectData { get; init; }
    public Optional<MonsterData> MonsterData { get; init; }
    public Optional<CharacterData> CharacterData { get; init; }

    public override Result Validate(IMap? context = null) {
        var result = base.Validate(context);
        if (Name.IsSet && string.IsNullOrWhiteSpace(Name.Value))
            result += new Error("When set, the asset name cannot be null or empty.", nameof(Name));

        if (Size.IsSet) {
            if (Size.Value.Width <= 0)
                result += new Error("Size width must be greater than 0.", $"{nameof(Size)}.{nameof(Size.Value.Width)}");
            if (Size.Value.Height <= 0)
                result += new Error("Size height must be greater than 0.", $"{nameof(Size)}.{nameof(Size.Value.Height)}");
        }

        return result;
    }
}