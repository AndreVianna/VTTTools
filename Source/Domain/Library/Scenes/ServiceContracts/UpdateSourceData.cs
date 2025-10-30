namespace VttTools.Library.Scenes.ServiceContracts;

public record UpdateSourceData
    : Data {
    [MaxLength(128)]
    public string Name { get; init; } = string.Empty;
    [MaxLength(4096)]
    public string? Description { get; init; }
    [MaxLength(64)]
    public string SourceType { get; init; } = string.Empty;
    public decimal DefaultRange { get; init; } = 5.0m;
    public decimal DefaultIntensity { get; init; } = 1.0m;
    public bool DefaultIsGradient { get; init; } = true;

    public override Result Validate(IMap? context = null) {
        var result = base.Validate(context);
        if (string.IsNullOrWhiteSpace(Name))
            result += new Error("Source name is required.", nameof(Name));
        if (Name.Length > 128)
            result += new Error("Source name must not exceed 128 characters.", nameof(Name));
        if (Description?.Length > 4096)
            result += new Error("Source description must not exceed 4096 characters.", nameof(Description));
        if (string.IsNullOrWhiteSpace(SourceType))
            result += new Error("Source type is required.", nameof(SourceType));
        if (SourceType.Length > 64)
            result += new Error("Source type must not exceed 64 characters.", nameof(SourceType));
        if (DefaultRange <= 0)
            result += new Error("Default range must be greater than 0.", nameof(DefaultRange));
        if (DefaultRange > 99.99m)
            result += new Error("Default range must not exceed 99.99.", nameof(DefaultRange));
        if (DefaultIntensity is < 0 or > 1.0m)
            result += new Error("Default intensity must be between 0.0 and 1.0.", nameof(DefaultIntensity));
        return result;
    }
}