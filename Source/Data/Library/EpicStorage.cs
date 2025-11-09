namespace VttTools.Data.Library;

/// <summary>
/// EF Core storage implementation for Epic entities.
/// </summary>
public class EpicStorage(ApplicationDbContext context)
    : IEpicStorage {
    /// <inheritdoc />
    public async Task<Epic[]> GetAllAsync(CancellationToken ct = default) {
        var query = context.Epics
            .Include(e => e.Campaigns)
                .ThenInclude(c => c.Adventures)
            .Include(e => e.Resource)
            .AsSplitQuery()
            .AsNoTracking();
        var result = await query.Select(Mapper.AsEpic).ToArrayAsync(ct);
        return result;
    }

    /// <inheritdoc />
    public async Task<Epic[]> GetManyAsync(string filterDefinition, CancellationToken ct = default) {
        var query = context.Epics
            .Include(e => e.Campaigns)
                .ThenInclude(c => c.Adventures)
            .Include(e => e.Resource)
            .AsSplitQuery()
            .AsNoTracking();

        switch (filterDefinition) {
            case not null when filterDefinition.Split(':') is ["OwnedBy", var id] && Guid.TryParse(id, out var ownerId):
                query = query.Where(e => e.OwnerId == ownerId);
                break;
            case not null when filterDefinition.Split(':') is ["AvailableTo", var id] && Guid.TryParse(id, out var userId):
                query = query.Where(e => e.OwnerId == userId || (e.IsPublic && e.IsPublished));
                break;
            case "Public":
                query = query.Where(e => e.IsPublic && e.IsPublished);
                break;
        }

        var result = await query.Select(Mapper.AsEpic).ToArrayAsync(ct);
        return result;
    }

    /// <inheritdoc />
    public async Task<Epic?> GetByIdAsync(Guid id, CancellationToken ct = default) {
        var query = context.Epics
            .Include(e => e.Campaigns)
                .ThenInclude(c => c.Adventures)
            .Include(e => e.Resource)
            .AsSplitQuery()
            .AsNoTracking();
        var result = await query.FirstOrDefaultAsync(e => e.Id == id, ct);
        return result.ToModel();
    }

    /// <inheritdoc />
    public async Task AddAsync(Epic epic, CancellationToken ct = default) {
        var entity = epic.ToEntity();
        await context.Epics.AddAsync(entity, ct);
        await context.SaveChangesAsync(ct);
    }

    /// <inheritdoc />
    public async Task<bool> UpdateAsync(Epic epic, CancellationToken ct = default) {
        var entity = epic.ToEntity();
        context.Epics.Update(entity);
        var count = await context.SaveChangesAsync(ct);
        return count > 0;
    }

    /// <inheritdoc />
    public async Task<bool> DeleteAsync(Guid id, CancellationToken ct = default) {
        var entity = await context.Epics.FindAsync([id], ct);
        if (entity is null)
            return false;
        context.Epics.Remove(entity);
        await context.SaveChangesAsync(ct);
        return true;
    }
}
