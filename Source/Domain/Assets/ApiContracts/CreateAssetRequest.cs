namespace VttTools.Assets.ApiContracts;

public record CreateAssetRequest
    : Request {
    public AssetKind Kind { get; init; }
    public string Name { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;
    public AssetTokenData[] Tokens { get; init; } = [];
    public Guid? PortraitId { get; init; }
    public NamedSize Size { get; init; } = NamedSize.Default;
    public bool IsPublished { get; init; }
    public bool IsPublic { get; init; }

    public ObjectData? ObjectData { get; init; }
    public CreatureData? CreatureData { get; init; }
}