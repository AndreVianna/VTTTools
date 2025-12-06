namespace VttTools.MediaGenerator.Application.Commands;

public sealed class PrepareCommand(IHttpClientFactory httpClientFactory,
                                   IFileStore fileStore,
                                   IConfiguration config) {

    public async Task<int> ExecuteAsync(PrepareOptions options, CancellationToken ct = default) {
        var stopwatch = Stopwatch.StartNew();

        var validationResult = InputFileValidator.ValidateJsonFile(options.InputPath);
        if (!validationResult.IsSuccessful) {
            ConsoleOutput.WriteError($"Error: {validationResult.Errors[0]}");
            return 1;
        }

        try {
            var assets = await fileStore.LoadAssetsAsync(options.InputPath, ct);
            var proceed = ConfirmationDialog.Show(assets);
            if (!proceed) {
                ConsoleOutput.WriteLine("Preparation cancelled by the user.");
                return 0;
            }
            await GeneratePromptsAsync(assets, ct);
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

    private async Task<int> GeneratePromptsAsync(List<Asset> assets, CancellationToken ct) {
        ConsoleOutput.WriteBlankLine();
        ConsoleOutput.WriteLine("Generating prompt files...");
        ConsoleOutput.WriteBlankLine();

        var totalFiles = assets.Sum(i =>
            i.Tokens.Count > 0
                ? ImageTypeFor(i.Classification.Kind, false).Count + ((i.Tokens.Count - 1) * ImageTypeFor(i.Classification.Kind, true).Count)
                : ImageTypeFor(i.Classification.Kind, false).Count);

        var replace = AllowOverwriteResult.Overwrite;
        var finalCost = 0.0;
        var processedCount = 0;
        var skipCount = 0;
        var previousAssetIndex = -1;
        foreach (var (assetIndex, asset, tokenIndex, token) in assets.SelectMany((e, i) =>
            e.Tokens.Count > 0
                ? e.Tokens.Select((v, vi) => (assetIndex: i, entity: e, tokenIndex: vi + 1, token: (ResourceInfo?)v))
                : [(assetIndex: i, entity: e, tokenIndex: 0, token: (ResourceInfo?)null)])) {
            ct.ThrowIfCancellationRequested();
            if (replace is AllowOverwriteResult.Cancel) {
                skipCount = totalFiles - (processedCount + skipCount);
                break;
            }

            if (previousAssetIndex != assetIndex) {
                ConsoleOutput.WriteLine($"[{assetIndex + 1}/{assets.Count}] {asset.Classification.Kind} {asset.Name}");
                previousAssetIndex = assetIndex;
            }

            var imageTypes = ImageTypeFor(asset.Classification.Kind, tokenIndex > 0);
            var tokenText = tokenIndex == 0 ? string.Empty : $" tokenIndex {tokenIndex}";
            ConsoleOutput.WriteLine($"Enhancing prompts for {asset.Name}{tokenText}... ");

            var entryCost = 0.0;
            foreach (var imageType in imageTypes) {
                (replace, var promptCost) = await GeneratePromptAsync(imageType, asset, tokenIndex, replace, ct);
                if (replace is AllowOverwriteResult.Skip or AllowOverwriteResult.AlwaysSkip or AllowOverwriteResult.Cancel) {
                    skipCount++;
                }
                else {
                    processedCount++;
                }
                entryCost += promptCost;
            }
            ConsoleOutput.WriteLine($"Entry cost: ${entryCost:0.0000}");
            finalCost += entryCost;
        }

        ConsoleOutput.WriteBlankLine();
        if (replace is not AllowOverwriteResult.Cancel) {
            ConsoleOutput.WriteSuccess("✓ Preparation complete.");
        }
        else {
            ConsoleOutput.WriteWarning("⚠ Preparation cancelled.");
        }
        ConsoleOutput.WriteLine($" Total Entries: {assets.Count}; Expected Files: {totalFiles}; Processed: {processedCount}; Skipped: {skipCount}.");
        ConsoleOutput.WriteLine($"Total cost: ${finalCost:0.0000}");

        return 0;
    }

    private async Task<(AllowOverwriteResult, double)> GeneratePromptAsync(string imageType, Asset entity, int tokenIndex, AllowOverwriteResult skipOrOverwriteState, CancellationToken ct) {
        ConsoleOutput.Write($"    {imageType}...");

        var filePath = fileStore.FindPromptFile(imageType, entity, tokenIndex);
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

        var result = await promptEnhancer.EnhancePromptAsync(imageType, entity, tokenIndex, ct);
        if (result.IsSuccess) {
            await fileStore.SavePromptAsync(imageType, entity, tokenIndex, result.Prompt, ct);
            ConsoleOutput.WriteSuccess($" Elapsed: {result.Duration:mm\\:ss\\.fff} ✓ Success");
        }
        else {
            ConsoleOutput.WriteError($" Elapsed: {result.Duration:mm\\:ss\\.fff} ✗ Failed to enhance {imageType} prompt for {entity.Name} #{tokenIndex}: {result.ErrorMessage}");
        }
        return (skipOrOverwriteState, result.TotalCost);
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