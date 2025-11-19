namespace VttTools.AssetImageManager.Domain.Shared;

/// <summary>
/// Expands AlternativeDefinition into structural variants using cartesian product logic.
/// Example: Gender=[male,female] × Class=[warrior,mage] = 4 variants
/// </summary>
public static partial class VariantExpander {
    private const int _defaultMaxVariants = 10_000;
    private static readonly string[] _sourceArray = ["size", "gender", "class", "equipment", "armor", "material", "quality"];

    public static IReadOnlyList<StructuralVariant> ExpandAlternatives(
        AlternativeDefinition alternatives,
        int maxVariants = _defaultMaxVariants) {
        ArgumentNullException.ThrowIfNull(alternatives);

        var dimensions = new[] {
            (Name: "size", Values: alternatives.Size),
            (Name: "gender", Values: alternatives.Gender),
            (Name: "class", Values: alternatives.Class),
            (Name: "equipment", Values: alternatives.Equipment),
            (Name: "armor", Values: alternatives.Armor),
            (Name: "material", Values: alternatives.Material),
            (Name: "quality", Values: alternatives.Quality)
        };

        var activeDimensions = dimensions
            .Where(d => d.Values?.Count > 0)
            .ToList();

        if (activeDimensions.Count == 0) {
            return [new StructuralVariant("base", null, null, null, null, null, null, null)];
        }

        if (maxVariants <= 0) {
            throw new ArgumentException("Maximum variants must be greater than zero.", nameof(maxVariants));
        }

        var totalVariants = activeDimensions
            .Select(d => (long)d.Values!.Count)
            .Aggregate(1L, (acc, count) => acc * count);

        if (totalVariants > maxVariants) {
            throw new InvalidOperationException(
                $"Cartesian product would generate {totalVariants:N0} variants, " +
                $"which exceeds the safety limit of {maxVariants:N0}. " +
                "Consider reducing dimension sizes or splitting into multiple entities.");
        }

        var combinations = ComputeCartesianProduct(activeDimensions);
        var variants = new List<StructuralVariant>();
        var seenIds = new HashSet<string>();

        foreach (var combination in combinations) {
            var variantId = BuildVariantId(combination);

            if (!seenIds.Add(variantId)) {
                throw new InvalidOperationException($"Duplicate variant ID detected: {variantId}");
            }

            variants.Add(new StructuralVariant(
                variantId,
                combination.GetValueOrDefault("size"),
                combination.GetValueOrDefault("gender"),
                combination.GetValueOrDefault("class"),
                combination.GetValueOrDefault("equipment"),
                combination.GetValueOrDefault("armor"),
                combination.GetValueOrDefault("material"),
                combination.GetValueOrDefault("quality")
            ));
        }

        return variants;
    }

    private static IEnumerable<Dictionary<string, string>> ComputeCartesianProduct(
        List<(string Name, IReadOnlyList<string>? Values)> dimensions) {
        if (dimensions.Count == 0) {
            yield return [];
            yield break;
        }

        var indices = new int[dimensions.Count];
        var maxIndices = dimensions.Select(d => d.Values!.Count).ToArray();

        while (true) {
            var combination = new Dictionary<string, string>();
            for (var i = 0; i < dimensions.Count; i++) {
                combination[dimensions[i].Name] = dimensions[i].Values![indices[i]];
            }

            yield return combination;

            var position = dimensions.Count - 1;
            while (position >= 0) {
                indices[position]++;
                if (indices[position] < maxIndices[position]) {
                    break;
                }

                indices[position] = 0;
                position--;
            }

            if (position < 0) {
                break;
            }
        }
    }

    private static string BuildVariantId(Dictionary<string, string> combination) {
        var orderedParts = _sourceArray.Select(key => combination.GetValueOrDefault(key))
            .Where(value => value is not null)
            .Select(value => SanitizeVariantValue(value!));

        return string.Join("-", orderedParts);
    }

    /// <summary>
    /// Validates and sanitizes a variant value to ensure it's safe for use in file paths.
    /// Applies special case replacements, converts to lowercase, and removes unsafe characters.
    /// </summary>
    /// <param name="value">The variant value to sanitize</param>
    /// <returns>Sanitized value safe for file paths</returns>
    /// <exception cref="ArgumentException">If value is empty or whitespace</exception>
    private static string SanitizeVariantValue(string value) {
        if (string.IsNullOrWhiteSpace(value)) {
            throw new ArgumentException("Variant value cannot be empty or whitespace.", nameof(value));
        }

        var sanitized = value.ToLowerInvariant();

        // Apply special case replacements before general cleanup
        sanitized = sanitized.Replace(" and ", "+");
        sanitized = sanitized.Replace(" & ", "+");

        // Replace remaining spaces with hyphens
        sanitized = sanitized.Replace(' ', '-');

        // Remove any characters not in [a-z0-9_+-]
        sanitized = SafeFileNameChars().Replace(sanitized, "");

        // Collapse multiple consecutive hyphens into single hyphen
        sanitized = MultipleHyphens().Replace(sanitized, "-");

        // Remove leading/trailing hyphens
        sanitized = sanitized.Trim('-');

        return string.IsNullOrEmpty(sanitized)
            ? throw new ArgumentException(
                $"Variant value '{value}' contains no valid characters after sanitization.",
                nameof(value))
            : sanitized;
    }

    [GeneratedRegex(@"[^a-z0-9_+-]")]
    private static partial Regex SafeFileNameChars();

    [GeneratedRegex(@"-{2,}")]
    private static partial Regex MultipleHyphens();
}
