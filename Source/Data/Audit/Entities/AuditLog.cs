namespace VttTools.Data.Audit.Entities;

public record AuditLog {
    public Guid Id { get; set; } = Guid.CreateVersion7();
    public DateTime Timestamp { get; set; }
    public Guid? UserId { get; set; }
    public string? UserEmail { get; set; }
    [MaxLength(100)]
    public string Action { get; set; } = string.Empty;
    [MaxLength(100)]
    public string? EntityType { get; set; }
    [MaxLength(50)]
    public string? EntityId { get; set; }
    [MaxLength(10)]
    public string HttpMethod { get; set; } = string.Empty;
    [MaxLength(500)]
    public string Path { get; set; } = string.Empty;
    [MaxLength(2000)]
    public string? QueryString { get; set; }
    public int StatusCode { get; set; }
    [MaxLength(50)]
    public string? IpAddress { get; set; }
    [MaxLength(500)]
    public string? UserAgent { get; set; }
    [MaxLength(8000)]
    public string? RequestBody { get; set; }
    [MaxLength(8000)]
    public string? ResponseBody { get; set; }
    public int DurationInMilliseconds { get; set; }
    [MaxLength(50)]
    public string Result { get; set; } = string.Empty;
    [MaxLength(4000)]
    public string? ErrorMessage { get; set; }
}
