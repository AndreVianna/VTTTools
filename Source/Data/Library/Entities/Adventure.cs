using Resource = VttTools.Data.Media.Entities.Resource;

namespace VttTools.Data.Library.Entities;

public class Adventure {
    public Guid? CampaignId { get; set; }
    public Campaign? Campaign { get; set; }
    public Guid OwnerId { get; set; }
    public Guid Id { get; set; } = Guid.CreateVersion7();
    [MaxLength(128)]
    public string Name { get; set; } = string.Empty;
    public AdventureStyle Style { get; set; }
    [MaxLength(4096)]
    public string Description { get; set; } = string.Empty;
    public Guid? BackgroundId { get; set; }
    public Resource Background { get; set; } = null!;
    public bool IsOneShot { get; set; }
    public bool IsPublished { get; set; }
    public bool IsPublic { get; set; }
    public ICollection<Scene> Scenes { get; set; } = [];
}