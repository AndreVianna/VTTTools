using VttTools.Data.Jobs.Entities;
using VttTools.Jobs.ApiContracts;

namespace VttTools.Data.Jobs;

public class JobStorage(ApplicationDbContext context) : IJobStorage {

    public async Task<Guid> CreateJobAsync(
        string type,
        string inputJson,
        int totalItems,
        long? estimatedDurationMs = null,
        CancellationToken ct = default) {
        var job = new Job {
            Type = type,
            InputJson = inputJson,
            TotalItems = totalItems,
            EstimatedDurationMs = estimatedDurationMs,
        };

        context.Jobs.Add(job);
        await context.SaveChangesAsync(ct);
        return job.Id;
    }

    public async Task AddItemsAsync(
        Guid jobId,
        IEnumerable<(int Index, string InputJson)> items,
        CancellationToken ct = default) {
        foreach (var item in items) {
            context.JobItems.Add(new JobItem {
                JobId = jobId,
                Index = item.Index,
                InputJson = item.InputJson,
            });
        }

        await context.SaveChangesAsync(ct);
    }

    public async Task<JobResponse?> GetJobByIdAsync(
        Guid jobId,
        CancellationToken ct = default) {
        var job = await context.Jobs
            .Include(j => j.Items)
            .AsNoTracking()
            .FirstOrDefaultAsync(j => j.Id == jobId, ct);

        return job is null ? null : MapToResponse(job);
    }

    public async Task<(IReadOnlyList<JobResponse> Jobs, int TotalCount)> GetJobsAsync(
        string? type = null,
        int skip = 0,
        int take = 20,
        CancellationToken ct = default) {
        var query = context.Jobs.AsQueryable();

        if (!string.IsNullOrEmpty(type))
            query = query.Where(j => j.Type == type);

        var totalCount = await query.CountAsync(ct);

        var jobs = await query
            .OrderByDescending(j => j.CreatedAt)
            .Skip(skip)
            .Take(take)
            .AsNoTracking()
            .ToListAsync(ct);

        return ([.. jobs.Select(MapToResponseWithoutItems)], totalCount);
    }

    public async Task UpdateJobStatusAsync(
        Guid jobId,
        JobStatus status,
        DateTime? startedAt = null,
        DateTime? completedAt = null,
        long? actualDurationMs = null,
        CancellationToken ct = default) {
        var job = await context.Jobs.FindAsync([jobId], ct);
        if (job is null)
            return;

        job.Status = status;
        if (startedAt.HasValue)
            job.StartedAt = startedAt.Value;
        if (completedAt.HasValue)
            job.CompletedAt = completedAt.Value;
        if (actualDurationMs.HasValue)
            job.ActualDurationMs = actualDurationMs.Value;

        await context.SaveChangesAsync(ct);
    }

    public async Task UpdateJobCountsAsync(
        Guid jobId,
        int completedItems,
        int failedItems,
        CancellationToken ct = default) {
        var job = await context.Jobs.FindAsync([jobId], ct);
        if (job is null)
            return;

        job.CompletedItems = completedItems;
        job.FailedItems = failedItems;

        await context.SaveChangesAsync(ct);
    }

    public async Task UpdateItemStatusAsync(
        Guid itemId,
        JobItemStatus status,
        string? outputJson = null,
        string? errorMessage = null,
        DateTime? startedAt = null,
        DateTime? completedAt = null,
        CancellationToken ct = default) {
        var item = await context.JobItems.FindAsync([itemId], ct);
        if (item is null)
            return;

        item.Status = status;
        if (outputJson is not null)
            item.OutputJson = outputJson;
        if (errorMessage is not null)
            item.ErrorMessage = errorMessage;
        if (startedAt.HasValue)
            item.StartedAt = startedAt.Value;
        if (completedAt.HasValue)
            item.CompletedAt = completedAt.Value;

        await context.SaveChangesAsync(ct);
    }

    public async Task<IReadOnlyList<JobItemResponse>> GetPendingItemsAsync(
        Guid jobId,
        CancellationToken ct = default) {
        var items = await context.JobItems
            .Where(i => i.JobId == jobId && i.Status == JobItemStatus.Pending)
            .OrderBy(i => i.Index)
            .AsNoTracking()
            .ToListAsync(ct);

        return [.. items.Select(MapItemToResponse)];
    }

    public async Task<IReadOnlyList<JobItemResponse>> GetFailedItemsAsync(
        Guid jobId,
        Guid[]? itemIds = null,
        CancellationToken ct = default) {
        var query = context.JobItems
            .Where(i => i.JobId == jobId && i.Status == JobItemStatus.Failed);

        if (itemIds is { Length: > 0 })
            query = query.Where(i => itemIds.Contains(i.Id));

        var items = await query.OrderBy(i => i.Index).AsNoTracking().ToListAsync(ct);
        return [.. items.Select(MapItemToResponse)];
    }

    private static JobResponse MapToResponse(Job job) => new() {
        Id = job.Id,
        Type = job.Type,
        Status = job.Status,
        TotalItems = job.TotalItems,
        CompletedItems = job.CompletedItems,
        FailedItems = job.FailedItems,
        InputJson = job.InputJson,
        EstimatedDurationMs = job.EstimatedDurationMs,
        ActualDurationMs = job.ActualDurationMs,
        CreatedAt = job.CreatedAt,
        StartedAt = job.StartedAt,
        CompletedAt = job.CompletedAt,
        Items = [.. job.Items.OrderBy(i => i.Index).Select(MapItemToResponse)],
    };

    private static JobResponse MapToResponseWithoutItems(Job job) => new() {
        Id = job.Id,
        Type = job.Type,
        Status = job.Status,
        TotalItems = job.TotalItems,
        CompletedItems = job.CompletedItems,
        FailedItems = job.FailedItems,
        InputJson = job.InputJson,
        EstimatedDurationMs = job.EstimatedDurationMs,
        ActualDurationMs = job.ActualDurationMs,
        CreatedAt = job.CreatedAt,
        StartedAt = job.StartedAt,
        CompletedAt = job.CompletedAt,
        Items = [],
    };

    private static JobItemResponse MapItemToResponse(JobItem item) => new() {
        ItemId = item.Id,
        JobId = item.JobId,
        Index = item.Index,
        Status = item.Status,
        InputJson = item.InputJson,
        OutputJson = item.OutputJson,
        ErrorMessage = item.ErrorMessage,
        StartedAt = item.StartedAt,
        CompletedAt = item.CompletedAt,
    };
}
