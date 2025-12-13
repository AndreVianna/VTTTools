namespace VttTools.Jobs.ApiContracts;

public sealed record JobResponse {
    public required Guid Id { get; init; }
    public required string Type { get; init; }
    public required JobStatus Status { get; init; }
    public required int TotalItems { get; init; }
    public int CompletedItems { get; init; }
    public int FailedItems { get; init; }
    public string? InputJson { get; init; }
    public long? EstimatedDurationMs { get; init; }
    public long? ActualDurationMs { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime? StartedAt { get; init; }
    public DateTime? CompletedAt { get; init; }
    public IReadOnlyList<JobItemResponse> Items { get; init; } = [];
}
