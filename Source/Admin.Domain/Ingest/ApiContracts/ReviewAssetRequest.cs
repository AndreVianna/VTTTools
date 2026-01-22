namespace VttTools.Admin.Ingest.ApiContracts;

public sealed record ApproveAssetsRequest {
    public required IReadOnlyList<Guid> AssetIds { get; init; }
}

public sealed record RejectAssetsRequest {
    public required IReadOnlyList<RejectAssetItem> Items { get; init; }
}

public sealed record RejectAssetItem {
    public required Guid AssetId { get; init; }
    public required string AiPrompt { get; init; }
}

public sealed record DiscardAssetsRequest {
    public required IReadOnlyList<Guid> AssetIds { get; init; }
}

public sealed record RetryFailedRequest {
    public required IReadOnlyList<Guid> AssetIds { get; init; }
}
