using Size = VttTools.Common.Model.Size;

namespace VttTools.Media.Services;

public class ResourceService(
    IBlobStorage blobStorage,
    IMediaStorage mediaStorage,
    MediaProcessingQueue processingQueue,
    ILogger<ResourceService> logger)
    : IResourceService {

    public async Task<Result<ResourceMetadata>> UploadResourceAsync(Guid userId, UploadResourceData data, CancellationToken ct = default) {
        var validationResult = data.Validate();
        if (!validationResult.IsSuccessful)
            return Result.Failure($"Invalid upload data: {validationResult.Errors[0].Message}");

        // Validate content type and file size upfront
        if (!MediaConstraints.For.TryGetValue(data.Role, out var constraints))
            return Result.Failure($"Invalid resource role: '{data.Role}'");

        if (!MediaConstraints.IsValidContentType(data.Role, data.ContentType)) {
            var allowedTypes = string.Join(", ", constraints.AllowedContentTypes);
            return Result.Failure($"Content type '{data.ContentType}' is not allowed for role '{data.Role}'. Allowed types: {allowedTypes}");
        }

        if (data.Stream!.Length > constraints.MaxFileSize) {
            var maxSizeMb = constraints.MaxFileSize / 1024.0 / 1024.0;
            var actualSizeMb = data.Stream.Length / 1024.0 / 1024.0;
            return Result.Failure($"File size ({actualSizeMb:F2} MB) exceeds maximum ({maxSizeMb:F2} MB)");
        }

        try {
            var fileName = SanitizeFileName(data.FileName);
            var guidId = Guid.CreateVersion7();
            var basePath = GenerateBasePath(guidId);

            // Determine PRIMARY content type (what we'll serve after conversion)
            var primaryContentType = GetPrimaryContentType(data.ContentType);

            var resource = new ResourceMetadata {
                Id = guidId,
                OwnerId = userId,
                Path = basePath,                        // "{suffix}/{id}" - no extension, no folder prefix
                ContentType = primaryContentType,       // PRIMARY format (e.g., "video/mp4")
                FileName = fileName,                    // Original filename with extension
                FileSize = (ulong)data.Stream.Length,
                Dimensions = Size.Zero,                 // Will be set during background processing
                Duration = TimeSpan.Zero,               // Will be set during background processing
            };

            var uploadResult = await blobStorage.SaveOriginalAsync(basePath, fileName, data.Stream, ct);
            if (!uploadResult.IsSuccessful)
                return Result.Failure(uploadResult.Errors[0].Message);

            logger.LogDebug("[DEBUG] Creating resource {ResourceId} with OwnerId={OwnerId}, ContentType={ContentType}, FileName={FileName}",
                resource.Id, resource.OwnerId, resource.ContentType, resource.FileName);
            await mediaStorage.AddAsync(resource, ct);
            logger.LogDebug("[DEBUG] Resource {ResourceId} saved to DB, queuing for processing", resource.Id);
            await processingQueue.EnqueueAsync(resource.Id, ct);
            logger.LogInformation("Resource {ResourceId} uploaded to {Path}, queued for background processing", resource.Id, basePath);
            return Result.Success(resource);
        }
        catch (Exception ex) {
            logger.LogError(ex, "Unexpected error during file upload for {FileName}", data.FileName);
            return Result.Failure("Unexpected error during file upload");
        }
    }

    public Task<(ResourceMetadata[] Items, int TotalCount)> FindResourcesAsync(Guid? userId, ResourceFilterData data, CancellationToken ct = default) {
        var effectiveFilter = data with {
            Skip = Math.Max(0, data.Skip),
            Take = Math.Clamp(data.Take, 1, 100),
        };

        return mediaStorage.FilterAsync(effectiveFilter, ct);
    }

    public async Task<Resource?> ServeResourceAsync(Guid id, CancellationToken ct = default) {
        var basePath = ComputeBasePath(id);
        var download = await blobStorage.GetResourceWithFallbackAsync(basePath, ct);

        if (download is null)
            return null;

        return new Resource {
            Stream = download.Content,
            ContentType = download.ContentType,
            FileName = $"{id}{GetExtensionFromContentType(download.ContentType)}",
            FileSize = download.Content.CanSeek ? (ulong)download.Content.Length : 0,
            Dimensions = Size.Zero,
            Duration = TimeSpan.Zero,
        };
    }

    public async Task<Resource?> ServeThumbnailAsync(Guid id, CancellationToken ct = default) {
        var basePath = ComputeBasePath(id);
        var download = await blobStorage.GetThumbnailAsync(basePath, ct);

        if (download is null)
            return null;

        return new Resource {
            Stream = download.Content,
            ContentType = download.ContentType,
            FileName = $"{id}_thumbnail.png",
            FileSize = download.Content.CanSeek ? (ulong)download.Content.Length : 0,
            Dimensions = Size.Zero,
            Duration = TimeSpan.Zero,
        };
    }

    public Task<ResourceMetadata?> GetResourceAsync(Guid userId, Guid id, CancellationToken ct = default)
        => mediaStorage.FindByIdAsync(id, ct);

    public async Task<Result> UpdateResourceAsync(Guid userId, Guid id, UpdateResourceData data, CancellationToken ct = default) {
        var resource = await mediaStorage.FindByIdAsync(id, ct);
        if (resource is null)
            return Result.Failure("NotFound");

        await mediaStorage.UpdateAsync(resource, ct);
        return Result.Success();
    }

    public async Task<Result> DeleteResourceAsync(Guid userId, Guid id, CancellationToken ct = default) {
        var resource = await mediaStorage.FindByIdAsync(id, ct);
        if (resource is null)
            return Result.Failure("NotFound");

        var deleteResult = await blobStorage.RemoveAsync(resource.Path, resource.FileName, resource.ContentType, ct);
        if (!deleteResult.IsSuccessful)
            return deleteResult;

        await mediaStorage.DeleteAsync(id, ct);
        return Result.Success();
    }

    /// <summary>
    /// Generate base path: {suffix}/{id} where suffix is last 4 chars of guid
    /// </summary>
    private static string GenerateBasePath(Guid id) => ComputeBasePath(id);

    /// <summary>
    /// Compute blob base path from resource ID: {suffix}/{id}
    /// </summary>
    internal static string ComputeBasePath(Guid id) {
        var guidString = id.ToString("N");
        var suffix = guidString[^4..];
        return $"{suffix}/{guidString}";
    }

    /// <summary>
    /// Get the PRIMARY content type that the resource will be converted to.
    /// </summary>
    private static string GetPrimaryContentType(string originalContentType) => originalContentType.ToLowerInvariant() switch {
        "video/webm" or "video/ogg" => "video/mp4",
        "image/jpeg" or "image/gif" or "image/webp" => "image/png",
        _ => originalContentType, // mp4, png already optimal
    };

    private static string GetExtensionFromContentType(string contentType)
        => contentType.ToLowerInvariant() switch {
            "video/mp4" => ".mp4",
            "video/webm" => ".webm",
            "image/png" => ".png",
            "image/jpeg" => ".jpg",
            "image/gif" => ".gif",
            "image/webp" => ".webp",
            "audio/mpeg" => ".mp3",
            "audio/wav" => ".wav",
            _ => "",
        };

    private static string SanitizeFileName(string fileName) {
        if (string.IsNullOrWhiteSpace(fileName))
            return "unnamed";

        var name = Path.GetFileNameWithoutExtension(fileName);
        var extension = Path.GetExtension(fileName);

        var sanitizedName = new string([.. name.Where(c => char.IsLetterOrDigit(c) || c == '-' || c == '_' || c == ' ')]).Trim();
        var sanitizedExt = new string([.. extension.Where(c => char.IsLetterOrDigit(c) || c == '.')]);

        if (string.IsNullOrWhiteSpace(sanitizedName))
            sanitizedName = "unnamed";

        if (sanitizedName.Length > 100)
            sanitizedName = sanitizedName[..100];

        return sanitizedName + sanitizedExt;
    }
}
