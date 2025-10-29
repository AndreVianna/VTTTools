using Barrier = VttTools.Library.Scenes.Model.Barrier;

namespace VttTools.Library.Scenes.Services;

public interface IBarrierService {
    Task<List<Barrier>> GetBarriersAsync(Guid ownerId, int page, int pageSize, CancellationToken ct = default);
    Task<Barrier?> GetBarrierByIdAsync(Guid id, Guid ownerId, CancellationToken ct = default);
    Task<Result<Barrier>> CreateBarrierAsync(CreateBarrierData data, Guid ownerId, CancellationToken ct = default);
    Task<Result<Barrier>> UpdateBarrierAsync(Guid id, UpdateBarrierData data, Guid ownerId, CancellationToken ct = default);
    Task<Result> DeleteBarrierAsync(Guid id, Guid ownerId, CancellationToken ct = default);
}
