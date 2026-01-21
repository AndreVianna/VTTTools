namespace VttTools.Media.Services;

public sealed class MediaProcessingWorker(
    IServiceScopeFactory scopeFactory,
    MediaProcessingQueue queue,
    ILogger<MediaProcessingWorker> logger)
    : BackgroundService {

    protected override async Task ExecuteAsync(CancellationToken stoppingToken) {
        logger.LogInformation("Media processing worker started");

        await foreach (var resourceId in queue.DequeueAllAsync(stoppingToken)) {
            try {
                await ProcessResourceAsync(resourceId, stoppingToken);
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested) {
                logger.LogInformation("Media processing worker stopping");
                break;
            }
            catch (Exception ex) {
                logger.LogError(ex, "Error processing resource {ResourceId}", resourceId);
            }
        }

        logger.LogInformation("Media processing worker stopped");
    }

    private async Task ProcessResourceAsync(Guid resourceId, CancellationToken ct) {
        using var scope = scopeFactory.CreateScope();
        var mediaStorage = scope.ServiceProvider.GetRequiredService<IMediaStorage>();
        var blobStorage = scope.ServiceProvider.GetRequiredService<IBlobStorage>();
        var processor = scope.ServiceProvider.GetRequiredService<IMediaProcessorService>();
        var eventPublisher = scope.ServiceProvider.GetRequiredService<IMediaEventPublisher>();

        var resource = await mediaStorage.FindByIdAsync(resourceId, ct);
        if (resource is null) {
            logger.LogWarning("Resource {ResourceId} not found for background processing", resourceId);
            return;
        }

        logger.LogDebug("[DEBUG] Worker read resource {ResourceId}: OwnerId={OwnerId}, ContentType={ContentType}, FileName={FileName}, Path={Path}",
            resource.Id, resource.OwnerId, resource.ContentType, resource.FileName, resource.Path);

        // Determine processing type from PRIMARY ContentType
        var category = MediaConstraints.GetMediaCategory(resource.ContentType);
        switch (category) {
            case "video":
                await ProcessVideoAsync(resource, mediaStorage, blobStorage, processor, eventPublisher, ct);
                break;
            case "image":
                await ProcessImageAsync(resource, mediaStorage, blobStorage, processor, eventPublisher, ct);
                break;
            default:
                logger.LogInformation("Resource {ResourceId} with category {Category} requires no background processing",
                    resourceId, category);
                break;
        }
    }

    private async Task ProcessVideoAsync(
        ResourceMetadata resource,
        IMediaStorage mediaStorage,
        IBlobStorage blobStorage,
        IMediaProcessorService processor,
        IMediaEventPublisher eventPublisher,
        CancellationToken ct) {
        // Get original file using FileName to determine extension
        var download = await blobStorage.GetOriginalAsync(resource.Path, resource.FileName, ct);
        if (download is null) {
            logger.LogWarning("Resource file not found in storage for {ResourceId}", resource.Id);
            return;
        }

        // Copy Azure stream to seekable MemoryStream (Azure RetriableStream doesn't support seeking)
        await using var memoryStream = new MemoryStream();
        await download.Content.CopyToAsync(memoryStream, ct);
        await download.Content.DisposeAsync();

        // Extract media info (dimensions and duration) - use original content type
        var originalContentType = GetContentTypeFromFileName(resource.FileName);

        // Step 1: Extract placeholder (first frame at original dimensions)
        memoryStream.Position = 0;
        var placeholder = await processor.ExtractPlaceholderAsync(originalContentType, memoryStream, ct);
        if (placeholder is { Length: > 0 }) {
            await blobStorage.SavePlaceholderAsync(resource.Path, placeholder, ct);
        }
        logger.LogInformation("Placeholder extracted for resource {ResourceId}", resource.Id);

        // Step 2: Generate thumbnail (256x256 center-crop)
        memoryStream.Position = 0;
        var thumbnail = await processor.GenerateThumbnailAsync(originalContentType, memoryStream, 256, ct);
        if (thumbnail is { Length: > 0 }) {
            await blobStorage.SaveThumbnailAsync(resource.Path, thumbnail, ct);
        }

        // Step 3: Convert to MP4 if needed (check original FileName extension)
        var needsConversion = !resource.FileName.EndsWith(".mp4", StringComparison.OrdinalIgnoreCase);
        memoryStream.Position = 0;
        if (needsConversion) {
            await using var converted = await processor.ConvertVideoAsync(memoryStream, ct);
            await blobStorage.SavePrimaryAsync(resource.Path, converted, resource.ContentType, ct);
        }
        else {
            // Original is already mp4, copy to primary location
            await blobStorage.SavePrimaryAsync(resource.Path, memoryStream, resource.ContentType, ct);
        }

        // Step 4: AI content analysis
        memoryStream.Position = 0;
        var analysis = await processor.AnalyzeContentAsync(resource.ContentType, memoryStream, resource.FileName, ct);
        if (analysis is not null) {
            var updatedResource = resource with {
                Name = analysis.SuggestedName ?? resource.Name,
                Description = analysis.Description,
                Tags = analysis.Tags ?? [],
            };
            await mediaStorage.UpdateAsync(updatedResource, ct);
            logger.LogInformation("AI analysis complete for resource {ResourceId}: Name={Name}, Tags={TagCount}",
                resource.Id, updatedResource.Name, updatedResource.Tags.Length);
        }

        // Notify clients that the resource has been updated
        await eventPublisher.NotifyResourceUpdatedAsync(resource.Id, ct);
        logger.LogInformation("Video processing complete for resource {ResourceId}", resource.Id);
    }

    private async Task ProcessImageAsync(
        ResourceMetadata resource,
        IMediaStorage mediaStorage,
        IBlobStorage blobStorage,
        IMediaProcessorService processor,
        IMediaEventPublisher eventPublisher,
        CancellationToken ct) {
        // Get original file using FileName to determine extension
        var download = await blobStorage.GetOriginalAsync(resource.Path, resource.FileName, ct);
        if (download is null) {
            logger.LogWarning("Resource file not found in storage for {ResourceId}", resource.Id);
            return;
        }

        // Copy Azure stream to seekable MemoryStream (Azure RetriableStream doesn't support seeking)
        await using var memoryStream = new MemoryStream();
        await download.Content.CopyToAsync(memoryStream, ct);
        await download.Content.DisposeAsync();

        // Extract media info (dimensions) - use original content type
        var originalContentType = GetContentTypeFromFileName(resource.FileName);
        memoryStream.Position = 0;
        var (dimensions, _) = await processor.ExtractMediaInfoAsync(originalContentType, memoryStream, ct);
        logger.LogInformation("Extracted image info for {ResourceId}: {Width}x{Height}",
            resource.Id, dimensions.Width, dimensions.Height);

        // Generate thumbnail (256x256 center-crop)
        memoryStream.Position = 0;
        var thumbnail = await processor.GenerateThumbnailAsync(originalContentType, memoryStream, 256, ct);
        if (thumbnail is { Length: > 0 }) {
            await blobStorage.SaveThumbnailAsync(resource.Path, thumbnail, ct);
        }

        // Convert to PNG if needed (check original FileName extension)
        var needsConversion = !resource.FileName.EndsWith(".png", StringComparison.OrdinalIgnoreCase);
        if (needsConversion) {
            memoryStream.Position = 0;
            var converted = await processor.ConvertImageAsync(memoryStream, ct);
            await blobStorage.SavePrimaryAsync(resource.Path, converted, resource.ContentType, ct);
            await converted.DisposeAsync();
        }
        else {
            // Original is already PNG, copy to primary location
            memoryStream.Position = 0;
            await blobStorage.SavePrimaryAsync(resource.Path, memoryStream, resource.ContentType, ct);
        }

        // Step 3: AI content analysis
        memoryStream.Position = 0;
        var analysis = await processor.AnalyzeContentAsync(resource.ContentType, memoryStream, resource.FileName, ct);
        if (analysis is not null) {
            var updatedResource = resource with {
                Name = analysis.SuggestedName ?? resource.Name,
                Description = analysis.Description,
                Tags = analysis.Tags ?? [],
            };
            await mediaStorage.UpdateAsync(updatedResource, ct);
            logger.LogInformation("AI analysis complete for resource {ResourceId}: Name={Name}, Tags={TagCount}",
                resource.Id, updatedResource.Name, updatedResource.Tags.Length);
        }

        // Notify clients that the resource has been updated
        await eventPublisher.NotifyResourceUpdatedAsync(resource.Id, ct);
        logger.LogInformation("Image processing complete for resource {ResourceId}", resource.Id);
    }

    private static string GetContentTypeFromFileName(string fileName) {
        var ext = Path.GetExtension(fileName).ToLowerInvariant();
        return ext switch {
            ".mp4" => "video/mp4",
            ".webm" => "video/webm",
            ".ogg" => "video/ogg",
            ".png" => "image/png",
            ".jpg" or ".jpeg" => "image/jpeg",
            ".gif" => "image/gif",
            ".webp" => "image/webp",
            ".mp3" => "audio/mpeg",
            ".wav" => "audio/wav",
            _ => "application/octet-stream",
        };
    }
}