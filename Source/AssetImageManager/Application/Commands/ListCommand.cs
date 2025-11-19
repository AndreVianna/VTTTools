namespace VttTools.AssetImageManager.Application.Commands;

public sealed class ListCommand(IImageStore store) {
    private readonly IImageStore _store = store;

    public async Task ExecuteAsync(ListTokensOptions options, CancellationToken ct = default) {
        var categoryFilter = options.TypeFilter switch {
            EntityType.Creature => "creature",
            EntityType.Object => "object",
            EntityType.Character => "character",
            _ => null
        };

        var summaries = await _store.GetEntitySummariesAsync(categoryFilter, null, null, ct);

        if (!string.IsNullOrWhiteSpace(options.IdOrName)) {
            var filter = options.IdOrName.Trim();
            summaries = [.. summaries.Where(s => string.Equals(s.Name, filter, StringComparison.OrdinalIgnoreCase))];
        }

        if (summaries.Count == 0) {
            Console.WriteLine("No entities found matching the filters.");
            return;
        }

        Console.WriteLine();
        Console.WriteLine($"Found {summaries.Count} entities:");
        Console.WriteLine();
        Console.WriteLine($"{"Name",-24} {"Genre",-12} {"Category",-12} {"Type",-16} {"Subtype",-16} {"Variants",-10} Poses");
        Console.WriteLine(new string('-', 112));

        foreach (var summary in summaries.OrderBy(s => s.Genre).ThenBy(s => s.Category).ThenBy(s => s.Type).ThenBy(s => s.Subtype).ThenBy(s => s.Name)) {
            Console.WriteLine($"{summary.Name,-24} {summary.Genre,-12} {summary.Category,-12} {summary.Type,-16} {summary.Subtype,-16} {summary.VariantCount,-10} {summary.TotalPoseCount}");
        }

        Console.WriteLine();
        Console.WriteLine($"Total: {summaries.Count} entities, {summaries.Sum(s => s.VariantCount)} variants, {summaries.Sum(s => s.TotalPoseCount)} poses");
    }
}
