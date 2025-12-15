namespace VttTools.AI.ApiContracts;

public sealed record BulkAssetGenerationRequest
    : Request {
    [Required]
    [MinLength(1, ErrorMessage = "At least one item is required")]
    [MaxLength(100, ErrorMessage = "Maximum 100 items per batch")]
    public required IReadOnlyList<BulkAssetGenerationListItem> Items { get; init; }

    public Guid? TemplateId { get; init; }

    public bool GeneratePortrait { get; init; } = true;

    public bool GenerateToken { get; init; } = true;
}
