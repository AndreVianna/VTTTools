namespace VttTools.Assets.Services;

/// <summary>
/// Azure Blob Container implementation of IMediaService for development.
/// </summary>
public class MediaService(BlobServiceClient client)
    : IMediaService {
    /// <inheritdoc />
    public async Task<Result> UploadImageAsync(Guid id, string fileName, Stream imageStream, CancellationToken ct = default) {
        var blobClient = await GetBlobClient(id.ToString("N"), ct);
        var metadata = new Dictionary<string, string> { ["FileName"] = fileName };
        await blobClient.SetMetadataAsync(metadata, cancellationToken: ct);
        var response = await blobClient.UploadAsync(imageStream, true, ct);
        return response.GetRawResponse().IsError
            ? Result.Failure(response.GetRawResponse().ReasonPhrase)
            : Result.Success();
    }

    /// <inheritdoc />
    public async Task<Result> DeleteImageAsync(Guid id, CancellationToken ct = default) {
        var blobClient = await GetBlobClient(id.ToString("N"), ct);
        var response = await blobClient.DeleteIfExistsAsync(DeleteSnapshotsOption.IncludeSnapshots, null, ct);
        return response.GetRawResponse().IsError
            ? Result.Failure(response.GetRawResponse().ReasonPhrase)
            : Result.Success();
    }

    private async Task<BlobClient> GetBlobClient(string blobName, CancellationToken ct) {
        var containerClient = client.GetBlobContainerClient("images");
        if (!await containerClient.ExistsAsync(ct))
            containerClient = await client.CreateBlobContainerAsync("images", PublicAccessType.BlobContainer, null, ct);
        return containerClient.GetBlobClient(blobName);
    }
}