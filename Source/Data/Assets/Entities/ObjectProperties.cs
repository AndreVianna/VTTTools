namespace VttTools.Data.Assets.Entities;

public class ObjectProperties {
    public double CellWidth { get; set; } = 1;
    public double CellHeight { get; set; } = 1;
    public bool IsMovable { get; set; } = true;
    public bool IsOpaque { get; set; }
    public Guid? TriggerEffectId { get; set; }
}