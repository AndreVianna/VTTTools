using Asset = VttTools.Assets.Model.Asset;
using AssetEntity = VttTools.Data.Assets.Entities.Asset;

namespace VttTools.Data.Assets;

public class AssetStorage(ApplicationDbContext context)
    : IAssetStorage {
    public async Task<Asset[]> GetAllAsync(CancellationToken ct = default) {
        var entities = await context.Assets
                    .Include(a => a.Portrait)
                        .ThenInclude(p => p!.Features)
                    .Include(a => a.AssetTokens)
                        .ThenInclude(a => a.Token)
                            .ThenInclude(t => t.Features)
                    .AsSplitQuery()
                    .AsNoTracking()
                    .ToArrayAsync(ct);
        return [.. entities.Select(e => e.ToModel()).OfType<Asset>()];
    }

    public async Task<(Asset[] assets, int totalCount)> SearchAsync(
        Guid userId,
        Availability? availability = null,
        AssetKind? kind = null,
        string? category = null,
        string? type = null,
        string? subtype = null,
        string? search = null,
        ICollection<AdvancedSearchFilter>? filters = null,
        AssetSortBy? sortBy = null,
        SortDirection? sortDirection = null,
        Pagination? pagination = null,
        CancellationToken ct = default) {

        var query = context.Assets
            .Include(a => a.Portrait)
                .ThenInclude(p => p!.Features)
            .Include(a => a.AssetTokens.Where(at => at.Token.OwnerId == userId || (at.Token.IsPublic && at.Token.IsPublished)))
                .ThenInclude(a => a.Token)
                    .ThenInclude(t => t.Features)
            .AsNoTracking()
            .AsSplitQuery()
            .AsQueryable();

        query = availability switch {
            Availability.MineOnly => query.Where(a => a.OwnerId == userId),
            Availability.MineAndPublished => query.Where(a => a.OwnerId == userId && a.IsPublished),
            _ => query.Where(a => a.OwnerId == userId || (a.IsPublic && a.IsPublished)),
        };

        if (kind.HasValue)
            query = query.Where(a => a.Classification.Kind == kind.Value);
        if (!string.IsNullOrWhiteSpace(category))
            query = query.Where(a => a.Classification.Category == category);
        if (!string.IsNullOrWhiteSpace(type))
            query = query.Where(a => a.Classification.Type == type);
        if (!string.IsNullOrWhiteSpace(subtype))
            query = query.Where(a => a.Classification.Subtype == subtype);

        if (!string.IsNullOrWhiteSpace(search)) {
            query = query.Where(a =>
                EF.Functions.Like(a.Name, search) ||
                EF.Functions.Like(a.Description, search));
        }

        query = AddAdvancedSearchFilters(filters, query);

        var totalCount = await query.CountAsync(ct);

        query = ApplySorting(query, sortBy, sortDirection);

        if (pagination is not null)
            query = query.Skip(pagination.Index * pagination.Size).Take(pagination.Size);

        var entities = await query.ToArrayAsync(ct);
        var assets = entities.Select(e => e.ToModel()).OfType<Asset>().ToArray();

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
                ? query.OrderByDescending(a => a.Classification.Kind)
                : query.OrderBy(a => a.Classification.Kind),
            AssetSortBy.Category => isDescending
                ? query.OrderByDescending(a => a.Classification.Category)
                : query.OrderBy(a => a.Classification.Category),
            AssetSortBy.Type => isDescending
                ? query.OrderByDescending(a => a.Classification.Type)
                : query.OrderBy(a => a.Classification.Type),
            _ => query.OrderBy(a => a.Name),
        };
    }

    private static IQueryable<AssetEntity> AddAdvancedSearchFilters(ICollection<AdvancedSearchFilter>? advancedSearch, IQueryable<AssetEntity> query) {
        if (advancedSearch == null)
            return query;
        foreach (var filter in advancedSearch) {
            switch (filter.Operator) {
                case FilterOperator.GreaterThan:
                    query = query.Where(a => a.StatBlock.Any(sb => sb.Key == filter.Key && sb.AsNumber > filter.AsNumber));
                    break;
                case FilterOperator.LessThan:
                    query = query.Where(a => a.StatBlock.Any(sb => sb.Key == filter.Key && sb.AsNumber < filter.AsNumber));
                    break;
                case FilterOperator.Contains:
                    query = query.Where(a =>
                        a.StatBlock.Any(sb => sb.Key == filter.Key && sb.AsText!.Contains(filter.AsText)) ||
                        a.AssetTokens.Any(at => at.Token.Features.Any(f => f.Key == filter.Key && f.Value.Contains(filter.AsText))));
                    break;
                case FilterOperator.Equals:
                    var textValue = filter.Value.ToString()!;
                    query = query.Where(a =>
                        a.StatBlock.Any(sb => sb.Key == filter.Key && sb.Value != null && sb.Value.Equals(filter.Value)) ||
                        a.AssetTokens.Any(at => at.Token.Features.Any(f => f.Key == filter.Key && f.Value.Equals(filter.Value))));
                    break;
            }
        }

        return query;
    }

    public async Task<Asset?> FindByIdAsync(Guid userId, Guid id, CancellationToken ct = default) {
        var entity = await context.Assets
                    .Include(a => a.Portrait)
                        .ThenInclude(p => p!.Features)
                    .Include(a => a.AssetTokens.Where(at => at.Token.OwnerId == userId || (at.Token.IsPublic && at.Token.IsPublished)))
                        .ThenInclude(a => a.Token)
                            .ThenInclude(t => t.Features)
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
                    .Include(a => a.Portrait)
                        .ThenInclude(p => p!.Features)
                    .Include(a => a.AssetTokens)
                        .ThenInclude(a => a.Token)
                            .ThenInclude(t => t.Features)
                    .AsSplitQuery()
                    .FirstOrDefaultAsync(a => a.Id == asset.Id, ct);
        if (entity == null)
            return false;
        entity.UpdateFrom(asset);
        var result = await context.SaveChangesAsync(ct);
        return result > 0;
    }

    public async Task<bool> DeleteAsync(Guid id, CancellationToken ct = default) {
        var asset = await context.Assets.FindAsync([id], ct);
        if (asset == null)
            return false;
        context.Assets.Remove(asset);
        var result = await context.SaveChangesAsync(ct);
        return result > 0;
    }
}