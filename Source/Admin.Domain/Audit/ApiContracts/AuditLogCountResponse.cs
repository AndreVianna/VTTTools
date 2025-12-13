namespace VttTools.Admin.Audit.ApiContracts;

public record AuditLogCountResponse {
    public int Count { get; init; }
}