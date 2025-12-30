using Adventure = VttTools.Library.Adventures.Model.Adventure;

namespace VttTools.Data.Library.Adventures;

public class AdventureStorage(ApplicationDbContext context)
    : IAdventureStorage {
    public async Task<(Adventure[] Items, int TotalCount)> SearchAsync(
        Guid masterUserId,
        LibrarySearchFilter filter,
        CancellationToken ct = default) {
        var query = context.Adventures.AsQueryable();

        query = ApplySearchFilters(query, filter, masterUserId);
        var totalCount = await query.CountAsync(ct);

        query = ApplySorting(query, filter);
        var entities = await query
            .Skip(filter.Skip)
            .Take(filter.Take)
            .AsNoTracking()
            .ToListAsync(ct);

        var items = entities.Select(e => e.ToModel(includeParent: true)!).ToArray();
        return (items, totalCount);
    }

    public async Task<Adventure[]> GetByCampaignIdAsync(Guid campaignId, CancellationToken ct = default) {
        var entities = await context.Adventures
            .Where(a => a.CampaignId == campaignId)
            .AsNoTracking()
            .ToListAsync(ct);
        return [.. entities.Select(e => e.ToModel(includeParent: true)!)];
    }

    public async Task<Adventure[]> GetAllAsync(CancellationToken ct = default) {
        var query = context.Adventures
            .Include(a => a.Encounters)
            .Include(a => a.Background)
            .Include(a => a.Campaign)
            .AsSplitQuery()
            .AsNoTracking();
        var result = await query.Select(Mapper.AsAdventure).ToArrayAsync(ct);
        return result;
    }

    public async Task<Adventure[]> GetManyAsync(string filterDefinition, CancellationToken ct = default) {
        var query = context.Adventures
            .Include(a => a.Encounters)
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

    public async Task<Adventure?> GetByIdAsync(Guid id, CancellationToken ct = default) {
        var query = context.Adventures
            .Include(a => a.Encounters)
                .ThenInclude(e => e.Stage)
            .Include(a => a.Encounters)
                .ThenInclude(e => e.Actors)
                    .ThenInclude(a => a.Asset)
            .Include(a => a.Encounters)
                .ThenInclude(e => e.Objects)
                    .ThenInclude(o => o.Asset)
            .Include(a => a.Encounters)
                .ThenInclude(e => e.Effects)
            .Include(a => a.Background)
            .Include(a => a.Campaign)
            .AsSplitQuery()
            .AsNoTracking();
        var result = await query.FirstOrDefaultAsync(a => a.Id == id, ct);
        return result.ToModel(includeParent: true);
    }

    public async Task AddAsync(Adventure adventure, CancellationToken ct = default) {
        var entity = adventure.ToEntity();
        await context.Adventures.AddAsync(entity, ct);
        await context.SaveChangesAsync(ct);
    }

    public async Task<bool> UpdateAsync(Adventure adventure, CancellationToken ct = default) {
        var entity = adventure.ToEntity();
        context.Adventures.Update(entity);
        var count = await context.SaveChangesAsync(ct);
        return count > 0;
    }

    public async Task<bool> DeleteAsync(Guid id, CancellationToken ct = default) {
        var entity = await context.Adventures.FindAsync([id], ct);
        if (entity is null)
            return false;
        context.Adventures.Remove(entity);
        await context.SaveChangesAsync(ct);
        return true;
    }

    private static IQueryable<Entities.Adventure> ApplySearchFilters(
        IQueryable<Entities.Adventure> query,
        LibrarySearchFilter filter,
        Guid masterUserId) {
        if (!string.IsNullOrWhiteSpace(filter.Search)) {
            var search = filter.Search.ToLowerInvariant();
            query = query.Where(a =>
                a.Name.Contains(search, StringComparison.InvariantCultureIgnoreCase) ||
                a.Description.Contains(search, StringComparison.InvariantCultureIgnoreCase));
        }

        if (filter.OwnerId.HasValue)
            query = query.Where(a => a.OwnerId == filter.OwnerId.Value);

        if (!string.IsNullOrWhiteSpace(filter.OwnerType)) {
            query = filter.OwnerType.ToLowerInvariant() switch {
                "master" => query.Where(a => a.OwnerId == masterUserId),
                "user" => query.Where(a => a.OwnerId != masterUserId),
                _ => query,
            };
        }

        if (filter.IsPublished.HasValue)
            query = query.Where(a => a.IsPublished == filter.IsPublished.Value);

        if (filter.IsPublic.HasValue)
            query = query.Where(a => a.IsPublic == filter.IsPublic.Value);

        return query;
    }

    private static IOrderedQueryable<Entities.Adventure> ApplySorting(
        IQueryable<Entities.Adventure> query,
        LibrarySearchFilter filter) {
        var sortBy = filter.SortBy?.ToLowerInvariant() ?? "name";
        var descending = filter.SortOrder?.ToLowerInvariant() == "desc";

        return sortBy switch {
            "name" => descending ? query.OrderByDescending(a => a.Name) : query.OrderBy(a => a.Name),
            _ => descending ? query.OrderByDescending(a => a.Name) : query.OrderBy(a => a.Name),
        };
    }
}