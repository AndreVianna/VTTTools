namespace VttTools.Data.Audit.Entities;

public record AuditLog {
    public Guid Id { get; set; } = Guid.CreateVersion7();
    public DateTime Timestamp { get; set; }
    public Guid? UserId { get; set; }
    public string? UserEmail { get; set; }
    [MaxLength(100)]
    public string Action { get; set; } = string.Empty;
    [MaxLength(4000)]
    public string? ErrorMessage { get; set; }
    [MaxLength(100)]
    public string? EntityType { get; set; }
    [MaxLength(50)]
    public string? EntityId { get; set; }
    public string? Payload { get; set; }
}
