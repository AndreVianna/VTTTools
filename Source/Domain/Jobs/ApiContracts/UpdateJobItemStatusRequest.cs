namespace VttTools.Jobs.ApiContracts;

public sealed record UpdateJobItemStatusRequest {
    public required JobItemStatus Status { get; init; }
    public string? OutputJson { get; init; }
    public string? ErrorMessage { get; init; }
    public DateTime? StartedAt { get; init; }
    public DateTime? CompletedAt { get; init; }
}
