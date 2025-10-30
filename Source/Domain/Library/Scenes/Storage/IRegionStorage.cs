using Region = VttTools.Library.Scenes.Model.Region;

namespace VttTools.Library.Scenes.Storage;

public interface IRegionStorage {
    Task<List<Region>> GetByOwnerAsync(Guid ownerId, int page, int pageSize, CancellationToken ct = default);
    Task<Region?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task AddAsync(Region region, CancellationToken ct = default);
    Task<bool> UpdateAsync(Region region, CancellationToken ct = default);
    Task<bool> DeleteAsync(Guid id, CancellationToken ct = default);
}