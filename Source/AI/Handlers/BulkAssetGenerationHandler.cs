namespace VttTools.AI.Handlers;

public sealed class BulkAssetGenerationHandler(
    IImageGenerationService imageService,
    ResourceServiceClient resourceClient,
    AssetServiceClient assetClient,
    IPromptTemplateStorage templateStorage,
    ILogger<BulkAssetGenerationHandler> logger) {

    public const string JobTypeName = "BulkAssetGeneration";

    private static readonly JsonSerializerOptions _jsonOptions = new() {
        PropertyNameCaseInsensitive = true,
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        WriteIndented = false
    };

    public string JobType => JobTypeName;

    public async Task<JobItemResult> ProcessItemAsync(JobItemContext context, CancellationToken ct) {
        try {
            var jobInput = DeserializeJobInput(context.JobInputJson);
            var itemData = DeserializeItemInput(context.ItemInputJson);
            var itemName = itemData?.Name ?? $"Item {context.Index}";

            PromptTemplate? template = null;
            if (jobInput?.TemplateId.HasValue == true)
                template = await templateStorage.GetByIdAsync(jobInput.TemplateId.Value, ct);

            var prompt = BuildPrompt(itemName, itemData, template);

            Guid? portraitResourceId = null;
            Guid? tokenResourceId = null;

            var generatePortrait = jobInput?.GeneratePortrait ?? false;
            var generateToken = jobInput?.GenerateToken ?? false;

            if (generatePortrait) {
                logger.LogDebug("Generating portrait for {ItemName}", itemName);
                var portraitResult = await GenerateImageAsync(prompt, "portrait", ct);
                if (portraitResult.IsSuccessful) {
                    portraitResourceId = await resourceClient.UploadImageAsync(
                        portraitResult.Value.ImageData,
                        $"{itemName}_portrait.png",
                        portraitResult.Value.ContentType,
                        ResourceType.Portrait,
                        context.AuthToken,
                        ct);
                }
            }

            if (generateToken) {
                logger.LogDebug("Generating token for {ItemName}", itemName);
                var tokenResult = await GenerateImageAsync(prompt, "token", ct);
                if (tokenResult.IsSuccessful) {
                    tokenResourceId = await resourceClient.UploadImageAsync(
                        tokenResult.Value.ImageData,
                        $"{itemName}_token.png",
                        tokenResult.Value.ContentType,
                        ResourceType.Token,
                        context.AuthToken,
                        ct);
                }
            }

            logger.LogDebug("Creating asset {ItemName}", itemName);
            var createAssetRequest = new CreateAssetHttpRequest {
                Kind = itemData?.Kind ?? AssetKind.Character,
                Category = itemData?.Category ?? string.Empty,
                Type = itemData?.Type ?? string.Empty,
                Subtype = itemData?.Subtype,
                Name = itemName,
                Description = itemData?.Description ?? string.Empty,
                Tags = itemData?.Tags ?? [],
                PortraitId = portraitResourceId,
                TokenId = tokenResourceId
            };

            var assetId = await assetClient.CreateAssetAsync(createAssetRequest, context.AuthToken, ct);
            if (assetId is null)
                return JobItemResult.Failure("Failed to create asset");

            var outputJson = SerializeItemOutput(assetId.Value, portraitResourceId, tokenResourceId);
            return JobItemResult.Success(outputJson);
        }
        catch (Exception ex) {
            logger.LogError(ex, "Error processing item {ItemId}", context.ItemId);
            return JobItemResult.Failure(ex.Message);
        }
    }

    private Task<Result<ImageGenerationResponse>> GenerateImageAsync(
        string prompt,
        string imageType,
        CancellationToken ct) {
        var contentType = imageType == "token"
            ? GeneratedContentType.ImageToken
            : GeneratedContentType.ImagePortrait;

        var data = new ImageGenerationData {
            ContentType = contentType,
            Prompt = prompt,
            Width = 1024,
            Height = 1024,
        };

        return imageService.GenerateAsync(data, ct);
    }

    private static string BuildPrompt(
        string itemName,
        BulkAssetGenerationItemData? itemData,
        PromptTemplate? template) {
        var basePrompt = $"A {itemData?.Category ?? "fantasy"} {itemData?.Type ?? "character"} named {itemName}";

        if (!string.IsNullOrWhiteSpace(itemData?.Description))
            basePrompt += $". {itemData.Description}";

        if (!string.IsNullOrWhiteSpace(itemData?.Environment))
            basePrompt += $" in {itemData.Environment}";

        return template is not null && !string.IsNullOrWhiteSpace(template.UserPromptTemplate)
            ? template.UserPromptTemplate
                .Replace("{name}", itemName)
                .Replace("{category}", itemData?.Category ?? "")
                .Replace("{type}", itemData?.Type ?? "")
                .Replace("{description}", itemData?.Description ?? "")
                .Replace("{prompt}", basePrompt)
            : basePrompt;
    }

    private static BulkAssetGenerationData? DeserializeJobInput(string? json) {
        if (string.IsNullOrWhiteSpace(json))
            return null;

        try {
            return JsonSerializer.Deserialize<BulkAssetGenerationData>(json, _jsonOptions);
        }
        catch {
            return null;
        }
    }

    private static BulkAssetGenerationItemData? DeserializeItemInput(string? json) {
        if (string.IsNullOrWhiteSpace(json))
            return null;

        try {
            return JsonSerializer.Deserialize<BulkAssetGenerationItemData>(json, _jsonOptions);
        }
        catch {
            return null;
        }
    }

    private static string SerializeItemOutput(Guid assetId, Guid? portraitResourceId, Guid? tokenResourceId)
        => JsonSerializer.Serialize(new {
            AssetId = assetId,
            PortraitResourceId = portraitResourceId,
            TokenResourceId = tokenResourceId
        }, _jsonOptions);
}
