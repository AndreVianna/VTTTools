namespace VttTools.AssetImageManager.Domain.Tokens.ServiceContracts;

/// <summary>
/// Defines cartesian product alternatives for entity variants.
/// Each non-null collection represents a dimension in the variant space.
/// Example: Gender=[male, female] × Class=[warrior, mage] produces 4 structural variants.
/// For creatures: Gender, Class, Equipment, Vestiment are common.
/// For objects: Material, Quality are common.
/// </summary>
public sealed partial record AlternativeDefinition
    : Data {
    public IReadOnlyList<string>? Size { get; init; }
    public IReadOnlyList<string>? Gender { get; init; }
    public IReadOnlyList<string>? Class { get; init; }
    public IReadOnlyList<string>? Equipment { get; init; }
    public IReadOnlyList<string>? Armor { get; init; }
    public IReadOnlyList<string>? Material { get; init; }
    public IReadOnlyList<string>? Quality { get; init; }

    public override Result Validate(IMap? context = null) {
        var result = base.Validate(context);

        var hasAnyDimension = Size is not null
                           || Gender is not null
                           || Class is not null
                           || Equipment is not null
                           || Armor is not null
                           || Material is not null
                           || Quality is not null;

        if (!hasAnyDimension)
            result += new Error("At least one dimension (Size, Gender, Class, Equipment, Vestiment, Material, or Quality) must be specified.");

        result += ValidateDimension(Size, nameof(Size), requireLowercase: true);
        result += ValidateDimension(Gender, nameof(Gender), requireLowercase: true);
        result += ValidateDimension(Class, nameof(Class), requireLowercase: true);
        result += ValidateDimension(Equipment, nameof(Equipment));
        result += ValidateDimension(Armor, nameof(Armor));
        result += ValidateDimension(Material, nameof(Material));
        result += ValidateDimension(Quality, nameof(Quality));

        return result;
    }

    private static Result ValidateDimension(IReadOnlyList<string>? dimension, string dimensionName, bool requireLowercase = false) {
        var result = Result.Success();

        if (dimension is null)
            return result;

        if (dimension.Count == 0)
            result += new Error($"{dimensionName} must have at least one item when specified.", dimensionName);

        var uniqueItems = new HashSet<string>();
        for (var i = 0; i < dimension.Count; i++) {
            var item = dimension[i];

            if (string.IsNullOrWhiteSpace(item)) {
                result += new Error($"{dimensionName}[{i}] cannot be null or empty.", $"{dimensionName}[{i}]");
            }
            else {
                if (!uniqueItems.Add(item))
                    result += new Error($"{dimensionName}[{i}] is a duplicate value: '{item}'.", $"{dimensionName}[{i}]");

                if (requireLowercase && !DimensionName().IsMatch(item))
                    result += new Error($"{dimensionName}[{i}] must contain only lowercase letters: '{item}'.", $"{dimensionName}[{i}]");
            }
        }

        return result;
    }

    [GeneratedRegex("^[a-z]+$")]
    private static partial Regex DimensionName();
}
