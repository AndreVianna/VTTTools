namespace VttTools.Data.Library;

/// <summary>
/// EF Core storage implementation for World entities.
/// </summary>
public class WorldStorage(ApplicationDbContext context)
    : IWorldStorage {
    /// <inheritdoc />
    public async Task<World[]> GetAllAsync(CancellationToken ct = default) {
        var query = context.Worlds
            .Include(e => e.Campaigns)
            .Include(e => e.Background)
            .AsSplitQuery()
            .AsNoTracking();
        var result = await query.Select(Mapper.AsWorld).ToArrayAsync(ct);
        return result;
    }

    /// <inheritdoc />
    public async Task<World[]> GetManyAsync(string filterDefinition, CancellationToken ct = default) {
        var query = context.Worlds
            .Include(e => e.Campaigns)
            .Include(e => e.Background)
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

        var result = await query.Select(Mapper.AsWorld).ToArrayAsync(ct);
        return result;
    }

    /// <inheritdoc />
    public async Task<World?> GetByIdAsync(Guid id, CancellationToken ct = default) {
        var query = context.Worlds
            .Include(e => e.Campaigns)
                .ThenInclude(c => c.Adventures)
            .Include(e => e.Background)
            .AsSplitQuery()
            .AsNoTracking();
        var result = await query.FirstOrDefaultAsync(e => e.Id == id, ct);
        return result.ToModel();
    }

    /// <inheritdoc />
    public async Task AddAsync(World world, CancellationToken ct = default) {
        var entity = world.ToEntity();
        await context.Worlds.AddAsync(entity, ct);
        await context.SaveChangesAsync(ct);
    }

    /// <inheritdoc />
    public async Task<bool> UpdateAsync(World world, CancellationToken ct = default) {
        var entity = world.ToEntity();
        context.Worlds.Update(entity);
        var count = await context.SaveChangesAsync(ct);
        return count > 0;
    }

    /// <inheritdoc />
    public async Task<bool> DeleteAsync(Guid id, CancellationToken ct = default) {
        var entity = await context.Worlds.FindAsync([id], ct);
        if (entity is null)
            return false;
        context.Worlds.Remove(entity);
        await context.SaveChangesAsync(ct);
        return true;
    }
}