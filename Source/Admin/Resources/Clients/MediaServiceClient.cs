namespace VttTools.Admin.Resources.Clients;

public class MediaServiceClient(
    IHttpClientFactory httpClientFactory,
    IOptions<PublicLibraryOptions> options,
    ILogger<MediaServiceClient> logger)
    : IMediaServiceClient {

    private readonly Guid _masterUserId = options.Value.MasterUserId;

    public async Task<Result<Guid>> UploadResourceAsync(byte[] data, string fileName, string contentType, ResourceType resourceType, CancellationToken ct = default) {
        using var content = new MultipartFormDataContent();
        using var fileContent = new ByteArrayContent(data);
        fileContent.Headers.ContentType = new MediaTypeHeaderValue(contentType);
        content.Add(fileContent, "file", fileName);
        content.Add(new StringContent(resourceType.ToString()), "resourceType");
        content.Add(new StringContent(_masterUserId.ToString()), "ownerId");
        content.Add(new StringContent("true"), "isPublic");

        var httpClient = httpClientFactory.CreateClient("MediaService");
        var response = await httpClient.PostAsync("/api/resources", content, ct);
        if (!response.IsSuccessStatusCode) {
            var errorBody = await response.Content.ReadAsStringAsync(ct);
            logger.LogError(
                "Resource upload failed with status {StatusCode} for file {FileName}: {ErrorBody}",
                response.StatusCode,
                fileName,
                errorBody);
            return Result.Failure(errorBody).WithNo<Guid>();
        }

        var result = await response.Content.ReadFromJsonAsync<ResourceUploadResponse>(JsonDefaults.Options, ct);
        return result?.Id ?? Result.Failure("Failed to parse upload response").WithNo<Guid>();
    }

    public async Task<Result> UpdateResourceAsync(Guid resourceId, UpdateResourceRequest request, CancellationToken ct = default) {
        var httpClient = httpClientFactory.CreateClient("MediaService");
        httpClient.DefaultRequestHeaders.Add("X-User-Id", _masterUserId.ToString());

        var response = await httpClient.PatchAsJsonAsync($"/api/resources/{resourceId}", request, ct);
        if (!response.IsSuccessStatusCode) {
            var errorBody = await response.Content.ReadAsStringAsync(ct);
            logger.LogError(
                "Resource update failed with status {StatusCode} for resource {ResourceId}: {ErrorBody}",
                response.StatusCode,
                resourceId,
                errorBody);
            return Result.Failure(errorBody);
        }
        return Result.Success();
    }

    public async Task<Result> DeleteResourceAsync(Guid resourceId, CancellationToken ct = default) {
        var httpClient = httpClientFactory.CreateClient("MediaService");
        httpClient.DefaultRequestHeaders.Add("X-User-Id", _masterUserId.ToString());

        var response = await httpClient.DeleteAsync($"/api/resources/{resourceId}", ct);
        if (!response.IsSuccessStatusCode) {
            var errorBody = await response.Content.ReadAsStringAsync(ct);
            logger.LogError(
                "Resource deletion failed with status {StatusCode} for resource {ResourceId}: {ErrorBody}",
                response.StatusCode,
                resourceId,
                errorBody);
            return Result.Failure(errorBody);
        }
        return Result.Success();
    }

    public async Task<Result<ResourceListResponse>> ListUnpublishedResourcesAsync(VttTools.Admin.Resources.ApiContracts.ResourceFilterRequest request, CancellationToken ct = default) {
        var httpClient = httpClientFactory.CreateClient("MediaService");

        var queryParams = new List<string>();
        if (!string.IsNullOrWhiteSpace(request.ResourceType))
            queryParams.Add($"resourceType={Uri.EscapeDataString(request.ResourceType)}");
        if (!string.IsNullOrWhiteSpace(request.ContentKind))
            queryParams.Add($"contentKind={Uri.EscapeDataString(request.ContentKind)}");
        if (!string.IsNullOrWhiteSpace(request.Category))
            queryParams.Add($"category={Uri.EscapeDataString(request.Category)}");
        if (!string.IsNullOrWhiteSpace(request.SearchText))
            queryParams.Add($"searchText={Uri.EscapeDataString(request.SearchText)}");
        if (request.IsPublished.HasValue)
            queryParams.Add($"isPublished={request.IsPublished.Value.ToString().ToLowerInvariant()}");
        else
            queryParams.Add("isPublished=false"); // Default to unpublished for admin review
        if (request.IsPublic.HasValue)
            queryParams.Add($"isPublic={request.IsPublic.Value.ToString().ToLowerInvariant()}");
        queryParams.Add($"skip={request.Skip ?? 0}");
        queryParams.Add($"take={request.Take ?? 50}");

        var url = "/api/resources?" + string.Join("&", queryParams);

        var response = await httpClient.GetAsync(url, ct);
        if (!response.IsSuccessStatusCode) {
            var errorBody = await response.Content.ReadAsStringAsync(ct);
            var errorMessage = string.IsNullOrWhiteSpace(errorBody)
                ? $"Request failed with status {response.StatusCode}"
                : errorBody;
            logger.LogError(
                "Failed to list resources with status {StatusCode}: {ErrorBody}",
                response.StatusCode,
                errorMessage);
            return Result.Failure(errorMessage).WithNo<ResourceListResponse>();
        }

        var mediaResponse = await response.Content.ReadFromJsonAsync<MediaFilterResponse>(JsonDefaults.Options, ct);
        if (mediaResponse is null)
            return Result.Failure("Failed to parse response").WithNo<ResourceListResponse>();

        var items = mediaResponse.Items.Select(MapToResourceInfo).ToList();
        return new ResourceListResponse {
            Items = items,
            TotalCount = mediaResponse.TotalCount,
            Skip = mediaResponse.Skip,
            Take = mediaResponse.Take,
        };
    }

    private static ResourceInfoResponse MapToResourceInfo(ResourceMetadata resource)
        => new() {
            Id = resource.Id,
            ResourceType = resource.ResourceType.ToString(),
            Classification = resource.Classification,
            Description = resource.Description,
            FileName = resource.FileName,
            ContentType = resource.ContentType,
            FileLength = resource.FileLength,
            OwnerId = resource.OwnerId,
            IsPublished = resource.IsPublished,
            IsPublic = resource.IsPublic,
        };

    private sealed record ResourceUploadResponse(Guid Id);

    public async Task<Result<(byte[] Data, string ContentType)>> GetResourceDataAsync(Guid resourceId, CancellationToken ct = default) {
        var httpClient = httpClientFactory.CreateClient("MediaService");

        var response = await httpClient.GetAsync($"/api/resources/{resourceId}", ct);
        if (!response.IsSuccessStatusCode) {
            logger.LogError(
                "Failed to get resource data with status {StatusCode} for resource {ResourceId}",
                response.StatusCode,
                resourceId);
            return Result.Failure($"Failed to get resource: {response.StatusCode}").WithNo<(byte[] Data, string ContentType)>();
        }

        var data = await response.Content.ReadAsByteArrayAsync(ct);
        var contentType = response.Content.Headers.ContentType?.MediaType ?? "application/octet-stream";
        return (data, contentType);
    }

    private sealed record MediaFilterResponse(
        ResourceMetadata[] Items,
        int TotalCount,
        int Skip,
        int Take);
}
