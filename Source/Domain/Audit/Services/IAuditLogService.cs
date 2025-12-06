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
        string? result = null,
        int skip = 0,
        int take = 50,
        CancellationToken ct = default);
    Task<int> GetTotalCountAsync(CancellationToken ct = default);

    /// <summary>
    /// Gets the count of distinct active users since the specified start date.
    /// </summary>
    Task<int> GetDistinctActiveUsersCountAsync(DateTime startDate, CancellationToken ct = default);

    /// <summary>
    /// Gets the count of audit logs in the specified period.
    /// </summary>
    Task<int> GetCountInPeriodAsync(DateTime startDate, CancellationToken ct = default);

    /// <summary>
    /// Gets the average response time in milliseconds for audit logs since the specified start date.
    /// </summary>
    Task<double> GetAverageResponseTimeAsync(DateTime startDate, CancellationToken ct = default);

    /// <summary>
    /// Gets hourly average response times as time series data points.
    /// </summary>
    Task<List<TimeSeriesDataPoint>> GetHourlyAverageResponseTimesAsync(
        DateTime startDate,
        CancellationToken ct = default);

    /// <summary>
    /// Gets the date when the user was created (first audit log entry).
    /// </summary>
    Task<DateTime> GetUserCreatedDateAsync(Guid userId, CancellationToken ct = default);

    /// <summary>
    /// Gets the date of the user's last login.
    /// </summary>
    Task<DateTime?> GetUserLastLoginDateAsync(Guid userId, CancellationToken ct = default);

    /// <summary>
    /// Gets the date of the user's last modification (any action).
    /// </summary>
    Task<DateTime?> GetUserLastModifiedDateAsync(Guid userId, CancellationToken ct = default);
}