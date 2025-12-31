namespace VttTools.Media.Services;

public class ResourceService(
    IBlobStorage blobStorage,
    IMediaStorage mediaStorage,
    IMediaProcessorService mediaProcessor,
    ILogger<ResourceService> logger)
    : IResourceService {

    public async Task<Result<ResourceMetadata>> UploadResourceAsync(Guid userId, UploadResourceData data, CancellationToken ct = default) {
        var validationResult = data.Validate();
        if (!validationResult.IsSuccessful)
            return Result.Failure($"Invalid upload data: {validationResult.Errors[0].Message}");

        try {
            var fileName = SanitizeFileName(data.FileName);
            var processResult = await mediaProcessor.ProcessAsync(
                data.Role,
                data.ContentType,
                fileName,
                data.Stream!,
                ct);

            if (!processResult.IsSuccessful) {
                logger.LogWarning("Media processing failed for file {FileName}:\n\t{Errors}", fileName, string.Join("\n\t", processResult.Errors));
                return Result.Failure(processResult.Errors);
            }

            var processed = processResult.Value;
            var guidId = Guid.CreateVersion7();
            var path = GeneratePath(guidId, data.ContentType);

            var resource = new ResourceMetadata {
                Id = guidId,
                Path = path,
                ContentType = processed.ContentType,
                FileName = processed.FileName,
                FileSize = processed.FileSize,
                Dimensions = processed.Dimensions,
                Duration = processed.Duration,
            };

            var uploadResult = await blobStorage.SaveAsync(path, processed.Stream, resource, ct);
            if (!uploadResult.IsSuccessful)
                return Result.Failure(uploadResult.Errors[0].Message);

            if (processed.Thumbnail is { Length: > 0 })
                await blobStorage.SaveThumbnailAsync(path, processed.Thumbnail, ct);

            await mediaStorage.AddAsync(resource, ct);
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
        var resource = await mediaStorage.FindByIdAsync(id, ct);
        if (resource is null)
            return null;

        var download = await blobStorage.GetAsync(resource.Path, ct);
        return GetResourceStream(download, resource);
    }

    private static Resource? GetResourceStream(ResourceDownloadResult? download, ResourceMetadata metadata)
        => download is null ? null : new() {
            Stream = download.Content,
            ContentType = metadata.ContentType,
            FileName = metadata.FileName,
            FileSize = metadata.FileSize,
            Dimensions = metadata.Dimensions,
            Duration = metadata.Duration,
        };

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

        var deleteResult = await blobStorage.RemoveAsync(resource.Path, ct);
        if (!deleteResult.IsSuccessful)
            return deleteResult;

        await mediaStorage.DeleteAsync(id, ct);
        return Result.Success();
    }

    private static string GeneratePath(Guid id, string contentType) {
        var guidString = id.ToString("N");
        var guidSuffix = guidString[^4..];
        var category = MediaConstraints.GetMediaCategory(contentType);
        return $"{category}/{guidSuffix}/{guidString}";
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