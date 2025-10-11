namespace VttTools.Media.Services;

/// <summary>
/// Azure Blob Container implementation of IMediaService for development.
/// </summary>
public class AzureResourceService(BlobServiceClient client, IMediaStorage mediaStorage)
    : IResourceService {
    /// <inheritdoc />
    public async Task<Result> SaveResourceAsync(AddResourceData data, Stream stream, Guid ownerId, string entityType, Guid? entityId, bool isPublic, CancellationToken ct = default) {
        var blobClient = await GetBlobClient(data.Path, ct);
        var options = new BlobUploadOptions {
            Metadata = new Dictionary<string, string> {
                ["ContentType"] = data.Metadata.ContentType,
                ["FileName"] = data.Metadata.FileName,
                ["FileLength"] = data.Metadata.FileLength.ToString(),
                ["Width"] = data.Metadata.ImageSize.Width.ToString(),
                ["Height"] = data.Metadata.ImageSize.Height.ToString(),
                ["Duration"] = data.Metadata.Duration.ToString(),
                ["OwnerId"] = ownerId.ToString(),
                ["EntityType"] = entityType,
                ["EntityId"] = entityId?.ToString() ?? "",
                ["IsPublic"] = isPublic.ToString()
            },
            HttpHeaders = new() {
                ContentType = data.Metadata.ContentType,
            },
        };
        var response = await blobClient.UploadAsync(stream, options, ct);
        if (response.GetRawResponse().IsError)
            return Result.Failure(response.GetRawResponse().ReasonPhrase);

        // Determine ResourceType from file metadata
        var resourceType = data.Metadata.Duration > TimeSpan.Zero ? ResourceType.Video
            : data.Metadata.ContentType.Contains("gif") || data.Metadata.ContentType.Contains("webp") ? ResourceType.Animation
            : ResourceType.Image;

        // Extract resource ID from path (format: "resourceType/guid-suffix/guid")
        // Example: "images/ee97/0199d0f8459a76a0a1c92dceab0cee97"
        var pathParts = data.Path.Split('/');
        var resourceId = Guid.Parse(pathParts[^1]);  // Last element is the full GUID

        // Save Resource entity to database
        var resource = new Resource {
            Id = resourceId,
            Type = resourceType,
            Path = data.Path,
            Metadata = data.Metadata,
            Tags = data.Tags,
        };
        await mediaStorage.AddAsync(resource, ct);

        return Result.Success();
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
        var containerClient = client.GetBlobContainerClient("media");
        if (!await containerClient.ExistsAsync(ct))
            containerClient = await client.CreateBlobContainerAsync("media", PublicAccessType.BlobContainer, null, ct);
        return containerClient.GetBlobClient(blobName);
    }
}