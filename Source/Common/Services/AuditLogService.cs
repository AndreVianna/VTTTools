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
}
