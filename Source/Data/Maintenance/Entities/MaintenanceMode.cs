namespace VttTools.Data.Maintenance.Entities;

public sealed record MaintenanceMode {
    public Guid Id { get; set; } = Guid.CreateVersion7();
    public bool IsEnabled { get; set; }
    [MaxLength(2000)]
    public string Message { get; set; } = string.Empty;
    public DateTime? ScheduledStartTime { get; set; }
    public DateTime? ScheduledEndTime { get; set; }
    public DateTime? EnabledAt { get; set; }
    public Guid? EnabledBy { get; set; }
    public DateTime? DisabledAt { get; set; }
    public Guid? DisabledBy { get; set; }
}