namespace VttTools.Data.Assets.Entities;

/// <summary>
/// EF Core entity for Object assets (furniture, traps, containers)
/// </summary>
public class ObjectAsset : Asset {
    /// <summary>
    /// Object-specific properties (stored as JSON)
    /// </summary>
    public ObjectProperties Properties { get; set; } = new();
}

/// <summary>
/// Properties for Object assets (serialized to JSON column)
/// </summary>
public class ObjectProperties {
    public double CellWidth { get; set; } = 1;
    public double CellHeight { get; set; } = 1;
    public bool IsMovable { get; set; } = true;
    public bool IsOpaque { get; set; }
    public Guid? TriggerEffectId { get; set; }
}