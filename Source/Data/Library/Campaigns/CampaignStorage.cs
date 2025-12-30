using Campaign = VttTools.Library.Campaigns.Model.Campaign;

namespace VttTools.Data.Library.Campaigns;

public class CampaignStorage(ApplicationDbContext context)
    : ICampaignStorage {
    /// <inheritdoc />
    public async Task<(Campaign[] Items, int TotalCount)> SearchAsync(
        Guid masterUserId,
        LibrarySearchFilter filter,
        CancellationToken ct = default) {
        var query = context.Campaigns.AsQueryable();

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
    public async Task<Campaign[]> GetByWorldIdAsync(Guid worldId, CancellationToken ct = default) {
        var entities = await context.Campaigns
            .Where(c => c.WorldId == worldId)
            .AsNoTracking()
            .ToListAsync(ct);
        return [.. entities.Select(e => e.ToModel()!)];
    }

    /// <inheritdoc />
    public async Task<Campaign[]> GetAllAsync(CancellationToken ct = default) {
        var query = context.Campaigns
            .Include(c => c.Adventures)
            .Include(c => c.Background)
            .AsSplitQuery()
            .AsNoTracking();
        var result = await query.Select(Mapper.AsCampaign).ToArrayAsync(ct);
        return result;
    }

    /// <inheritdoc />
    public async Task<Campaign[]> GetManyAsync(string filterDefinition, CancellationToken ct = default) {
        var query = context.Campaigns
            .Include(c => c.Adventures)
            .Include(c => c.Background)
            .AsSplitQuery()
            .AsNoTracking();

        switch (filterDefinition) {
            case not null when filterDefinition.Split(':') is ["OwnedBy", var id] && Guid.TryParse(id, out var ownerId):
                query = query.Where(c => c.OwnerId == ownerId);
                break;
            case not null when filterDefinition.Split(':') is ["AvailableTo", var id] && Guid.TryParse(id, out var userId):
                query = query.Where(c => c.OwnerId == userId || (c.IsPublic && c.IsPublished));
                break;
            case "Public":
                query = query.Where(c => c.IsPublic && c.IsPublished);
                break;
        }

        var result = await query.Select(Mapper.AsCampaign).ToArrayAsync(ct);
        return result;
    }

    /// <inheritdoc />
    public async Task<Campaign?> GetByIdAsync(Guid id, CancellationToken ct = default) {
        var query = context.Campaigns
            .Include(c => c.Adventures)
                .ThenInclude(a => a.Encounters)
            .Include(c => c.Background)
            .AsSplitQuery()
            .AsNoTracking();
        var result = await query.FirstOrDefaultAsync(c => c.Id == id, ct);
        return result.ToModel();
    }

    /// <inheritdoc />
    public async Task AddAsync(Campaign campaign, CancellationToken ct = default) {
        var entity = campaign.ToEntity();
        await context.Campaigns.AddAsync(entity, ct);
        await context.SaveChangesAsync(ct);
    }

    /// <inheritdoc />
    public async Task<bool> UpdateAsync(Campaign campaign, CancellationToken ct = default) {
        var entity = campaign.ToEntity();
        context.Campaigns.Update(entity);
        var count = await context.SaveChangesAsync(ct);
        return count > 0;
    }

    /// <inheritdoc />
    public async Task<bool> DeleteAsync(Guid id, CancellationToken ct = default) {
        var entity = await context.Campaigns.FindAsync([id], ct);
        if (entity is null)
            return false;
        context.Campaigns.Remove(entity);
        await context.SaveChangesAsync(ct);
        return true;
    }

    private static IQueryable<Entities.Campaign> ApplySearchFilters(
        IQueryable<Entities.Campaign> query,
        LibrarySearchFilter filter,
        Guid masterUserId) {
        if (!string.IsNullOrWhiteSpace(filter.Search)) {
            var search = filter.Search.ToLowerInvariant();
            query = query.Where(c =>
                c.Name.Contains(search, StringComparison.InvariantCultureIgnoreCase) ||
                c.Description.Contains(search, StringComparison.InvariantCultureIgnoreCase));
        }

        if (filter.OwnerId.HasValue)
            query = query.Where(c => c.OwnerId == filter.OwnerId.Value);

        if (!string.IsNullOrWhiteSpace(filter.OwnerType)) {
            query = filter.OwnerType.ToLowerInvariant() switch {
                "master" => query.Where(c => c.OwnerId == masterUserId),
                "user" => query.Where(c => c.OwnerId != masterUserId),
                _ => query,
            };
        }

        if (filter.IsPublished.HasValue)
            query = query.Where(c => c.IsPublished == filter.IsPublished.Value);

        if (filter.IsPublic.HasValue)
            query = query.Where(c => c.IsPublic == filter.IsPublic.Value);

        return query;
    }

    private static IOrderedQueryable<Entities.Campaign> ApplySorting(
        IQueryable<Entities.Campaign> query,
        LibrarySearchFilter filter) {
        var sortBy = filter.SortBy?.ToLowerInvariant() ?? "name";
        var descending = filter.SortOrder?.ToLowerInvariant() == "desc";

        return sortBy switch {
            "name" => descending ? query.OrderByDescending(c => c.Name) : query.OrderBy(c => c.Name),
            _ => descending ? query.OrderByDescending(c => c.Name) : query.OrderBy(c => c.Name),
        };
    }
}