namespace VttTools.Audit.Services;

public interface IAuditLogService {
    Task AddAsync(AuditLog auditLog, CancellationToken ct = default);
    Task<AuditLog?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<(IEnumerable<AuditLog> Items, int TotalCount)> QueryAsync(
        DateTime? startDate = null,
        DateTime? endDate = null,
        Guid? userId = null,
        string? action = null,
        string? entityType = null,
        int skip = 0,
        int take = 50,
        CancellationToken ct = default);
    Task<int> GetTotalCountAsync(CancellationToken ct = default);
    Task<int> GetDistinctActiveUsersCountAsync(DateTime startDate, CancellationToken ct = default);
    Task<int> GetCountInPeriodAsync(DateTime startDate, CancellationToken ct = default);
    Task<double> GetAverageResponseTimeAsync(DateTime startDate, CancellationToken ct = default);
    Task<List<TimeSeriesDataPoint>> GetHourlyAverageResponseTimesAsync(DateTime startDate, CancellationToken ct = default);
    Task<DateTime> GetUserCreatedDateAsync(Guid userId, CancellationToken ct = default);
    Task<DateTime?> GetUserLastLoginDateAsync(Guid userId, CancellationToken ct = default);
    Task<DateTime?> GetUserLastModifiedDateAsync(Guid userId, CancellationToken ct = default);
}