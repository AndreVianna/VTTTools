namespace VttTools.Assets.ServiceContracts;

public record ObjectData {
    public bool IsMovable { get; init; } = true;
    public bool IsOpaque { get; init; }
    public Guid? TriggerEffectId { get; init; }
}
