using Asset = VttTools.Assets.Model.Asset;
using AssetEntity = VttTools.Data.Assets.Entities.Asset;

namespace VttTools.Data.Assets;

public class AssetStorage(ApplicationDbContext context)
    : IAssetStorage {
    public async Task<Asset[]> GetAllAsync(CancellationToken ct = default) {
        var entities = await context.Assets
                    .Include(a => a.Thumbnail)
                    .Include(a => a.Portrait)
                    .Include(a => a.Tokens)
                        .ThenInclude(r => r.Token)
                    .Include(a => a.StatBlockEntries)
                        .ThenInclude(se => se.GameSystem)
                    .AsSplitQuery()
                    .AsNoTracking()
                    .ToArrayAsync(ct);
        return [.. entities.Select(e => e.ToModel())];
    }

    public async Task<(Asset[] assets, int totalCount)> SearchAsync(
        Guid userId,
        Availability? availability = null,
        AssetKind? kind = null,
        string? category = null,
        string? type = null,
        string? subtype = null,
        string? search = null,
        string[]? tags = null,
        ICollection<AdvancedSearchFilter>? filters = null,
        AssetSortBy? sortBy = null,
        SortDirection? sortDirection = null,
        Pagination? pagination = null,
        CancellationToken ct = default) {

        var query = context.Assets
                    .Include(a => a.Thumbnail)
                    .Include(a => a.Portrait)
                    .Include(a => a.Tokens)
                        .ThenInclude(r => r.Token)
                    .Include(a => a.StatBlockEntries)
                        .ThenInclude(se => se.GameSystem)
                    .AsNoTracking()
                    .AsSplitQuery()
                    .AsQueryable();

        query = availability switch {
            Availability.MineOnly => query.Where(a => a.OwnerId == userId),
            _ => query.Where(a => a.OwnerId == userId || (a.IsPublic && a.IsPublished)),
        };

        if (kind.HasValue)
            query = query.Where(a => a.Kind == kind.Value);
        if (!string.IsNullOrWhiteSpace(category))
            query = query.Where(a => a.Category == category);
        if (!string.IsNullOrWhiteSpace(type))
            query = query.Where(a => a.Type == type);
        if (!string.IsNullOrWhiteSpace(subtype))
            query = query.Where(a => a.Subtype == subtype);

        if (!string.IsNullOrWhiteSpace(search)) {
            var pattern = $"%{search}%";
            query = query.Where(a =>
                EF.Functions.Like(a.Name, pattern) ||
                EF.Functions.Like(a.Description, pattern));
        }

        if (tags is { Length: > 0 }) {
            foreach (var tag in tags)
                query = query.Where(a => a.Tags.Contains(tag));
        }

        query = AddAdvancedSearchFilters(filters, query);

        var totalCount = await query.CountAsync(ct);

        query = ApplySorting(query, sortBy, sortDirection);

        if (pagination is not null)
            query = query.Skip(pagination.Index * pagination.Size).Take(pagination.Size);

        var entities = await query.ToArrayAsync(ct);
        var assets = entities.Select(e => e.ToModel()).ToArray();

        return (assets, totalCount);
    }

    private static IQueryable<AssetEntity> ApplySorting(
        IQueryable<AssetEntity> query,
        AssetSortBy? sortBy,
        SortDirection? sortDirection) {
        var isDescending = sortDirection == SortDirection.Descending;
        return sortBy switch {
            AssetSortBy.Name => isDescending
                ? query.OrderByDescending(a => a.Name)
                : query.OrderBy(a => a.Name),
            AssetSortBy.Kind => isDescending
                ? query.OrderByDescending(a => a.Kind)
                : query.OrderBy(a => a.Kind),
            AssetSortBy.Category => isDescending
                ? query.OrderByDescending(a => a.Category)
                : query.OrderBy(a => a.Category),
            AssetSortBy.Type => isDescending
                ? query.OrderByDescending(a => a.Type)
                : query.OrderBy(a => a.Type),
            _ => query.OrderBy(a => a.Name),
        };
    }

    private static IQueryable<AssetEntity> AddAdvancedSearchFilters(ICollection<AdvancedSearchFilter>? advancedSearch, IQueryable<AssetEntity> query) {
        if (advancedSearch == null)
            return query;
        foreach (var filter in advancedSearch) {
            switch (filter.Operator) {
                case FilterOperator.GreaterThan:
                    query = query.Where(a => a.StatBlockEntries.Any(sb => sb.Key == filter.Key && sb.AsNumber > filter.AsNumber));
                    break;
                case FilterOperator.LessThan:
                    query = query.Where(a => a.StatBlockEntries.Any(sb => sb.Key == filter.Key && sb.AsNumber < filter.AsNumber));
                    break;
            }
        }

        return query;
    }

    public async Task<Asset?> FindByIdAsync(Guid userId, Guid id, CancellationToken ct = default) {
        var entity = await context.Assets
                    .Include(a => a.Thumbnail)
                    .Include(a => a.Portrait)
                    .Include(a => a.Tokens)
                        .ThenInclude(r => r.Token)
                    .Include(a => a.StatBlockEntries)
                        .ThenInclude(se => se.GameSystem)
                    .Where(a => a.OwnerId == userId || (a.IsPublic && a.IsPublished))
                    .AsSplitQuery()
                    .AsNoTracking()
                    .FirstOrDefaultAsync(a => a.Id == id, ct);
        return entity?.ToModel();
    }

    public async Task AddAsync(Asset asset, CancellationToken ct = default) {
        var entity = asset.ToEntity();
        await context.Assets.AddAsync(entity, ct);
        await context.SaveChangesAsync(ct);
    }

    public async Task<bool> UpdateAsync(Asset asset, CancellationToken ct = default) {
        var entity = await context.Assets
                    .Include(a => a.Thumbnail)
                    .Include(a => a.Portrait)
                    .Include(a => a.Tokens)
                        .ThenInclude(r => r.Token)
                    .Include(a => a.StatBlockEntries)
                        .ThenInclude(se => se.GameSystem)
                    .AsSplitQuery()
                    .FirstOrDefaultAsync(a => a.Id == asset.Id, ct);
        if (entity == null)
            return false;
        entity.UpdateFrom(asset);
        var result = await context.SaveChangesAsync(ct);
        return result > 0;
    }

    public async Task<bool> DeleteAsync(Guid id, CancellationToken ct = default) {
        var asset = await context.Assets.IgnoreQueryFilters().FirstOrDefaultAsync(a => a.Id == id, ct);
        if (asset == null)
            return false;
        context.Assets.Remove(asset);
        var result = await context.SaveChangesAsync(ct);
        return result > 0;
    }

    public async Task<bool> SoftDeleteAsync(Guid id, CancellationToken ct = default) {
        var result = await context.Assets
            .IgnoreQueryFilters()
            .Where(a => a.Id == id)
            .ExecuteUpdateAsync(setters => setters.SetProperty(a => a.IsDeleted, true), ct);
        return result > 0;
    }

    public async Task<(Asset[] assets, int totalCount)> SearchByIngestStatusAsync(
        Guid ownerId,
        IngestStatus[] statuses,
        int skip,
        int take,
        CancellationToken ct = default) {
        var query = context.Assets
            .Include(a => a.Thumbnail)
            .Include(a => a.Portrait)
            .Include(a => a.Tokens)
                .ThenInclude(r => r.Token)
            .Include(a => a.StatBlockEntries)
                .ThenInclude(se => se.GameSystem)
            .IgnoreQueryFilters()
            .Where(a => a.OwnerId == ownerId && statuses.Contains(a.IngestStatus))
            .AsNoTracking()
            .AsSplitQuery();

        var totalCount = await query.CountAsync(ct);

        var entities = await query
            .OrderByDescending(a => a.Id)
            .Skip(skip)
            .Take(take)
            .ToArrayAsync(ct);

        var assets = entities.Select(e => e.ToModel()).ToArray();

        return (assets, totalCount);
    }
}