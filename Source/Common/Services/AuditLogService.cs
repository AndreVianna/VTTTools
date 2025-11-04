using VttTools.Domain.Admin.ApiContracts;

namespace VttTools.Services;

public class AuditLogService(IAuditLogStorage storage, ILogger<AuditLogService> logger)
    : IAuditLogService {
    private static readonly string[] _validResults = ["Success", "Failure", "Error"];

    public async Task AddAsync(AuditLog auditLog, CancellationToken ct = default) {
        ArgumentNullException.ThrowIfNull(auditLog);

        if (!_validResults.Contains(auditLog.Result)) {
            throw new ArgumentException(
                $"Result must be one of: {string.Join(", ", _validResults)}",
                nameof(auditLog));
        }

        var logToCreate = auditLog.Timestamp == default
            ? auditLog with { Timestamp = DateTime.UtcNow }
            : auditLog;

        logger.LogInformation(
            "Creating audit log: Action={Action}, EntityType={EntityType}, Result={Result}",
            logToCreate.Action,
            logToCreate.EntityType,
            logToCreate.Result);

        await storage.AddAsync(logToCreate, ct);
        logger.LogDebug("Audit log created successfully with ID: {Id}", logToCreate.Id);
    }

    public async Task<AuditLog?> GetByIdAsync(Guid id, CancellationToken ct = default) {
        logger.LogDebug("Retrieving audit log with ID: {Id}", id);

        var auditLog = await storage.GetByIdAsync(id, ct);

        if (auditLog is null) {
            logger.LogDebug("Audit log not found with ID: {Id}", id);
        }

        return auditLog;
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

        if (skip < 0) {
            throw new ArgumentOutOfRangeException(nameof(skip), "Skip must be greater than or equal to 0.");
        }

        if (take <= 0) {
            throw new ArgumentOutOfRangeException(nameof(take), "Take must be greater than 0.");
        }

        if (take > 100) {
            throw new ArgumentOutOfRangeException(nameof(take), "Take must be less than or equal to 100.");
        }

        logger.LogDebug(
            "Querying audit logs: StartDate={StartDate}, EndDate={EndDate}, UserId={UserId}, Action={Action}, EntityType={EntityType}, Result={Result}, Skip={Skip}, Take={Take}",
            startDate,
            endDate,
            userId,
            action,
            entityType,
            result,
            skip,
            take);

        var queryResult = await storage.QueryAsync(
            startDate,
            endDate,
            userId,
            action,
            entityType,
            result,
            skip,
            take,
            ct);

        logger.LogDebug("Query returned {Count} items out of {TotalCount} total", queryResult.Items.Count(), queryResult.TotalCount);

        return queryResult;
    }

    public async Task<int> GetTotalCountAsync(CancellationToken ct = default) {
        logger.LogDebug("Retrieving total audit log count");

        var count = await storage.GetCountAsync(ct);

        logger.LogDebug("Total audit log count: {Count}", count);

        return count;
    }

    public async Task<int> GetDistinctActiveUsersCountAsync(DateTime startDate, CancellationToken ct = default) {
        logger.LogDebug("Retrieving distinct active users count since {StartDate}", startDate);

        var count = await storage.GetDistinctActiveUsersCountAsync(startDate, ct);

        logger.LogDebug("Distinct active users count: {Count}", count);

        return count;
    }

    public async Task<int> GetCountInPeriodAsync(DateTime startDate, CancellationToken ct = default) {
        logger.LogDebug("Retrieving audit log count since {StartDate}", startDate);

        var count = await storage.GetCountInPeriodAsync(startDate, ct);

        logger.LogDebug("Audit log count in period: {Count}", count);

        return count;
    }

    public async Task<double> GetAverageResponseTimeAsync(DateTime startDate, CancellationToken ct = default) {
        logger.LogDebug("Retrieving average response time since {StartDate}", startDate);

        var average = await storage.GetAverageResponseTimeAsync(startDate, ct);

        logger.LogDebug("Average response time: {Average}ms", average);

        return average;
    }

    public async Task<List<TimeSeriesDataPoint>> GetHourlyAverageResponseTimesAsync(
        DateTime startDate,
        CancellationToken ct = default) {

        logger.LogDebug("Retrieving hourly average response times since {StartDate}", startDate);

        var dataPoints = await storage.GetHourlyAverageResponseTimesAsync(startDate, ct);

        logger.LogDebug("Retrieved {Count} time series data points", dataPoints.Count);

        return dataPoints;
    }

    public async Task<DateTime> GetUserCreatedDateAsync(Guid userId, CancellationToken ct = default) {
        logger.LogDebug("Retrieving created date for user {UserId}", userId);

        var createdDate = await storage.GetUserCreatedDateAsync(userId, ct);

        logger.LogDebug("User {UserId} created date: {CreatedDate}", userId, createdDate);

        return createdDate;
    }

    public async Task<DateTime?> GetUserLastLoginDateAsync(Guid userId, CancellationToken ct = default) {
        logger.LogDebug("Retrieving last login date for user {UserId}", userId);

        var lastLoginDate = await storage.GetUserLastLoginDateAsync(userId, ct);

        logger.LogDebug("User {UserId} last login date: {LastLoginDate}", userId, lastLoginDate?.ToString() ?? "Never");

        return lastLoginDate;
    }

    public async Task<DateTime?> GetUserLastModifiedDateAsync(Guid userId, CancellationToken ct = default) {
        logger.LogDebug("Retrieving last modified date for user {UserId}", userId);

        var lastModifiedDate = await storage.GetUserLastModifiedDateAsync(userId, ct);

        logger.LogDebug("User {UserId} last modified date: {LastModifiedDate}", userId, lastModifiedDate);

        return lastModifiedDate;
    }
}
