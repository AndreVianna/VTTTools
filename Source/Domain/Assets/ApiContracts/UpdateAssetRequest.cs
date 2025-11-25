namespace VttTools.Assets.ApiContracts;

/// <summary>
/// Request to update an existing Asset template.
/// Note: AssetKind cannot be changed after creation.
/// </summary>
public record UpdateAssetRequest
    : Request {
    public Optional<AssetKind> Kind { get; init; }
    public Optional<string> Category { get; init; }
    public Optional<string> Type { get; init; }
    public Optional<string> Subtype { get; init; }

    public Optional<string> Name { get; init; }
    public Optional<string> Description { get; init; }

    public Optional<ListPatcher<string>> Tags { get; init; }

    public Optional<Guid?> PortraitId { get; init; }
    public Optional<NamedSize> TokenSize { get; init; }

    public Optional<bool> IsPublished { get; set; }
    public Optional<bool> IsPublic { get; set; }
}