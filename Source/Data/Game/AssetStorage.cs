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
    public async Task<Asset> UpdateAsync(Asset asset, CancellationToken ct = default) {
        context.Assets.Update(asset);
        await context.SaveChangesAsync(ct);
        return asset;
    }

    /// <inheritdoc />
    public async Task DeleteAsync(Asset asset, CancellationToken ct = default) {
        context.Assets.Remove(asset);
        await context.SaveChangesAsync(ct);
    }
}