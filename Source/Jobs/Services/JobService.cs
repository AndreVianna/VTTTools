namespace VttTools.Jobs.Services;

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
        CancellationToken ct = default) {
        var job = await storage.GetJobByIdAsync(jobId, ct);
        return job is null ? null : ApplyStateMachine(job);
    }

    public async Task<(IReadOnlyList<JobResponse> Jobs, int TotalCount)> GetJobsAsync(
        string? type = null,
        int skip = 0,
        int take = 20,
        CancellationToken ct = default) {
        (var jobs, var totalCount) = await storage.GetJobsAsync(type, skip, take, ct);
        var jobsWithStateMachine = jobs.Select(ApplyStateMachine).ToList();
        return (jobsWithStateMachine, totalCount);
    }

    public async Task<IReadOnlyList<JobItemResponse>> GetJobItemsAsync(
        Guid jobId,
        JobItemStatus? status = null,
        CancellationToken ct = default)
        => await storage.GetJobItemsAsync(jobId, status, ct);

    public async Task<Result> CancelJobAsync(
        Guid jobId,
        CancellationToken ct = default) {
        var job = await storage.GetJobByIdAsync(jobId, ct);
        if (job is null) {
            return Result.Failure("Job not found");
        }

        await storage.CancelJobItemsAsync(jobId, ct);

        return Result.Success();
    }

    public async Task<Result> RetryJobAsync(
        Guid jobId,
        CancellationToken ct = default) {
        var job = await storage.GetJobByIdAsync(jobId, ct);
        if (job is null) {
            return Result.Failure("Job not found");
        }

        await storage.RetryJobItemsAsync(jobId, ct);

        return Result.Success();
    }

    public async Task<Result> UpdateItemStatusAsync(
        Guid jobId,
        int itemIndex,
        UpdateJobItemStatusRequest request,
        CancellationToken ct = default) {
        var item = await storage.GetJobItemByIndexAsync(jobId, itemIndex, ct);
        if (item is null) {
            return Result.Failure("Job item not found");
        }

        var isValidTransition = IsValidTransition(item.Status, request.Status);
        if (!isValidTransition) {
            return Result.Failure(
                $"Invalid state transition from {item.Status} to {request.Status}. " +
                "Valid transitions: Pending → InProgress, InProgress → Success/Failed/Canceled");
        }

        await storage.UpdateItemStatusAsync(
            jobId,
            itemIndex,
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

        await hubContext.SendProgressAsync(progressEvent, ct);
        return Result.Success();
    }

    private static JobStatus DeriveJobStatus(IReadOnlyList<JobItemResponse> items) {
        if (items.Count == 0)
            return JobStatus.Pending;

        var pendingCount = items.Count(i => i.Status == JobItemStatus.Pending);
        var successCount = items.Count(i => i.Status == JobItemStatus.Success);
        var failedCount = items.Count(i => i.Status == JobItemStatus.Failed);
        var canceledCount = items.Count(i => i.Status == JobItemStatus.Canceled);
        var completedCount = successCount + failedCount + canceledCount;

        return pendingCount == items.Count ? JobStatus.Pending
             : completedCount == items.Count && successCount == items.Count ? JobStatus.Success
             : completedCount == items.Count && canceledCount > 0 ? JobStatus.Canceled
             : completedCount == items.Count && failedCount > 0 && canceledCount == 0 ? JobStatus.Failed
             : JobStatus.InProgress;
    }

    private static (int Progress, int CompletedCount, int FailedCount) CalculateProgress(IReadOnlyCollection<JobItemResponse> items) {
        if (items.Count == 0) {
            return (0, 0, 0);
        }

        var successCount = items.Count(i => i.Status == JobItemStatus.Success);
        var failedCount = items.Count(i => i.Status == JobItemStatus.Failed);
        var progressCount = successCount + failedCount;
        var progress = (int)Math.Round((double)progressCount / items.Count * 100);

        return (progress, progressCount, failedCount);
    }

    private static JobResponse ApplyStateMachine(JobResponse job) {
        var status = DeriveJobStatus(job.Items);
        (var progress, var completedItems, var failedItems) = CalculateProgress(job.Items);

        return job with {
            Status = status,
            Progress = progress,
            CompletedItems = completedItems,
            FailedItems = failedItems
        };
    }

    private static bool IsValidTransition(JobItemStatus currentStatus, JobItemStatus newStatus)
        => (currentStatus, newStatus) switch {
            (JobItemStatus.Pending, JobItemStatus.InProgress) => true,
            (JobItemStatus.InProgress, JobItemStatus.Success) => true,
            (JobItemStatus.InProgress, JobItemStatus.Failed) => true,
            (JobItemStatus.InProgress, JobItemStatus.Canceled) => true,
            (var current, var target) when current == target => true,
            _ => false,
        };
}
