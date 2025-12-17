namespace VttTools.Jobs.Model;

public record JobItem {
    [JsonIgnore]
    public Job Job { get; init; } = null!;
    public int Index { get; init; }
    public JobItemStatus Status { get; init; } = JobItemStatus.Pending;
    public string Data { get; init; } = string.Empty;
    public string? Message { get; init; }
    public DateTime? StartedAt { get; init; }
    public DateTime? CompletedAt { get; init; }
}
