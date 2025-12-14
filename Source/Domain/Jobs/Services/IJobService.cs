namespace VttTools.Jobs.Services;

public interface IJobService {
    Task<Result<Guid>> CreateJobAsync(
        CreateJobRequest request,
        CancellationToken ct = default);

    Task<JobResponse?> GetJobByIdAsync(
        Guid jobId,
        CancellationToken ct = default);

    Task<(IReadOnlyList<JobResponse> Jobs, int TotalCount)> GetJobsAsync(
        string? type = null,
        int skip = 0,
        int take = 20,
        CancellationToken ct = default);

    Task<IReadOnlyList<JobItemResponse>> GetJobItemsAsync(
        Guid jobId,
        JobItemStatus? status = null,
        CancellationToken ct = default);

    Task<Result> CancelJobAsync(
        Guid jobId,
        CancellationToken ct = default);

    Task<Result> RetryJobAsync(
        Guid jobId,
        CancellationToken ct = default);

    Task<Result> UpdateItemStatusAsync(
        Guid jobId,
        int itemIndex,
        UpdateJobItemStatusRequest request,
        CancellationToken ct = default);

    Task<Result> BroadcastProgressAsync(
        BroadcastProgressRequest request,
        CancellationToken ct = default);
}
