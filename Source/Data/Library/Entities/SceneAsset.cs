using Asset = VttTools.Data.Assets.Entities.Asset;
using Position = VttTools.Common.Model.Position;
using Resource = VttTools.Data.Media.Entities.Resource;
using NamedSize = VttTools.Common.Model.NamedSize;

namespace VttTools.Data.Library.Entities;

public class SceneAsset {
    public Guid SceneId { get; set; }
    public uint Index { get; set; }
    public Guid AssetId { get; set; }
    public Asset Asset { get; set; } = null!;
    public uint Number { get; set; }

    // Overridable properties (nullable = use template if null)
    [MaxLength(128)]
    public string Name { get; set; } = string.Empty;
    [MaxLength(4096)]
    public string? Description { get; set; }  // Override template description
    public Guid ResourceId { get; set; }  // REQUIRED - must select from Asset.Resources
    public Resource? Resource { get; set; }  // Navigation property for selected resource

    // Instance-specific data
    public Frame Frame { get; set; } = new Frame();
    public NamedSize Size { get; set; } = NamedSize.Zero;
    public Position Position { get; set; } = Position.Zero;
    public float Rotation { get; set; }
    public float Elevation { get; set; }
    public bool IsLocked { get; set; }
    public bool IsVisible { get; set; } = true;
    public Guid? ControlledBy { get; set; }
}