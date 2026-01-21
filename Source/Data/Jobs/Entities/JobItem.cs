namespace VttTools.Data.Jobs.Entities;

public class JobItem {
    public Guid JobId { get; set; }
    public Job Job { get; set; } = null!;
    public int Index { get; set; }
    public JobItemStatus Status { get; set; } = JobItemStatus.Pending;
    [MaxLength(8192)]
    public string Data { get; init; } = string.Empty;
    [MaxLength(8192)]
    public string? Result { get; set; }
    public DateTime? StartedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
}