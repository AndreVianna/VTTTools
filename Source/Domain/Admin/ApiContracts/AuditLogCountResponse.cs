namespace VttTools.Admin.ApiContracts;

public record AuditLogCountResponse {
    public int Count { get; init; }
}