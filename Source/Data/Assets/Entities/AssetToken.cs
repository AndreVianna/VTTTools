using Resource = VttTools.Data.Media.Entities.Resource;

namespace VttTools.Data.Assets.Entities;

public class AssetToken {
    public Guid AssetId { get; set; }
    public Asset Asset { get; set; } = null!;
    public Guid TokenId { get; set; }
    public Resource Token { get; set; } = null!;
    public int Index { get; set; }
}