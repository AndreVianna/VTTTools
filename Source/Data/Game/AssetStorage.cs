namespace VttTools.Data.Game;

/// <summary>
/// EF Core storage implementation for Asset entities.
/// </summary>
public class AssetStorage(ApplicationDbContext context)
    : IAssetStorage {
    /// <inheritdoc />
    public Task<Asset[]> GetAllAsync(CancellationToken ct = default)
        => context.Assets
                  .AsNoTrackingWithIdentityResolution()
                  .ToArrayAsync(ct);

    /// <inheritdoc />
    public Task<Asset?> GetByIdAsync(Guid id, CancellationToken ct = default)
        => context.Assets
                  .AsNoTrackingWithIdentityResolution()
                  .FirstOrDefaultAsync(a => a.Id == id, ct);

    /// <inheritdoc />
    public async Task<Asset> AddAsync(Asset asset, CancellationToken ct = default) {
        await context.Assets.AddAsync(asset, ct);
        await context.SaveChangesAsync(ct);
        return asset;
    }

    /// <inheritdoc />
    public async Task<Asset?> UpdateAsync(Asset asset, CancellationToken ct = default) {
        context.Assets.Update(asset);
        var result = await context.SaveChangesAsync(ct);
        return result > 0 ? asset : null;
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