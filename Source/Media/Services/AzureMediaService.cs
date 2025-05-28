using VttTools.Media.Model;

namespace VttTools.Media.Services;

/// <summary>
/// Azure Blob Container implementation of IMediaService for development.
/// </summary>
public class AzureMediaService(BlobServiceClient client)
    : IMediaService {
    /// <inheritdoc />
    public async Task<Result> SaveUploadedFileAsync(string type, Guid id, ResourceFileInfo file, Stream fileStream, CancellationToken ct = default) {
        var blobClient = await GetBlobClient($"{type}_{id:N}", ct);
        var metadata = new Dictionary<string, string> {
            ["Name"] = file.Name,
            ["Type"] = file.Type.ToString(),
            ["Width"] = file.Width.ToString(),
            ["Height"] = file.Height.ToString(),
        };
        await blobClient.SetMetadataAsync(metadata, cancellationToken: ct);
        var response = await blobClient.UploadAsync(fileStream, true, ct);
        return response.GetRawResponse().IsError
            ? Result.Failure(response.GetRawResponse().ReasonPhrase)
            : Result.Success();
    }

    /// <inheritdoc />
    public async Task<Result> DeleteFileAsync(string type, Guid id, CancellationToken ct = default) {
        var blobClient = await GetBlobClient($"{type}_{id:N}", ct);
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