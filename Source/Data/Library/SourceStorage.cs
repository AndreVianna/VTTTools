using Source = VttTools.Library.Scenes.Model.Source;

namespace VttTools.Data.Library;

public class SourceStorage(ApplicationDbContext context)
    : ISourceStorage {
    public async Task<List<Source>> GetByOwnerAsync(Guid ownerId, int page, int pageSize, CancellationToken ct = default) {
        var query = context.Sources
            .Where(s => s.OwnerId == ownerId)
            .OrderByDescending(s => s.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .AsNoTracking()
            .Select(Mapper.AsSource);
        return await query.ToListAsync(ct);
    }

    public async Task<Source?> GetByIdAsync(Guid id, CancellationToken ct = default) {
        var entity = await context.Sources
            .AsNoTracking()
            .FirstOrDefaultAsync(s => s.Id == id, ct);
        return entity.ToModel();
    }

    public async Task AddAsync(Source source, CancellationToken ct = default) {
        var entity = source.ToEntity();
        await context.Sources.AddAsync(entity, ct);
        await context.SaveChangesAsync(ct);
    }

    public async Task<bool> UpdateAsync(Source source, CancellationToken ct = default) {
        var entity = source.ToEntity();
        context.Sources.Update(entity);
        var result = await context.SaveChangesAsync(ct);
        return result > 0;
    }

    public async Task<bool> DeleteAsync(Guid id, CancellationToken ct = default) {
        var entity = await context.Sources.FindAsync([id], ct);
        if (entity == null)
            return false;
        context.Sources.Remove(entity);
        var result = await context.SaveChangesAsync(ct);
        return result > 0;
    }
}
