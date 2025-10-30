namespace VttTools.Library.Scenes.ServiceContracts;

public record UpdateBarrierData
    : Data {
    [MaxLength(128)]
    public string Name { get; init; } = string.Empty;
    [MaxLength(4096)]
    public string? Description { get; init; }
    public WallVisibility Visibility { get; init; } = WallVisibility.Normal;
    public bool IsClosed { get; init; }
    [MaxLength(64)]
    public string? Material { get; init; }

    public override Result Validate(IMap? context = null) {
        var result = base.Validate(context);
        if (string.IsNullOrWhiteSpace(Name))
            result += new Error("Barrier name is required.", nameof(Name));
        if (Name.Length > 128)
            result += new Error("Barrier name must not exceed 128 characters.", nameof(Name));
        if (Description?.Length > 4096)
            result += new Error("Barrier description must not exceed 4096 characters.", nameof(Description));
        if (Material?.Length > 64)
            result += new Error("Barrier material must not exceed 64 characters.", nameof(Material));
        return result;
    }
}