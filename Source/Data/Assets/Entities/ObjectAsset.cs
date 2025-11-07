namespace VttTools.Data.Assets.Entities;

public class ObjectAsset : Asset {
    public bool IsMovable { get; set; } = true;
    public bool IsOpaque { get; set; }
    public Guid? TriggerEffectId { get; set; }
}
