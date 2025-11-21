namespace VttTools.AssetImageManager.Application.Commands;

public sealed class PrepareCommand(IHttpClientFactory httpClientFactory,
                                   IFileStore imageStore,
                                   IConfiguration config,
                                   IEntityLoaderService entityLoader) {

    public async Task<int> ExecuteAsync(PrepareOptions options, CancellationToken ct = default) {
        var stopwatch = Stopwatch.StartNew();

        var validationResult = InputFileValidator.ValidateJsonFile(options.InputPath);
        if (!validationResult.IsSuccess) {
            ConsoleOutput.WriteError($"Error: {validationResult.ErrorMessage}");
            return 1;
        }

        try {
            var outputOptions = new EntityOutputOptions(VerboseOutput: true, ShowAllVariants: options.ShowAll);
            var loadResult = await entityLoader.LoadAndValidateAsync(options.InputPath, outputOptions, ct);

            if (loadResult.HasErrors) {
                ConsoleOutput.WriteBlankLine();
                Console.ForegroundColor = ConsoleColor.Red;
                ConsoleOutput.WriteLine("✗ Some entities have validation errors.");
                Console.ResetColor();
                return 1;
            }

            var validEntries = loadResult.ValidEntries.ToDictionary(kv => kv.Key, kv => (List<StructuralVariant>)[.. kv.Value]);

            var proceed = ConfirmationDialog.Show(validEntries);
            if (!proceed) {
                ConsoleOutput.WriteLine("Preparation cancelled by the user.");
                return 0;
            }
            await GeneratePromptsAsync(validEntries, ct);
            ConsoleOutput.WriteLine($"Total time: {stopwatch.Elapsed:hh\\:mm\\:ss\\.fff}.");

            return 0;
        }
        catch (JsonException ex) {
            ConsoleOutput.WriteError($"Error: Invalid JSON format: {ex.Message}");
            return 1;
        }
        catch (Exception ex) {
            ConsoleOutput.WriteError($"Error: {ex.Message}");
            return 1;
        }
    }

    private async Task<int> GeneratePromptsAsync(Dictionary<EntryDefinition, List<StructuralVariant>> entries, CancellationToken ct) {
        ConsoleOutput.WriteBlankLine();
        ConsoleOutput.WriteLine("Generating prompt files...");
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
            ConsoleOutput.WriteLine($"Enhancing prompts for {entity.Name}{variants}... ");

            var entryCost = 0.0;
            foreach (var imageType in imageTypes) {
                (replace, var promptCost) = await GeneratePromptAsync(entity, variant, imageType, replace, ct);
                if (replace is AllowOverwriteResult.Skip or AllowOverwriteResult.AlwaysSkip or AllowOverwriteResult.Cancel) {
                    skipCount++;
                } else {
                    processedCount++;
                }
                entryCost += promptCost;
            }
            ConsoleOutput.WriteLine($"Entry cost: ${entryCost:0.0000}");
            finalCost += entryCost;
        }

        ConsoleOutput.WriteBlankLine();
        if (replace is not AllowOverwriteResult.Cancel) {
            Console.ForegroundColor = ConsoleColor.Yellow;
            ConsoleOutput.Write("✓ Preparation complete.");
        } else {
            Console.ForegroundColor = ConsoleColor.Green;
            ConsoleOutput.Write("⚠ Preparation cancelled.");
        }
        System.Console.ResetColor();
        ConsoleOutput.WriteLine($" Total Entries: {entries.Count}; Expected Files: {totalFiles}; Processed: {processedCount}; Skipped: {skipCount}.");
        ConsoleOutput.WriteLine($"Total cost: ${finalCost:0.0000}");

        return 0;
    }

    private async Task<(AllowOverwriteResult, double)> GeneratePromptAsync(EntryDefinition entity, StructuralVariant variant, string imageType, AllowOverwriteResult skipOrOverwriteState, CancellationToken ct) {
        ConsoleOutput.Write($"    {imageType}...");

        var filePath = imageStore.FindPromptFile(entity, variant, imageType);
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

        var provider = config["PromptEnhancer:Provider"] ?? throw new InvalidOperationException("Prompt enhancer provider not configured.");
        IPromptEnhancer promptEnhancer = provider.ToUpperInvariant() switch {
            "OPENAI" => new OpenAiPromptEnhancer(httpClientFactory, config),
            _ => throw new InvalidOperationException($"Unsupported prompt enhancer provider: {provider}.")
        };

        var result = await promptEnhancer.EnhancePromptAsync(entity, variant, imageType, ct);
        if (result.IsSuccess) {
            await imageStore.SavePromptAsync(entity, variant, result.Prompt, imageType, ct);
            Console.ForegroundColor = ConsoleColor.Green;
            ConsoleOutput.WriteLine($" Elapsed: {result.Duration:mm\\:ss\\.fff} ✓ Success");
        }
        else {
            Console.ForegroundColor = ConsoleColor.Red;
            ConsoleOutput.WriteLine($" Elapsed: {result.Duration:mm\\:ss\\.fff} ✗ Failed to enhance prompt for {entity.Name} / {variant.VariantId} / {imageType}: {result.ErrorMessage}");
        }
        System.Console.ResetColor();
        return (skipOrOverwriteState, result.TotalCost);
    }
}
