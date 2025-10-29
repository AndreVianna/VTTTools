namespace VttTools.Library.Scenes.ServiceContracts;

public record CreateBarrierData
    : Data {
    [MaxLength(128)]
    public string Name { get; init; } = string.Empty;
    [MaxLength(4096)]
    public string? Description { get; init; }
    public bool IsOpaque { get; init; } = true;
    public bool IsSolid { get; init; } = true;
    public bool IsSecret { get; init; }
    public bool IsOpenable { get; init; }
    public bool IsLocked { get; init; }

    public override Result Validate(IMap? context = null) {
        var result = base.Validate(context);
        if (string.IsNullOrWhiteSpace(Name))
            result += new Error("Barrier name is required.", nameof(Name));
        if (Name.Length > 128)
            result += new Error("Barrier name must not exceed 128 characters.", nameof(Name));
        if (Description?.Length > 4096)
            result += new Error("Barrier description must not exceed 4096 characters.", nameof(Description));
        return result;
    }
}
