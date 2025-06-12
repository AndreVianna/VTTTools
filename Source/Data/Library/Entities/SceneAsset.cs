using Asset = VttTools.Data.Assets.Entities.Asset;
using Resource = VttTools.Data.Resources.Entities.Resource;

namespace VttTools.Data.Library.Entities;

public class SceneAsset {
    public Guid SceneId { get; set; }
    public Guid AssetId { get; set; }
    public uint Number { get; set; }
    public Asset Asset { get; set; } = null!;
    [MaxLength(128)]
    public string Name { get; set; } = string.Empty;
    public Guid DisplayId { get; set; }
    public Resource Display { get; set; } = new();
    public Point Position { get; set; }
    public float Scale { get; set; } = 1;
    public float Rotation { get; set; }
    public float Elevation { get; set; }
    public bool IsLocked { get; set; }
    public Guid? ControlledBy { get; set; }
}