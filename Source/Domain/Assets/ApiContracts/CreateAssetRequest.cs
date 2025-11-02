namespace VttTools.Assets.ApiContracts;

public record CreateAssetRequest
    : Request {
    public AssetKind Kind { get; init; }
    public string Name { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;
    public AssetResourceData[] Resources { get; init; } = [];
    public bool IsPublished { get; init; }
    public bool IsPublic { get; init; }

    // Polymorphic properties (only one should be populated based on Kind)
    public ObjectProperties? ObjectProps { get; init; }
    public CreatureProperties? CreatureProps { get; init; }
}