namespace VttTools.Media.Services;

public interface IResourceService {
    Task<Result<ResourceFile>> UploadResourceAsync(Guid userId, UploadResourceData data, CancellationToken ct = default);
    Task<(ResourceInfo[] Items, int TotalCount)> FindResourcesAsync(Guid userId, ResourceFilterData data, CancellationToken ct = default);
    Task<ResourceData?> ServeResourceAsync(Guid userId, Guid id, CancellationToken ct = default);
    Task<ResourceInfo?> GetResourceAsync(Guid userId, Guid id, CancellationToken ct = default);
    Task<Result> UpdateResourceAsync(Guid userId, Guid id, UpdateResourceData data, CancellationToken ct = default);
    Task<Result> DeleteResourceAsync(Guid userId, Guid id, CancellationToken ct = default);
}