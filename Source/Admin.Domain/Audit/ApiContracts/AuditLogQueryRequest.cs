namespace VttTools.Admin.Audit.ApiContracts;

public sealed record AuditLogQueryRequest : Request {
    public DateTime? StartDate { get; init; }
    public DateTime? EndDate { get; init; }
    public Guid? UserId { get; init; }

    [MaxLength(100, ErrorMessage = "Action cannot exceed 100 characters")]
    public string? Action { get; init; }

    [MaxLength(100, ErrorMessage = "EntityType cannot exceed 100 characters")]
    public string? EntityType { get; init; }

    [MaxLength(50, ErrorMessage = "Result cannot exceed 50 characters")]
    public string? Result { get; init; }

    [Range(0, int.MaxValue, ErrorMessage = "Skip must be 0 or greater")]
    public int Skip { get; init; }

    [Range(1, 100, ErrorMessage = "Take must be between 1 and 100")]
    public int Take { get; init; } = 50;
}