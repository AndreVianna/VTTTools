using Asset = VttTools.Data.Assets.Entities.Asset;
using Resource = VttTools.Data.Media.Entities.Resource;

namespace VttTools.Data.Library.Entities;

public class SceneAsset {
    public Guid SceneId { get; set; }
    public uint Index { get; set; }
    public Guid AssetId { get; set; }
    public Asset Asset { get; set; } = null!;
    public uint Number { get; set; }
    [MaxLength(128)]
    public string Name { get; set; } = string.Empty;
    public Guid DisplayId { get; set; }
    public Resource Display { get; set; } = null!;
    public Frame? Frame { get; set; }
    public Size Size { get; set; }
    public Point Position { get; set; }
    public float Rotation { get; set; }
    public float Elevation { get; set; }
    public bool IsLocked { get; set; }
    public Guid? ControlledBy { get; set; }
}