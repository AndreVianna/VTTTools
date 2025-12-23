using Resource = VttTools.Data.Media.Entities.Resource;

namespace VttTools.Data.Library.Entities;

public class CampaignResource {
    public Guid CampaignId { get; set; }
    public Campaign Campaign { get; set; } = null!;
    public Guid ResourceId { get; set; }
    public Resource Resource { get; set; } = null!;
    public ResourceRole Role { get; set; }
    public ushort Index { get; set; }
}
