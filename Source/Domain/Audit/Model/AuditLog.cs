namespace VttTools.Audit.Model;

public record AuditLog {
    public Guid Id { get; init; } = Guid.CreateVersion7();
    public DateTime Timestamp { get; init; }
    public Guid? UserId { get; init; }
    public string? UserEmail { get; init; }
    [MaxLength(100)]
    public string Action { get; init; } = string.Empty;
    [MaxLength(4000)]
    public string? ErrorMessage { get; init; }
    [MaxLength(100)]
    public string? EntityType { get; init; }
    [MaxLength(50)]
    public string? EntityId { get; init; }
    [MaxLength(8000)]
    public string? Payload { get; init; }
}
