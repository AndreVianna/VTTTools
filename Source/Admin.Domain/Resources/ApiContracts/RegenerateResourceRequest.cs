namespace VttTools.Admin.Resources.ApiContracts;

public sealed record RegenerateResourceRequest
    : Request {
    [Required]
    public required Guid ResourceId { get; init; }

    [Required]
    [MaxLength(128)]
    public required string AssetName { get; init; }

    [Required]
    [MaxLength(16)]
    public required string GenerationType { get; init; }

    [Required]
    public required AssetKind Kind { get; init; }

    [MaxLength(64)]
    public string? Category { get; init; }

    [MaxLength(64)]
    public string? Type { get; init; }

    [MaxLength(1024)]
    public string? Description { get; init; }
}
