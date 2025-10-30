using Region = VttTools.Library.Scenes.Model.Region;

namespace VttTools.Data.Library;

public class RegionStorage(ApplicationDbContext context)
    : IRegionStorage {
    public async Task<List<Region>> GetByOwnerAsync(Guid ownerId, int page, int pageSize, CancellationToken ct = default) {
        var query = context.Regions
            .Where(r => r.OwnerId == ownerId)
            .OrderByDescending(r => r.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .AsNoTracking()
            .Select(Mapper.AsRegion);
        return await query.ToListAsync(ct);
    }

    public async Task<Region?> GetByIdAsync(Guid id, CancellationToken ct = default) {
        var entity = await context.Regions
            .AsNoTracking()
            .FirstOrDefaultAsync(r => r.Id == id, ct);
        return entity.ToModel();
    }

    public async Task AddAsync(Region region, CancellationToken ct = default) {
        var entity = region.ToEntity();
        await context.Regions.AddAsync(entity, ct);
        await context.SaveChangesAsync(ct);
    }

    public async Task<bool> UpdateAsync(Region region, CancellationToken ct = default) {
        var entity = region.ToEntity();
        context.Regions.Update(entity);
        var result = await context.SaveChangesAsync(ct);
        return result > 0;
    }

    public async Task<bool> DeleteAsync(Guid id, CancellationToken ct = default) {
        var entity = await context.Regions.FindAsync([id], ct);
        if (entity == null)
            return false;
        context.Regions.Remove(entity);
        var result = await context.SaveChangesAsync(ct);
        return result > 0;
    }
}