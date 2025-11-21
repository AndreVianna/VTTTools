namespace VttTools.AssetImageManager.Application.Commands;

public sealed class ShowCommand(IFileStore store) {
    private readonly IFileStore _store = store;

    public async Task ExecuteAsync(ShowTokenOptions options, CancellationToken ct = default) {
        var allSummaries = await _store.GetEntitySummariesAsync(null, null, null, ct);

        var matchingSummary = allSummaries.FirstOrDefault(s =>
            string.Equals(s.Name, options.Id, StringComparison.OrdinalIgnoreCase));

        if (matchingSummary is null) {
            ConsoleOutput.WriteLine($"No entity found with name '{options.Id}'.");
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
            ConsoleOutput.WriteLine($"Error: Could not load details for entity '{options.Id}'.");
            return;
        }

        ConsoleOutput.WriteBlankLine();
        ConsoleOutput.WriteLine($"Entity: {entityInfo.Name}");
        ConsoleOutput.WriteLine($"Genre: {entityInfo.Genre}");
        ConsoleOutput.WriteLine($"Category: {entityInfo.Category}");
        ConsoleOutput.WriteLine($"Type: {entityInfo.Type}");
        ConsoleOutput.WriteLine($"Subtype: {entityInfo.Subtype}");
        ConsoleOutput.WriteBlankLine();
        ConsoleOutput.WriteLine($"Total Variants: {entityInfo.Variants.Count}");
        ConsoleOutput.WriteLine($"Total Poses: {entityInfo.Variants.Sum(v => v.Poses.Count)}");
        ConsoleOutput.WriteBlankLine();

        foreach (var variant in entityInfo.Variants.OrderBy(v => v.VariantId)) {
            ConsoleOutput.WriteLine($"Variant: {variant.VariantId} ({variant.Poses.Count} poses)");

            foreach (var pose in variant.Poses.OrderBy(p => p.PoseNumber)) {
                var sizeKb = pose.FileSizeBytes / 1024.0;
                ConsoleOutput.WriteLine($"  Pose {pose.PoseNumber}: {Path.GetFileName(pose.FilePath)} ({sizeKb:F1} KB, created {pose.CreatedUtc:yyyy-MM-dd HH:mm:ss} UTC)");
            }

            ConsoleOutput.WriteBlankLine();
        }
    }
}
