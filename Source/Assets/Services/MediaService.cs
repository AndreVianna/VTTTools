namespace VttTools.Assets.Services;

/// <summary>
/// Azure Blob Container implementation of IMediaService for development.
/// </summary>
public class MediaService(BlobServiceClient client)
    : IMediaService {
    /// <inheritdoc />
    public async Task<string> UploadImageAsync(Stream imageStream, string fileName, CancellationToken ct = default) {
        // generate a unique file name
        var extension = Path.GetExtension(fileName);
        var name = Path.GetFileNameWithoutExtension(fileName);
        var blobName = $"{name}_{Path.GetRandomFileName()}{extension}";

        var blobClient = await GetBlobClient(blobName, ct);
        await blobClient.UploadAsync(imageStream, true, ct);

        // return URL path
        return $"/uploads/{blobName}";
    }

    private async Task<BlobClient> GetBlobClient(string blobName, CancellationToken ct) {
        var containerClient = client.GetBlobContainerClient("images");
        if (!await containerClient.ExistsAsync(ct))
            containerClient = await client.CreateBlobContainerAsync("images", PublicAccessType.BlobContainer, null, ct);
        return containerClient.GetBlobClient(blobName);
    }

    /// <inheritdoc />
    public async Task DeleteImageAsync(string imageUrl, CancellationToken ct = default) {
        var blobName = Path.GetFileName(imageUrl);
        if (string.IsNullOrEmpty(blobName))
            return;
        var extension = Path.GetExtension(blobName);
        if (string.IsNullOrEmpty(extension))
            return;

        var blobClient = await GetBlobClient(blobName, ct);
        await blobClient.DeleteIfExistsAsync(DeleteSnapshotsOption.IncludeSnapshots, null, ct);
    }
}