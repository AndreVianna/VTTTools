namespace VttTools.Audit.Model;

public record AuditLog {
    public Guid Id { get; init; } = Guid.CreateVersion7();
    public DateTime Timestamp { get; init; }
    public Guid? UserId { get; init; }
    public string? UserEmail { get; init; }
    [MaxLength(100)]
    public string Action { get; init; } = string.Empty;
    [MaxLength(100)]
    public string? EntityType { get; init; }
    [MaxLength(50)]
    public string? EntityId { get; init; }
    [MaxLength(10)]
    public string HttpMethod { get; init; } = string.Empty;
    [MaxLength(500)]
    public string Path { get; init; } = string.Empty;
    [MaxLength(2000)]
    public string? QueryString { get; init; }
    public int StatusCode { get; init; }
    [MaxLength(50)]
    public string? IpAddress { get; init; }
    [MaxLength(500)]
    public string? UserAgent { get; init; }
    [MaxLength(8000)]
    public string? RequestBody { get; init; }
    [MaxLength(8000)]
    public string? ResponseBody { get; init; }
    public int DurationInMilliseconds { get; init; }
    [MaxLength(50)]
    public string Result { get; init; } = string.Empty;
    [MaxLength(4000)]
    public string? ErrorMessage { get; init; }
}
