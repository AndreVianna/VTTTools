namespace VttTools.AI.ApiContracts;

public sealed record BulkAssetGenerationRequest
    : Request {
    public required IReadOnlyList<BulkAssetGenerationListItem> Items { get; init; }
    public Guid? TemplateId { get; init; }
    public bool GeneratePortrait { get; init; } = true;
    public bool GenerateToken { get; init; } = true;
}