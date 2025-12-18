using Job = VttTools.Jobs.Model.Job;

namespace VttTools.Data.Jobs;

public class JobStorage(ApplicationDbContext context)
    : IJobStorage {

    public async Task AddAsync(Job job, CancellationToken ct = default) {
        var entity = job.ToEntity();
        context.Jobs.Add(entity);
        await context.SaveChangesAsync(ct);
    }

    public async Task<Job?> GetByIdAsync(Guid id, CancellationToken ct = default) {
        var job = await context.Jobs
            .Include(j => j.Items)
            .AsNoTracking()
            .FirstOrDefaultAsync(j => j.Id == id, ct);

        return job.ToModel();
    }

    public async Task<(IReadOnlyList<Job> Jobs, int TotalCount)> SearchAsync(
        string? type = null,
        int skip = 0,
        int take = 20,
        CancellationToken ct = default) {
        var query = context.Jobs.AsQueryable();

        if (!string.IsNullOrEmpty(type))
            query = query.Where(j => j.Type == type);

        var totalCount = await query.CountAsync(ct);

        var jobs = await query
            .Include(j => j.Items)
            .Skip(skip)
            .Take(take)
            .AsNoTracking()
            .ToListAsync(ct);

        return ([.. jobs.Select(i => i.ToModel())], totalCount);
    }

    public async Task<bool> UpdateAsync(Job job, CancellationToken ct = default) {
        var entity = await context.Jobs
                               .Include(j => j.Items)
                               .FirstOrDefaultAsync(i => i.Id == job.Id, ct);
        if (entity is null)
            return false;

        entity.UpdateFrom(job);
        await context.SaveChangesAsync(ct);
        return true;
    }

    public async Task<bool> CancelAsync(Guid id, CancellationToken ct = default) {
        var job = await context.Jobs
                               .Include(j => j.Items)
                               .FirstOrDefaultAsync(i => i.Id == id, ct);
        if (job is null)
            return false;

        foreach (var item in job.Items.Where(i => i.Status is JobItemStatus.Pending or JobItemStatus.InProgress)) {
            item.Status = JobItemStatus.Canceled;
            item.CompletedAt = DateTime.UtcNow;
        }

        await context.SaveChangesAsync(ct);
        return true;
    }

    public async Task<bool> RetryAsync(Guid id, CancellationToken ct = default) {
        var job = await context.Jobs
                               .Include(j => j.Items)
                               .FirstOrDefaultAsync(i => i.Id == id, ct);
        if (job is null)
            return false;

        foreach (var item in job.Items.Where(i => i.Status is JobItemStatus.Failed or JobItemStatus.Canceled)) {
            item.Status = JobItemStatus.Pending;
            item.Result = null;
            item.StartedAt = null;
            item.CompletedAt = null;
        }

        await context.SaveChangesAsync(ct);
        return true;
    }
}
