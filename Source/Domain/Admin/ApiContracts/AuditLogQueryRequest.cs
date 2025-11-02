namespace VttTools.Admin.ApiContracts;

public record AuditLogQueryRequest {
    public DateTime? StartDate { get; init; }
    public DateTime? EndDate { get; init; }
    public Guid? UserId { get; init; }
    public string? Action { get; init; }
    public string? EntityType { get; init; }
    public string? Result { get; init; }
    public int Skip { get; init; }
    public int Take { get; init; } = 50;
}
