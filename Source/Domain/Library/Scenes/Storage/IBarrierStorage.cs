using Barrier = VttTools.Library.Scenes.Model.Barrier;

namespace VttTools.Library.Scenes.Storage;

public interface IBarrierStorage {
    Task<List<Barrier>> GetByOwnerAsync(Guid ownerId, int page, int pageSize, CancellationToken ct = default);
    Task<Barrier?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task AddAsync(Barrier barrier, CancellationToken ct = default);
    Task<bool> UpdateAsync(Barrier barrier, CancellationToken ct = default);
    Task<bool> DeleteAsync(Guid id, CancellationToken ct = default);
}
