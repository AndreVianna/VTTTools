namespace VttTools.TokenManager.Application.Commands;

public sealed class GenerateTokensCommand(TokenGenerationService generator, string engineId) {
    private readonly TokenGenerationService _generator = generator;
    private readonly string _engineId = engineId;

    private static readonly JsonSerializerOptions _jsonOptions = new() { PropertyNameCaseInsensitive = true };

    public async Task ExecuteAsync(GenerateTokensCommandOptions options) {
        if (!File.Exists(options.InputPath)) {
            Console.Error.WriteLine($"Input file not found: {options.InputPath}");
            return;
        }

        var json = await File.ReadAllTextAsync(options.InputPath);
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
                    await _generator.GenerateAsync(e, v, _engineId);
                    Console.WriteLine("   OK");
                }
                catch (Exception ex) {
                    Console.Error.WriteLine($"   Error: {ex.Message}");
                }

                if (options.DelayMs > 0)
                    await Task.Delay(options.DelayMs);
            }
        }
    }
}