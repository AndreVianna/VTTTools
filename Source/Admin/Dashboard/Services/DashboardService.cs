namespace VttTools.Admin.Dashboard.Services;

public class DashboardService(
    UserManager<UserEntity> userManager,
    IAuditLogService auditLogService,
    ILogger<DashboardService> logger)
    : IDashboardService {

    public async Task<DashboardStatsResponse> GetStatsAsync(CancellationToken cancellationToken = default) {
        try {
            logger.LogDebug("Retrieving dashboard statistics");

            var totalUsers = await Task.Run(() => userManager.Users.Count(), cancellationToken);

            var twentyFourHoursAgo = DateTime.UtcNow.AddHours(-24);
            var activeUsers24h = await auditLogService.GetDistinctActiveUsersCountAsync(
                twentyFourHoursAgo,
                cancellationToken);

            var totalAuditLogs = await auditLogService.GetTotalCountAsync(cancellationToken);

            const decimal storageUsedGB = 0m;

            logger.LogDebug(
                "Dashboard stats retrieved: TotalUsers={TotalUsers}, ActiveUsers24h={ActiveUsers24h}, TotalAuditLogs={TotalAuditLogs}",
                totalUsers,
                activeUsers24h,
                totalAuditLogs);

            return new DashboardStatsResponse {
                TotalUsers = totalUsers,
                ActiveUsers24h = activeUsers24h,
                TotalAuditLogs = totalAuditLogs,
                StorageUsedGB = storageUsedGB
            };
        }
        catch (Exception ex) {
            logger.LogError(ex, "Error retrieving dashboard statistics");
            throw;
        }
    }

    public async Task<PerformanceMetricsResponse> GetMetricsAsync(int hours, CancellationToken cancellationToken = default) {
        if (hours is < 1 or > 168) {
            throw new ArgumentOutOfRangeException(nameof(hours), "Hours must be between 1 and 168.");
        }

        try {
            logger.LogDebug("Retrieving performance metrics for last {Hours} hours", hours);

            var startDate = DateTime.UtcNow.AddHours(-hours);

            var totalRequests = await auditLogService.GetCountInPeriodAsync(startDate, cancellationToken);
            var averageResponseTimeMs = await auditLogService.GetAverageResponseTimeAsync(startDate, cancellationToken);

            var totalMinutes = hours * 60;
            var requestsPerMinute = totalMinutes > 0
                ? (int)Math.Round((double)totalRequests / totalMinutes)
                : 0;

            var responseTimeHistory = await auditLogService.GetHourlyAverageResponseTimesAsync(
                startDate,
                cancellationToken);

            var filledHistory = FillTimeSeriesGaps(responseTimeHistory, startDate, hours, averageResponseTimeMs);

            logger.LogDebug(
                "Performance metrics retrieved: AverageResponseTimeMs={AverageResponseTimeMs}, RequestsPerMinute={RequestsPerMinute}",
                averageResponseTimeMs,
                requestsPerMinute);

            return new PerformanceMetricsResponse {
                AverageResponseTimeMs = averageResponseTimeMs,
                RequestsPerMinute = requestsPerMinute,
                ResponseTimeHistory = filledHistory
            };
        }
        catch (Exception ex) {
            logger.LogError(ex, "Error retrieving performance metrics for last {Hours} hours", hours);
            throw;
        }
    }

    private static List<TimeSeriesDataPoint> FillTimeSeriesGaps(
        List<TimeSeriesDataPoint> dataPoints,
        DateTime startDate,
        int hours,
        double defaultValue) {

        var result = new List<TimeSeriesDataPoint>();
        var existingTimes = dataPoints.ToDictionary(dp => dp.Timestamp);

        for (var i = 0; i <= hours; i++) {
            var timestamp = startDate.AddHours(i);
            var hourKey = new DateTime(timestamp.Year, timestamp.Month, timestamp.Day, timestamp.Hour, 0, 0, DateTimeKind.Utc);

            if (existingTimes.TryGetValue(hourKey, out var dataPoint)) {
                result.Add(dataPoint);
            }
            else {
                result.Add(new TimeSeriesDataPoint {
                    Timestamp = hourKey,
                    Value = defaultValue
                });
            }
        }

        return result;
    }
}