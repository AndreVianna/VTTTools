using Resource = VttTools.Data.Media.Entities.Resource;

namespace VttTools.Data.Assets.Entities;

public class AssetResource {
    public Guid AssetId { get; set; }
    public Asset Asset { get; set; } = null!;
    public Guid ResourceId { get; set; }
    public Resource Resource { get; set; } = null!;
    public ResourceRole Role { get; set; }
    public int Index { get; set; }
}
