using Barrier = VttTools.Library.Scenes.Model.Barrier;

namespace VttTools.Data.Library;

public class BarrierStorage(ApplicationDbContext context)
    : IBarrierStorage {
    public async Task<List<Barrier>> GetByOwnerAsync(Guid ownerId, int page, int pageSize, CancellationToken ct = default) {
        var query = context.Barriers
            .Where(b => b.OwnerId == ownerId)
            .OrderByDescending(b => b.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .AsNoTracking()
            .Select(Mapper.AsBarrier);
        return await query.ToListAsync(ct);
    }

    public async Task<Barrier?> GetByIdAsync(Guid id, CancellationToken ct = default) {
        var entity = await context.Barriers
            .AsNoTracking()
            .FirstOrDefaultAsync(b => b.Id == id, ct);
        return entity.ToModel();
    }

    public async Task AddAsync(Barrier barrier, CancellationToken ct = default) {
        var entity = barrier.ToEntity();
        await context.Barriers.AddAsync(entity, ct);
        await context.SaveChangesAsync(ct);
    }

    public async Task<bool> UpdateAsync(Barrier barrier, CancellationToken ct = default) {
        var entity = barrier.ToEntity();
        context.Barriers.Update(entity);
        var result = await context.SaveChangesAsync(ct);
        return result > 0;
    }

    public async Task<bool> DeleteAsync(Guid id, CancellationToken ct = default) {
        var entity = await context.Barriers.FindAsync([id], ct);
        if (entity == null)
            return false;
        context.Barriers.Remove(entity);
        var result = await context.SaveChangesAsync(ct);
        return result > 0;
    }
}