using Asset = VttTools.Data.Assets.Entities.Asset;
using Resource = VttTools.Data.Media.Entities.Resource;

namespace VttTools.Data.Library.Entities;

public class SceneAsset {
    public Guid SceneId { get; set; }
    public uint Index { get; set; }
    public Guid AssetId { get; set; }
    public Asset Asset { get; set; } = null!;

    [MaxLength(128)]
    public string Name { get; set; } = string.Empty;
    public uint Number { get; set; }

    public bool IsLocked { get; set; }
    public bool IsVisible { get; set; } = true;

    public Frame Frame { get; set; } = new Frame();
    public Guid? PortraitId { get; set; }
    public Resource? Portrait { get; set; }
    public Guid? TokenId { get; set; }
    public Resource? Token { get; set; }

    public NamedSize Size { get; set; } = NamedSize.Default;
    public Position Position { get; set; } = Position.Zero;
    public float Rotation { get; set; }
    public float Elevation { get; set; }

    public Guid? ControlledBy { get; set; }

    [MaxLength(4096)]
    public string? Notes { get; set; }
}