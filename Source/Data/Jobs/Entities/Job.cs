namespace VttTools.Data.Jobs.Entities;

public class Job {
    public Guid Id { get; set; } = Guid.CreateVersion7();
    public string Type { get; set; } = string.Empty;
    public JobStatus Status { get; set; } = JobStatus.Pending;
    public TimeSpan EstimatedDuration { get; set; }
    public DateTime? StartedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    public ICollection<JobItem> Items { get; set; } = [];
}
