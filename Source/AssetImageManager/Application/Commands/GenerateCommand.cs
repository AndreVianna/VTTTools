namespace VttTools.AssetImageManager.Application.Commands;

public sealed class GenerateCommand(IHttpClientFactory httpClientFactory,
                                    IFileStore imageStore,
                                    IConfiguration config,
                                    IEntityLoaderService entityLoader) {

    public async Task<int> ExecuteAsync(GenerateOptions options, CancellationToken ct = default) {
        var stopwatch = Stopwatch.StartNew();

        var validationResult = InputFileValidator.ValidateJsonFile(options.InputPath);
        if (!validationResult.IsSuccess) {
            ConsoleOutput.WriteError($"Error: {validationResult.ErrorMessage}");
            return 1;
        }

        var loadResult = await entityLoader.LoadAndValidateAsync(options.InputPath, new EntityOutputOptions(), ct);
        if (loadResult.HasErrors) return 0;

        var validEntries = loadResult.ValidEntries.ToDictionary(kv => kv.Key, kv => (List<StructuralVariant>)[.. kv.Value]);

        validEntries = ApplyNameFilter(validEntries, options.IdFilter);
        if (validEntries.Count == 0) {
            ConsoleOutput.WriteLine($"No entity matching '{options.IdFilter}' found in {options.InputPath}.");
            return 0;
        }

        if (options.Limit is not null && options.Limit < validEntries.Values.Count) {
            validEntries = validEntries.Take(options.Limit.Value).ToDictionary(kv => kv.Key, kv => kv.Value);
        }

        ConsoleOutput.WriteLine($"Loaded {validEntries.Count} entries from {options.InputPath}.");

        var proceed = ConfirmationDialog.Show(validEntries);
        if (!proceed) {
            ConsoleOutput.WriteLine("Generation cancelled by user.");
            return 0;
        }

        var totalImages = validEntries.Sum(e => e.Value.Count * (options.ImageType.Trim().Equals("all", StringComparison.OrdinalIgnoreCase) ? ImageType.For(e.Key.Category).Length : 1));
        var generatedCount = await GenerateImagesAsync(validEntries, options.DelayMs, ct);
        ConsoleOutput.WriteLine($"Generation complete. {generatedCount}/{totalImages} images generated.");
        ConsoleOutput.WriteLine($"Total time: {stopwatch.Elapsed:hh\\:mm\\:ss\\.fff}.");
        return 0;
    }

    private static Dictionary<EntryDefinition, List<StructuralVariant>> ApplyNameFilter(Dictionary<EntryDefinition, List<StructuralVariant>> entries, string? nameFilter) {
        if (string.IsNullOrWhiteSpace(nameFilter)) {
            return entries;
        }

        var filter = nameFilter.Trim();
        return entries.Where(e => e.Key.Name.Contains(filter, StringComparison.OrdinalIgnoreCase)).ToDictionary(kv => kv.Key, kv => kv.Value);
    }

    private async Task<int> GenerateImagesAsync(Dictionary<EntryDefinition, List<StructuralVariant>> entries, int delayMs, CancellationToken ct) {
        ConsoleOutput.WriteBlankLine();
        ConsoleOutput.WriteLine("Generating images files...");
        ConsoleOutput.WriteBlankLine();

        var totalFiles = entries.Sum(i => i.Value.Count * ImageType.For(i.Key.Category).Length);

        var replace = AllowOverwriteResult.Overwrite;
        var finalCost = 0.0;
        var processedCount = 0;
        var skipCount = 0;
        var previousIndex = -1;
        foreach (var (index, entity, variant) in entries.SelectMany((e, i) => e.Value.Select(v => (index: i, entity: e.Key, variant: v)))) {
            ct.ThrowIfCancellationRequested();
            if (replace is AllowOverwriteResult.Cancel) {
                skipCount = totalFiles - (processedCount + skipCount);
                break;
            }

            if (previousIndex != index) {
                ConsoleOutput.WriteLine($"[{index + 1}/{entries.Count}] {entity.Type} {entity.Name}");
                previousIndex = index;
            }

            var imageTypes = ImageType.For(entity.Category);
            var variants = variant.VariantId == "base" ? string.Empty : $" {variant.VariantId}";
            ConsoleOutput.WriteLine($"Generating images for {entity.Name}{variants}... ");

            var entryCost = 0.0;
            foreach (var imageType in imageTypes) {
                (replace, var imageCost) = await GenerateImageAsync(entity, variant, imageType, replace, ct);
                if (replace is AllowOverwriteResult.Skip or AllowOverwriteResult.AlwaysSkip or AllowOverwriteResult.Cancel) {
                    skipCount++;
                }
                else {
                    processedCount++;
                }
                entryCost += imageCost;
                if (delayMs > 0) await Task.Delay(delayMs, ct);
            }
            ConsoleOutput.WriteLine($"Entry cost: ${entryCost:0.0000}");
            finalCost += entryCost;
        }

        ConsoleOutput.WriteBlankLine();
        if (replace is not AllowOverwriteResult.Cancel) {
            Console.ForegroundColor = ConsoleColor.Yellow;
            ConsoleOutput.Write("✓ Preparation complete.");
        }
        else {
            Console.ForegroundColor = ConsoleColor.Green;
            ConsoleOutput.Write("⚠ Preparation cancelled.");
        }
        Console.ResetColor();
        ConsoleOutput.WriteLine($" Total Entries: {entries.Count}; Expected Files: {totalFiles}; Processed: {processedCount}; Skipped: {skipCount}.");
        ConsoleOutput.WriteLine($"Total cost: ${finalCost:0.0000}");

        return 0;
    }

    private async Task<(AllowOverwriteResult, double)> GenerateImageAsync(EntryDefinition entity, StructuralVariant variant, string imageType, AllowOverwriteResult skipOrOverwriteState, CancellationToken ct) {
        ConsoleOutput.Write($"    {imageType}...");

        var filePath = imageStore.FindImageFile(entity, variant, imageType);
        if (skipOrOverwriteState != AllowOverwriteResult.AlwaysOverwrite && filePath is not null) {
            if (skipOrOverwriteState is AllowOverwriteResult.AlwaysSkip) {
                ConsoleOutput.Write(" Cost: $0.0000000 (0) + $0.0000000 (0) = $0.0000000 (0); ⚠ Skipped");
                return (skipOrOverwriteState, 0.0);
            }
            skipOrOverwriteState = AllowOverwriteDialog.ShowFor(filePath);
            if (skipOrOverwriteState is AllowOverwriteResult.AlwaysSkip or AllowOverwriteResult.Skip or AllowOverwriteResult.Cancel) {
                ConsoleOutput.WriteLine(". Cost: $0.0000000 (0) + $0.0000000 (0) = $0.0000000 (0); ⚠ Skipped");
                return (skipOrOverwriteState, 0.0);
            }
        }

        var finalPrompt = await GetImagePromptAsync(entity, variant, imageType, ct);
        if (finalPrompt is null) return (skipOrOverwriteState, 0.0);

        var provider = config[$"Images:{imageType}:Provider"] ?? throw new InvalidOperationException($"{imageType} provider not configured.");
        IImageGenerator imageGenerator = provider.ToUpperInvariant() switch {
            "STABILITY" => new StabilityClient(httpClientFactory, config),
            "OPENAI" => new OpenAiImageGenerator(httpClientFactory, config),
            "GOOGLE" => new GoogleClient(httpClientFactory, config),
            _ => throw new InvalidOperationException($"Unsupported image generation provider: {provider}.")
        };

        var model = config[$"Images:{imageType}:Model"] ?? throw new InvalidOperationException($"{imageType} model not configured.");

        var result = await imageGenerator.GenerateImageFileAsync(model, imageType, finalPrompt, ct);
        if (result.IsSuccess) {
            await imageStore.SaveImageAsync(entity, variant, result.Data, imageType, ct);
            Console.ForegroundColor = ConsoleColor.Green;
            ConsoleOutput.WriteLine($" Elapsed: {result.Duration:mm\\:ss\\.fff} ✓ Success");
        }
        else {
            Console.ForegroundColor = ConsoleColor.Red;
            ConsoleOutput.WriteLine($" Elapsed: {result.Duration:mm\\:ss\\.fff} ✗ Failed to genrate image for {entity.Name} / {variant.VariantId} / {imageType}: {result.ErrorMessage}");
        }
        Console.ResetColor();
        return (skipOrOverwriteState, result.TotalCost);
    }

    private async Task<string?> GetImagePromptAsync(EntryDefinition entity, StructuralVariant variant, string imageType, CancellationToken ct) {
        var promptFilePath = imageStore.FindPromptFile(entity, variant, imageType);
        if (promptFilePath is null) {
            ConsoleOutput.WriteError($" Error: Prompt file {promptFilePath} not found.");
            ConsoleOutput.WriteError("  Run 'token prepare' first to generate prompt files.");
            return null;
        }
        return await File.ReadAllTextAsync(promptFilePath, ct);
    }
}
