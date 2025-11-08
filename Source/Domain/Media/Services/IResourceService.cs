namespace VttTools.Media.Services;

public interface IResourceService {
    Task<Result<Resource>> SaveResourceAsync(AddResourceData data, Stream stream, Guid ownerId, string entityType, Guid? entityId, bool isPublic, CancellationToken ct = default);
    Task<Result> UpdateResourceAsync(Guid id, UpdateResourceData data, CancellationToken ct = default);
    Task<Result> DeleteResourceAsync(Guid id, CancellationToken ct = default);
    Task<ResourceFile?> ServeResourceAsync(Guid id, CancellationToken ct = default);
}