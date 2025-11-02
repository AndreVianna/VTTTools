using Resource = VttTools.Data.Media.Entities.Resource;

namespace VttTools.Data.Assets.Entities;

public class AssetResource {
    public Guid ResourceId { get; set; }
    public Resource? Resource { get; set; }
    public ResourceRole Role { get; set; }
}
