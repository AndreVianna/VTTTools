using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace VttTools.Data.Jobs.Entities;

[Table("JobItems")]
public record JobItem {
    public Guid Id { get; set; } = Guid.CreateVersion7();
    public Guid JobId { get; set; }
    public Job Job { get; set; } = null!;
    public int Index { get; set; }
    public string InputJson { get; set; } = string.Empty;
    public string? OutputJson { get; set; }
    public JobItemStatus Status { get; set; } = JobItemStatus.Pending;
    [MaxLength(1024)]
    public string? ErrorMessage { get; set; }
    public DateTime? StartedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
}
