namespace VttTools.Jobs.Services;

/// <summary>
/// Service implementation for managing job lifecycle and operations.
/// </summary>
public class JobService(IJobStorage storage, IHubContext<JobHub> hubContext) : IJobService {
    public async Task<Result<Guid>> CreateJobAsync(
        CreateJobRequest request,
        CancellationToken ct = default) {
        var jobId = await storage.CreateJobAsync(
            request.Type,
            request.InputJson,
            request.TotalItems,
            request.EstimatedDurationMs,
            ct);

        if (request.Items.Count > 0) {
            var items = request.Items.Select(i => (i.Index, i.InputJson));
            await storage.AddItemsAsync(jobId, items, ct);
        }

        return Result.Success(jobId);
    }

    public async Task<JobResponse?> GetJobByIdAsync(
        Guid jobId,
        CancellationToken ct = default)
        => await storage.GetJobByIdAsync(jobId, ct);

    public async Task<(IReadOnlyList<JobResponse> Jobs, int TotalCount)> GetJobsAsync(
        string? type = null,
        int skip = 0,
        int take = 20,
        CancellationToken ct = default)
        => await storage.GetJobsAsync(type, skip, take, ct);

    public async Task<Result> UpdateJobStatusAsync(
        Guid jobId,
        UpdateJobStatusRequest request,
        CancellationToken ct = default) {
        var job = await storage.GetJobByIdAsync(jobId, ct);
        if (job is null) {
            return Result.Failure("Job not found");
        }

        await storage.UpdateJobStatusAsync(
            jobId,
            request.Status,
            request.StartedAt,
            request.CompletedAt,
            request.ActualDurationMs,
            ct);

        return Result.Success();
    }

    public async Task<Result> UpdateJobCountsAsync(
        Guid jobId,
        UpdateJobCountsRequest request,
        CancellationToken ct = default) {
        var job = await storage.GetJobByIdAsync(jobId, ct);
        if (job is null) {
            return Result.Failure("Job not found");
        }

        await storage.UpdateJobCountsAsync(
            jobId,
            request.CompletedItems,
            request.FailedItems,
            ct);

        return Result.Success();
    }

    public async Task<Result> UpdateItemStatusAsync(
        Guid itemId,
        UpdateJobItemStatusRequest request,
        CancellationToken ct = default) {
        await storage.UpdateItemStatusAsync(
            itemId,
            request.Status,
            request.OutputJson,
            request.ErrorMessage,
            request.StartedAt,
            request.CompletedAt,
            ct);

        return Result.Success();
    }

    public async Task<Result> BroadcastProgressAsync(
        BroadcastProgressRequest request,
        CancellationToken ct = default) {
        var progressEvent = new JobProgressEvent {
            JobId = request.JobId,
            Type = request.Type,
            ItemIndex = request.ItemIndex,
            ItemStatus = request.ItemStatus,
            Message = request.Message,
            CurrentItem = request.CurrentItem,
            TotalItems = request.TotalItems
        };

        await hubContext.SendProgressAsync(progressEvent, ct: ct);
        return Result.Success();
    }
}
