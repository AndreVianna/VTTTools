using Barrier = VttTools.Library.Scenes.Model.Barrier;

namespace VttTools.Library.Services;

public class BarrierService(IBarrierStorage storage)
    : IBarrierService {
    public Task<List<Barrier>> GetBarriersAsync(Guid ownerId, int page, int pageSize, CancellationToken ct = default)
        => storage.GetByOwnerAsync(ownerId, page, pageSize, ct);

    public async Task<Barrier?> GetBarrierByIdAsync(Guid id, Guid ownerId, CancellationToken ct = default) {
        var barrier = await storage.GetByIdAsync(id, ct);
        if (barrier is null || barrier.OwnerId != ownerId)
            return null;
        return barrier;
    }

    public async Task<Result<Barrier>> CreateBarrierAsync(CreateBarrierData data, Guid ownerId, CancellationToken ct = default) {
        var result = data.Validate();
        if (result.HasErrors)
            return result;

        var barrier = new Barrier {
            Id = Guid.CreateVersion7(),
            OwnerId = ownerId,
            Name = data.Name,
            Description = data.Description,
            IsOpaque = data.IsOpaque,
            IsSolid = data.IsSolid,
            IsSecret = data.IsSecret,
            IsOpenable = data.IsOpenable,
            IsLocked = data.IsLocked,
            CreatedAt = DateTime.UtcNow,
        };

        await storage.AddAsync(barrier, ct);
        return barrier;
    }

    public async Task<Result<Barrier>> UpdateBarrierAsync(Guid id, UpdateBarrierData data, Guid ownerId, CancellationToken ct = default) {
        var barrier = await storage.GetByIdAsync(id, ct);
        if (barrier is null)
            return Result.Failure("NotFound");
        if (barrier.OwnerId != ownerId)
            return Result.Failure("NotAllowed");

        var result = data.Validate();
        if (result.HasErrors)
            return result;

        barrier = barrier with {
            Name = data.Name,
            Description = data.Description,
            IsOpaque = data.IsOpaque,
            IsSolid = data.IsSolid,
            IsSecret = data.IsSecret,
            IsOpenable = data.IsOpenable,
            IsLocked = data.IsLocked,
        };

        await storage.UpdateAsync(barrier, ct);
        return barrier;
    }

    public async Task<Result> DeleteBarrierAsync(Guid id, Guid ownerId, CancellationToken ct = default) {
        var barrier = await storage.GetByIdAsync(id, ct);
        if (barrier is null)
            return Result.Failure("NotFound");
        if (barrier.OwnerId != ownerId)
            return Result.Failure("NotAllowed");

        await storage.DeleteAsync(id, ct);
        return Result.Success();
    }
}
