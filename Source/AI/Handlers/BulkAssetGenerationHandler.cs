using VttTools.Audit.Model.Payloads;

namespace VttTools.AI.Handlers;

public sealed class BulkAssetGenerationHandler(
    IImageGenerationService imageService,
    IResourceServiceClient resourceClient,
    IAssetsServiceClient assetClient,
    IPromptTemplateStorage templateStorage,
    IAuditLogService auditLogService,
    ILogger<BulkAssetGenerationHandler> logger) {

    public const string JobTypeName = "BulkAssetGeneration";

    public async Task<Result<AssetGenerationResult>> ProcessItemAsync(Guid ownerId, JobItemContext context, CancellationToken ct) {
        try {
            var itemData = JsonSerializer.Deserialize<AssetGenerationData>(context.Data, JsonDefaults.Options);
            var itemName = itemData?.Name ?? $"Item {context.Index}";

            PromptTemplate? template = null;
            if (itemData?.TemplateId.HasValue == true)
                template = await templateStorage.GetByIdAsync(itemData.TemplateId.Value, ct);

            var prompt = BuildPrompt(itemName, itemData, template);

            Guid? portraitResourceId = null;
            Guid? tokenResourceId = null;

            var generatePortrait = itemData?.GeneratePortrait ?? false;
            var generateToken = itemData?.GenerateToken ?? false;

            if (generatePortrait) {
                logger.LogDebug("Generating portrait for {AssetName}", itemName);
                var portraitResult = await GenerateImageAsync(prompt, "portrait", ct);
                if (portraitResult.IsSuccessful) {
                    portraitResourceId = await resourceClient.UploadImageAsync(
                        ownerId,
                        portraitResult.Value.ImageData,
                        $"{itemName}_portrait.png",
                        portraitResult.Value.ContentType,
                        ResourceType.Portrait,
                        ct);

                    // Audit log: Resource generated via job
                    await LogResourceGeneratedAsync(ownerId, context.JobId, context.Index, portraitResourceId.Value, "Portrait", ct);
                }
                else {
                    logger.LogWarning("Portrait generation failed for {AssetName}: {Errors}", itemName, string.Join(", ", portraitResult.Errors));
                    return Result.Failure($"Portrait generation failed: {string.Join(", ", portraitResult.Errors)}").WithNo<AssetGenerationResult>();
                }
            }

            if (generateToken) {
                logger.LogDebug("Generating token for {AssetName}", itemName);
                var tokenResult = await GenerateImageAsync(prompt, "token", ct);
                if (tokenResult.IsSuccessful) {
                    tokenResourceId = await resourceClient.UploadImageAsync(
                        ownerId,
                        tokenResult.Value.ImageData,
                        $"{itemName}_token.png",
                        tokenResult.Value.ContentType,
                        ResourceType.Token,
                        ct);

                    // Audit log: Resource generated via job
                    await LogResourceGeneratedAsync(ownerId, context.JobId, context.Index, tokenResourceId.Value, "Token", ct);
                }
                else {
                    logger.LogWarning("Token generation failed for {AssetName}: {Errors}", itemName, string.Join(", ", tokenResult.Errors));
                    return Result.Failure($"Token generation failed: {string.Join(", ", tokenResult.Errors)}").WithNo<AssetGenerationResult>();
                }
            }

            logger.LogDebug("Creating createResult {AssetName}", itemName);
            var createAssetRequest = new CreateAssetRequest {
                Kind = itemData?.Kind ?? AssetKind.Character,
                Category = itemData?.Category ?? string.Empty,
                Type = itemData?.Type ?? string.Empty,
                Subtype = itemData?.Subtype,
                Name = itemName,
                Description = itemData?.Description ?? string.Empty,
                Tags = itemData?.Tags ?? [],
                PortraitId = portraitResourceId,
                TokenId = tokenResourceId,
            };

            var createResult = await assetClient.CreateAssetAsync(ownerId, createAssetRequest, ct);
            if (!createResult.IsSuccessful)
                return Result.Failure(createResult.Errors).WithNo<AssetGenerationResult>();

            // Audit log: Asset generated via job
            await LogAssetGeneratedAsync(ownerId, context.JobId, context.Index, createResult.Value, portraitResourceId, tokenResourceId, ct);

            var result = new AssetGenerationResult(createResult.Value, portraitResourceId, tokenResourceId);
            return result;
        }
        catch (Exception ex) {
            logger.LogError(ex, "Error processing item {Index}", context.Index);
            return Result.Failure(ex.Message).WithNo<AssetGenerationResult>();
        }
    }

    private Task<Result<ImageGenerationResponse>> GenerateImageAsync(string prompt, string imageType, CancellationToken ct) {
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

    private static string BuildPrompt(string itemName, AssetGenerationData? itemData, PromptTemplate? template) {
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

    private async Task LogAssetGeneratedAsync(
        Guid ownerId,
        Guid jobId,
        int jobItemIndex,
        Guid assetId,
        Guid? portraitResourceId,
        Guid? tokenResourceId,
        CancellationToken ct) {

        var payload = new AssetGeneratedPayload {
            JobId = jobId.ToString(),
            JobItemIndex = jobItemIndex,
            PortraitResourceId = portraitResourceId?.ToString(),
            TokenResourceId = tokenResourceId?.ToString(),
        };
        var auditLog = new AuditLog {
            UserId = ownerId,
            Action = "Asset:Generated:ViaJob",
            EntityType = "Asset",
            EntityId = assetId.ToString(),
            Payload = JsonSerializer.Serialize(payload, JsonDefaults.Options),
        };
        await auditLogService.AddAsync(auditLog, ct);
    }

    private async Task LogResourceGeneratedAsync(
        Guid ownerId,
        Guid jobId,
        int jobItemIndex,
        Guid resourceId,
        string resourceType,
        CancellationToken ct) {

        var payload = new ResourceGeneratedPayload {
            JobId = jobId.ToString(),
            JobItemIndex = jobItemIndex,
            ResourceType = resourceType,
        };
        var auditLog = new AuditLog {
            UserId = ownerId,
            Action = "Resource:Generated:ViaJob",
            EntityType = "Resource",
            EntityId = resourceId.ToString(),
            Payload = JsonSerializer.Serialize(payload, JsonDefaults.Options),
        };
        await auditLogService.AddAsync(auditLog, ct);
    }
}
