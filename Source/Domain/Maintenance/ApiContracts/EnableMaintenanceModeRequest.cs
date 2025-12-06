namespace VttTools.Maintenance.ApiContracts;

public sealed record EnableMaintenanceModeRequest : Request {
    [Required(ErrorMessage = "Message is required")]
    [MaxLength(2000, ErrorMessage = "Message cannot exceed 2000 characters")]
    public required string Message { get; init; }

    public DateTime? ScheduledStartTime { get; init; }
    public DateTime? ScheduledEndTime { get; init; }
}