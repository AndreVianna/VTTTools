namespace VttTools.Maintenance.Model;

public sealed record MaintenanceMode {
    public Guid Id { get; init; } = Guid.CreateVersion7();
    public bool IsEnabled { get; init; }
    [MaxLength(2000)]
    public string Message { get; init; } = string.Empty;
    public DateTime? ScheduledStartTime { get; init; }
    public DateTime? ScheduledEndTime { get; init; }
    public DateTime? EnabledAt { get; init; }
    public Guid? EnabledBy { get; init; }
    public DateTime? DisabledAt { get; init; }
    public Guid? DisabledBy { get; init; }
}
