namespace VttTools.AssetImageManager.Application.Commands;

public sealed class ShowCommand(IImageStore store) {
    private readonly IImageStore _store = store;

    public async Task ExecuteAsync(ShowTokenOptions options, CancellationToken ct = default) {
        var allSummaries = await _store.GetEntitySummariesAsync(null, null, null, ct);

        var matchingSummary = allSummaries.FirstOrDefault(s =>
            string.Equals(s.Name, options.Id, StringComparison.OrdinalIgnoreCase));

        if (matchingSummary is null) {
            Console.WriteLine($"No entity found with name '{options.Id}'.");
            return;
        }

        var entityInfo = await _store.GetEntityInfoAsync(
            matchingSummary.Genre,
            matchingSummary.Category,
            matchingSummary.Type,
            matchingSummary.Subtype,
            matchingSummary.Name,
            ct);

        if (entityInfo is null) {
            Console.WriteLine($"Error: Could not load details for entity '{options.Id}'.");
            return;
        }

        Console.WriteLine();
        Console.WriteLine($"Entity: {entityInfo.Name}");
        Console.WriteLine($"Genre: {entityInfo.Genre}");
        Console.WriteLine($"Category: {entityInfo.Category}");
        Console.WriteLine($"Type: {entityInfo.Type}");
        Console.WriteLine($"Subtype: {entityInfo.Subtype}");
        Console.WriteLine();
        Console.WriteLine($"Total Variants: {entityInfo.Variants.Count}");
        Console.WriteLine($"Total Poses: {entityInfo.Variants.Sum(v => v.Poses.Count)}");
        Console.WriteLine();

        foreach (var variant in entityInfo.Variants.OrderBy(v => v.VariantId)) {
            Console.WriteLine($"Variant: {variant.VariantId} ({variant.Poses.Count} poses)");

            foreach (var pose in variant.Poses.OrderBy(p => p.PoseNumber)) {
                var sizeKb = pose.FileSizeBytes / 1024.0;
                Console.WriteLine($"  Pose {pose.PoseNumber}: {Path.GetFileName(pose.FilePath)} ({sizeKb:F1} KB, created {pose.CreatedUtc:yyyy-MM-dd HH:mm:ss} UTC)");
            }

            Console.WriteLine();
        }
    }
}
