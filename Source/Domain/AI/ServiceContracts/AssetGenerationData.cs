namespace VttTools.AI.ServiceContracts;

public sealed record AssetGenerationData
    : Data {
    public required string Name { get; init; }
    public AssetKind Kind { get; init; } = AssetKind.Creature;
    public Guid? TemplateId { get; init; }
    public bool GeneratePortrait { get; init; } = true;
    public bool GenerateToken { get; init; } = true;
    public string? GenerationType { get; init; }
    public required string Category { get; init; }
    public required string Type { get; init; }
    public string? Subtype { get; init; }
    public string Size { get; init; } = "medium";
    public string? Environment { get; init; }
    public string Description { get; init; } = string.Empty;
    public string[] Tags { get; init; } = [];

    public override Result Validate(IMap? context = null) {
        var result = base.Validate(context);
        if (string.IsNullOrWhiteSpace(Name))
            result += new Error("Name is required.", nameof(Name));
        if (string.IsNullOrWhiteSpace(Category))
            result += new Error("Category is required.", nameof(Category));
        if (string.IsNullOrWhiteSpace(Type))
            result += new Error("Type is required.", nameof(Type));
        return result;
    }
}