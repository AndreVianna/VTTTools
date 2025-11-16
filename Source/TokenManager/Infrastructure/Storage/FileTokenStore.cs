namespace VttTools.TokenManager.Infrastructure.Storage;

public sealed partial class FileTokenStore(string root) : IFileTokenStore {
    private readonly string _root = root;

    private static readonly JsonSerializerOptions _jsonOptions = new() { WriteIndented = true };

    public string GetEntityFolder(TokenEntity entity)
        => Path.Combine(_root, $"{entity.Type.ToString().ToLowerInvariant()}-{entity.Id}");

    public string GetEntityFolder(string idOrSlug) {
        if (string.IsNullOrWhiteSpace(idOrSlug))
            throw new ArgumentException("Entity ID cannot be empty.", nameof(idOrSlug));

        if (!ValidEntityId().IsMatch(idOrSlug))
            throw new ArgumentException($"Invalid entity ID format: {idOrSlug}", nameof(idOrSlug));

        return Directory.GetDirectories(_root, $"*-{idOrSlug}", SearchOption.TopDirectoryOnly)
            .FirstOrDefault() ?? Path.Combine(_root, idOrSlug);
    }

    public IEnumerable<(string Folder, TokenMetadata Metadata)> EnumerateTokens() {
        if (!Directory.Exists(_root))
            yield break;

        foreach (var dir in Directory.GetDirectories(_root)) {
            var metaPath = Path.Combine(dir, "token_1.json"); // simplistic, extend later
            if (!File.Exists(metaPath))
                continue;

            var json = File.ReadAllText(metaPath);
            var meta = JsonSerializer.Deserialize<TokenMetadata>(json);
            if (meta is null)
                continue;

            yield return (dir, meta);
        }
    }

    public TokenMetadata? LoadMetadata(string entityId) {
        var folder = GetEntityFolder(entityId);
        var metaPath = Path.Combine(folder, "token_1.json");
        if (!File.Exists(metaPath))
            return null;

        var json = File.ReadAllText(metaPath);
        return JsonSerializer.Deserialize<TokenMetadata>(json);
    }

    public async Task SaveVariantAsync(TokenMetadata metadata, byte[] imageBytes, int variantIndex, CancellationToken ct = default) {
        var folder = GetEntityFolder(metadata.EntitySlug);
        Directory.CreateDirectory(folder);

        var fileName = $"token_{variantIndex}.png";
        var pngPath = Path.Combine(folder, fileName);
        await File.WriteAllBytesAsync(pngPath, imageBytes, ct);

        var metaWithFile = metadata with { FileName = fileName };

        var metaPath = Path.Combine(folder, $"token_{variantIndex}.json");
        var json = JsonSerializer.Serialize(metaWithFile, _jsonOptions);
        await File.WriteAllTextAsync(metaPath, json, ct);
    }

    [GeneratedRegex(@"^[a-zA-Z0-9_-]+$")]
    private static partial Regex ValidEntityId();
}
