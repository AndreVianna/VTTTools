namespace VttTools.Admin.Resources.Services;

public class ResourceApprovalService(
    IMediaServiceClient mediaClient,
    IAssetsServiceClient assetsClient,
    IAiServiceClient aiClient,
    IOptions<PublicLibraryOptions> options)
    : IResourceApprovalService {

    private readonly Guid _masterUserId = options.Value.MasterUserId;

    public async Task<Result<Guid>> ApproveAsync(ApproveResourceData data, CancellationToken ct = default) {
        var isPortrait = data.GenerationType.Equals("Portrait", StringComparison.OrdinalIgnoreCase);

        // Mark resource as published
        var updateRequest = new UpdateResourceRequest {
            IsPublished = true,
        };
        var updateResult = await mediaClient.UpdateResourceAsync(data.ResourceId, updateRequest, ct);
        if (!updateResult.IsSuccessful)
            return Result.Failure(updateResult.Errors).WithNo<Guid>();

        if (data.AssetId is null) {
            // Create new asset with the resource
            var createRequest = new CreateAssetRequest {
                OwnerId = _masterUserId,
                Kind = data.Kind,
                Category = data.Category ?? string.Empty,
                Type = data.Type ?? string.Empty,
                Subtype = data.Subtype,
                Name = data.AssetName,
                Description = data.Description ?? string.Empty,
                Tags = data.Tags,
                PortraitId = isPortrait ? data.ResourceId : null,
                TokenId = isPortrait ? null : data.ResourceId,
            };
            return await assetsClient.CreateAssetAsync(createRequest, ct);
        }

        // Update existing asset
        if (isPortrait) {
            var assetUpdateRequest = new UpdateAssetRequest {
                PortraitId = data.ResourceId,
            };
            var result = await assetsClient.UpdateAssetAsync(data.AssetId.Value, assetUpdateRequest, ct);
            return result.IsSuccessful
                ? data.AssetId.Value
                : Result.Failure(result.Errors).WithNo<Guid>();
        }

        // Add token to existing asset
        var addTokenRequest = new AddTokenRequest { ResourceId = data.ResourceId };
        var tokenResult = await assetsClient.AddTokenAsync(data.AssetId.Value, addTokenRequest, ct);
        return tokenResult.IsSuccessful
            ? data.AssetId.Value
            : Result.Failure(tokenResult.Errors).WithNo<Guid>();
    }

    public async Task<Result<Guid>> RegenerateAsync(RegenerateResourceData data, CancellationToken ct = default) {
        var isPortrait = data.GenerationType.Equals("Portrait", StringComparison.OrdinalIgnoreCase);
        var contentType = isPortrait
            ? GeneratedContentType.ImagePortrait
            : GeneratedContentType.ImageToken;
        var resourceType = isPortrait ? ResourceType.Portrait : ResourceType.Token;

        // Build prompt
        var prompt = BuildPrompt(data);

        // Generate new image
        var generateRequest = new ImageGenerationRequest {
            ContentType = contentType,
            Prompt = prompt,
        };
        var generateResult = await aiClient.GenerateImageAsync(generateRequest, ct);
        if (!generateResult.IsSuccessful)
            return Result.Failure(generateResult.Errors).WithNo<Guid>();

        // Upload as new resource
        var fileName = $"{data.AssetName}_{data.GenerationType.ToLower()}.png";
        var uploadResult = await mediaClient.UploadResourceAsync(
            generateResult.Value,
            fileName,
            "image/png",
            resourceType,
            ct);
        if (!uploadResult.IsSuccessful)
            return Result.Failure(uploadResult.Errors).WithNo<Guid>();

        // Delete old resource
        var deleteResult = await mediaClient.DeleteResourceAsync(data.ResourceId, ct);
        if (!deleteResult.IsSuccessful)
            return Result.Failure(deleteResult.Errors).WithNo<Guid>();

        return uploadResult.Value;
    }

    public async Task<Result> RejectAsync(RejectResourceData data, CancellationToken ct = default) {
        return await mediaClient.DeleteResourceAsync(data.ResourceId, ct);
    }

    private static string BuildPrompt(RegenerateResourceData data) {
        var basePrompt = $"A {data.Category ?? "fantasy"} {data.Type ?? "character"} named {data.AssetName}";

        if (!string.IsNullOrWhiteSpace(data.Description))
            basePrompt += $". {data.Description}";

        return basePrompt;
    }
}
