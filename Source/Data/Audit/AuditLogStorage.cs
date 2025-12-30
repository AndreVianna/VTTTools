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
            query = query.Where(a => a.Action.Contains(action));

        if (!string.IsNullOrWhiteSpace(entityType))
            query = query.Where(a => a.EntityType == entityType);

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

    public Task<int> GetCountAsync(CancellationToken ct = default)
        => context.AuditLogs.CountAsync(ct);

    public Task<int> GetDistinctActiveUsersCountAsync(DateTime startDate, CancellationToken ct = default)
        => context.AuditLogs
                  .AsNoTracking()
                  .Where(a => a.Timestamp >= startDate && a.UserId != null)
                  .Select(a => a.UserId!.Value)
                  .Distinct()
                  .CountAsync(ct);

    public Task<int> GetCountInPeriodAsync(DateTime startDate, CancellationToken ct = default)
        => context.AuditLogs
                  .AsNoTracking()
                  .Where(a => a.Timestamp >= startDate)
                  .CountAsync(ct);

    public async Task<double> GetAverageResponseTimeAsync(DateTime startDate, CancellationToken ct = default) {
        // Only HTTP audit logs have durationMs in their payload
        // These are identified by having a non-null Payload with httpMethod field
        var logs = await context.AuditLogs
            .AsNoTracking()
            .Where(a => a.Timestamp >= startDate && a.Payload != null)
            .Select(a => a.Payload!)
            .ToListAsync(ct);

        var durations = logs
            .Select(ExtractDurationMs)
            .Where(d => d > 0)
            .ToList();

        return durations.Count != 0 ? durations.Average() : 0;
    }

    public async Task<List<TimeSeriesDataPoint>> GetHourlyAverageResponseTimesAsync(
        DateTime startDate,
        CancellationToken ct = default) {

        // Only HTTP audit logs have durationMs in their payload
        var logs = await context.AuditLogs
            .AsNoTracking()
            .Where(a => a.Timestamp >= startDate && a.Payload != null)
            .Select(a => new {
                a.Timestamp,
                a.Payload,
            })
            .ToListAsync(ct);

        var results = logs
            .Select(a => new {
                a.Timestamp,
                DurationMs = ExtractDurationMs(a.Payload!),
            })
            .Where(a => a.DurationMs > 0)
            .GroupBy(a => new DateTime(a.Timestamp.Year, a.Timestamp.Month, a.Timestamp.Day, a.Timestamp.Hour, 0, 0, DateTimeKind.Utc))
            .Select(g => new TimeSeriesDataPoint {
                Timestamp = g.Key,
                Value = g.Average(a => a.DurationMs),
            })
            .OrderBy(dp => dp.Timestamp)
            .ToList();

        return results;
    }

    public async Task<DateTime> GetUserCreatedDateAsync(Guid userId, CancellationToken ct = default) {
        var createdDate = await context.AuditLogs
            .AsNoTracking()
            .Where(a => a.UserId == userId)
            .MinAsync(a => (DateTime?)a.Timestamp, ct);

        return createdDate ?? DateTime.MinValue;
    }

    public Task<DateTime?> GetUserLastLoginDateAsync(Guid userId, CancellationToken ct = default)
        => context.AuditLogs
                  .AsNoTracking()
                  .Where(a => a.UserId == userId && a.Action == "User:LoggedIn")
                  .MaxAsync(a => (DateTime?)a.Timestamp, ct);

    public Task<DateTime?> GetUserLastModifiedDateAsync(Guid userId, CancellationToken ct = default)
        => context.AuditLogs
                  .AsNoTracking()
                  .Where(a => a.UserId == userId)
                  .MaxAsync(a => (DateTime?)a.Timestamp, ct);

    private static double ExtractDurationMs(string payload) {
        try {
            using var doc = JsonDocument.Parse(payload);
            if (doc.RootElement.TryGetProperty("durationMs", out var durationElement))
                return durationElement.GetDouble();
        }
        catch {
            // Invalid JSON or missing property
        }
        return 0;
    }
}
