namespace VttTools.TokenManager.Application.Commands;

public sealed class GenerateTokensCommand(ITokenGenerationService generator) {
    private readonly ITokenGenerationService _generator = generator;

    private static readonly JsonSerializerOptions _jsonOptions = new() {
        PropertyNameCaseInsensitive = true,
        MaxDepth = 32
    };

    public async Task ExecuteAsync(GenerateTokensCommandOptions options, CancellationToken ct = default) {
        if (string.IsNullOrWhiteSpace(options.InputPath)) {
            Console.Error.WriteLine("Error: Input path cannot be empty.");
            return;
        }

        if (!Path.IsPathFullyQualified(options.InputPath)) {
            Console.Error.WriteLine($"Error: Input path must be an absolute path: {options.InputPath}");
            return;
        }

        var extension = Path.GetExtension(options.InputPath).ToLowerInvariant();
        if (extension != ".json") {
            Console.Error.WriteLine($"Error: Only .json files are supported. Got: {extension}");
            return;
        }

        try {
            var fullPath = Path.GetFullPath(options.InputPath);
            var currentDir = Path.GetFullPath(Directory.GetCurrentDirectory());

            var normalizedCurrent = currentDir.TrimEnd(Path.DirectorySeparatorChar) + Path.DirectorySeparatorChar;
            var normalizedFull = fullPath.TrimEnd(Path.DirectorySeparatorChar) + Path.DirectorySeparatorChar;

            if (!normalizedFull.StartsWith(normalizedCurrent, StringComparison.OrdinalIgnoreCase)) {
                Console.Error.WriteLine("Error: Access denied. Input file must be within the current directory.");
                return;
            }
        }
        catch (Exception) {
            Console.Error.WriteLine("Error: Invalid file path.");
            return;
        }

        if (!File.Exists(options.InputPath)) {
            Console.Error.WriteLine($"Input file not found: {options.InputPath}");
            return;
        }

        var fileInfo = new FileInfo(options.InputPath);
        const long maxFileSizeBytes = 10 * 1024 * 1024;
        if (fileInfo.Length > maxFileSizeBytes) {
            Console.Error.WriteLine($"Error: Input file exceeds maximum size of {maxFileSizeBytes / (1024 * 1024)} MB.");
            return;
        }

        var json = await File.ReadAllTextAsync(options.InputPath, ct);
        var monsters = JsonSerializer.Deserialize<List<MonsterDefinition>>(json, _jsonOptions) ?? [];

        // Map to TokenEntity (monster type)
        var entities = monsters.ConvertAll(m => m.ToTokenEntity());

        // Optional filter by ID or Name (for "regenerate" use-case)
        if (!string.IsNullOrWhiteSpace(options.IdOrNameFilter)) {
            var filter = options.IdOrNameFilter.Trim();

            entities = [.. entities
                .Where(e =>
                    string.Equals(e.Id, filter, StringComparison.OrdinalIgnoreCase) ||
                    string.Equals(e.Name, filter, StringComparison.OrdinalIgnoreCase))];

            if (entities.Count == 0) {
                Console.WriteLine($"No entity matching '{filter}' found in {options.InputPath}.");
                return;
            }
        }

        if (options.Limit is not null)
            entities = [.. entities.Take(options.Limit.Value)];

        Console.WriteLine($"Loaded {entities.Count} entities from {options.InputPath}.");

        var index = 0;
        foreach (var e in entities) {
            index++;
            Console.WriteLine($"[{index}/{entities.Count}] {e.Type} {e.Name} ({e.Id})");

            for (var v = 1; v <= options.Variants; v++) {
                try {
                    Console.WriteLine($"  Variant {v}...");
                    await _generator.GenerateAsync(e, v, ct);
                    Console.WriteLine("   OK");
                }
                catch (Exception ex) {
                    Console.Error.WriteLine($"   Error: {ex.Message}");
                }

                if (options.DelayMs > 0)
                    await Task.Delay(options.DelayMs, ct);
            }
        }
    }
}