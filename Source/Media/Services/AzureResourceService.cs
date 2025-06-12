using Azure.Storage;

using VttTools.Media.Model;

namespace VttTools.Media.Services;

/// <summary>
/// Azure Blob Container implementation of IMediaService for development.
/// </summary>
public class AzureResourceService(BlobServiceClient client)
    : IResourceService {
    /// <inheritdoc />
    public async Task<Result> SaveResourceAsync(Resource resource, Stream stream, CancellationToken ct = default) {
        var blobClient = await GetBlobClient(resource.Path, ct);
        var options = new BlobUploadOptions {
            Metadata = new Dictionary<string, string> {
                ["ContentType"] = resource.ContentType,
                ["FileName"] = resource.FileName,
                ["FileSize"] = resource.FileSize.ToString(),
                ["Width"] = resource.ImageSize.Width.ToString(),
                ["Height"] = resource.ImageSize.Height.ToString(),
                ["Duration"] = resource.Duration.ToString(),
            },
            HttpHeaders = new() {
                ContentType = resource.ContentType,
            },
        };
        var response = await blobClient.UploadAsync(stream, options, ct);
        return response.GetRawResponse().IsError
            ? Result.Failure(response.GetRawResponse().ReasonPhrase)
            : Result.Success();
    }

    /// <inheritdoc />
    public async Task<Result> DeleteResourceAsync(string id, CancellationToken ct = default) {
        var blobClient = await GetBlobClient(id, ct);
        var response = await blobClient.DeleteIfExistsAsync(DeleteSnapshotsOption.IncludeSnapshots, null, ct);
        return response.GetRawResponse().IsError
            ? Result.Failure(response.GetRawResponse().ReasonPhrase)
            : Result.Success();
    }

    /// <inheritdoc />
    public async Task<StreamData?> ServeResourceAsync(string id, CancellationToken ct = default) {
        var blobClient = await GetBlobClient(id, ct);
        var response = await blobClient.DownloadAsync(ct);
        return  response.GetRawResponse().IsError
            ? null
            : new() {
            Content = response.Value.Content,
            Type =response.Value.ContentType,
            Length = (ulong)response.Value.ContentLength,
        };
    }

    private async Task<BlobClient> GetBlobClient(string blobName, CancellationToken ct) {
        var containerClient = client.GetBlobContainerClient("images");
        if (!await containerClient.ExistsAsync(ct))
            containerClient = await client.CreateBlobContainerAsync("images", PublicAccessType.BlobContainer, null, ct);
        return containerClient.GetBlobClient(blobName);
    }
}