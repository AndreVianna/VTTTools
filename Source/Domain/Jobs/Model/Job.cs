namespace VttTools.Jobs.Model;

public record Job {
    public Guid Id { get; init; } = Guid.CreateVersion7();
    public Guid OwnerId { get; init; }
    public string Type { get; init; } = string.Empty;
    public JobStatus Status { get; init; } = JobStatus.Pending;
    public TimeSpan EstimatedDuration { get; init; }
    public string? Result { get; init; }
    public DateTime? StartedAt { get; init; }
    public DateTime? CompletedAt { get; init; }
    public List<JobItem> Items { get; init; } = [];
}
