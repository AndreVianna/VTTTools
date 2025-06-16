namespace VttTools.Media.Services;

public interface IResourceService {
    Task<Result> SaveResourceAsync(AddResourceData data, Stream stream, CancellationToken ct = default);
    Task<Result> UpdateResourceAsync(Guid id, UpdateResourceData data, CancellationToken ct = default);
    Task<Result> DeleteResourceAsync(Guid id, CancellationToken ct = default);
    Task<ResourceFile?> ServeResourceAsync(Guid id, CancellationToken ct = default);
}