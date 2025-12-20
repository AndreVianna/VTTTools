namespace VttTools.Admin.Resources.Clients;

public interface IMediaServiceClient {
    Task<Result<Guid>> UploadResourceAsync(byte[] data, string fileName, string contentType, ResourceType resourceType, CancellationToken ct = default);
    Task<Result> UpdateResourceAsync(Guid resourceId, UpdateResourceRequest request, CancellationToken ct = default);
    Task<Result> DeleteResourceAsync(Guid resourceId, CancellationToken ct = default);
    Task<Result<ResourceListResponse>> ListUnpublishedResourcesAsync(VttTools.Admin.Resources.ApiContracts.ResourceFilterRequest request, CancellationToken ct = default);
    Task<Result<(byte[] Data, string ContentType)>> GetResourceDataAsync(Guid resourceId, CancellationToken ct = default);
}
