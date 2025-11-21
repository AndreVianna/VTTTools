namespace VttTools.AssetImageManager.Infrastructure.Storage;

/// <summary>
/// Stores VTT files (images and prompts) in a 7-level hierarchical folder structure.
/// Hierarchy: files/{genre}/{category}/{type}/{subtype}/{entity}/{variant}/files
/// Supports Windows long paths (\\?\ prefix for paths >260 characters).
/// </summary>
public sealed partial class HierarchicalFileStore(string rootPath)
    : IFileStore {
    private readonly string _rootPath = rootPath ?? throw new ArgumentNullException(nameof(rootPath));
    private const int _windowsMaxPathLength = 260;

    private const string _imageFileExtension = ".png";
    private const string _promptFileExtension = ".md";

    public bool HasImageFiles(EntryDefinition entity, StructuralVariant variant) {
        ArgumentNullException.ThrowIfNull(entity);
        ArgumentNullException.ThrowIfNull(variant);
        var path = BuildVariantPath(entity, variant);
        var imageTypes = ImageType.For(entity.Category);
        return imageTypes.Any(it => File.Exists(Path.Combine(path, ImageType.ToFileName(it) + _imageFileExtension)));
    }

    public bool ImageFileExists(EntryDefinition entity, StructuralVariant variant, string imageType) {
        ArgumentNullException.ThrowIfNull(entity);
        ArgumentNullException.ThrowIfNull(variant);
        var path = BuildVariantPath(entity, variant);
        return File.Exists(Path.Combine(path, ImageType.ToFileName(imageType) + _imageFileExtension));
    }

    public IReadOnlyList<string> GetExistingImageFiles(
        EntryDefinition entity,
        StructuralVariant variant) {
        ArgumentNullException.ThrowIfNull(entity);
        ArgumentNullException.ThrowIfNull(variant);

        var variantPath = BuildVariantPath(entity, variant);
        variantPath = PreparePathForWindows(variantPath);
        return !Directory.Exists(variantPath)
            ? []
            : [.. ImageType.For(entity.Category).Select(it => Path.Combine(variantPath, ImageType.ToFileName(it) + _imageFileExtension)).Where(f => File.Exists(f))];
    }

    public string? FindImageFile(EntryDefinition entity, StructuralVariant variant, string imageType) {
        ArgumentNullException.ThrowIfNull(entity);
        ArgumentNullException.ThrowIfNull(variant);

        var variantPath = BuildVariantPath(entity, variant);
        variantPath = PreparePathForWindows(variantPath);
        var filePath = Path.Combine(variantPath, ImageType.ToFileName(imageType) + _imageFileExtension);
        return File.Exists(filePath) ? filePath : null;
    }

    public async Task<string> SaveImageAsync(
        EntryDefinition entity,
        StructuralVariant variant,
        byte[] imageData,
        string imageType,
        CancellationToken ct = default) {
        ArgumentNullException.ThrowIfNull(entity);
        ArgumentNullException.ThrowIfNull(variant);
        ArgumentNullException.ThrowIfNull(imageData);
        ArgumentException.ThrowIfNullOrWhiteSpace(imageType);

        if (!ImageType.IsValid(imageType)) {
            throw new ArgumentException($"Invalid image type: {imageType}. Valid types: {string.Join(", ", ImageType.All)}", nameof(imageType));
        }

        var variantPath = BuildVariantPath(entity, variant);
        Directory.CreateDirectory(variantPath);
        var filePath = Path.Combine(variantPath, ImageType.ToFileName(imageType) + _imageFileExtension);
        filePath = PreparePathForWindows(filePath);

        await File.WriteAllBytesAsync(filePath, imageData, ct);
        return filePath;
    }

    public bool HasPromptFiles(EntryDefinition entity, StructuralVariant variant) {
        ArgumentNullException.ThrowIfNull(entity);
        ArgumentNullException.ThrowIfNull(variant);
        var path = BuildVariantPath(entity, variant);
        var imageTypes = ImageType.For(entity.Category);
        return imageTypes.Any(it => File.Exists(Path.Combine(path, ImageType.ToFileName(it) + _promptFileExtension)));
    }

    public bool PromptFileExists(EntryDefinition entity, StructuralVariant variant, string imageType) {
        ArgumentNullException.ThrowIfNull(entity);
        ArgumentNullException.ThrowIfNull(variant);
        var path = BuildVariantPath(entity, variant);
        return File.Exists(Path.Combine(path, ImageType.ToFileName(imageType) + _promptFileExtension));
    }

    public IReadOnlyList<string> GetExistingPromptFiles(EntryDefinition entity, StructuralVariant variant) {
        ArgumentNullException.ThrowIfNull(entity);
        ArgumentNullException.ThrowIfNull(variant);

        var variantPath = BuildVariantPath(entity, variant);
        variantPath = PreparePathForWindows(variantPath);
        return !Directory.Exists(variantPath)
            ? []
            : [.. ImageType.For(entity.Category).Select(it => Path.Combine(variantPath, ImageType.ToFileName(it) + _promptFileExtension)).Where(f => File.Exists(f))];
    }

    public string? FindPromptFile(EntryDefinition entity, StructuralVariant variant, string imageType) {
        ArgumentNullException.ThrowIfNull(entity);
        ArgumentNullException.ThrowIfNull(variant);

        var variantPath = BuildVariantPath(entity, variant);
        variantPath = PreparePathForWindows(variantPath);
        var filePath = Path.Combine(variantPath, ImageType.ToFileName(imageType) + _promptFileExtension);
        return File.Exists(filePath) ? filePath : null;
    }

    public async Task<string> SavePromptAsync(
        EntryDefinition entity,
        StructuralVariant variant,
        string prompt,
        string imageType,
        CancellationToken ct = default) {
        ArgumentNullException.ThrowIfNull(entity);
        ArgumentNullException.ThrowIfNull(variant);
        ArgumentException.ThrowIfNullOrWhiteSpace(prompt);
        ArgumentException.ThrowIfNullOrWhiteSpace(imageType);

        var variantPath = BuildVariantPath(entity, variant);
        Directory.CreateDirectory(variantPath);
        var filePath = Path.Combine(variantPath, ImageType.ToFileName(imageType) + _promptFileExtension);
        filePath = PreparePathForWindows(filePath);
        await File.WriteAllTextAsync(filePath, prompt, ct);
        return filePath;
    }

    public async Task<string> SaveMetadataAsync(
        EntryDefinition entity,
        StructuralVariant variant,
        string metadataJson,
        CancellationToken ct = default) {
        ArgumentNullException.ThrowIfNull(entity);
        ArgumentNullException.ThrowIfNull(variant);
        ArgumentException.ThrowIfNullOrWhiteSpace(metadataJson);

        var variantPath = BuildVariantPath(entity, variant);
        Directory.CreateDirectory(variantPath);

        const string fileName = "metadata.json";
        var filePath = Path.Combine(variantPath, fileName);
        filePath = PreparePathForWindows(filePath);

        await File.WriteAllTextAsync(filePath, metadataJson, ct);
        return filePath;
    }

    public async Task<string?> LoadMetadataAsync(
        EntryDefinition entity,
        StructuralVariant variant,
        CancellationToken ct = default) {
        ArgumentNullException.ThrowIfNull(entity);
        ArgumentNullException.ThrowIfNull(variant);

        var variantPath = BuildVariantPath(entity, variant);
        const string fileName = "metadata.json";
        var filePath = Path.Combine(variantPath, fileName);
        filePath = PreparePathForWindows(filePath);

        return !File.Exists(filePath) ? null : await File.ReadAllTextAsync(filePath, ct);
    }

    private string BuildVariantPath(EntryDefinition entity, StructuralVariant variant) {
        var genre = string.IsNullOrWhiteSpace(entity.Genre) ? "Fantasy" : entity.Genre;

        ValidatePathComponent(genre, nameof(entity.Genre));
        ValidatePathComponent(entity.Name, nameof(entity.Name));
        ValidatePathComponent(entity.Category, nameof(entity.Category));
        ValidatePathComponent(entity.Type, nameof(entity.Type));
        ValidatePathComponent(entity.Subtype, nameof(entity.Subtype));
        ValidatePathComponent(variant.VariantId, nameof(variant.VariantId));

        var entityName = entity.Name.ToLowerInvariant().Replace(" ", "_");

        return Path.Combine(
            _rootPath,
            genre.ToLowerInvariant().Replace(" ", "_"),
            entity.Category.ToLowerInvariant(),
            entity.Type.ToLowerInvariant(),
            entity.Subtype.ToLowerInvariant(),
            entityName,
            variant.VariantId
        );
    }

    private static void ValidatePathComponent(string value, string paramName) {
        if (string.IsNullOrWhiteSpace(value)) {
            throw new ArgumentException($"{paramName} cannot be null or whitespace.", paramName);
        }

        if (value.Contains("..") || value.Contains('/') || value.Contains('\\') ||
            Path.IsPathRooted(value) || value.IndexOfAny(Path.GetInvalidFileNameChars()) >= 0) {
            throw new ArgumentException($"{paramName} contains invalid filePath characters.", paramName);
        }
    }

    private static string PreparePathForWindows(string path) {
        if (!OperatingSystem.IsWindows()) {
            return path;
        }

        var fullPath = Path.GetFullPath(path);

        return fullPath.Length > _windowsMaxPathLength && !fullPath.StartsWith(@"\\?\") ? @"\\?\" + fullPath : fullPath;
    }

    public Task<IReadOnlyList<EntitySummary>> GetEntitySummariesAsync(
        string? categoryFilter = null,
        string? typeFilter = null,
        string? subtypeFilter = null,
        CancellationToken ct = default) {
        var rootImagesPath = Path.Combine(_rootPath);
        rootImagesPath = PreparePathForWindows(rootImagesPath);

        if (!Directory.Exists(rootImagesPath)) {
            return Task.FromResult<IReadOnlyList<EntitySummary>>([]);
        }

        var summaries = new List<EntitySummary>();
        var genres = Directory.EnumerateDirectories(rootImagesPath);

        foreach (var genrePath in genres) {
            ct.ThrowIfCancellationRequested();

            if (!Directory.Exists(genrePath)) {
                continue;
            }

            var genreName = Path.GetFileName(genrePath) ?? string.Empty;
            var categories = string.IsNullOrWhiteSpace(categoryFilter)
                ? Directory.EnumerateDirectories(genrePath)
                : [Path.Combine(genrePath, categoryFilter.ToLowerInvariant())];

            foreach (var categoryPath in categories) {
                ct.ThrowIfCancellationRequested();

                if (!Directory.Exists(categoryPath)) {
                    continue;
                }

                var categoryName = Path.GetFileName(categoryPath) ?? string.Empty;
                var types = string.IsNullOrWhiteSpace(typeFilter)
                    ? Directory.EnumerateDirectories(categoryPath)
                    : [Path.Combine(categoryPath, typeFilter.ToLowerInvariant())];

                foreach (var typePath in types) {
                    ct.ThrowIfCancellationRequested();

                    if (!Directory.Exists(typePath)) {
                        continue;
                    }

                    var typeName = Path.GetFileName(typePath) ?? string.Empty;
                    var subtypes = string.IsNullOrWhiteSpace(subtypeFilter)
                        ? Directory.EnumerateDirectories(typePath)
                        : [Path.Combine(typePath, subtypeFilter.ToLowerInvariant())];

                    foreach (var subtypePath in subtypes) {
                        ct.ThrowIfCancellationRequested();

                        if (!Directory.Exists(subtypePath)) {
                            continue;
                        }

                        var subtypeName = Path.GetFileName(subtypePath) ?? string.Empty;
                        var entityDirs = Directory.EnumerateDirectories(subtypePath);

                        foreach (var entityPath in entityDirs) {
                            ct.ThrowIfCancellationRequested();

                            var entityName = Path.GetFileName(entityPath) ?? string.Empty;
                            var variantDirs = Directory.EnumerateDirectories(entityPath);
                            var variantCount = 0;
                            var totalImageCount = 0;

                            foreach (var variantPath in variantDirs) {
                                ct.ThrowIfCancellationRequested();

                                variantCount++;
                                var imageFiles = Directory.EnumerateFiles(variantPath, "*.png")
                                    .Where(f => {
                                        var name = Path.GetFileNameWithoutExtension(f);
                                        return ImageType.All.Any(type => ImageType.ToFileName(type).Equals(name, StringComparison.OrdinalIgnoreCase));
                                    });
                                totalImageCount += imageFiles.Count();
                            }

                            summaries.Add(new EntitySummary(
                                genreName,
                                categoryName,
                                typeName,
                                subtypeName,
                                entityName,
                                variantCount,
                                totalImageCount
                            ));
                        }
                    }
                }
            }
        }

        return Task.FromResult<IReadOnlyList<EntitySummary>>(summaries);
    }

    public Task<EntityInfo?> GetEntityInfoAsync(
        string genre,
        string category,
        string type,
        string subtype,
        string name,
        CancellationToken ct = default) {
        var entityName = name.ToLowerInvariant().Replace(" ", "_");
        var genreFolder = genre.ToLowerInvariant().Replace(" ", "_");

        var entityPath = Path.Combine(
            _rootPath,
            genreFolder,
            category.ToLowerInvariant(),
            type.ToLowerInvariant(),
            subtype.ToLowerInvariant(),
            entityName
        );

        entityPath = PreparePathForWindows(entityPath);

        if (!Directory.Exists(entityPath)) {
            return Task.FromResult<EntityInfo?>(null);
        }

        var variants = new List<VariantInfo>();
        var variantDirs = Directory.EnumerateDirectories(entityPath);

        foreach (var variantPath in variantDirs) {
            ct.ThrowIfCancellationRequested();

            var variantId = Path.GetFileName(variantPath) ?? string.Empty;
            var poses = new List<PoseInfo>();

            foreach (var imageType in ImageType.All) {
                var fileName = $"{ImageType.ToFileName(imageType)}.png";
                var imagePath = Path.Combine(variantPath, fileName);

                if (File.Exists(imagePath)) {
                    var fileInfo = new FileInfo(imagePath);
                    poses.Add(new PoseInfo(
                        Array.IndexOf(ImageType.All, imageType) + 1,
                        imagePath,
                        fileInfo.Length,
                        fileInfo.CreationTimeUtc
                    ));
                }
            }

            poses.Sort((a, b) => a.PoseNumber.CompareTo(b.PoseNumber));

            variants.Add(new VariantInfo(variantId, poses));
        }

        var entityInfo = new EntityInfo(
            genre,
            category,
            type,
            subtype,
            name,
            variants
        );

        return Task.FromResult<EntityInfo?>(entityInfo);
    }

    [GeneratedRegex(@"^(top-down|photo|portrait)\.png$")]
    private static partial Regex ImageFileName();
}
