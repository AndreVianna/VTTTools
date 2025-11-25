namespace VttTools.AssetImageManager.Infrastructure.Storage;

/// <summary>
/// Stores VTT files (images and prompts) in a 7-level hierarchical folder structure.
/// Hierarchy: files/{genre}/{category}/{type}/{subtype}/{asset}/{variantIndex}/files
/// Supports Windows long paths (\\?\ prefix for paths >260 characters).
/// </summary>
public sealed partial class HierarchicalFileStore(string rootPath)
    : IFileStore {
    private readonly string _rootPath = rootPath ?? throw new ArgumentNullException(nameof(rootPath));
    private const int _windowsMaxPathLength = 260;

    private const string _imageFileExtension = ".png";
    private const string _promptFileExtension = ".md";
    private const string _metadataFileName = ".asset.json";

    private static readonly JsonSerializerOptions _jsonOptions = new() {
        PropertyNameCaseInsensitive = true,
        MaxDepth = 32
    };

    public async Task<List<Asset>> LoadAssetsAsync(string path, CancellationToken ct = default) {
        var json = await File.ReadAllTextAsync(path, ct);
        var assets = JsonSerializer.Deserialize<List<Asset>>(json, _jsonOptions) ?? [];
        if (assets.Count == 0) {
            ConsoleOutput.WriteLine("No assets found in file.");
            return [];
        }

        ConsoleOutput.WriteLine($"{assets.Count} assets found in file.");
        ConsoleOutput.WriteBlankLine();

        return assets;
    }

    public bool HasImageFiles(Asset asset, int variantIndex = 0) {
        ArgumentNullException.ThrowIfNull(asset);
        var path = BuildVariantPath(asset, variantIndex);
        var imageTypes = ImageTypeFor(asset.Classification.Kind);
        return imageTypes.Any(it => File.Exists(Path.Combine(path, NormalizeFileName(it) + _imageFileExtension)));
    }

    public bool ImageFileExists(string imageType, Asset asset, int variantIndex = 0) {
        ArgumentNullException.ThrowIfNull(asset);
        var path = BuildVariantPath(asset, variantIndex);
        return File.Exists(Path.Combine(path, NormalizeFileName(imageType) + _imageFileExtension));
    }

    public IReadOnlyList<string> GetExistingImageFiles(
        Asset asset,
        int variantIndex = 0) {
        ArgumentNullException.ThrowIfNull(asset);

        var variantPath = BuildVariantPath(asset, variantIndex);
        variantPath = PreparePathForWindows(variantPath);
        return !Directory.Exists(variantPath)
            ? []
            : [.. ImageTypeFor(asset.Classification.Kind).Select(it => Path.Combine(variantPath, NormalizeFileName(it) + _imageFileExtension)).Where(f => File.Exists(f))];
    }

    public string? FindImageFile(string imageType, Asset asset, int variantIndex = 0) {
        ArgumentNullException.ThrowIfNull(asset);

        var variantPath = BuildVariantPath(asset, variantIndex);
        variantPath = PreparePathForWindows(variantPath);
        var filePath = Path.Combine(variantPath, NormalizeFileName(imageType) + _imageFileExtension);
        return File.Exists(filePath) ? filePath : null;
    }

    public async Task<string> SaveImageAsync(
        string imageType,
        Asset asset,
        int variantIndex,
        byte[] content,
        CancellationToken ct = default) {
        ArgumentNullException.ThrowIfNull(asset);
        ArgumentNullException.ThrowIfNull(content);
        ArgumentException.ThrowIfNullOrWhiteSpace(imageType);

        var variantPath = BuildVariantPath(asset, variantIndex);
        Directory.CreateDirectory(variantPath);
        await SaveAssetMetadataAsync(asset, ct);

        var filePath = Path.Combine(variantPath, NormalizeFileName(imageType) + _imageFileExtension);
        filePath = PreparePathForWindows(filePath);

        await File.WriteAllBytesAsync(filePath, content, ct);
        return filePath;
    }

    public bool HasPromptFiles(Asset asset, int variantIndex = 0) {
        ArgumentNullException.ThrowIfNull(asset);
        var path = BuildVariantPath(asset, variantIndex);
        var imageTypes = ImageTypeFor(asset.Classification.Kind);
        return imageTypes.Any(it => File.Exists(Path.Combine(path, NormalizeFileName(it) + _promptFileExtension)));
    }

    public bool PromptFileExists(string imageType, Asset asset, int variantIndex = 0) {
        ArgumentNullException.ThrowIfNull(asset);
        var path = BuildVariantPath(asset, variantIndex);
        return File.Exists(Path.Combine(path, NormalizeFileName(imageType) + _promptFileExtension));
    }

    public IReadOnlyList<string> GetExistingPromptFiles(Asset asset, int variantIndex = 0) {
        ArgumentNullException.ThrowIfNull(asset);

        var variantPath = BuildVariantPath(asset, variantIndex);
        variantPath = PreparePathForWindows(variantPath);
        return !Directory.Exists(variantPath)
            ? []
            : [.. ImageTypeFor(asset.Classification.Kind).Select(it => Path.Combine(variantPath, NormalizeFileName(it) + _promptFileExtension)).Where(f => File.Exists(f))];
    }

    public string? FindPromptFile(string imageType, Asset asset, int variantIndex = 0) {
        ArgumentNullException.ThrowIfNull(asset);

        var variantPath = BuildVariantPath(asset, variantIndex);
        variantPath = PreparePathForWindows(variantPath);
        var filePath = Path.Combine(variantPath, NormalizeFileName(imageType) + _promptFileExtension);
        return File.Exists(filePath) ? filePath : null;
    }

    public async Task<string> SavePromptAsync(
        string imageType,
        Asset asset,
        int variantIndex,
        string prompt,
        CancellationToken ct = default) {
        ArgumentNullException.ThrowIfNull(asset);
        ArgumentException.ThrowIfNullOrWhiteSpace(prompt);
        ArgumentException.ThrowIfNullOrWhiteSpace(imageType);

        var variantPath = BuildVariantPath(asset, variantIndex);
        Directory.CreateDirectory(variantPath);
        await SaveAssetMetadataAsync(asset, ct);

        var filePath = Path.Combine(variantPath, NormalizeFileName(imageType) + _promptFileExtension);
        filePath = PreparePathForWindows(filePath);
        await File.WriteAllTextAsync(filePath, prompt, ct);
        return filePath;
    }

    private string BuildVariantPath(Asset asset, int variantIndex = 0)
        => Path.Combine(
            _rootPath,
            NormalizeFolderName(asset.Classification.Kind.ToString()),
            NormalizeFolderName(asset.Classification.Category),
            NormalizeFolderName(asset.Classification.Type),
            NormalizeFolderName(asset.Classification.Subtype, string.Empty),
            NormalizeFolderName(asset.Name),
            variantIndex == 0 ? string.Empty : NormalizeFolderName(variantIndex.ToString()));

    private static string PreparePathForWindows(string path) {
        if (!OperatingSystem.IsWindows()) {
            return path;
        }

        var fullPath = Path.GetFullPath(path);

        return fullPath.Length > _windowsMaxPathLength && !fullPath.StartsWith(@"\\?\") ? @"\\?\" + fullPath : fullPath;
    }

    public IReadOnlyList<Asset> GetAssets(
        AssetKind? kindFilter = null,
        string? categoryFilter = null,
        string? typeFilter = null,
        string? subtypeFilter = null,
        string? nameFilter = null) {

        var rootImagesPath = PreparePathForWindows(_rootPath);
        var assets = new List<Asset>();

        if (!Directory.Exists(rootImagesPath)) {
            return assets;
        }

        ListItems(rootImagesPath, kindFilter?.ToString(), kindPath
            => ListItems(kindPath, categoryFilter, categoryPath
                => ListItems(categoryPath, typeFilter, typePath
                    => ListItems(typePath, subtypeFilter, subtypePath
                        => ListItems(subtypePath, nameFilter, namePath
                            => {
                                var kind = Path.GetFileName(kindPath)!;
                                var category = Path.GetFileName(categoryPath)!;
                                var type = Path.GetFileName(typePath)!;
                                var subtype = Path.GetFileName(subtypePath)!;
                                assets.Add(CreateAsset(Enum.Parse<AssetKind>(kind, true), category, type, subtype, namePath));
                            })))));

        return assets;
    }

    private static void ListItems(string parentPath, string? filter, Action<string> execute) {
        var assetFolders = string.IsNullOrWhiteSpace(filter)
            ? Directory.EnumerateDirectories(parentPath)
            : [Path.Combine(parentPath, NormalizeFolderName(filter))];
        foreach (var assetPath in assetFolders) {
            if (!Directory.Exists(assetPath)) continue;
            execute(assetPath);
        }
    }

    private static Asset CreateAsset(AssetKind kind, string category, string type, string? subtype, string assetPath) {
        var name = LoadAssetName(assetPath) ?? Path.GetFileName(assetPath)!;
        return new Asset {
            Classification = new AssetClassification(kind, category, type, subtype),
            Name = name,
            Tokens = [.. Directory.EnumerateDirectories(assetPath).Select(d => new Resource {
                Description = Path.GetFileName(d),
            })]
        };
    }

    public Asset? FindAsset(string name) {
        var assetFolder = NormalizeFolderName(name);

        var rootImagesPath = PreparePathForWindows(_rootPath);
        if (!Directory.Exists(rootImagesPath)) return null;

        var paths = Directory.EnumerateDirectories(rootImagesPath, assetFolder, new EnumerationOptions { RecurseSubdirectories = true });
        if (!paths.Any()) return null;
        var assetPath = paths.First();

        var relativePath = Path.GetRelativePath(rootImagesPath, assetPath);
        var pathParts = relativePath.Split(Path.DirectorySeparatorChar, Path.AltDirectorySeparatorChar);

        if (pathParts.Length < 4) return null;

        var kind = Enum.Parse<AssetKind>(pathParts[0], true);
        var category = pathParts[1];
        var type = pathParts[2];

        string? subtype = null;
        if (pathParts.Length >= 4 && pathParts[3] != assetFolder) {
            subtype = pathParts[3];
        }

        return CreateAsset(kind, category, type, subtype, assetPath);
    }

    private static IReadOnlyList<string> ImageTypeFor(AssetKind kind)
        => kind switch {
            AssetKind.Character => ["TopDown", "CloseUp", "Portrait"],
            AssetKind.Creature => ["TopDown", "CloseUp", "Portrait"],
            AssetKind.Object => ["TopDown", "Portrait"],
            _ => []
        };

    private static string NormalizeFolderName(string? component, string? defaultValue = null) {
        if (string.IsNullOrWhiteSpace(component))
            return defaultValue ?? string.Empty;
        var normalized = component.ToLowerInvariant()
                                  .Replace(' ', '_');
        normalized = SafeFolderNameChars().Replace(normalized, string.Empty);
        return MultipleHyphens().Replace(normalized, "-").Trim('-');
    }

    private static string NormalizeFileName(string? component, string? defaultValue = null) {
        if (string.IsNullOrWhiteSpace(component))
            return defaultValue ?? string.Empty;
        var normalized = component.ToLowerInvariant()
                                  .Replace(", and ", "+")
                                  .Replace(", ", "+")
                                  .Replace(" and ", "+")
                                  .Replace(" & ", "+")
                                  .Replace(' ', '-');
        normalized = SafeFileNameChars().Replace(normalized, string.Empty);
        return MultipleHyphens().Replace(normalized, "-").Trim('-');
    }

    private async Task SaveAssetMetadataAsync(Asset asset, CancellationToken ct = default) {
        var assetPath = BuildAssetPath(asset);
        Directory.CreateDirectory(assetPath);
        var metadataPath = Path.Combine(assetPath, _metadataFileName);
        metadataPath = PreparePathForWindows(metadataPath);

        var metadata = new { asset.Name };
        var json = JsonSerializer.Serialize(metadata, _jsonOptions);
        await File.WriteAllTextAsync(metadataPath, json, ct);
    }

    private static string? LoadAssetName(string assetPath) {
        var metadataPath = Path.Combine(assetPath, _metadataFileName);
        metadataPath = PreparePathForWindows(metadataPath);

        if (!File.Exists(metadataPath)) {
            return Path.GetFileName(assetPath);
        }

        try {
            var json = File.ReadAllText(metadataPath);
            var metadata = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(json, _jsonOptions);
            if (metadata != null && metadata.TryGetValue("Name", out var nameElement)) {
                return nameElement.GetString();
            }
        }
        catch {
        }

        return Path.GetFileName(assetPath);
    }

    private string BuildAssetPath(Asset asset)
        => Path.Combine(
            _rootPath,
            NormalizeFolderName(asset.Classification.Kind.ToString()),
            NormalizeFolderName(asset.Classification.Category),
            NormalizeFolderName(asset.Classification.Type),
            NormalizeFolderName(asset.Classification.Subtype, string.Empty),
            NormalizeFolderName(asset.Name));

    [GeneratedRegex(@"[^a-z0-9+-]")]
    private static partial Regex SafeFileNameChars();

    [GeneratedRegex(@"[^a-z0-9_]")]
    private static partial Regex SafeFolderNameChars();

    [GeneratedRegex(@"-{2,}")]
    private static partial Regex MultipleHyphens();
}
