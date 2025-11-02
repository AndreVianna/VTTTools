using AuditLog = VttTools.Audit.Model.AuditLog;

namespace VttTools.Data.Audit;

public class AuditLogStorage(ApplicationDbContext context)
    : IAuditLogStorage {
    public async Task AddAsync(AuditLog auditLog, CancellationToken ct = default) {
        var entity = auditLog.ToEntity();
        await context.AuditLogs.AddAsync(entity, ct);
        await context.SaveChangesAsync(ct);
    }

    public async Task<AuditLog?> GetByIdAsync(Guid id, CancellationToken ct = default) {
        var entity = await context.AuditLogs
            .AsNoTracking()
            .FirstOrDefaultAsync(a => a.Id == id, ct);
        return entity?.ToModel();
    }

    public async Task<(IEnumerable<AuditLog> Items, int TotalCount)> QueryAsync(
        DateTime? startDate = null,
        DateTime? endDate = null,
        Guid? userId = null,
        string? action = null,
        string? entityType = null,
        string? result = null,
        int skip = 0,
        int take = 50,
        CancellationToken ct = default) {

        var query = context.AuditLogs.AsNoTracking();

        if (startDate.HasValue)
            query = query.Where(a => a.Timestamp >= startDate.Value);

        if (endDate.HasValue)
            query = query.Where(a => a.Timestamp <= endDate.Value);

        if (userId.HasValue)
            query = query.Where(a => a.UserId == userId.Value);

        if (!string.IsNullOrWhiteSpace(action))
            query = query.Where(a => a.Action == action);

        if (!string.IsNullOrWhiteSpace(entityType))
            query = query.Where(a => a.EntityType == entityType);

        if (!string.IsNullOrWhiteSpace(result))
            query = query.Where(a => a.Result == result);

        var totalCount = await query.CountAsync(ct);

        var items = await query
            .OrderByDescending(a => a.Timestamp)
            .Skip(skip)
            .Take(take)
            .Select(Mapper.AsAuditLog)
            .AsNoTracking()
            .ToListAsync(ct);

        return (items, totalCount);
    }

    public async Task<int> GetCountAsync(CancellationToken ct = default)
        => await context.AuditLogs.CountAsync(ct);
}
