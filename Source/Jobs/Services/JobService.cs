namespace VttTools.Jobs.Services;

public class JobService(IJobStorage storage, IHubContext<JobHub> hubContext)
    : IJobService {
    public async Task<Result<Job>> AddAsync(AddJobData data, CancellationToken ct = default) {
        var result = data.Validate();
        if (result.IsFailure)
            return Result.Failure(result.Errors).WithNo<Job>();

        var job = new Job {
            OwnerId = data.OwnerId,
            Type = data.Type,
            EstimatedDuration = TimeSpan.FromMilliseconds(1500 * data.Items.Count),
            Items = [.. data.Items.Select((input, index) => new JobItem {
                Index = index,
                Data = input.Data,
            })],
        };
        await storage.AddAsync(job, ct);
        return job;
    }

    public async Task<Job?> GetByIdAsync(Guid id, CancellationToken ct = default) {
        var job = await storage.GetByIdAsync(id, ct);
        return job == null ? null : job with { Status = DeriveJobStatus(job.Items) };
    }

    public async Task<(IReadOnlyList<Job> Jobs, int TotalCount)> SearchAsync(
        string? type = null,
        int skip = 0,
        int take = 20,
        CancellationToken ct = default) {
        (var jobs, var totalCount) = await storage.SearchAsync(type, skip, take, ct);
        var jobsWithStateMachine = jobs.Select(job => job with { Status = DeriveJobStatus(job.Items) }).ToList();
        return (jobsWithStateMachine, totalCount);
    }

    public async Task<Result<Job>> UpdateAsync(UpdateJobData data, CancellationToken ct = default) {
        var result = data.Validate();
        if (result.IsFailure)
            return Result.Failure(result.Errors).WithNo<Job>();

        var job = await storage.GetByIdAsync(data.Id, ct);
        if (job is null)
            return Result.Failure("Job not found.").WithNo<Job>();

        job = job with {
            Status = data.Status,
            StartedAt = data.StartedAt.IsSet ? data.StartedAt.Value : job.StartedAt,
            CompletedAt = data.CompletedAt.IsSet ? data.CompletedAt.Value : job.CompletedAt,
            Items = [.. job.Items.Select(item => {
                var updatedItem = data.Items.FirstOrDefault(i => i.Index == item.Index);
                return updatedItem is null ? item : item with {
                    Status = updatedItem.Status,
                    Message = updatedItem.Message.IsSet ? updatedItem.Message.Value : item.Message,
                    StartedAt = updatedItem.StartedAt.IsSet ? updatedItem.StartedAt.Value : item.StartedAt,
                    CompletedAt = updatedItem.CompletedAt.IsSet ? updatedItem.CompletedAt.Value : item.CompletedAt,
                };
            })],
        };

        await storage.UpdateAsync(job, ct);
        return job;
    }

    public async Task<bool> CancelAsync(Guid id, CancellationToken ct = default) {
        var job = await storage.GetByIdAsync(id, ct);
        if (job is null)
            return false;

        for (var i = 0; i < job.Items.Count; i++) {
            if (job.Items[i].Status is not (JobItemStatus.Pending or JobItemStatus.InProgress))
                continue;
            job.Items[i] = job.Items[i] with {
                Status = JobItemStatus.Canceled,
                Message = null,
            };
        }

        await storage.UpdateAsync(job, ct);
        return true;
    }

    public async Task<bool> RetryAsync(Guid id, CancellationToken ct = default) {
        var job = await storage.GetByIdAsync(id, ct);
        if (job is null)
            return false;

        for (var i = 0; i < job.Items.Count; i++) {
            if (job.Items[i].Status is not (JobItemStatus.Failed or JobItemStatus.Canceled))
                continue;
            job.Items[i] = job.Items[i] with {
                Status = JobItemStatus.Pending,
                Message = null,
            };
        }

        await storage.UpdateAsync(job, ct);
        return true;
    }

    public Task BroadcastItemUpdateAsync(JobItemUpdateEvent @event, CancellationToken ct = default)
        => hubContext.SendItemUpdateAsync(@event, ct);

    public Task BroadcastProgressAsync(JobProgressEvent @event, CancellationToken ct = default)
        => hubContext.SendProgressAsync(@event, ct);

    private static JobStatus DeriveJobStatus(IReadOnlyCollection<JobItem> items) {
        if (items.Count == 0)
            return JobStatus.Pending;

        var pendingCount = items.Count(i => i.Status is JobItemStatus.Pending);
        var completedCount = items.Count(i => i.Status is JobItemStatus.Success or JobItemStatus.Failed);
        var canceledCount = items.Count(i => i.Status == JobItemStatus.Canceled);

        return pendingCount == items.Count ? JobStatus.Pending
             : completedCount == items.Count ? JobStatus.Completed
             : (canceledCount + completedCount) == items.Count ? JobStatus.Canceled
             : JobStatus.InProgress;
    }
}
