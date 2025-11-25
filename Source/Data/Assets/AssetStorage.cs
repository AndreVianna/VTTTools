namespace VttTools.Data.Assets;

public class AssetStorage(ApplicationDbContext context)
    : IAssetStorage {
    public async Task<Asset[]> GetAllAsync(CancellationToken ct = default) {
        var entities = await context.Assets
                    .Include(a => a.Portrait)
                    .Include(a => a.AssetTokens)
                        .ThenInclude(a => a.Token)
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
        Pagination? pagination = null,
        CancellationToken ct = default) {

        var query = context.Assets
            .Include(a => a.Portrait)
            .Include(a => a.AssetTokens.Where(at => at.Token.OwnerId == userId || (at.Token.IsPublic && at.Token.IsPublished)))
                .ThenInclude(a => a.Token)
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

        var totalCount = await query.CountAsync(ct);

        if (pagination is not null)
            query = query.Skip(pagination.Index * pagination.Size).Take(pagination.Size);

        var entities = await query.ToArrayAsync(ct);
        var assets = entities.Select(e => e.ToModel()).OfType<Asset>().ToArray();

        return (assets, totalCount);
    }

    public async Task<Asset?> FindByIdAsync(Guid userId, Guid id, CancellationToken ct = default) {
        var entity = await context.Assets
                    .Include(a => a.Portrait)
                    .Include(a => a.AssetTokens.Where(at => at.Token.OwnerId == userId || (at.Token.IsPublic && at.Token.IsPublished)))
                        .ThenInclude(a => a.Token)
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
                    .Include(a => a.AssetTokens)
                        .ThenInclude(a => a.Token)
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
