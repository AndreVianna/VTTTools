namespace VttTools.Jobs.ApiContracts;

public sealed record CreateJobRequest {
    public required string Type { get; init; }
    public required string InputJson { get; init; }
    public required int TotalItems { get; init; }
    public long? EstimatedDurationMs { get; init; }
    public IReadOnlyList<CreateJobItemRequest> Items { get; init; } = [];
}
