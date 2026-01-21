namespace VttTools.Admin.Audit.Model;

public sealed record AuditLogSummary {
    public required Guid Id { get; init; }
    public required DateTime Timestamp { get; init; }
    public required string Action { get; init; }
    public string? EntityType { get; init; }
    public Guid? EntityId { get; init; }
    public string? ErrorMessage { get; init; }
    public string? Payload { get; init; }
}