using Resource = VttTools.Data.Media.Entities.Resource;

namespace VttTools.Data.Assets.Entities;

/// <summary>
/// EF Core entity for reusable effect templates (light, fog, weather, sounds)
/// </summary>
public class Effect {
    public Guid Id { get; set; } = Guid.CreateVersion7();
    public Guid OwnerId { get; set; }
    [MaxLength(128)]
    public string Name { get; set; } = string.Empty;
    [MaxLength(4096)]
    public string? Description { get; set; }
    public EffectShape Shape { get; set; }
    public double Size { get; set; }
    public double? Direction { get; set; }
    public bool BoundedByStructures { get; set; }
    public Guid? ResourceId { get; set; }
    public Resource? Resource { get; set; }
    [MaxLength(32)]
    public string? Category { get; set; }
    public DateTime CreatedAt { get; set; }
}