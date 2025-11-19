namespace VttTools.AssetImageManager.Application.Commands;

public sealed class PrepareCommand(IHttpClientFactory httpClientFactory,
                                   IImageStore imageStore,
                                   IConfiguration config) {

    private static readonly JsonSerializerOptions _jsonOptions = new() {
        PropertyNameCaseInsensitive = true,
        MaxDepth = 32
    };

    public async Task<int> ExecuteAsync(PrepareOptions options, CancellationToken ct = default) {
        if (string.IsNullOrWhiteSpace(options.InputPath)) {
            Console.Error.WriteLine("Error: Input path cannot be empty.");
            return 1;
        }

        if (!Path.IsPathFullyQualified(options.InputPath)) {
            Console.Error.WriteLine($"Error: Input path must be an absolute path: {options.InputPath}");
            return 1;
        }

        var extension = Path.GetExtension(options.InputPath).ToLowerInvariant();
        if (extension != ".json") {
            Console.Error.WriteLine($"Error: Only .json files are supported. Got: {extension}");
            return 1;
        }

        if (!File.Exists(options.InputPath)) {
            Console.Error.WriteLine($"Error: File not found: {options.InputPath}");
            return 1;
        }

        try {
            var json = await File.ReadAllTextAsync(options.InputPath, ct);
            var entities = JsonSerializer.Deserialize<List<EntityDefinition>>(json, _jsonOptions);

            if (entities is null || entities.Count == 0) {
                Console.WriteLine("No entities found in file.");
                return 0;
            }

            Console.WriteLine($"Found {entities.Count} entities");
            Console.WriteLine();

            var totalVariants = 0;
            var hasErrors = false;

            foreach (var entity in entities) {
                try {
                    var validationResult = entity.Validate();
                    if (validationResult.HasErrors) {
                        hasErrors = true;
                        Console.Error.WriteLine($"✗ {entity.Name}:");
                        foreach (var error in validationResult.Errors) {
                            Console.Error.WriteLine($"  - {error.Message}");
                        }
                        Console.WriteLine();
                        continue;
                    }

                    var allVariants = new List<StructuralVariant>();

                    if (entity.Alternatives?.Count > 0) {
                        foreach (var alternative in entity.Alternatives) {
                            var variants = VariantExpander.ExpandAlternatives(alternative);
                            allVariants.AddRange(variants);
                        }
                    }
                    else {
                        allVariants.Add(new StructuralVariant("base", null, null, null, null, null, null, null));
                    }

                    totalVariants += allVariants.Count;

                    Console.WriteLine($"✓ {entity.Name}");
                    Console.WriteLine($"  Type: {entity.Type}");
                    Console.WriteLine($"  Category: {entity.Category}");
                    Console.WriteLine($"  Variants: {allVariants.Count}");

                    if (options.ShowAll || allVariants.Count <= 10) {
                        Console.WriteLine("  All variants:");
                        foreach (var variant in allVariants) {
                            Console.WriteLine($"    - {variant.VariantId}");
                        }
                    }
                    else {
                        Console.WriteLine("  Sample variants:");
                        for (var i = 0; i < Math.Min(10, allVariants.Count); i++) {
                            Console.WriteLine($"    - {allVariants[i].VariantId}");
                        }
                        if (allVariants.Count > 10) {
                            Console.WriteLine($"    ... and {allVariants.Count - 10} more");
                            Console.WriteLine("    (use --show-all to see all variants)");
                        }
                    }

                    Console.WriteLine();
                }
                catch (Exception ex) {
                    hasErrors = true;
                    Console.Error.WriteLine($"✗ {entity.Name}: {ex.Message}");
                    Console.WriteLine();
                }
            }

            Console.WriteLine("=".PadRight(60, '='));
            Console.WriteLine($"Total entities: {entities.Count}");
            Console.WriteLine($"Total variants: {totalVariants}");

            if (totalVariants > 50) {
                Console.WriteLine();
                Console.ForegroundColor = ConsoleColor.Yellow;
                Console.WriteLine($"⚠ Warning: Generating {totalVariants} variants will create many API calls.");
                Console.WriteLine("  Consider using --limit parameter when generating.");
                Console.ResetColor();
            }

            if (hasErrors) {
                Console.WriteLine();
                Console.ForegroundColor = ConsoleColor.Red;
                Console.WriteLine("✗ Some entities have validation errors.");
                Console.ResetColor();
                return 1;
            }

            Console.WriteLine();
            Console.ForegroundColor = ConsoleColor.Green;
            Console.WriteLine("✓ All entities valid and ready for generation.");
            Console.ResetColor();

            Console.WriteLine();
            Console.Write("Can I proceed? (Y/n): ");
            var response = Console.ReadLine()?.Trim().ToLowerInvariant();
            if (response is "n" or "no") {
                Console.WriteLine("Preparation cancelled by user.");
                return 0;
            }

            return await GeneratePromptFilesAsync(entities, options, ct);
        }
        catch (JsonException ex) {
            Console.Error.WriteLine($"Error: Invalid JSON format: {ex.Message}");
            return 1;
        }
        catch (Exception ex) {
            Console.Error.WriteLine($"Error: {ex.Message}");
            return 1;
        }
    }

    private async Task<int> GeneratePromptFilesAsync(
        List<EntityDefinition> entities,
        PrepareOptions options,
        CancellationToken ct) {
        Console.WriteLine();
        Console.WriteLine("Generating prompt files...");
        Console.WriteLine();

        var overwriteAll = false;
        var processedCount = 0;
        var totalToProcess = 0;

        var provider = config["PromptEnhancer:Provider"] ?? throw new InvalidOperationException("Prompt enhancer provider not configured.");
        IPromptEnhancer promptEnhancer = provider.ToUpperInvariant() switch {
            "OPENAI" => new OpenAiClient(httpClientFactory, config),
            _ => throw new InvalidOperationException($"Unsupported prompt enhancer provider: {provider}.")
        };

        foreach (var entity in entities) {
            var validationResult = entity.Validate();
            if (validationResult.HasErrors) {
                continue;
            }

            var allVariants = new List<StructuralVariant>();

            if (entity.Alternatives?.Count > 0) {
                foreach (var alternative in entity.Alternatives) {
                    var variants = VariantExpander.ExpandAlternatives(alternative);
                    allVariants.AddRange(variants);
                }
            }
            else {
                allVariants.Add(new StructuralVariant("base", null, null, null, null, null, null, null));
            }

            if (options.Limit.HasValue) {
                allVariants = [.. allVariants.Take(options.Limit.Value)];
            }

            var imageTypes = GetImageTypesForCategory(entity.Category);
            totalToProcess += allVariants.Count * imageTypes.Length;
        }

        foreach (var entity in entities) {
            var validationResult = entity.Validate();
            if (validationResult.HasErrors) {
                continue;
            }

            var allVariants = new List<StructuralVariant>();

            if (entity.Alternatives?.Count > 0) {
                foreach (var alternative in entity.Alternatives) {
                    var variants = VariantExpander.ExpandAlternatives(alternative);
                    allVariants.AddRange(variants);
                }
            }
            else {
                allVariants.Add(new StructuralVariant("base", null, null, null, null, null, null, null));
            }

            if (options.Limit.HasValue) {
                allVariants = [.. allVariants.Take(options.Limit.Value)];
            }

            foreach (var variant in allVariants) {
                ct.ThrowIfCancellationRequested();

                var variantPath = imageStore.GetVariantDirectoryPath(entity, variant);
                Directory.CreateDirectory(variantPath);

                var imageTypes = GetImageTypesForCategory(entity.Category);
                var totalPromptsForVariant = imageTypes.Length;

                var anyFileExists = false;
                foreach (var imageType in imageTypes) {
                    var fileName = ImageType.ToFileName(imageType);
                    if (File.Exists(Path.Combine(variantPath, $"{fileName}.prompt"))) {
                        anyFileExists = true;
                        break;
                    }
                }

                var skipAll = false;
                if (anyFileExists && !overwriteAll) {
                    Console.WriteLine();
                    Console.WriteLine($"Prompt files exist for: {entity.Name} / {variant.VariantId}");
                    Console.Write("Overwrite? (Yes/No/All/Cancel): ");
                    switch (Console.ReadLine()?.Trim().ToLowerInvariant()) {
                        case "y" or "yes":
                            break;
                        case "n" or "no":
                            Console.WriteLine($"Skipping: {entity.Name} / {variant.VariantId}");
                            processedCount += totalPromptsForVariant;
                            skipAll = true;
                            break;
                        case "a" or "all":
                            overwriteAll = true;
                            break;
                        case "c" or "cancel":
                            Console.WriteLine("Preparation cancelled by user.");
                            Console.WriteLine($"Processed {processedCount}/{totalToProcess} prompts.");
                            return 0;
                        default:
                            Console.WriteLine($"Skipping: {entity.Name} / {variant.VariantId}");
                            processedCount += totalPromptsForVariant;
                            skipAll = true;
                            break;
                    }
                }

                if (skipAll) {
                    continue;
                }

                Console.Write($"Enhancing prompts for {entity.Name} / {variant.VariantId}... ");

                foreach (var imageType in imageTypes) {
                    var result = await promptEnhancer.EnhancePromptAsync(entity, variant, imageType, ct);
                    if (result.IsSuccess) {
                        var fileName = ImageType.ToFileName(imageType);
                        var promptPath = Path.Combine(variantPath, $"{fileName}.prompt");
                        await File.WriteAllTextAsync(promptPath, result.Prompt, ct);
                    } else {
                        Console.WriteLine();
                        Console.ForegroundColor = ConsoleColor.Red;
                        Console.WriteLine($"✗ Failed to enhance prompt for {entity.Name} / {variant.VariantId} / {imageType}: {result.ErrorMessage}");
                        Console.ResetColor();
                    }
                    processedCount++;
                }

                Console.WriteLine($"✓ ({totalPromptsForVariant}/{totalPromptsForVariant})");
            }
        }

        Console.WriteLine();
        Console.ForegroundColor = ConsoleColor.Green;
        Console.WriteLine($"✓ Preparation complete. {processedCount}/{totalToProcess} prompts processed.");
        Console.ResetColor();

        return 0;
    }

    private static string[] GetImageTypesForCategory(string category) => category.Equals("objects", StringComparison.OrdinalIgnoreCase)
            ? [ImageType.TopDown, ImageType.Miniature, ImageType.Portrait]
            : ImageType.All;
}
