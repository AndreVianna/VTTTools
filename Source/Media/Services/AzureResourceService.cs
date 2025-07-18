namespace VttTools.Media.Services;

/// <summary>
/// Azure Blob Container implementation of IMediaService for development.
/// </summary>
public class AzureResourceService(BlobServiceClient client, IMediaStorage mediaStorage)
    : IResourceService {
    /// <inheritdoc />
    public async Task<Result> SaveResourceAsync(AddResourceData data, Stream stream, CancellationToken ct = default) {
        var blobClient = await GetBlobClient(data.Path, ct);
        var options = new BlobUploadOptions {
            Metadata = new Dictionary<string, string> {
                ["ContentType"] = data.Metadata.ContentType,
                ["FileName"] = data.Metadata.FileName,
                ["FileLength"] = data.Metadata.FileLength.ToString(),
                ["Width"] = data.Metadata.ImageSize.Width.ToString(),
                ["Height"] = data.Metadata.ImageSize.Height.ToString(),
                ["Duration"] = data.Metadata.Duration.ToString(),
            },
            HttpHeaders = new() {
                ContentType = data.Metadata.ContentType,
            },
        };
        var response = await blobClient.UploadAsync(stream, options, ct);
        return response.GetRawResponse().IsError
            ? Result.Failure(response.GetRawResponse().ReasonPhrase)
            : Result.Success();
    }

    /// <inheritdoc />
    public async Task<Result> UpdateResourceAsync(Guid id, UpdateResourceData data, CancellationToken ct = default) {
        var resource = await mediaStorage.GetByIdAsync(id, ct);
        if (resource is null)
            return Result.Failure("NotFound");
        if (!data.Tags.IsSet)
            return Result.Success();

        var tags = data.Tags.Value.Items.Length > 0
            ? data.Tags.Value.Items
            : resource.Tags.Union(data.Tags.Value.Add).Except(data.Tags.Value.Remove);
        resource = resource with { Tags = [.. tags] };
        await mediaStorage.UpdateAsync(resource, ct);
        return Result.Success();
    }

    /// <inheritdoc />
    public async Task<Result> DeleteResourceAsync(Guid id, CancellationToken ct = default) {
        var resource = await mediaStorage.GetByIdAsync(id, ct);
        if (resource is null)
            return Result.Failure("NotFound");
        var blobClient = await GetBlobClient(resource.Path, ct);
        var response = await blobClient.DeleteIfExistsAsync(DeleteSnapshotsOption.IncludeSnapshots, null, ct);
        if (response.GetRawResponse().IsError)
            return Result.Failure(response.GetRawResponse().ReasonPhrase);
        await mediaStorage.DeleteAsync(id, ct);
        return Result.Success();
    }

    /// <inheritdoc />
    public async Task<ResourceFile?> ServeResourceAsync(Guid id, CancellationToken ct = default) {
        var resource = await mediaStorage.GetByIdAsync(id, ct);
        if (resource is null)
            return null;
        var blobClient = await GetBlobClient(resource.Path, ct);
        var response = await blobClient.DownloadAsync(ct);
        return response.GetRawResponse().IsError
            ? null
            : new() {
                Stream = response.Value.Content,
                ContentType = response.Value.ContentType,
                FileName = response.Value.Details?.Metadata["FileName"] ?? resource.Metadata.FileName,
                FileLength = ulong.TryParse(response.Value.Details?.Metadata["FileLength"], out var fileLength)
                    ? fileLength
                    : resource.Metadata.FileLength,
                ImageSize = new Size(
                    int.TryParse(response.Value.Details?.Metadata["Width"], out var width)
                        ? width
                        : resource.Metadata.ImageSize.Width,
                    int.TryParse(response.Value.Details?.Metadata["Height"], out var height)
                        ? height
                        : resource.Metadata.ImageSize.Height),
                Duration = TimeSpan.TryParse(response.Value.Details?.Metadata["Duration"], out var duration)
                    ? duration
                    : resource.Metadata.Duration,
            };
    }

    private async Task<BlobClient> GetBlobClient(string blobName, CancellationToken ct) {
        var containerClient = client.GetBlobContainerClient("images");
        if (!await containerClient.ExistsAsync(ct))
            containerClient = await client.CreateBlobContainerAsync("images", PublicAccessType.BlobContainer, null, ct);
        return containerClient.GetBlobClient(blobName);
    }
}