using Asset = VttTools.Data.Assets.Entities.Asset;
using Resource = VttTools.Data.Media.Entities.Resource;
using Size = VttTools.Common.Model.Size;
using Position = VttTools.Common.Model.Position;

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
    public Guid? ResourceId { get; set; }  // Override template resource
    public Resource? Resource { get; set; }  // Navigation property for override resource

    // Instance-specific data
    public Frame? Frame { get; set; }
    public Size Size { get; set; }
    public Position Position { get; set; }
    public float Rotation { get; set; }
    public float Elevation { get; set; }
    public bool IsLocked { get; set; }
    public Guid? ControlledBy { get; set; }
}