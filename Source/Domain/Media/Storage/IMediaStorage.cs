namespace VttTools.Media.Storage;

public interface IMediaStorage {
    Task<(ResourceInfo[] Items, int TotalCount)> FilterAsync(ResourceFilterData filter, CancellationToken ct = default);
    Task<ResourceInfo?> FindByIdAsync(Guid id, CancellationToken ct = default);
    Task AddAsync(ResourceInfo resource, CancellationToken ct = default);
    Task<bool> UpdateAsync(ResourceInfo resource, CancellationToken ct = default);
    Task<bool> DeleteAsync(Guid id, CancellationToken ct = default);
}