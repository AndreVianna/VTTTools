using Resource = VttTools.Data.Media.Entities.Resource;

namespace VttTools.Data.Library.Entities;

public class Campaign {
    public Guid? WorldId { get; set; }
    public World? World { get; set; }
    public Guid OwnerId { get; set; }
    public Guid Id { get; set; } = Guid.CreateVersion7();
    [MaxLength(128)]
    public string Name { get; set; } = string.Empty;
    [MaxLength(4096)]
    public string Description { get; set; } = string.Empty;
    public bool IsPublished { get; set; }
    public bool IsPublic { get; set; }
    public ICollection<Adventure> Adventures { get; set; } = [];
    public ICollection<CampaignResource> Resources { get; set; } = [];
}