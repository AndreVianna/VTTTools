using VttTools.Audit.Model.Payloads;

namespace VttTools.AI.Handlers;

public sealed class BulkAssetGenerationHandler(
    IImageGenerationService imageService,
    IResourceServiceClient resourceClient,
    IPromptTemplateStorage templateStorage,
    IAuditLogService auditLogService,
    ILogger<BulkAssetGenerationHandler> logger) {

    public const string JobTypeName = "BulkAssetGeneration";

    public async Task<Result<GeneratedResourceResult>> ProcessItemAsync(Guid ownerId, JobItemContext context, CancellationToken ct) {
        try {
            var itemData = JsonSerializer.Deserialize<AssetGenerationData>(context.Data, JsonDefaults.Options);
            var itemName = itemData?.Name ?? $"Item {context.Index}";
            var generationType = itemData?.GenerationType ?? "Portrait"; // Default to Portrait for backward compatibility

            PromptTemplate? template = null;
            if (itemData?.TemplateId.HasValue == true)
                template = await templateStorage.GetByIdAsync(itemData.TemplateId.Value, ct);

            var prompt = BuildPrompt(itemName, itemData, template);

            // Generate single image based on GenerationType (atomic operation)
            var isPortrait = generationType.Equals("Portrait", StringComparison.OrdinalIgnoreCase);
            var imageType = isPortrait ? "portrait" : "token";
            var role = isPortrait ? ResourceRole.Portrait : ResourceRole.Token;

            logger.LogDebug("Generating {GenerationType} for {AssetName}", generationType, itemName);
            var imageResult = await GenerateImageAsync(prompt, imageType, ct);

            if (!imageResult.IsSuccessful) {
                logger.LogWarning("{GenerationType} generation failed for {AssetName}: {Errors}",
                    generationType, itemName, string.Join(", ", imageResult.Errors));
                return Result.Failure($"{generationType} generation failed: {string.Join(", ", imageResult.Errors)}").WithNo<GeneratedResourceResult>();
            }

            var resourceId = await resourceClient.UploadImageAsync(
                ownerId,
                imageResult.Value.ImageData,
                $"{itemName}_{imageType}.png",
                imageResult.Value.ContentType,
                role,
                ct);

            if (!resourceId.HasValue) {
                return Result.Failure("Failed to upload resource").WithNo<GeneratedResourceResult>();
            }

            // Audit log: Display generated via job
            await LogResourceGeneratedAsync(ownerId, context.JobId, context.Index, resourceId.Value, generationType, ct);

            // Return resource info for frontend review (user will approve to create asset)
            var result = new GeneratedResourceResult {
                AssetName = itemName,
                GenerationType = generationType,
                ResourceId = resourceId.Value,
                Kind = (itemData?.Kind ?? AssetKind.Character).ToString(),
                Category = itemData?.Category,
                Type = itemData?.Type,
                Subtype = itemData?.Subtype,
                Description = itemData?.Description,
                Tags = itemData?.Tags ?? [],
            };
            return result;
        }
        catch (Exception ex) {
            logger.LogError(ex, "Error processing item {Index}", context.Index);
            return Result.Failure(ex.Message).WithNo<GeneratedResourceResult>();
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

    private Task LogResourceGeneratedAsync(
        Guid ownerId,
        Guid jobId,
        int jobItemIndex,
        Guid resourceId,
        string role,
        CancellationToken ct) {

        var payload = new ResourceGeneratedPayload {
            JobId = jobId.ToString(),
            JobItemIndex = jobItemIndex,
            ResourceType = role,
        };
        var auditLog = new AuditLog {
            UserId = ownerId,
            Action = "Display:Generated:ViaJob",
            EntityType = "Display",
            EntityId = resourceId.ToString(),
            Payload = JsonSerializer.Serialize(payload, JsonDefaults.Options),
        };
        return auditLogService.AddAsync(auditLog, ct);
    }
}
