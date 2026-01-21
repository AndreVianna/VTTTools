namespace VttTools.Media.Storage;

public class AzureBlobStorage(BlobServiceClient blobClient, ILogger<AzureBlobStorage> logger)
    : IBlobStorage {
    private const string _containerName = "media";

    public async Task<Result<string>> SaveOriginalAsync(string basePath, string fileName, Stream content, CancellationToken ct = default) {
        try {
            var containerClient = blobClient.GetBlobContainerClient(_containerName);
            await containerClient.CreateIfNotExistsAsync(PublicAccessType.None, cancellationToken: ct);

            var extension = GetExtensionFromFileName(fileName);
            var blobPath = $"originals/{extension}/{basePath}";
            var blob = containerClient.GetBlobClient(blobPath);

            var contentType = GetContentTypeFromExtension(extension);
            var uploadOptions = new BlobUploadOptions {
                HttpHeaders = new() { ContentType = contentType },
            };

            var response = await blob.UploadAsync(content, uploadOptions, ct);
            if (response.GetRawResponse().IsError) {
                logger.LogError("Blob upload failed for {Path}: {Reason}", blobPath, response.GetRawResponse().ReasonPhrase);
                return Result.Failure<string>(null!, "Failed to upload file");
            }

            return Result.Success(blobPath);
        }
        catch (Exception ex) {
            logger.LogError(ex, "Unexpected error during original upload for {Path}", basePath);
            return Result.Failure<string>(null!, "Unexpected error during file upload");
        }
    }

    public async Task<Result<string>> SavePrimaryAsync(string basePath, Stream content, string contentType, CancellationToken ct = default) {
        try {
            var containerClient = blobClient.GetBlobContainerClient(_containerName);
            await containerClient.CreateIfNotExistsAsync(PublicAccessType.None, cancellationToken: ct);

            var blobPath = $"resources/{basePath}";
            var blob = containerClient.GetBlobClient(blobPath);

            var uploadOptions = new BlobUploadOptions {
                HttpHeaders = new() { ContentType = contentType },
            };

            var response = await blob.UploadAsync(content, uploadOptions, ct);
            if (response.GetRawResponse().IsError) {
                logger.LogError("Blob upload failed for {Path}: {Reason}", blobPath, response.GetRawResponse().ReasonPhrase);
                return Result.Failure<string>(null!, "Failed to upload primary file");
            }

            return Result.Success(blobPath);
        }
        catch (Exception ex) {
            logger.LogError(ex, "Unexpected error during primary upload for {Path}", basePath);
            return Result.Failure<string>(null!, "Unexpected error during primary upload");
        }
    }

    public async Task<Result<string>> SavePlaceholderAsync(string basePath, byte[] placeholder, CancellationToken ct = default) {
        try {
            var containerClient = blobClient.GetBlobContainerClient(_containerName);
            await containerClient.CreateIfNotExistsAsync(PublicAccessType.None, cancellationToken: ct);

            var blobPath = $"placeholders/{basePath}";
            var blob = containerClient.GetBlobClient(blobPath);

            await using var stream = new MemoryStream(placeholder);
            var uploadOptions = new BlobUploadOptions {
                HttpHeaders = new() { ContentType = "image/png" },
            };

            var response = await blob.UploadAsync(stream, uploadOptions, ct);
            if (response.GetRawResponse().IsError) {
                logger.LogError("Blob upload failed for {Path}: {Reason}", blobPath, response.GetRawResponse().ReasonPhrase);
                return Result.Failure<string>(null!, "Failed to upload placeholder");
            }

            return Result.Success(blobPath);
        }
        catch (Exception ex) {
            logger.LogError(ex, "Unexpected error during placeholder upload for {Path}", basePath);
            return Result.Failure<string>(null!, "Unexpected error during placeholder upload");
        }
    }

    public async Task<Result<string>> SaveThumbnailAsync(string basePath, byte[] thumbnail, CancellationToken ct = default) {
        try {
            var containerClient = blobClient.GetBlobContainerClient(_containerName);
            await containerClient.CreateIfNotExistsAsync(PublicAccessType.None, cancellationToken: ct);

            var blobPath = $"thumbnails/{basePath}";
            var blob = containerClient.GetBlobClient(blobPath);

            await using var stream = new MemoryStream(thumbnail);
            var uploadOptions = new BlobUploadOptions {
                HttpHeaders = new() { ContentType = "image/png" },
            };

            var response = await blob.UploadAsync(stream, uploadOptions, ct);
            if (response.GetRawResponse().IsError) {
                logger.LogError("Blob upload failed for {Path}: {Reason}", blobPath, response.GetRawResponse().ReasonPhrase);
                return Result.Failure<string>(null!, "Failed to upload thumbnail");
            }

            return Result.Success(blobPath);
        }
        catch (Exception ex) {
            logger.LogError(ex, "Unexpected error during thumbnail upload for {Path}", basePath);
            return Result.Failure<string>(null!, "Unexpected error during thumbnail upload");
        }
    }

    public async Task<ResourceDownloadResult?> GetOriginalAsync(string basePath, string fileName, CancellationToken ct = default) {
        try {
            var containerClient = blobClient.GetBlobContainerClient(_containerName);
            var extension = GetExtensionFromFileName(fileName);
            var blobPath = $"originals/{extension}/{basePath}";
            var blob = containerClient.GetBlobClient(blobPath);

            var response = await blob.DownloadAsync(ct);
            return response.GetRawResponse().IsError
                ? null
                : new ResourceDownloadResult {
                    Content = response.Value.Content,
                    ContentType = response.Value.ContentType,
                    Metadata = response.Value.Details?.Metadata.ToDictionary() ?? [],
                };
        }
        catch (Exception ex) {
            logger.LogError(ex, "Failed to download original blob {Path}", basePath);
            return null;
        }
    }

    public async Task<ResourceDownloadResult?> GetPrimaryAsync(string basePath, string contentType, CancellationToken ct = default) {
        try {
            var containerClient = blobClient.GetBlobContainerClient(_containerName);

            var newBlobPath = $"resources/{basePath}";
            var result = await TryDownloadBlobAsync(containerClient, newBlobPath, ct);
            if (result is not null)
                return result;

            logger.LogWarning("Resource not found at new path {NewPath} or legacy path {LegacyPath}", newBlobPath, basePath);
            return null;
        }
        catch (Exception ex) {
            logger.LogError(ex, "Failed to download primary blob {Path}", basePath);
            return null;
        }
    }

    public async Task<ResourceDownloadResult?> GetThumbnailAsync(string basePath, CancellationToken ct = default) {
        try {
            var containerClient = blobClient.GetBlobContainerClient(_containerName);
            var blobPath = $"thumbnails/{basePath}";
            var blob = containerClient.GetBlobClient(blobPath);

            return !await blob.ExistsAsync(ct) ? null : await DownloadBlobAsync(blob, ct);
        }
        catch (Exception ex) {
            logger.LogError(ex, "Failed to download thumbnail blob {Path}", basePath);
            return null;
        }
    }

    public async Task<ResourceDownloadResult?> GetResourceWithFallbackAsync(string basePath, CancellationToken ct = default) {
        try {
            var containerClient = blobClient.GetBlobContainerClient(_containerName);

            // Try new path format first: resources/{basePath}
            var primaryPath = $"resources/{basePath}";
            var primaryBlob = containerClient.GetBlobClient(primaryPath);
            if (await primaryBlob.ExistsAsync(ct))
                return await DownloadBlobAsync(primaryBlob, ct);

            // Try legacy path formats: resources/{extension}/{basePath}
            // Legacy data was stored with extension folder prefix
            string[] legacyExtensions = ["png", "jpg", "jpeg", "gif", "webp", "mp4", "webm"];
            foreach (var ext in legacyExtensions) {
                var legacyPath = $"resources/{ext}/{basePath}";
                var legacyBlob = containerClient.GetBlobClient(legacyPath);
                if (await legacyBlob.ExistsAsync(ct))
                    return await DownloadBlobAsync(legacyBlob, ct);
            }

            // Fallback to placeholder
            var placeholderPath = $"placeholders/{basePath}";
            var placeholderBlob = containerClient.GetBlobClient(placeholderPath);
            if (await placeholderBlob.ExistsAsync(ct))
                return await DownloadBlobAsync(placeholderBlob, ct);

            // Return null - caller will provide static default
            return null;
        }
        catch (Exception ex) {
            logger.LogError(ex, "Failed to download resource with fallback for {Path}", basePath);
            return null;
        }
    }

    private static async Task<ResourceDownloadResult?> TryDownloadBlobAsync(BlobContainerClient container, string blobPath, CancellationToken ct) {
        try {
            var blob = container.GetBlobClient(blobPath);
            if (!await blob.ExistsAsync(ct))
                return null;

            var response = await blob.DownloadAsync(ct);
            return response.GetRawResponse().IsError
                ? null
                : new ResourceDownloadResult {
                    Content = response.Value.Content,
                    ContentType = response.Value.ContentType,
                    Metadata = response.Value.Details?.Metadata.ToDictionary() ?? [],
                };
        }
        catch {
            return null;
        }
    }

    public async Task<Result> RemoveAsync(string basePath, string fileName, string contentType, CancellationToken ct = default) {
        try {
            var containerClient = blobClient.GetBlobContainerClient(_containerName);

            // Delete all artifacts for this resource (new path format)
            var pathsToDelete = new List<string> {
                $"originals/{basePath}",
                $"resources/{basePath}",
                $"placeholders/{basePath}",
                $"thumbnails/{basePath}",
                // Also try legacy path format (basePath was the full path like "image/suffix/id")
                basePath,
            };

            foreach (var path in pathsToDelete) {
                var blob = containerClient.GetBlobClient(path);
                await blob.DeleteIfExistsAsync(cancellationToken: ct);
            }

            return Result.Success();
        }
        catch (Exception ex) {
            logger.LogError(ex, "Failed to delete blob {Path}", basePath);
            return Result.Failure("Failed to delete file");
        }
    }

    private static string GetExtensionFromFileName(string fileName) {
        var ext = Path.GetExtension(fileName).TrimStart('.').ToLowerInvariant();
        return string.IsNullOrEmpty(ext) ? "bin" : ext;
    }

    private static string GetContentTypeFromExtension(string extension)
        => extension.ToLowerInvariant() switch {
            "mp4" => "video/mp4",
            "webm" => "video/webm",
            "ogg" => "video/ogg",
            "png" => "image/png",
            "jpg" or "jpeg" => "image/jpeg",
            "gif" => "image/gif",
            "webp" => "image/webp",
            "mp3" => "audio/mpeg",
            "wav" => "audio/wav",
            _ => "application/octet-stream",
        };

    private static async Task<ResourceDownloadResult?> DownloadBlobAsync(BlobClient blob, CancellationToken ct) {
        var response = await blob.DownloadAsync(ct);
        return response.GetRawResponse().IsError
            ? null
            : new ResourceDownloadResult {
                Content = response.Value.Content,
                ContentType = response.Value.ContentType,
                Metadata = response.Value.Details?.Metadata.ToDictionary() ?? [],
            };
    }
}