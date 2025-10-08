namespace VttTools.Assets.ApiContracts;

/// <summary>
/// Request to update an existing Asset template.
/// Note: AssetKind cannot be changed after creation.
/// </summary>
public record UpdateAssetRequest
    : Request {
    public Optional<string> Name { get; init; }
    public Optional<string> Description { get; init; }
    public Optional<Guid> ResourceId { get; init; }
    public Optional<bool> IsPublished { get; set; }
    public Optional<bool> IsPublic { get; set; }

    // Polymorphic properties (provide the one matching the asset's Kind)
    public Optional<ObjectProperties> ObjectProps { get; init; }
    public Optional<CreatureProperties> CreatureProps { get; init; }
}