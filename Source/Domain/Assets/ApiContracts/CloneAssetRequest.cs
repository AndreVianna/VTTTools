namespace VttTools.Assets.ApiContracts;

public record CloneAssetRequest
    : Request {
    public Guid TemplateId { get; init; }
    public Optional<string> Name { get; init; }
    public Optional<string> Description { get; init; }
    public Optional<AssetType> Type { get; init; }
    public Optional<Format> Format { get; set; }
}
