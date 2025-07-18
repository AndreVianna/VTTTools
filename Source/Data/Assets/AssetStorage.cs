using Asset = VttTools.Assets.Model.Asset;

namespace VttTools.Data.Assets;

/// <summary>
/// EF Core storage implementation for Asset entities.
/// </summary>
public class AssetStorage(ApplicationDbContext context)
    : IAssetStorage {
    /// <inheritdoc />
    public async Task<Asset[]> GetAllAsync(CancellationToken ct = default) {
        var query = context.Assets
                    .Include(a => a.Display)
                  .AsNoTrackingWithIdentityResolution();
        var result = await query.Select(Mapper.AsAsset).ToArrayAsync(ct);
        return result;
    }

    /// <inheritdoc />
    public async Task<Asset?> GetByIdAsync(Guid id, CancellationToken ct = default) {
        var query = context.Assets
                    .Include(a => a.Display)
                  .AsNoTrackingWithIdentityResolution();
        var result = await query.Select(Mapper.AsAsset).FirstOrDefaultAsync(a => a.Id == id, ct);
        return result;
    }

    /// <inheritdoc />
    public async Task AddAsync(Asset asset, CancellationToken ct = default) {
        var entity = asset.ToEntity();
        await context.Assets.AddAsync(entity, ct);
        await context.SaveChangesAsync(ct);
    }

    /// <inheritdoc />
    public async Task<bool> UpdateAsync(Asset asset, CancellationToken ct = default) {
        var entity = await context.Assets.FindAsync([asset.Id], ct);
        if (entity == null)
            return false;
        entity.UpdateFrom(asset);
        context.Assets.Update(entity);
        var result = await context.SaveChangesAsync(ct);
        return result > 0;
    }

    /// <inheritdoc />
    public async Task<bool> DeleteAsync(Guid id, CancellationToken ct = default) {
        var asset = await context.Assets.FindAsync([id], ct);
        if (asset == null)
            return false;
        context.Assets.Remove(asset);
        var result = await context.SaveChangesAsync(ct);
        return result > 0;
    }
}