namespace VttTools.AssetImageManager.Application.Commands;

public sealed class GenerateCommand(IHttpClientFactory httpClientFactory,
                                    IImageStore imageStore,
                                    IConfiguration config) {

    private static readonly JsonSerializerOptions _jsonOptions = new() {
        PropertyNameCaseInsensitive = true,
        MaxDepth = 32
    };

    public async Task ExecuteAsync(GenerateTokensOptions options, CancellationToken ct = default) {
        if (!ValidateInputPath(options.InputPath, out var errorMessage)) {
            Console.Error.WriteLine(errorMessage);
            return;
        }

        var entities = await LoadEntitiesAsync(options.InputPath, ct);
        if (entities is null) return;

        var (validEntities, invalidCount) = ValidateAndFilterEntities(entities);
        if (invalidCount > 0) {
            Console.ForegroundColor = ConsoleColor.Yellow;
            Console.WriteLine($"⚠ {invalidCount} invalid entities skipped.");
            Console.ResetColor();
            Console.WriteLine();
        }

        if (validEntities.Count == 0) {
            Console.Error.WriteLine("No valid entities found after validation.");
            return;
        }

        validEntities = ApplyNameFilter(validEntities, options.IdFilter);
        if (validEntities.Count == 0) {
            Console.WriteLine($"No entity matching '{options.IdFilter}' found in {options.InputPath}.");
            return;
        }

        if (options.Limit is not null) {
            validEntities = [.. validEntities.Take(options.Limit.Value)];
        }

        Console.WriteLine($"Loaded {validEntities.Count} entities from {options.InputPath}.");

        var requestedImageTypes = GetRequestedImageTypes(options.ImageType);

        var totalImages = CalculateTotalImages(validEntities, requestedImageTypes);
        Console.WriteLine($"Total images to generate: {totalImages}");
        Console.WriteLine();

        if (!ConfirmGeneration(totalImages)) {
            Console.WriteLine("Generation cancelled by user.");
            return;
        }

        var generatedCount = await GenerateImagesAsync(validEntities, requestedImageTypes, options.DelayMs, ct);

        Console.WriteLine($"Generation complete. {generatedCount}/{totalImages} images generated.");
    }

    private static bool ValidateInputPath(string inputPath, out string errorMessage) {
        if (string.IsNullOrWhiteSpace(inputPath)) {
            errorMessage = "Error: Input path cannot be empty.";
            return false;
        }

        if (!Path.IsPathFullyQualified(inputPath)) {
            errorMessage = $"Error: Input path must be an absolute path: {inputPath}";
            return false;
        }

        var extension = Path.GetExtension(inputPath).ToLowerInvariant();
        if (extension != ".json") {
            errorMessage = $"Error: Only .json files are supported. Got: {extension}";
            return false;
        }

        try {
            var fullPath = Path.GetFullPath(inputPath);
            var currentDir = Path.GetFullPath(Directory.GetCurrentDirectory());

            var normalizedCurrent = currentDir.TrimEnd(Path.DirectorySeparatorChar) + Path.DirectorySeparatorChar;
            var normalizedFull = fullPath.TrimEnd(Path.DirectorySeparatorChar) + Path.DirectorySeparatorChar;

            if (!normalizedFull.StartsWith(normalizedCurrent, StringComparison.OrdinalIgnoreCase)) {
                errorMessage = "Error: Access denied. Input file must be within the current directory.";
                return false;
            }
        }
        catch (ArgumentException) {
            errorMessage = "Error: Invalid file path.";
            return false;
        }
        catch (NotSupportedException) {
            errorMessage = "Error: File path format is not supported.";
            return false;
        }
        catch (PathTooLongException) {
            errorMessage = "Error: File path is too long.";
            return false;
        }
        catch (SecurityException) {
            errorMessage = "Error: Access denied due to security restrictions.";
            return false;
        }

        if (!File.Exists(inputPath)) {
            errorMessage = $"Input file not found: {inputPath}";
            return false;
        }

        var fileInfo = new FileInfo(inputPath);
        const long maxFileSizeBytes = 10 * 1024 * 1024;
        if (fileInfo.Length > maxFileSizeBytes) {
            errorMessage = $"Error: Input file exceeds maximum size of {maxFileSizeBytes / (1024 * 1024)} MB.";
            return false;
        }

        errorMessage = string.Empty;
        return true;
    }

    private static async Task<List<EntityDefinition>?> LoadEntitiesAsync(string path, CancellationToken ct) {
        var json = await File.ReadAllTextAsync(path, ct);
        var entityDefinitions = JsonSerializer.Deserialize<List<EntityDefinition>>(json, _jsonOptions);

        if (entityDefinitions is null || entityDefinitions.Count == 0) {
            Console.WriteLine("No entities found in input file.");
            return null;
        }

        return entityDefinitions;
    }

    private static (List<EntityDefinition> valid, int invalidCount) ValidateAndFilterEntities(List<EntityDefinition> entities) {
        var validEntities = new List<EntityDefinition>();
        var invalidCount = 0;

        foreach (var entity in entities) {
            var validationResult = entity.Validate();
            if (validationResult.HasErrors) {
                invalidCount++;
                Console.ForegroundColor = ConsoleColor.Red;
                Console.Error.WriteLine($"✗ Skipping {entity.Name} due to validation errors:");
                Console.ResetColor();
                foreach (var error in validationResult.Errors) {
                    Console.Error.WriteLine($"  - {error.Message}");
                }
                Console.WriteLine();
            }
            else {
                validEntities.Add(entity);
            }
        }

        return (validEntities, invalidCount);
    }

    private static List<EntityDefinition> ApplyNameFilter(List<EntityDefinition> entities, string? nameFilter) {
        if (string.IsNullOrWhiteSpace(nameFilter)) {
            return entities;
        }

        var filter = nameFilter.Trim();
        return [.. entities.Where(e => string.Equals(e.Name, filter, StringComparison.OrdinalIgnoreCase))];
    }

    private static string[] GetRequestedImageTypes(string imageType) {
        var normalizedType = imageType.Trim().ToLowerInvariant();
        return normalizedType switch {
            "topdown" => [ImageType.TopDown],
            "miniature" => [ImageType.Miniature],
            "photo" => [ImageType.Photo],
            "portrait" => [ImageType.Portrait],
            "all" => ImageType.All,
            _ => ImageType.All
        };
    }

    private static List<StructuralVariant> GetAllVariants(EntityDefinition entity) {
        if (entity.Alternatives?.Count > 0) {
            var variants = new List<StructuralVariant>();
            foreach (var alternative in entity.Alternatives) {
                var expandedVariants = VariantExpander.ExpandAlternatives(alternative);
                variants.AddRange(expandedVariants);
            }
            return variants;
        }

        return [new StructuralVariant("base", null, null, null, null, null, null, null)];
    }

    private static int CalculateTotalImages(List<EntityDefinition> entities, string[] requestedTypes) {
        var totalImages = 0;

        foreach (var entity in entities) {
            var imageTypes = GetImageTypesForEntity(entity.Category, requestedTypes);
            var variants = GetAllVariants(entity);
            totalImages += variants.Count * imageTypes.Length;
        }

        return totalImages;
    }

    private static bool ConfirmGeneration(int totalImages) {
        if (totalImages <= 50) {
            return true;
        }

        Console.ForegroundColor = ConsoleColor.Yellow;
        Console.WriteLine($"⚠ Warning: Generating {totalImages} variants will create many API calls and may incur significant costs.");
        Console.ResetColor();
        Console.Write("Do you want to continue? (y/N): ");

        var response = Console.ReadLine()?.Trim().ToLowerInvariant();

        if (response is not "y" and not "yes") {
            return false;
        }

        Console.WriteLine();
        return true;
    }

    private async Task<int> GenerateImagesAsync(List<EntityDefinition> entities, string[] imageTypes, int delayMs, CancellationToken ct) {
        var entityIndex = 0;
        var generatedCount = 0;

        foreach (var entity in entities) {
            entityIndex++;
            Console.WriteLine($"[{entityIndex}/{entities.Count}] {entity.Type} {entity.Name}");

            var variants = GetAllVariants(entity);

            var variantIndex = 0;
            foreach (var variant in variants) {
                variantIndex++;
                Console.WriteLine($"  [{variantIndex}/{variants.Count}] Variant: {variant.VariantId}");

                foreach (var imageType in GetImageTypesForEntity(entity.Category, imageTypes)) {
                    try {
                        await GenerateImageAsync(entity, variant, imageType, ct);
                        generatedCount++;

                        if (delayMs > 0) {
                            await Task.Delay(delayMs, ct);
                        }
                    }
                    catch (HttpRequestException ex) {
                        Console.Error.WriteLine($" Error: Network error - {ex.Message}");
                        throw;
                    }
                    catch (InvalidOperationException ex) {
                        Console.Error.WriteLine($" Error: API error - {ex.Message}");
                        throw;
                    }
                    catch (IOException ex) {
                        Console.Error.WriteLine($" Error: File I/O error - {ex.Message}");
                        throw;
                    }
                    catch (OperationCanceledException) {
                        Console.Error.WriteLine(" Error: Operation cancelled");
                        throw;
                    }
                }
            }

            Console.WriteLine();
        }

        return generatedCount;
    }

    private async Task GenerateImageAsync(EntityDefinition entity, StructuralVariant variant, string imageType, CancellationToken ct) {
        Console.Write($"    {imageType}...");

        var variantPath = imageStore.GetVariantDirectoryPath(entity, variant);
        var fileName = ImageType.ToFileName(imageType);
        var promptFilePath = Path.Combine(variantPath, $"{fileName}.prompt");

        if (!File.Exists(promptFilePath)) {
            Console.Error.WriteLine($" Error: Prompt file not found: {promptFilePath}");
            Console.Error.WriteLine("  Run 'token prepare' first to generate prompt files.");
            return;
        }

        var finalPrompt = await File.ReadAllTextAsync(promptFilePath, ct);

        var provider = config[$"Images:{imageType}:Provider"] ?? throw new InvalidOperationException($"{imageType} provider not configured.");

        IImageGenerator imageGenerator = provider.ToUpperInvariant() switch {
            "STABILITY" => new StabilityClient(httpClientFactory, config),
            "OPENAI" => new OpenAiClient(httpClientFactory, config),
            "GOOGLE" => new GoogleClient(httpClientFactory, config),
            _ => throw new InvalidOperationException($"Unsupported image generation provider: {provider}.")
        };

        var model = config[$"Images:{imageType}:Model"] ?? throw new InvalidOperationException($"{imageType} model not configured.");
        var result = await imageGenerator.GenerateImageAsync(model, imageType, finalPrompt, ct);
        await imageStore.SaveImageAsync(entity, variant, result.Data, imageType, ct);
        Console.WriteLine(" OK");
    }

    private static string[] GetImageTypesForEntity(string category, string[] requestedTypes) {
        var categoryTypes = category.Equals("objects", StringComparison.OrdinalIgnoreCase)
            ? [ImageType.TopDown, ImageType.Miniature, ImageType.Portrait]
            : ImageType.All;

        return [.. requestedTypes.Intersect(categoryTypes)];
    }
}
