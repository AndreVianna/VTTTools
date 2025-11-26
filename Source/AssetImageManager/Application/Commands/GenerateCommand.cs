namespace VttTools.AssetImageManager.Application.Commands;

public sealed class GenerateCommand(IHttpClientFactory httpClientFactory,
                                    IFileStore fileStore,
                                    IConfiguration config) {

    public async Task<int> ExecuteAsync(GenerateOptions options, CancellationToken ct = default) {
        var stopwatch = Stopwatch.StartNew();

        var validationResult = InputFileValidator.ValidateJsonFile(options.InputPath);
        if (!validationResult.IsSuccessful) {
            ConsoleOutput.WriteError($"Error: {validationResult.Errors[0]}");
            return 1;
        }

        var assets = await fileStore.LoadAssetsAsync(options.InputPath, ct);
        var validEntries = ApplyNameFilter(assets, options.NameFilter);
        if (validEntries.Count == 0) {
            ConsoleOutput.WriteLine($"No asset matching '{options.NameFilter}' found in {options.InputPath}.");
            return 0;
        }

        var variantCount = 0;
        if (options.Limit is not null && options.Limit < validEntries.Sum(a => a.Tokens.Count)) {
            validEntries = [..validEntries.TakeWhile(a => {
                variantCount += a.Tokens.Count;
                return variantCount <= options.Limit;
            })];
        }
        var totalTokens = validEntries.Sum(a => a.Tokens.Count);

        ConsoleOutput.WriteLine($"Loaded {validEntries.Count} entries from {options.InputPath}.");

        var proceed = ConfirmationDialog.Show(validEntries);
        if (!proceed) {
            ConsoleOutput.WriteLine("Generation cancelled by user.");
            return 0;
        }

        var generatedCount = await GenerateImagesAsync(validEntries, options.DelayMs, ct);
        ConsoleOutput.WriteLine($"Total time: {stopwatch.Elapsed:hh\\:mm\\:ss\\.fff}.");
        return 0;
    }

    private static IReadOnlyList<Asset> ApplyNameFilter(IReadOnlyList<Asset> entries, string? nameFilter) {
        if (string.IsNullOrWhiteSpace(nameFilter)) {
            return entries;
        }

        var filter = nameFilter.Trim();
        return [..entries.Where(e => e.Name.Contains(filter, StringComparison.OrdinalIgnoreCase))];
    }

    private async Task<int> GenerateImagesAsync(IReadOnlyList<Asset> entries, int delayMs, CancellationToken ct) {
        ConsoleOutput.WriteBlankLine();
        ConsoleOutput.WriteLine("Generating images files...");
        ConsoleOutput.WriteBlankLine();

        var totalFiles = entries.Sum(i => ImageTypeFor(i.Classification.Kind, false).Count + (i.Tokens.Count * ImageTypeFor(i.Classification.Kind, true).Count));

        var replace = AllowOverwriteResult.Overwrite;
        var finalCost = 0.0;
        var processedCount = 0;
        var skipCount = 0;
        var previousIndex = -1;

        ct.ThrowIfCancellationRequested();

        foreach (var asset in entries) {
            foreach (var imageType in ImageTypeFor(asset.Classification.Kind, false)) {
                (replace, var imageCost) = await GenerateImageAsync(imageType, asset, 0, replace, ct);
                if (replace is AllowOverwriteResult.Skip or AllowOverwriteResult.AlwaysSkip or AllowOverwriteResult.Cancel) {
                    skipCount++;
                }
                else {
                    processedCount++;
                }
                finalCost += imageCost;
                if (delayMs > 0)
                    await Task.Delay(delayMs, ct);
            }
            ConsoleOutput.WriteLine($"Asset cost: ${finalCost:0.0000}");

            var index = 1;
            foreach (var token in asset.Tokens) {
                if (replace is AllowOverwriteResult.Cancel) {
                    skipCount = totalFiles - (processedCount + skipCount);
                    break;
                }

                if (previousIndex != index) {
                    ConsoleOutput.WriteLine($"[{index + 1}/{entries.Count}] {asset.Classification.Kind} {asset.Name}");
                    previousIndex = index;
                }

                var imageTypes = ImageTypeFor(asset.Classification.Kind, true);
                ConsoleOutput.WriteLine($"Generating images for {asset.Name} {token.Description}... ");

                var entryCost = 0.0;
                foreach (var imageType in imageTypes) {
                    (replace, var variantImageCost) = await GenerateImageAsync(imageType, asset, index, replace, ct);
                    if (replace is AllowOverwriteResult.Skip or AllowOverwriteResult.AlwaysSkip or AllowOverwriteResult.Cancel) {
                        skipCount++;
                    }
                    else {
                        processedCount++;
                    }
                    entryCost += variantImageCost;
                    if (delayMs > 0) await Task.Delay(delayMs, ct);
                }
                ConsoleOutput.WriteLine($"Entry cost: ${entryCost:0.0000}");
                finalCost += entryCost;
                index++;
            }
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

        ConsoleOutput.WriteLine($"Generation complete. {processedCount}/{totalFiles} images generated.");
        return 0;
    }

    private async Task<(AllowOverwriteResult, double)> GenerateImageAsync(string imageType, Asset asset, int tokenIndex, AllowOverwriteResult skipOrOverwriteState, CancellationToken ct) {
        ConsoleOutput.Write($"    {imageType}...");

        var filePath = fileStore.FindImageFile(imageType, asset, tokenIndex);
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

        var finalPrompt = await GetImagePromptAsync(imageType, asset, tokenIndex, ct);
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
            await fileStore.SaveImageAsync(imageType, asset, tokenIndex, result.Data, ct);
            Console.ForegroundColor = ConsoleColor.Green;
            ConsoleOutput.WriteLine($" Elapsed: {result.Duration:mm\\:ss\\.fff} ✓ Success");
        }
        else {
            Console.ForegroundColor = ConsoleColor.Red;
            ConsoleOutput.WriteLine($" Elapsed: {result.Duration:mm\\:ss\\.fff} ✗ Failed to genrate {imageType} for {asset.Name} #{tokenIndex}: {result.ErrorMessage}");
        }
        Console.ResetColor();
        return (skipOrOverwriteState, result.TotalCost);
    }

    private async Task<string?> GetImagePromptAsync(string imageType, Asset entity, int tokenIndex, CancellationToken ct) {
        var promptFilePath = fileStore.FindPromptFile(imageType, entity, tokenIndex);
        if (promptFilePath is null) {
            ConsoleOutput.WriteError($" Error: Prompt file {promptFilePath} not found.");
            ConsoleOutput.WriteError("  Run 'token prepare' first to generate prompt files.");
            return null;
        }
        return await File.ReadAllTextAsync(promptFilePath, ct);
    }

    private static IReadOnlyList<string> ImageTypeFor(AssetKind kind, bool isToken = false)
        => kind switch {
            AssetKind.Character when isToken => ["TopDown", "CloseUp"],
            AssetKind.Creature when isToken => ["TopDown", "CloseUp"],
            AssetKind.Object when isToken => ["TopDown"],
            AssetKind.Object => ["TopDown", "Portrait"],
            _ => ["TopDown", "CloseUp", "Portrait"],
        };
}
