namespace VttTools.Admin.Ingest.ApiContracts;

public sealed record IngestAssetResponse {
    public required Guid Id { get; init; }
    public required string Name { get; init; }
    public string? Description { get; init; }
    public required AssetKind Kind { get; init; }
    public required string Category { get; init; }
    public required string Type { get; init; }
    public string? Subtype { get; init; }
    public required IngestStatus IngestStatus { get; init; }
    public string? AiPrompt { get; init; }
    public IngestResourceInfo? Portrait { get; init; }
    public IReadOnlyList<IngestResourceInfo>? Tokens { get; init; }
    public DateTime? CreatedAt { get; init; }
    public DateTime? UpdatedAt { get; init; }
}

public sealed record IngestResourceInfo {
    public required Guid Id { get; init; }
    public required string Path { get; init; }
    public string? FileName { get; init; }
    public string? ContentType { get; init; }
}

public sealed record IngestAssetListResponse {
    public required IReadOnlyList<IngestAssetResponse> Items { get; init; }
    public required int TotalCount { get; init; }
    public required bool HasMore { get; init; }
}

public sealed record IngestJobResponse {
    public required Guid JobId { get; init; }
    public required int ItemCount { get; init; }
    public required IReadOnlyList<Guid> AssetIds { get; init; }
}

public sealed record IngestBatchResponse {
    public required IReadOnlyList<Guid> SucceededIds { get; init; }
    public required IReadOnlyList<IngestBatchFailure> Failures { get; init; }
}

public sealed record IngestBatchFailure {
    public required Guid AssetId { get; init; }
    public required string Reason { get; init; }
}
