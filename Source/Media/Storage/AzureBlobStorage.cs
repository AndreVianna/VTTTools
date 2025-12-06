namespace VttTools.Media.Storage;

public class AzureBlobStorage(BlobServiceClient blobClient, ILogger<AzureBlobStorage> logger)
    : IBlobStorage {
    private const string ContainerName = "media";

    public async Task<Result<string>> UploadAsync(string path, Stream content, BlobMetadata metadata, CancellationToken ct = default) {
        try {
            var containerClient = blobClient.GetBlobContainerClient(ContainerName);
            await containerClient.CreateIfNotExistsAsync(PublicAccessType.None, cancellationToken: ct);
            var blob = containerClient.GetBlobClient(path);

            var uploadOptions = new BlobUploadOptions {
                Metadata = new Dictionary<string, string> {
                    ["ContentType"] = metadata.ContentType,
                    ["FileName"] = metadata.FileName,
                    ["FileLength"] = metadata.FileLength.ToString(),
                    ["Width"] = metadata.Width.ToString(),
                    ["Height"] = metadata.Height.ToString(),
                    ["Duration"] = metadata.Duration.ToString(),
                    ["OwnerId"] = metadata.OwnerId.ToString(),
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

    public async Task<Result<string>> UploadThumbnailAsync(string path, byte[] thumbnail, CancellationToken ct = default) {
        try {
            var containerClient = blobClient.GetBlobContainerClient(ContainerName);
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

    public async Task<BlobDownloadResult?> DownloadAsync(string path, CancellationToken ct = default) {
        try {
            var containerClient = blobClient.GetBlobContainerClient(ContainerName);
            var blob = containerClient.GetBlobClient(path);
            var response = await blob.DownloadAsync(ct);

            if (response.GetRawResponse().IsError)
                return null;

            return new BlobDownloadResult {
                Content = response.Value.Content,
                ContentType = response.Value.ContentType,
                Metadata = response.Value.Details?.Metadata,
            };
        }
        catch (Exception ex) {
            logger.LogError(ex, "Failed to download blob {Path}", path);
            return null;
        }
    }

    public async Task<Result> DeleteAsync(string path, CancellationToken ct = default) {
        try {
            var containerClient = blobClient.GetBlobContainerClient(ContainerName);
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
