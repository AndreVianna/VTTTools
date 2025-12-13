using System.ComponentModel.DataAnnotations.Schema;

namespace VttTools.Data.Jobs.Entities;

[Table("Jobs")]
public record Job {
    public Guid Id { get; set; } = Guid.CreateVersion7();
    public string Type { get; set; } = string.Empty;
    public JobStatus Status { get; set; } = JobStatus.Pending;
    public int TotalItems { get; set; }
    public int CompletedItems { get; set; }
    public int FailedItems { get; set; }
    public string InputJson { get; set; } = string.Empty;
    public long? EstimatedDurationMs { get; set; }
    public long? ActualDurationMs { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? StartedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    public ICollection<JobItem> Items { get; set; } = [];
}
