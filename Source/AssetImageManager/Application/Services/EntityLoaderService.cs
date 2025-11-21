namespace VttTools.AssetImageManager.Application.Services;

public sealed class EntityLoaderService : IEntityLoaderService {
    private static readonly JsonSerializerOptions _jsonOptions = new() {
        PropertyNameCaseInsensitive = true,
        MaxDepth = 32
    };

    public async Task<EntityLoadResult> LoadAndValidateAsync(
        string inputPath,
        EntityOutputOptions? options = null,
        CancellationToken ct = default) {

        options ??= new EntityOutputOptions();

        var entities = await DeserializeEntitiesAsync(inputPath, ct);
        if (entities is null || entities.Count == 0) {
            ConsoleOutput.WriteLine("No entities found in file.");
            return new EntityLoadResult(false, new Dictionary<EntryDefinition, IReadOnlyList<StructuralVariant>>(), 0);
        }

        WriteEntityCount(entities.Count);

        var (validEntries, totalVariants, hasErrors) = ValidateAndExpandEntities(entities, options);

        ConsoleOutput.WriteBlankLine();
        return new EntityLoadResult(hasErrors, validEntries, totalVariants);
    }

    private static async Task<List<EntryDefinition>?> DeserializeEntitiesAsync(string path, CancellationToken ct) {
        var json = await File.ReadAllTextAsync(path, ct);
        return JsonSerializer.Deserialize<List<EntryDefinition>>(json, _jsonOptions);
    }

    private static void WriteEntityCount(int count) {
        ConsoleOutput.WriteLine($"Found {count} entities");
        ConsoleOutput.WriteBlankLine();
    }

    private static (
        IReadOnlyDictionary<EntryDefinition, IReadOnlyList<StructuralVariant>> validEntries,
        int totalVariants,
        bool hasErrors) ValidateAndExpandEntities(
            List<EntryDefinition> entities,
            EntityOutputOptions options) {

        var hasErrors = false;
        var validEntries = new Dictionary<EntryDefinition, IReadOnlyList<StructuralVariant>>();
        var totalVariants = 0;

        foreach (var entity in entities) {
            if (!ValidateEntity(entity)) {
                hasErrors = true;
                continue;
            }

            var variants = ExpandVariants(entity);
            validEntries[entity] = variants;
            totalVariants += variants.Count;

            WriteEntitySuccess(entity, variants, options);
        }

        return (validEntries, totalVariants, hasErrors);
    }

    private static bool ValidateEntity(EntryDefinition entity) {
        var validationResult = entity.Validate();
        if (!validationResult.HasErrors) return true;

        WriteValidationErrors(entity.Name, validationResult.Errors);
        return false;
    }

    private static void WriteValidationErrors(string? entityName, IEnumerable<Error> errors) {
        ConsoleOutput.WriteError($"✗ {entityName}:");
        foreach (var error in errors) {
            ConsoleOutput.WriteError($"  - {error.Message}");
        }
        ConsoleOutput.WriteBlankLine();
    }

    private static IReadOnlyList<StructuralVariant> ExpandVariants(EntryDefinition entity) {
        var variants = entity.Alternatives?
            .SelectMany(a => VariantExpander.ExpandAlternatives(a))
            .ToList() ?? [];

        if (variants.Count == 0) {
            variants.Add(new StructuralVariant("base", null, null, null, null, null, null, null));
        }

        return variants;
    }

    private static void WriteEntitySuccess(
        EntryDefinition entity,
        IReadOnlyList<StructuralVariant> variants,
        EntityOutputOptions options) {

        if (options.VerboseOutput) {
            WriteVerboseEntityInfo(entity, variants, options.ShowAllVariants);
        }
        else {
            WriteCompactEntityInfo(entity, variants);
        }
    }

    private static void WriteCompactEntityInfo(EntryDefinition entity, IReadOnlyList<StructuralVariant> variants)
        => ConsoleOutput.WriteLine($"✓ {entity.Category}: {entity.Name} {entity.Type} ({entity.Subtype}); Number of variants: {variants.Count}");

    private static void WriteVerboseEntityInfo(
        EntryDefinition entity,
        IReadOnlyList<StructuralVariant> variants,
        bool showAllVariants) {

        ConsoleOutput.WriteLine($"✓ {entity.Name}");
        ConsoleOutput.WriteLine($"  Type: {entity.Type}");
        ConsoleOutput.WriteLine($"  Category: {entity.Category}");
        ConsoleOutput.WriteLine($"  Variants: {variants.Count}");

        WriteVariantList(variants, showAllVariants);
        ConsoleOutput.WriteBlankLine();
    }

    private static void WriteVariantList(IReadOnlyList<StructuralVariant> variants, bool showAll) {
        const int maxVariantsToShow = 10;

        if (showAll || variants.Count <= maxVariantsToShow) {
            ConsoleOutput.WriteLine("  All variants:");
            foreach (var variant in variants) {
                ConsoleOutput.WriteLine($"    - {variant.VariantId}");
            }
        }
        else {
            WriteSampleVariants(variants, maxVariantsToShow);
        }
    }

    private static void WriteSampleVariants(IReadOnlyList<StructuralVariant> variants, int maxToShow) {
        ConsoleOutput.WriteLine("  Sample variants:");
        for (var i = 0; i < Math.Min(maxToShow, variants.Count); i++) {
            ConsoleOutput.WriteLine($"    - {variants[i].VariantId}");
        }

        if (variants.Count > maxToShow) {
            ConsoleOutput.WriteLine($"    ... and {variants.Count - maxToShow} more");
            ConsoleOutput.WriteLine("    (use --show-all to see all variants)");
        }
    }
}
