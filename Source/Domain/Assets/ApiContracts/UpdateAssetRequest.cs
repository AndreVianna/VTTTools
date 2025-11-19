namespace VttTools.Assets.ApiContracts;

/// <summary>
/// Request to update an existing Asset template.
/// Note: AssetKind cannot be changed after creation.
/// </summary>
public record UpdateAssetRequest
    : Request {
    public Optional<string> Name { get; init; }
    public Optional<string> Description { get; init; }
    public Optional<NamedSize> Size { get; init; }

    public Optional<Guid?> PortraitId { get; init; }
    public Optional<Guid?> TopDownId { get; init; }
    public Optional<Guid?> MiniatureId { get; init; }
    public Optional<Guid?> PhotoId { get; init; }

    public Optional<bool> IsPublished { get; set; }
    public Optional<bool> IsPublic { get; set; }

    public Optional<ObjectData> ObjectData { get; init; }
    public Optional<MonsterData> MonsterData { get; init; }
    public Optional<CharacterData> CharacterData { get; init; }
}