namespace VttTools.AssetImageManager.Infrastructure.Storage;

/// <summary>
/// Stores VTT images in an 8-level hierarchical folder structure.
/// Hierarchy: images/{genre}/{category}/{type}/{subtype}/{letter}/{entity}/{variant}/files
/// Supports Windows long paths (\\?\ prefix for paths >260 characters).
/// </summary>
public sealed partial class HierarchicalImageStore(string rootPath) : IImageStore {
    private readonly string _rootPath = rootPath ?? throw new ArgumentNullException(nameof(rootPath));

    private const int _windowsMaxPathLength = 260;

    public async Task<string> SaveImageAsync(
        EntityDefinition entity,
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

        var fileName = $"{ImageType.ToFileName(imageType)}.png";
        var filePath = Path.Combine(variantPath, fileName);
        filePath = PreparePathForWindows(filePath);

        await File.WriteAllBytesAsync(filePath, imageData, ct);
        return filePath;
    }

    public Task<IReadOnlyList<string>> GetExistingImageTypesAsync(
        EntityDefinition entity,
        StructuralVariant variant,
        CancellationToken ct = default) {
        ArgumentNullException.ThrowIfNull(entity);
        ArgumentNullException.ThrowIfNull(variant);

        var variantPath = BuildVariantPath(entity, variant);
        variantPath = PreparePathForWindows(variantPath);

        if (!Directory.Exists(variantPath)) {
            return Task.FromResult<IReadOnlyList<string>>([]);
        }

        var existingTypes = new List<string>();
        foreach (var imageType in ImageType.All) {
            var fileName = $"{ImageType.ToFileName(imageType)}.png";
            var filePath = Path.Combine(variantPath, fileName);
            if (File.Exists(filePath)) {
                existingTypes.Add(imageType);
            }
        }

        return Task.FromResult<IReadOnlyList<string>>(existingTypes);
    }

    public async Task<string> SaveMetadataAsync(
        EntityDefinition entity,
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
        EntityDefinition entity,
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

    public string GetVariantDirectoryPath(EntityDefinition entity, StructuralVariant variant) {
        ArgumentNullException.ThrowIfNull(entity);
        ArgumentNullException.ThrowIfNull(variant);

        return BuildVariantPath(entity, variant);
    }

    private string BuildVariantPath(EntityDefinition entity, StructuralVariant variant) {
        var genre = string.IsNullOrWhiteSpace(entity.Genre) ? "Fantasy" : entity.Genre;

        ValidatePathComponent(genre, nameof(entity.Genre));
        ValidatePathComponent(entity.Name, nameof(entity.Name));
        ValidatePathComponent(entity.Category, nameof(entity.Category));
        ValidatePathComponent(entity.Type, nameof(entity.Type));
        ValidatePathComponent(entity.Subtype, nameof(entity.Subtype));
        ValidatePathComponent(variant.VariantId, nameof(variant.VariantId));

        var firstLetter = entity.Name.ToLowerInvariant()[0].ToString();
        var entityName = entity.Name.ToLowerInvariant().Replace(" ", "_");

        return Path.Combine(
            _rootPath,
            genre.ToLowerInvariant().Replace(" ", "_"),
            entity.Category.ToLowerInvariant(),
            entity.Type.ToLowerInvariant(),
            entity.Subtype.ToLowerInvariant(),
            firstLetter,
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
            throw new ArgumentException($"{paramName} contains invalid path characters.", paramName);
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
                        var letterDirs = Directory.EnumerateDirectories(subtypePath);

                        foreach (var letterPath in letterDirs) {
                            ct.ThrowIfCancellationRequested();

                            var entityDirs = Directory.EnumerateDirectories(letterPath);

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
        var firstLetter = GetFirstLetter(name);
        var entityName = name.ToLowerInvariant().Replace(" ", "_");
        var genreFolder = genre.ToLowerInvariant().Replace(" ", "_");

        var entityPath = Path.Combine(
            _rootPath,
            genreFolder,
            category.ToLowerInvariant(),
            type.ToLowerInvariant(),
            subtype.ToLowerInvariant(),
            firstLetter.ToString(),
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

    private static char GetFirstLetter(string entityName) {
        var firstChar = char.ToLowerInvariant(entityName[0]);
        return char.IsLetterOrDigit(firstChar) ? firstChar : '0';
    }

    [GeneratedRegex(@"^(top-down|miniature|photo|portrait)\.png$")]
    private static partial Regex ImageFileName();
}
