using AuditLog = VttTools.Audit.Model.AuditLog;

namespace VttTools.Audit.Storage;

public interface IAuditLogStorage {
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
    Task<int> GetCountAsync(CancellationToken ct = default);
}
