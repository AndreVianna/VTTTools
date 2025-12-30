using Adventure = VttTools.Data.Library.Adventures.Entities.Adventure;
using Resource = VttTools.Data.Media.Entities.Resource;
using World = VttTools.Data.Library.Worlds.Entities.World;

namespace VttTools.Data.Library.Campaigns.Entities;

public class Campaign {
    public Guid? WorldId { get; set; }
    public World? World { get; set; }
    public Guid OwnerId { get; set; }
    public Guid Id { get; set; } = Guid.CreateVersion7();
    [MaxLength(128)]
    public string Name { get; set; } = string.Empty;
    [MaxLength(4096)]
    public string Description { get; set; } = string.Empty;

    public Guid? BackgroundId { get; set; }
    public Resource? Background { get; set; }

    public ICollection<Adventure> Adventures { get; set; } = [];

    public bool IsPublished { get; set; }
    public bool IsPublic { get; set; }
}