using Resource = VttTools.Data.Resources.Entities.Resource;

namespace VttTools.Data.Library.Entities;

public class Adventure {
    public Guid? CampaignId { get; set; }
    public Campaign? Campaign { get; set; }
    public Guid Id { get; set; } = Guid.CreateVersion7();
    public Guid OwnerId { get; set; }
    [MaxLength(128)]
    public string Name { get; set; } = string.Empty;
    public AdventureType Type { get; set; }
    [MaxLength(4096)]
    public string Description { get; set; } = string.Empty;
    public Guid DisplayId { get; set; }
    public Resource Display { get; set; } = new();
    public bool IsPublished { get; set; }
    public bool IsPublic { get; set; }
    public ICollection<Scene> Scenes { get; set; } = [];
}