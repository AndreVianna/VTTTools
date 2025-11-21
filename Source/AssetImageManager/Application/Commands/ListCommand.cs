namespace VttTools.AssetImageManager.Application.Commands;

public sealed class ListCommand(IFileStore store) {
    private readonly IFileStore _store = store;

    private static readonly JsonSerializerOptions _jsonOptions = new() {
        PropertyNameCaseInsensitive = true,
        MaxDepth = 32
    };

    public async Task ExecuteAsync(ListTokensOptions options, CancellationToken ct = default) {
        List<EntitySummary> summaries;

        if (!string.IsNullOrWhiteSpace(options.ImportPath)) {
            summaries = await LoadSummariesFromJsonAsync(options.ImportPath, options.TypeFilter, ct);
        }
        else {
            var categoryFilter = options.TypeFilter switch {
                EntityType.Creature => "creature",
                EntityType.Object => "object",
                EntityType.Character => "character",
                _ => null
            };

            summaries = [.. await _store.GetEntitySummariesAsync(categoryFilter, null, null, ct)];
        }

        if (!string.IsNullOrWhiteSpace(options.IdOrName)) {
            var filter = options.IdOrName.Trim();
            summaries = [.. summaries.Where(s => string.Equals(s.Name, filter, StringComparison.OrdinalIgnoreCase))];
        }

        if (summaries.Count == 0) {
            ConsoleOutput.WriteLine("No entities found matching the filters.");
            return;
        }

        ConsoleOutput.WriteBlankLine();
        ConsoleOutput.WriteLine($"Found {summaries.Count} entities:");
        ConsoleOutput.WriteBlankLine();
        ConsoleOutput.WriteLine($"{"Name",-24} {"Genre",-12} {"Category",-12} {"Type",-16} {"Subtype",-16} {"Variants",-10} Poses");
        ConsoleOutput.WriteLine(new string('-', 112));

        foreach (var summary in summaries.OrderBy(s => s.Genre).ThenBy(s => s.Category).ThenBy(s => s.Type).ThenBy(s => s.Subtype).ThenBy(s => s.Name)) {
            ConsoleOutput.WriteLine($"{summary.Name,-24} {summary.Genre,-12} {summary.Category,-12} {summary.Type,-16} {summary.Subtype,-16} {summary.VariantCount,-10} {summary.TotalPoseCount}");
        }

        ConsoleOutput.WriteBlankLine();
        ConsoleOutput.WriteLine($"Total: {summaries.Count} entities, {summaries.Sum(s => s.VariantCount)} variants, {summaries.Sum(s => s.TotalPoseCount)} poses");
    }

    private static async Task<List<EntitySummary>> LoadSummariesFromJsonAsync(string path, EntityType? typeFilter, CancellationToken ct) {
        if (!File.Exists(path)) {
            ConsoleOutput.WriteError($"Error: File not found: {path}");
            return [];
        }

        var json = await File.ReadAllTextAsync(path, ct);
        var entities = JsonSerializer.Deserialize<List<EntryDefinition>>(json, _jsonOptions);

        if (entities is null || entities.Count == 0) {
            ConsoleOutput.WriteLine("No entities found in import file.");
            return [];
        }

        var categoryFilter = typeFilter switch {
            EntityType.Creature => "Creature",
            EntityType.Object => "Object",
            EntityType.Character => "Character",
            _ => null
        };

        return [.. entities
            .Where(e => categoryFilter == null || string.Equals(e.Category, categoryFilter, StringComparison.OrdinalIgnoreCase))
            .Select(CreateSummaryFromEntity)];
    }

    private static EntitySummary CreateSummaryFromEntity(EntryDefinition entity) {
        var variantCount = 1;
        var totalPoseCount = GetImageTypeCount(entity.Category);

        if (entity.Alternatives is { Count: > 0 }) {
            variantCount = entity.Alternatives
                .Sum(alt => VariantExpander.ExpandAlternatives(alt).Count)
;
            totalPoseCount *= variantCount;
        }

        return new EntitySummary(
            Genre: entity.Genre ?? "Unknown",
            Category: entity.Category ?? "Unknown",
            Type: entity.Type ?? "Unknown",
            Subtype: entity.Subtype ?? "Unknown",
            Name: entity.Name ?? "Unnamed",
            VariantCount: variantCount,
            TotalPoseCount: totalPoseCount
        );
    }

    private static int GetImageTypeCount(string? category) => category?.ToLowerInvariant() switch {
        "creature" => 3,
        "character" => 2,
        "object" => 1,
        _ => 1
    };
}
