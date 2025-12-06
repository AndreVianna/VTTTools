namespace VttTools.Domain.Admin.Services;

public interface IDashboardService {
    /// <summary>
    /// Retrieves dashboard statistics including total users, active users in last 24 hours,
    /// total audit log count, and storage usage.
    /// </summary>
    /// <param name="cancellationToken">Cancellation token for the operation.</param>
    /// <returns>Dashboard statistics response.</returns>
    Task<DashboardStatsResponse> GetStatsAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Retrieves performance metrics including average response time and request rate
    /// for the specified time period.
    /// </summary>
    /// <param name="hours">Number of hours to look back (1-168).</param>
    /// <param name="cancellationToken">Cancellation token for the operation.</param>
    /// <returns>Performance metrics response.</returns>
    Task<PerformanceMetricsResponse> GetMetricsAsync(int hours, CancellationToken cancellationToken = default);
}