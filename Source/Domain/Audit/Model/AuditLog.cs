namespace VttTools.Audit.Model;

public record AuditLog {
    public Guid Id { get; init; } = Guid.CreateVersion7();
    public DateTime Timestamp { get; init; }
    public Guid? UserId { get; init; }
    public string? UserEmail { get; init; }
    public string Action { get; init; } = string.Empty;
    public string? ErrorMessage { get; init; }
    public string? EntityType { get; init; }
    public string? EntityId { get; init; }
    public string? Payload { get; init; }
}
