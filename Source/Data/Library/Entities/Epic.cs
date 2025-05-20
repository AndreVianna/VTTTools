namespace VttTools.Data.Library.Entities;

public class Epic {
    public Guid Id { get; set; } = Guid.CreateVersion7();
    public Guid OwnerId { get; set; }
    [MaxLength(128)]
    public string Name { get; set; } = string.Empty;
    [MaxLength(4096)]
    public string Description { get; set; } = string.Empty;
    public Guid? ImageId { get; set; }
    public bool IsPublished { get; set; }
    public bool IsPublic { get; set; }
    public HashSet<Campaign> Campaigns { get; set; } = [];
}