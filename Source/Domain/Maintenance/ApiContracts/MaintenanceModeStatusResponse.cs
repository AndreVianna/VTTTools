namespace VttTools.Maintenance.ApiContracts;

public sealed record MaintenanceModeStatusResponse : Response {
    public Guid? Id { get; init; }
    public bool IsEnabled { get; init; }
    public string? Message { get; init; }
    public DateTime? ScheduledStartTime { get; init; }
    public DateTime? ScheduledEndTime { get; init; }
    public DateTime? EnabledAt { get; init; }
    public Guid? EnabledBy { get; init; }
    public DateTime? DisabledAt { get; init; }
    public Guid? DisabledBy { get; init; }
}
