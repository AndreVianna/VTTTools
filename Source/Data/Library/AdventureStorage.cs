namespace VttTools.Data.Library;

/// <summary>
/// EF Core storage implementation for Adventure entities.
/// </summary>
public class AdventureStorage(ApplicationDbContext context)
    : IAdventureStorage {
    /// <inheritdoc />
    public async Task<Adventure[]> GetAllAsync(CancellationToken ct = default) {
        var query = context.Adventures
            .Include(a => a.Scenes)
            .Include(a => a.Background)
            .Include(a => a.Campaign)
            .AsSplitQuery()
            .AsNoTracking();
        var result = await query.Select(Mapper.AsAdventure).ToArrayAsync(ct);
        return result;
    }

    /// <inheritdoc />
    public async Task<Adventure[]> GetManyAsync(string filterDefinition, CancellationToken ct = default) {
        var query = context.Adventures
            .Include(a => a.Scenes)
            .Include(a => a.Background)
            .Include(a => a.Campaign)
            .AsSplitQuery()
            .AsNoTracking();

        switch (filterDefinition) {
            case not null when filterDefinition.Split(':') is ["OwnedBy", var id] && Guid.TryParse(id, out var ownerId):
                query = query.Where(a => a.OwnerId == ownerId);
                break;
            case not null when filterDefinition.Split(':') is ["AvailableTo", var id] && Guid.TryParse(id, out var userId):
                query = query.Where(a => a.OwnerId == userId || (a.IsPublic && a.IsPublished));
                break;
            case "Public":
                query = query.Where(a => a.IsPublic && a.IsPublished);
                break;
        }

        var result = await query.Select(Mapper.AsAdventure).ToArrayAsync(ct);
        return result;
    }

    /// <inheritdoc />
    public async Task<Adventure?> GetByIdAsync(Guid id, CancellationToken ct = default) {
        var query = context.Adventures
            .Include(a => a.Scenes)
                .ThenInclude(s => s.SceneAssets)
                    .ThenInclude(sa => sa.Asset)
            .Include(a => a.Background)
            .Include(a => a.Campaign)
            .AsSplitQuery()
            .AsNoTracking();
        var result = await query.FirstOrDefaultAsync(a => a.Id == id, ct);
        return result.ToModel();
    }

    /// <inheritdoc />
    public async Task AddAsync(Adventure adventure, CancellationToken ct = default) {
        var entity = adventure.ToEntity();
        await context.Adventures.AddAsync(entity, ct);
        await context.SaveChangesAsync(ct);
    }

    /// <inheritdoc />
    public async Task<bool> UpdateAsync(Adventure adventure, CancellationToken ct = default) {
        var entity = adventure.ToEntity();
        context.Adventures.Update(entity);
        var count = await context.SaveChangesAsync(ct);
        return count > 0;
    }

    /// <inheritdoc />
    public async Task<bool> DeleteAsync(Guid id, CancellationToken ct = default) {
        var entity = await context.Adventures.FindAsync([id], ct);
        if (entity is null)
            return false;
        context.Adventures.Remove(entity);
        await context.SaveChangesAsync(ct);
        return true;
    }
}