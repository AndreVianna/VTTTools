namespace VttTools.AssetImageManager.Domain.Tokens.ServiceContracts;

/// <summary>
/// Represents a simplified entity definition for token generation.
/// Supports creatures (monsters, NPCs, characters) and objects (equipment, items).
/// Replaces the complex MonsterDefinition schema with a more flexible approach.
/// </summary>
public sealed partial record EntryDefinition
    : Data {
    public string Name { get; init; } = string.Empty;
    public string Genre { get; init; } = string.Empty;
    public string Category { get; init; } = string.Empty;
    public string Type { get; init; } = string.Empty;
    public string Subtype { get; init; } = string.Empty;
    public string PhysicalDescription { get; init; } = string.Empty;
    public string? DistinctiveFeatures { get; init; }
    public string? Environment { get; init; }
    public IReadOnlyList<AlternativeDefinition> Alternatives { get; init; } = [];
    public int SchemaVersion { get; init; } = 1;

    public override Result Validate(IMap? context = null) {
        var result = base.Validate(context);

        if (SchemaVersion != 1)
            result += new Error("Only schema version 1 is currently supported.", nameof(SchemaVersion));

        if (string.IsNullOrWhiteSpace(Name))
            result += new Error("The entity name cannot be null or empty.", nameof(Name));
        else if (Name.Length > 128)
            result += new Error("The entity name cannot exceed 128 characters.", nameof(Name));
        else if (!EntityName().IsMatch(Name))
            result += new Error("The entity name can only contain alphanumeric characters and spaces.", nameof(Name));

        var genre = string.IsNullOrWhiteSpace(Genre) ? "Fantasy" : Genre;
        if (genre.Length > 64)
            result += new Error("The genre cannot exceed 64 characters.", nameof(Genre));
        else if (!EntityName().IsMatch(genre))
            result += new Error("The genre can only contain alphanumeric characters and spaces.", nameof(Genre));

        if (string.IsNullOrWhiteSpace(Category))
            result += new Error("The category cannot be null or empty.", nameof(Category));
        else if (Category is not "Creature" and not "Object" and not "Character")
            result += new Error("The category must be 'Creature', 'Object', or 'Character'.", nameof(Category));

        if (string.IsNullOrWhiteSpace(Type))
            result += new Error("The type cannot be null or empty.", nameof(Type));
        else if (Type.Length > 50)
            result += new Error("The type cannot exceed 50 characters.", nameof(Type));

        if (string.IsNullOrWhiteSpace(Subtype))
            result += new Error("The subtype cannot be null or empty.", nameof(Subtype));
        else if (Subtype.Length > 50)
            result += new Error("The subtype cannot exceed 50 characters.", nameof(Subtype));

        if (string.IsNullOrWhiteSpace(PhysicalDescription))
            result += new Error("The physical description cannot be null or empty.", nameof(PhysicalDescription));
        else if (PhysicalDescription.Length > 2048)
            result += new Error("The physical description cannot exceed 2048 characters.", nameof(PhysicalDescription));

        if (DistinctiveFeatures?.Length > 1024)
            result += new Error("The distinctive features cannot exceed 1024 characters.", nameof(DistinctiveFeatures));

        if (Environment?.Length > 256)
            result += new Error("The environment cannot exceed 256 characters.", nameof(Environment));

        foreach (var alternative in Alternatives) {
            result += alternative.Validate(context);
        }

        return result;
    }

    [GeneratedRegex("^[a-zA-Z0-9 ]+$")]
    private static partial Regex EntityName();
}
