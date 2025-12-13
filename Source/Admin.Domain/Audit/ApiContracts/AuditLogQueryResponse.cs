namespace VttTools.Admin.Audit.ApiContracts;

public record AuditLogQueryResponse {
    public IEnumerable<AuditLog> Items { get; init; } = [];
    public int TotalCount { get; init; }
}