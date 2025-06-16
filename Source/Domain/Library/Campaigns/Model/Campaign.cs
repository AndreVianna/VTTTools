namespace VttTools.Library.Campaigns.Model;

public class Campaign {
    public Guid? EpicId { get; set; }
    public Guid OwnerId { get; set; }
    public Guid Id { get; set; } = Guid.CreateVersion7();
    [MaxLength(128)]
    public string Name { get; set; } = string.Empty;
    [MaxLength(4096)]
    public string Description { get; set; } = string.Empty;
    public Resource Background { get; init; } = null!;
    public bool IsPublished { get; set; }
    public bool IsPublic { get; set; }
    public List<Adventure> Adventures { get; set; } = [];
}