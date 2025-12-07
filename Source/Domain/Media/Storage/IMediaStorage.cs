namespace VttTools.Media.Storage;

public interface IMediaStorage {
    Task<(ResourceMetadata[] Items, int TotalCount)> FilterAsync(ResourceFilterData filter, CancellationToken ct = default);
    Task<ResourceMetadata?> FindByIdAsync(Guid id, CancellationToken ct = default);
    Task AddAsync(ResourceMetadata resource, CancellationToken ct = default);
    Task<bool> UpdateAsync(ResourceMetadata resource, CancellationToken ct = default);
    Task<bool> DeleteAsync(Guid id, CancellationToken ct = default);
}