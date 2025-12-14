namespace VttTools.MediaGenerator.Application.Commands;

public sealed class PrepareCommand(IPromptEnhancementService promptEnhancementService,
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
        foreach ((var assetIndex, var asset, var tokenIndex, var token) in assets.SelectMany((e, i) =>
                                                                                                 e.Tokens.Count > 0
                                                                                                     ? e.Tokens.Select((v, vi) => (assetIndex: i, entity: e, tokenIndex: vi + 1, token: (ResourceMetadata?)v))
                                                                                                     : [(assetIndex: i, entity: e, tokenIndex: 0, token: null)])) {
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

        var providerName = config["PromptEnhancer:Provider"] ?? throw new InvalidOperationException("Prompt enhancer provider not configured.");
        var model = config["PromptEnhancer:Model"] ?? throw new InvalidOperationException("Prompt enhancer model not configured.");

        var request = BuildPromptData(imageType, entity, tokenIndex, providerName, model);

        var result = await promptEnhancementService.GenerateAsync(request, ct);
        if (result.IsSuccessful) {
            var response = result.Value;
            await fileStore.SavePromptAsync(imageType, entity, tokenIndex, response.EnhancedPrompt, ct);
            ConsoleOutput.WriteSuccess($" Elapsed: {response.Elapsed:mm\\:ss\\.fff} ✓ Success");
            return (skipOrOverwriteState, (double)response.Cost);
        }

        var error = result.Errors[0].Message;
        ConsoleOutput.WriteError($" ✗ Failed to enhance {imageType} prompt for {entity.Name} #{tokenIndex}: {error}");
        return (skipOrOverwriteState, 0.0);
    }

    private static PromptEnhancementData BuildPromptData(
        string imageType,
        Asset asset,
        int tokenIndex,
        string provider,
        string model) {
        var userPrompt = BuildUserPrompt(imageType, asset, tokenIndex);
        var systemPrompt = BuildSystemPrompt(imageType, asset);

        return new PromptEnhancementData {
            Prompt = userPrompt,
            Context = systemPrompt,
            Provider = provider,
            Model = model
        };
    }

    private static string BuildSystemPrompt(string imageType, Asset asset)
        => $""""
        You are an expert at creating image generation prompts for a high quality {asset.Classification.Kind} illustration.
        Your task in to create a detailed prompt that generates an image that captures all of the details described below."
        You MUST ensure that the image that the prompt describes is {ImageDescriptionFor(imageType, asset)} in a Virtual Tabletop Web Application.
        You MUST also ensure that the image does not contain any border, frame, text, watermark, signature, blurry, multiple subjects, duplicates, cropped edges, cropped parts, distorted shapes, and incorrect forms, body parts or perspective."
        The image MUST be a realistic color-pencil illustration, with vivid colors, good contrast, with focus on the {asset.Classification.Kind} described below."
        The output MUST be a simple text that will be immediatelly submitted to an image generator AI."
        It MUST not have any preamble or explanation or the result, only the prompt text tailored for image generation."
        Here is the {asset.Classification.Kind} description:
        """";

    private static string ImageDescriptionFor(string imageType, Asset asset)
        => imageType switch {
            "TopDown" => $"a bird's eye, top-down of the {asset.Classification.Kind}, with a transparent background to be seamless integrated into a virtual battlemap",
            "CloseUp" => $"a close-up of the main features of the {asset.Classification.Kind}, with a solid neutral background, to be used as a token on a virtual battlemap",
            _ => $"a portrait of the {asset.Classification.Kind}, displaying it in full view, with an image background that highlights the {BackgroundFor(asset)}, to be used as the {asset.Classification.Kind} display",
        };

    private static string BackgroundFor(Asset asset) => asset.Classification.Kind switch {
        AssetKind.Creature => $"{asset.Classification.Kind} in its natural environment",
        AssetKind.Character => $"{asset.Classification.Kind}'s background",
        _ => $"{asset.Classification.Kind}",
    };

    private static string BuildUserPrompt(string imageType, Asset asset, int tokenIndex) {
        var sb = new StringBuilder();
        sb.AppendLine($"{asset.Name}; {BuildType(asset)}.");
        AppendAssetDescription(sb, asset);
        AppendImageDescription(sb, imageType, asset, tokenIndex);
        return sb.ToString();
    }

    private static void AppendAssetDescription(StringBuilder sb, Asset asset) {
        if (!string.IsNullOrWhiteSpace(asset.Description))
            sb.AppendLine($"The subject is described as {asset.Description}. ");
    }

    private static void AppendImageDescription(
        StringBuilder sb,
        string imageType,
        Asset asset,
        int tokenIndex) {
        if (imageType.Equals("Portrait", StringComparison.OrdinalIgnoreCase) && !string.IsNullOrWhiteSpace(asset.Portrait?.Description)) {
            sb.AppendLine(asset.Portrait.Description);
            return;
        }

        if (tokenIndex >= 0 && tokenIndex < asset.Tokens.Count)
            sb.AppendLine(asset.Tokens[tokenIndex].Description);
    }

    private static string BuildType(Asset entity)
        => string.IsNullOrWhiteSpace(entity.Classification.Type) ? ""
        : string.IsNullOrWhiteSpace(entity.Classification.Subtype) ? $" {entity.Classification.Type}"
        : $" {entity.Classification.Type} ({entity.Classification.Subtype})";

    private static IReadOnlyList<string> ImageTypeFor(AssetKind kind, bool isToken = false)
        => kind switch {
            AssetKind.Character when isToken => ["TopDown", "CloseUp"],
            AssetKind.Creature when isToken => ["TopDown", "CloseUp"],
            AssetKind.Object when isToken => ["TopDown"],
            AssetKind.Object => ["TopDown", "Portrait"],
            _ => ["TopDown", "CloseUp", "Portrait"],
        };
}