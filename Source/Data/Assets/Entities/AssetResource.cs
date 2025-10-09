using Resource = VttTools.Data.Media.Entities.Resource;

namespace VttTools.Data.Assets.Entities;

/// <summary>
/// Entity representing the association between an Asset and a Resource with role information
/// Owned entity stored as JSON in the Assets table
/// </summary>
public class AssetResource {
    public Guid ResourceId { get; set; }
    public Resource? Resource { get; set; }
    public ResourceRole Role { get; set; }
    public bool IsDefault { get; set; }
}
