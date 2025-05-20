using Asset = VttTools.Data.Assets.Entities.Asset;

namespace VttTools.Data.Library.Entities;

public class SceneAsset {
    public Guid SceneId { get; set; }
    public Guid AssetId { get; set; }
    public uint Number { get; set; }
    public Asset Asset { get; set; } = null!;
    [MaxLength(128)]
    public string Name { get; set; } = string.Empty;
    public Vector2 Position { get; set; }
    public Vector2 Scale { get; set; } = new(1.0f, 1.0f);
    public float Rotation { get; set; }
    public float Elevation { get; set; }
    public bool IsLocked { get; set; }
    public Guid? ControlledBy { get; set; }
}