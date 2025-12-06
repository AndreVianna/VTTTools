using Size = VttTools.Common.Model.Size;

namespace VttTools.Media.Services;

public class ResourceService(
    IBlobStorage blobStorage,
    IMediaStorage mediaStorage,
    IMediaProcessorService mediaProcessor,
    ILogger<ResourceService> logger)
    : IResourceService {

    public async Task<Result<ResourceFile>> UploadResourceAsync(Guid userId, UploadResourceData data, CancellationToken ct = default) {
        var validationResult = data.Validate();
        if (!validationResult.IsSuccessful)
            return Result.Failure<ResourceFile>(null!, $"Invalid upload data: {validationResult.Errors[0].Message}");

        var fileName = SanitizeFileName(data.FileName);
        var contentType = data.ContentType;

        try {
            var processResult = await mediaProcessor.ProcessAsync(
                ResourceType.Undefined,
                data.Stream!,
                contentType,
                fileName,
                ct);

            if (!processResult.IsSuccessful) {
                logger.LogWarning("Media processing failed for file {FileName}: {Error}", fileName, processResult.Errors[0].Message);
                return Result.Failure<ResourceFile>(null!, "Media processing failed");
            }

            var processed = processResult.Value;
            var guidId = Guid.CreateVersion7();
            var path = GeneratePath(guidId, contentType);

            var metadata = new BlobMetadata {
                ContentType = processed.ContentType,
                FileName = processed.FileName,
                FileLength = processed.FileLength,
                Width = processed.Size.Width,
                Height = processed.Size.Height,
                Duration = processed.Duration,
                OwnerId = userId,
            };

            var uploadResult = await blobStorage.UploadAsync(path, processed.Stream, metadata, ct);
            if (!uploadResult.IsSuccessful)
                return Result.Failure<ResourceFile>(null!, uploadResult.Errors[0].Message);

            if (processed.Thumbnail is { Length: > 0 })
                await blobStorage.UploadThumbnailAsync(path, processed.Thumbnail, ct);

            var resource = new ResourceInfo {
                Id = guidId,
                ResourceType = ResourceType.Undefined,
                Path = path,
                ContentType = processed.ContentType,
                FileLength = (ulong)processed.FileLength,
                FileName = processed.FileName,
                Duration = processed.Duration,
                Size = processed.Size,
                OwnerId = userId,
                IsPublished = false,
                IsPublic = false,
            };

            await mediaStorage.AddAsync(resource, ct);

            return Result.Success<ResourceFile>(new() {
                ContentType = resource.ContentType,
                FileName = resource.FileName,
                Size = resource.Size,
                Duration = resource.Duration,
                FileLength = resource.FileLength,
            });
        }
        catch (Exception ex) {
            logger.LogError(ex, "Unexpected error during file upload for {FileName}", fileName);
            return Result.Failure<ResourceFile>(null!, "Unexpected error during file upload");
        }
    }

    public async Task<(ResourceInfo[] Items, int TotalCount)> FindResourcesAsync(Guid userId, ResourceFilterData data, CancellationToken ct = default) {
        var effectiveFilter = data with {
            Skip = Math.Max(0, data.Skip),
            Take = Math.Clamp(data.Take, 1, 100),
        };

        if (effectiveFilter.OwnerId.HasValue && effectiveFilter.OwnerId.Value != userId) {
            effectiveFilter = effectiveFilter with { IsPublic = true };
        }
        else if (!effectiveFilter.OwnerId.HasValue) {
            effectiveFilter = effectiveFilter with { OwnerId = userId };
        }

        return await mediaStorage.FilterAsync(effectiveFilter, ct);
    }

    public async Task<ResourceData?> ServeResourceAsync(Guid userId, Guid id, CancellationToken ct = default) {
        var resource = await mediaStorage.FindByIdAsync(id, ct);
        if (resource is null)
            return null;

        if (!CanAccess(resource, userId))
            return null;

        var download = await blobStorage.DownloadAsync(resource.Path, ct);
        if (download is null)
            return null;

        return new ResourceData {
            Stream = download.Content,
            ContentType = download.ContentType,
            FileName = download.Metadata?.TryGetValue("FileName", out var fileName) == true ? fileName : resource.FileName,
            FileLength = download.Metadata?.TryGetValue("FileLength", out var fileLengthStr) == true && ulong.TryParse(fileLengthStr, out var fileLength)
                ? fileLength
                : resource.FileLength,
            Size = new Size(
                download.Metadata?.TryGetValue("Width", out var widthStr) == true && int.TryParse(widthStr, out var width)
                    ? width
                    : resource.Size.Width,
                download.Metadata?.TryGetValue("Height", out var heightStr) == true && int.TryParse(heightStr, out var height)
                    ? height
                    : resource.Size.Height),
            Duration = download.Metadata?.TryGetValue("Duration", out var durationStr) == true && TimeSpan.TryParse(durationStr, out var duration)
                ? duration
                : resource.Duration,
        };
    }

    public async Task<ResourceInfo?> GetResourceAsync(Guid userId, Guid id, CancellationToken ct = default) {
        var resource = await mediaStorage.FindByIdAsync(id, ct);
        return CanAccess(resource, userId) ? resource : null;
    }

    public async Task<Result> UpdateResourceAsync(Guid userId, Guid id, UpdateResourceData data, CancellationToken ct = default) {
        var resource = await mediaStorage.FindByIdAsync(id, ct);
        if (resource is null)
            return Result.Failure("NotFound");
        if (resource.OwnerId != userId)
            return Result.Failure("NotAllowed");

        resource = resource with {
            Description = data.Description.IsSet ? data.Description.Value : resource.Description,
            Features = data.Features.IsSet ? data.Features.Value : resource.Features,
            IsPublic = data.IsPublic.IsSet ? data.IsPublic.Value : resource.IsPublic,
        };

        await mediaStorage.UpdateAsync(resource, ct);
        return Result.Success();
    }

    public async Task<Result> DeleteResourceAsync(Guid userId, Guid id, CancellationToken ct = default) {
        var resource = await mediaStorage.FindByIdAsync(id, ct);
        if (resource is null)
            return Result.Failure("NotFound");
        if (resource.OwnerId != userId)
            return Result.Failure("NotAllowed");

        var deleteResult = await blobStorage.DeleteAsync(resource.Path, ct);
        if (!deleteResult.IsSuccessful)
            return deleteResult;

        await mediaStorage.DeleteAsync(id, ct);
        return Result.Success();
    }

    private static bool CanAccess(ResourceInfo? resource, Guid userId)
        => resource is not null && (resource.OwnerId == userId || (resource.IsPublic && resource.IsPublished));

    private static string GeneratePath(Guid id, string contentType) {
        var guidString = id.ToString("N");
        var guidSuffix = guidString[^4..];
        var category = GetMediaCategory(contentType);
        return $"{category}/{guidSuffix}/{guidString}";
    }

    private static string GetMediaCategory(string contentType) {
        var normalizedType = contentType.ToLowerInvariant();
        return normalizedType.StartsWith("image/") ? "images"
            : normalizedType.StartsWith("audio/") ? "audio"
            : normalizedType.StartsWith("video/") ? "videos"
            : "other";
    }

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
