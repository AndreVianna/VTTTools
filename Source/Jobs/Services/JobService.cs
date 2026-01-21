using VttTools.Audit.Model.Payloads;

namespace VttTools.Jobs.Services;

public class JobService(
    IJobStorage storage,
    IJobEventPublisher eventPublisher,
    IAuditLogService auditLogService)
    : IJobService {
    public async Task<Result<Job>> AddAsync(AddJobData data, CancellationToken ct = default) {
        var result = data.Validate();
        if (result.IsFailure)
            return Result.Failure(result.Errors).WithNo<Job>();

        var collector = new JobEventCollector();

        var job = new Job {
            OwnerId = data.OwnerId,
            Type = data.Type,
            EstimatedDuration = TimeSpan.FromMilliseconds(1500 * data.Items.Count),
        };
        job.Items.AddRange(data.Items.Select((input, index) => new JobItem {
            Job = job,
            Index = index,
            Data = input.Data,
        }));

        await storage.AddAsync(job, ct);
        await LogJobCreatedAsync(job, ct);

        collector.AddJobEvent(new JobCreatedEvent {
            JobId = job.Id,
            Type = job.Type,
            EstimatedDuration = job.EstimatedDuration,
            TotalItems = job.Items.Count,
        });

        await collector.PublishAllAsync(eventPublisher, ct);

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

        var collector = new JobEventCollector();

        job = job with {
            Status = data.Status,
            StartedAt = data.StartedAt.IsSet ? data.StartedAt.Value : job.StartedAt,
            CompletedAt = data.CompletedAt.IsSet ? data.CompletedAt.Value : job.CompletedAt,
            Items = [.. job.Items.Select(item => {
                var updatedItem = data.Items.FirstOrDefault(i => i.Index == item.Index);
                return updatedItem is null ? item : item with {
                    Status = updatedItem.Status,
                    Result = updatedItem.Result.IsSet ? updatedItem.Result.Value : item.Result,
                    StartedAt = updatedItem.StartedAt.IsSet ? updatedItem.StartedAt.Value : item.StartedAt,
                    CompletedAt = updatedItem.CompletedAt.IsSet ? updatedItem.CompletedAt.Value : item.CompletedAt,
                };
            })],
        };

        var derivedStatus = DeriveJobStatus(job.Items);
        if (derivedStatus == JobStatus.Completed)
            job = job with { Result = BuildJobResult(job.Items) };

        await storage.UpdateAsync(job, ct);

        foreach (var dataItem in data.Items) {
            var jobItem = job.Items.First(i => i.Index == dataItem.Index);
            if (dataItem.Status == JobItemStatus.InProgress) {
                collector.AddItemEvent(new JobItemStartedEvent {
                    JobId = job.Id,
                    Index = dataItem.Index,
                });
                await LogJobItemStartedAsync(job, jobItem, ct);
            }
            else if (dataItem.Status is JobItemStatus.Success or JobItemStatus.Failed or JobItemStatus.Canceled) {
                collector.AddItemEvent(new JobItemCompletedEvent {
                    JobId = job.Id,
                    Index = dataItem.Index,
                    Status = dataItem.Status,
                    Result = jobItem.Result,
                });
                await LogJobItemCompletedAsync(job, jobItem, ct);
            }
        }

        if (derivedStatus == JobStatus.Completed) {
            collector.AddJobEvent(new JobCompletedEvent { JobId = job.Id, Result = job.Result });
            await LogJobCompletedAsync(job, ct);
        }

        await collector.PublishAllAsync(eventPublisher, ct);

        return job;
    }

    public async Task<bool> CancelAsync(Guid id, CancellationToken ct = default) {
        var job = await storage.GetByIdAsync(id, ct);
        if (job is null)
            return false;

        var collector = new JobEventCollector();

        for (var i = 0; i < job.Items.Count; i++) {
            if (job.Items[i].Status is not (JobItemStatus.Pending or JobItemStatus.InProgress))
                continue;
            job.Items[i] = job.Items[i] with {
                Status = JobItemStatus.Canceled,
                Result = null,
            };
        }

        await storage.UpdateAsync(job, ct);
        await LogJobCanceledAsync(job, ct);

        collector.AddJobEvent(new JobCanceledEvent { JobId = id });
        await collector.PublishAllAsync(eventPublisher, ct);

        return true;
    }

    public async Task<bool> RetryAsync(Guid id, CancellationToken ct = default) {
        var job = await storage.GetByIdAsync(id, ct);
        if (job is null)
            return false;

        var collector = new JobEventCollector();

        for (var i = 0; i < job.Items.Count; i++) {
            if (job.Items[i].Status is not (JobItemStatus.Failed or JobItemStatus.Canceled))
                continue;
            job.Items[i] = job.Items[i] with {
                Status = JobItemStatus.Pending,
                Result = null,
            };
        }

        await storage.UpdateAsync(job, ct);
        await LogJobRetriedAsync(job, ct);

        collector.AddJobEvent(new JobRetriedEvent { JobId = id });
        await collector.PublishAllAsync(eventPublisher, ct);

        return true;
    }

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

    private static string BuildJobResult(IReadOnlyCollection<JobItem> items) {
        var successCount = items.Count(i => i.Status == JobItemStatus.Success);
        var failedCount = items.Count(i => i.Status == JobItemStatus.Failed);
        var canceledCount = items.Count(i => i.Status == JobItemStatus.Canceled);

        var parts = new List<string>();
        if (successCount > 0)
            parts.Add($"{successCount} succeeded");
        if (failedCount > 0)
            parts.Add($"{failedCount} failed");
        if (canceledCount > 0)
            parts.Add($"{canceledCount} canceled");

        return parts.Count > 0 ? string.Join(", ", parts) : "No items processed";
    }

    private Task LogJobCreatedAsync(Job job, CancellationToken ct) {
        var payload = new JobCreatedPayload {
            Type = job.Type,
            TotalItems = job.Items.Count,
            EstimatedDuration = job.EstimatedDuration.ToString(),
        };
        var auditLog = new AuditLog {
            UserId = job.OwnerId,
            Action = "Job:Created",
            EntityType = "Job",
            EntityId = job.Id.ToString(),
            Payload = JsonSerializer.Serialize(payload, JsonDefaults.Options),
        };
        return auditLogService.AddAsync(auditLog, ct);
    }

    private Task LogJobItemStartedAsync(Job job, JobItem item, CancellationToken ct) {
        var payload = new JobItemStartedPayload {
            Index = item.Index,
            StartedAt = item.StartedAt ?? DateTime.UtcNow,
        };
        var auditLog = new AuditLog {
            UserId = job.OwnerId,
            Action = "JobItem:Started",
            EntityType = "JobItem",
            EntityId = $"{job.Id}:{item.Index}",
            Payload = JsonSerializer.Serialize(payload, JsonDefaults.Options),
        };
        return auditLogService.AddAsync(auditLog, ct);
    }

    private Task LogJobItemCompletedAsync(Job job, JobItem item, CancellationToken ct) {
        var payload = new JobItemCompletedPayload {
            Index = item.Index,
            Status = item.Status.ToString(),
            Result = item.Result,
        };
        var auditLog = new AuditLog {
            UserId = job.OwnerId,
            Action = "JobItem:Completed",
            EntityType = "JobItem",
            EntityId = $"{job.Id}:{item.Index}",
            ErrorMessage = item.Status == JobItemStatus.Failed ? item.Result : null,
            Payload = JsonSerializer.Serialize(payload, JsonDefaults.Options),
        };
        return auditLogService.AddAsync(auditLog, ct);
    }

    private Task LogJobCompletedAsync(Job job, CancellationToken ct) {
        var successCount = job.Items.Count(i => i.Status == JobItemStatus.Success);
        var failedCount = job.Items.Count(i => i.Status == JobItemStatus.Failed);
        var payload = new JobCompletedPayload {
            CompletedAt = job.CompletedAt ?? DateTime.UtcNow,
            SuccessCount = successCount,
            FailedCount = failedCount,
        };
        var auditLog = new AuditLog {
            UserId = job.OwnerId,
            Action = "Job:Completed",
            EntityType = "Job",
            EntityId = job.Id.ToString(),
            ErrorMessage = failedCount > 0 ? $"{failedCount} items failed" : null,
            Payload = JsonSerializer.Serialize(payload, JsonDefaults.Options),
        };
        return auditLogService.AddAsync(auditLog, ct);
    }

    private Task LogJobCanceledAsync(Job job, CancellationToken ct) {
        var auditLog = new AuditLog {
            UserId = job.OwnerId,
            Action = "Job:Canceled",
            EntityType = "Job",
            EntityId = job.Id.ToString(),
        };
        return auditLogService.AddAsync(auditLog, ct);
    }

    private Task LogJobRetriedAsync(Job job, CancellationToken ct) {
        var auditLog = new AuditLog {
            UserId = job.OwnerId,
            Action = "Job:Retried",
            EntityType = "Job",
            EntityId = job.Id.ToString(),
        };
        return auditLogService.AddAsync(auditLog, ct);
    }
}