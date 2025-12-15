namespace VttTools.Data.Library;

/// <summary>
/// EF Core storage implementation for World entities.
/// </summary>
public class WorldStorage(ApplicationDbContext context)
    : IWorldStorage {
    /// <inheritdoc />
    public async Task<(World[] Items, int TotalCount)> SearchAsync(
        Guid masterUserId,
        LibrarySearchFilter filter,
        CancellationToken ct = default) {
        var query = context.Worlds.AsQueryable();

        query = ApplySearchFilters(query, filter, masterUserId);
        var totalCount = await query.CountAsync(ct);

        query = ApplySorting(query, filter);
        var entities = await query
            .Skip(filter.Skip)
            .Take(filter.Take)
            .AsNoTracking()
            .ToListAsync(ct);

        var items = entities.Select(e => e.ToModel()!).ToArray();
        return (items, totalCount);
    }

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
    public async Task<World[]> SearchAsync(string filterDefinition, CancellationToken ct = default) {
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

    private static IQueryable<Entities.World> ApplySearchFilters(
        IQueryable<Entities.World> query,
        LibrarySearchFilter filter,
        Guid masterUserId) {
        if (!string.IsNullOrWhiteSpace(filter.Search)) {
            var search = filter.Search.ToLowerInvariant();
            query = query.Where(w =>
                w.Name.Contains(search, StringComparison.InvariantCultureIgnoreCase) ||
                w.Description.Contains(search, StringComparison.InvariantCultureIgnoreCase));
        }

        if (filter.OwnerId.HasValue)
            query = query.Where(w => w.OwnerId == filter.OwnerId.Value);

        if (!string.IsNullOrWhiteSpace(filter.OwnerType)) {
            query = filter.OwnerType.ToLowerInvariant() switch {
                "master" => query.Where(w => w.OwnerId == masterUserId),
                "user" => query.Where(w => w.OwnerId != masterUserId),
                _ => query
            };
        }

        if (filter.IsPublished.HasValue)
            query = query.Where(w => w.IsPublished == filter.IsPublished.Value);

        if (filter.IsPublic.HasValue)
            query = query.Where(w => w.IsPublic == filter.IsPublic.Value);

        return query;
    }

    private static IOrderedQueryable<Entities.World> ApplySorting(
        IQueryable<Entities.World> query,
        LibrarySearchFilter filter) {
        var sortBy = filter.SortBy?.ToLowerInvariant() ?? "name";
        var descending = filter.SortOrder?.ToLowerInvariant() == "desc";

        return sortBy switch {
            "name" => descending ? query.OrderByDescending(w => w.Name) : query.OrderBy(w => w.Name),
            _ => descending ? query.OrderByDescending(w => w.Name) : query.OrderBy(w => w.Name)
        };
    }
}