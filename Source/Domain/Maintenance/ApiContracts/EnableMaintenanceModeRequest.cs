namespace VttTools.Maintenance.ApiContracts;

public sealed record EnableMaintenanceModeRequest : Request {
    public required string Message { get; init; }
    public DateTime? ScheduledStartTime { get; init; }
    public DateTime? ScheduledEndTime { get; init; }
}