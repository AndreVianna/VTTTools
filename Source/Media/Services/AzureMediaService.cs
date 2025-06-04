using VttTools.Media.Model;

namespace VttTools.Media.Services;

/// <summary>
/// Azure Blob Container implementation of IMediaService for development.
/// </summary>
public class AzureMediaService(BlobServiceClient client)
    : IMediaService {
    /// <inheritdoc />
    public async Task<Result> SaveUploadedFileAsync(ResourceInfo file, Stream fileStream, string fileName, CancellationToken ct = default) {
        var blobClient = await GetBlobClient(file.Id, ct);
        var metadata = new Dictionary<string, string> {
            ["Name"] = fileName,
            ["Type"] = file.Type.ToString(),
            ["Bytes"] = file.Bytes.ToString(),
            ["Width"] = file.Size.Width.ToString(),
            ["Height"] = file.Size.Height.ToString(),
            ["Duration"] = file.Duration.ToString(),
        };
        await blobClient.SetMetadataAsync(metadata, cancellationToken: ct);
        var response = await blobClient.UploadAsync(fileStream, true, ct);
        return response.GetRawResponse().IsError
            ? Result.Failure(response.GetRawResponse().ReasonPhrase)
            : Result.Success();
    }

    /// <inheritdoc />
    public async Task<Result> DeleteFileAsync(string id, CancellationToken ct = default) {
        var blobClient = await GetBlobClient(id, ct);
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