using VttTools.Audit.Model.Payloads;
using VttTools.Json;

namespace VttTools.Jobs.Services;

public class JobService(
    IJobStorage storage,
    IHubContext<JobHub> hubContext,
    IAuditLogService auditLogService)
    : IJobService {
    public async Task<Result<Job>> AddAsync(AddJobData data, CancellationToken ct = default) {
        var result = data.Validate();
        if (result.IsFailure)
            return Result.Failure(result.Errors).WithNo<Job>();

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

        var createdEvent = new JobCreatedEvent {
            JobId = job.Id,
            Type = job.Type,
            EstimatedDuration = job.EstimatedDuration,
            TotalItems = job.Items.Count,
        };
        await hubContext.SendJobCreatedAsync(createdEvent, ct);

        // Audit log: Job created
        await LogJobCreatedAsync(job, ct);

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

        foreach (var dataItem in data.Items) {
            var jobItem = job.Items.First(i => i.Index == dataItem.Index);
            if (dataItem.Status == JobItemStatus.InProgress) {
                var startedEvent = new JobItemStartedEvent {
                    JobId = job.Id,
                    Index = dataItem.Index,
                    StartedAt = jobItem.StartedAt,
                };
                await hubContext.SendJobItemStartedAsync(startedEvent, ct);

                // Audit log: Job item started
                await LogJobItemStartedAsync(job, jobItem, ct);
            }
            else if (dataItem.Status is JobItemStatus.Success or JobItemStatus.Failed or JobItemStatus.Canceled) {
                var completedEvent = new JobItemCompletedEvent {
                    JobId = job.Id,
                    Index = dataItem.Index,
                    Status = dataItem.Status,
                    Message = jobItem.Message,
                    CompletedAt = jobItem.CompletedAt,
                };
                await hubContext.SendJobItemCompletedAsync(completedEvent, ct);

                // Audit log: Job item completed
                await LogJobItemCompletedAsync(job, jobItem, ct);
            }
        }

        var derivedStatus = DeriveJobStatus(job.Items);
        if (derivedStatus == JobStatus.Completed) {
            var completedEvent = new JobCompletedEvent { JobId = job.Id };
            await hubContext.SendJobCompletedAsync(completedEvent, ct);

            // Audit log: Job completed
            await LogJobCompletedAsync(job, ct);
        }

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

        var canceledEvent = new JobCanceledEvent { JobId = id };
        await hubContext.SendJobCanceledAsync(canceledEvent, ct);

        // Audit log: Job canceled
        await LogJobCanceledAsync(job, ct);

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

        var retriedEvent = new JobRetriedEvent { JobId = id };
        await hubContext.SendJobRetriedAsync(retriedEvent, ct);

        // Audit log: Job retried
        await LogJobRetriedAsync(job, ct);

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

    private async Task LogJobCreatedAsync(Job job, CancellationToken ct) {
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
        await auditLogService.AddAsync(auditLog, ct);
    }

    private async Task LogJobItemStartedAsync(Job job, JobItem item, CancellationToken ct) {
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
        await auditLogService.AddAsync(auditLog, ct);
    }

    private async Task LogJobItemCompletedAsync(Job job, JobItem item, CancellationToken ct) {
        var payload = new JobItemCompletedPayload {
            Index = item.Index,
            Status = item.Status.ToString(),
            Message = item.Message,
        };
        var auditLog = new AuditLog {
            UserId = job.OwnerId,
            Action = "JobItem:Completed",
            EntityType = "JobItem",
            EntityId = $"{job.Id}:{item.Index}",
            ErrorMessage = item.Status == JobItemStatus.Failed ? item.Message : null,
            Payload = JsonSerializer.Serialize(payload, JsonDefaults.Options),
        };
        await auditLogService.AddAsync(auditLog, ct);
    }

    private async Task LogJobCompletedAsync(Job job, CancellationToken ct) {
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
        await auditLogService.AddAsync(auditLog, ct);
    }

    private async Task LogJobCanceledAsync(Job job, CancellationToken ct) {
        var auditLog = new AuditLog {
            UserId = job.OwnerId,
            Action = "Job:Canceled",
            EntityType = "Job",
            EntityId = job.Id.ToString(),
        };
        await auditLogService.AddAsync(auditLog, ct);
    }

    private async Task LogJobRetriedAsync(Job job, CancellationToken ct) {
        var auditLog = new AuditLog {
            UserId = job.OwnerId,
            Action = "Job:Retried",
            EntityType = "Job",
            EntityId = job.Id.ToString(),
        };
        await auditLogService.AddAsync(auditLog, ct);
    }
}
