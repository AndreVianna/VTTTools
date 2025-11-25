namespace VttTools.AssetImageManager.Application.Commands;

public sealed class ListCommand(IFileStore store) {
    private readonly IFileStore _store = store;

    private static readonly JsonSerializerOptions _jsonOptions = new() {
        PropertyNameCaseInsensitive = true,
        MaxDepth = 32
    };

    public async Task ExecuteAsync(ListTokensOptions options, CancellationToken ct = default) {
        var assets = !string.IsNullOrWhiteSpace(options.ImportPath)
            ? await LoadSummariesFromJsonAsync(options.ImportPath, options.KindFilter, ct)
            : [.. _store.GetAssets(kindFilter: options.KindFilter)];

        if (!string.IsNullOrWhiteSpace(options.Name)) {
            var filter = options.Name.Trim();
            assets = [.. assets.Where(s => string.Equals(s.Name, filter, StringComparison.OrdinalIgnoreCase))];
        }

        if (assets.Count == 0) {
            ConsoleOutput.WriteLine("No entities found matching the filters.");
            return;
        }

        ConsoleOutput.WriteBlankLine();
        ConsoleOutput.WriteLine($"Found {assets.Count} entities:");
        ConsoleOutput.WriteBlankLine();
        ConsoleOutput.WriteLine($"{"Name",-24} {"Category",-12} {"Type",-16} {"Subtype",-16} Tokens");
        ConsoleOutput.WriteLine(new string('-', 112));

        foreach (var asset in assets.OrderBy(s => s.Classification.Kind).ThenBy(s => s.Classification.Category).ThenBy(s => s.Classification.Type).ThenBy(s => s.Classification.Subtype).ThenBy(s => s.Name)) {
            ConsoleOutput.WriteLine($"{asset.Name,-24} {asset.Classification.Kind,-12} {asset.Classification.Category,-12} {asset.Classification.Type,-16} {asset.Classification.Subtype,-16} {asset.Tokens.Count,-10}");
        }

        ConsoleOutput.WriteBlankLine();
        ConsoleOutput.WriteLine($"Total: {assets.Count} entities, {assets.Sum(s => s.Tokens.Count)} tokens");
    }

    private static async Task<List<Asset>> LoadSummariesFromJsonAsync(string path, AssetKind? kindFilter, CancellationToken ct) {
        if (!File.Exists(path)) {
            ConsoleOutput.WriteError($"Error: File not found: {path}");
            return [];
        }

        var json = await File.ReadAllTextAsync(path, ct);
        var entities = JsonSerializer.Deserialize<List<Asset>>(json, _jsonOptions);

        if (entities is null || entities.Count == 0) {
            ConsoleOutput.WriteLine("No entities found in import file.");
            return [];
        }

        return [.. entities
            .Where(e => kindFilter == null || e.Classification.Kind == kindFilter.Value)];
    }
}
