namespace VttTools.Media.Storage;

public class AzureBlobStorage(BlobServiceClient blobClient, ILogger<AzureBlobStorage> logger)
    : IBlobStorage {
    private const string _containerName = "media";

    public async Task<Result<string>> SaveAsync(string path, Stream content, ResourceMetadata metadata, CancellationToken ct = default) {
        try {
            var containerClient = blobClient.GetBlobContainerClient(_containerName);
            await containerClient.CreateIfNotExistsAsync(PublicAccessType.None, cancellationToken: ct);
            var blob = containerClient.GetBlobClient(path);

            var uploadOptions = new BlobUploadOptions {
                Metadata = new Dictionary<string, string> {
                    ["GeneratedContentType"] = metadata.ContentType,
                    ["FileName"] = metadata.FileName,
                    ["FileSize"] = metadata.FileSize.ToString(),
                    ["Width"] = metadata.Dimensions.Width.ToString(),
                    ["Height"] = metadata.Dimensions.Height.ToString(),
                    ["Duration"] = metadata.Duration.ToString(),
                },
                HttpHeaders = new() {
                    ContentType = metadata.ContentType,
                },
            };

            var response = await blob.UploadAsync(content, uploadOptions, ct);
            if (response.GetRawResponse().IsError) {
                logger.LogError("Blob upload failed for {Path}: {Reason}", path, response.GetRawResponse().ReasonPhrase);
                return Result.Failure<string>(null!, "Failed to upload file");
            }

            return Result.Success(path);
        }
        catch (Exception ex) {
            logger.LogError(ex, "Unexpected error during blob upload for {Path}", path);
            return Result.Failure<string>(null!, "Unexpected error during file upload");
        }
    }

    public async Task<Result<string>> SaveThumbnailAsync(string path, byte[] thumbnail, CancellationToken ct = default) {
        try {
            var containerClient = blobClient.GetBlobContainerClient(_containerName);
            var thumbnailPath = $"{path}_thumb";
            var thumbnailBlob = containerClient.GetBlobClient(thumbnailPath);
            await using var thumbnailStream = new MemoryStream(thumbnail);
            await thumbnailBlob.UploadAsync(thumbnailStream, new BlobUploadOptions {
                HttpHeaders = new() { ContentType = "image/jpeg" },
            }, ct);

            return Result.Success(thumbnailPath);
        }
        catch (Exception ex) {
            logger.LogError(ex, "Unexpected error during thumbnail upload for {Path}", path);
            return Result.Failure<string>(null!, "Unexpected error during thumbnail upload");
        }
    }

    public async Task<ResourceDownloadResult?> GetAsync(string path, CancellationToken ct = default) {
        try {
            var containerClient = blobClient.GetBlobContainerClient(_containerName);
            var blob = containerClient.GetBlobClient(path);
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
            logger.LogError(ex, "Failed to download blob {Path}", path);
            return null;
        }
    }

    public async Task<Result> RemoveAsync(string path, CancellationToken ct = default) {
        try {
            var containerClient = blobClient.GetBlobContainerClient(_containerName);
            var blob = containerClient.GetBlobClient(path);
            var response = await blob.DeleteIfExistsAsync(DeleteSnapshotsOption.IncludeSnapshots, null, ct);

            if (response.GetRawResponse().IsError) {
                logger.LogError("Failed to delete blob {Path}: {Reason}", path, response.GetRawResponse().ReasonPhrase);
                return Result.Failure("Failed to delete file");
            }

            var thumbnailPath = $"{path}_thumb";
            var thumbnailBlob = containerClient.GetBlobClient(thumbnailPath);
            await thumbnailBlob.DeleteIfExistsAsync(cancellationToken: ct);

            return Result.Success();
        }
        catch (Exception ex) {
            logger.LogError(ex, "Failed to delete blob {Path}", path);
            return Result.Failure("Failed to delete file");
        }
    }
}