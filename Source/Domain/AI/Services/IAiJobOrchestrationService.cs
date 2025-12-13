namespace VttTools.AI.Services;

public interface IAiJobOrchestrationService {
    Task<Result<JobResponse>> StartBulkAssetGenerationAsync(
        BulkAssetGenerationData data,
        CancellationToken ct = default);

    Task<JobResponse?> GetJobStatusAsync(
        Guid jobId,
        CancellationToken ct = default);

    Task<(IReadOnlyList<JobResponse> Jobs, int TotalCount)> GetJobHistoryAsync(
        string? type = null,
        int skip = 0,
        int take = 20,
        CancellationToken ct = default);

    Task<Result> CancelJobAsync(
        Guid jobId,
        CancellationToken ct = default);

    Task<Result<JobResponse>> RetryFailedItemsAsync(
        Guid jobId,
        Guid[]? itemIds = null,
        CancellationToken ct = default);
}
