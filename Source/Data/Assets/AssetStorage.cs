namespace VttTools.Data.Assets;

/// <summary>
/// EF Core storage implementation for Asset entities.
/// </summary>
public class AssetStorage(ApplicationDbContext context)
    : IAssetStorage {
    /// <inheritdoc />
    public async Task<Asset[]> GetAllAsync(CancellationToken ct = default) {
        var entities = await context.Assets
                    .Include(a => a.Portrait)
                    .Include(a => a.TopDown)
                    .Include(a => a.Miniature)
                    .Include(a => a.Photo)
                  .AsNoTrackingWithIdentityResolution()
                  .ToArrayAsync(ct);
        return [.. entities.Select(e => e.ToModel()).OfType<Asset>()];
    }

    /// <inheritdoc />
    public async Task<Asset?> GetByIdAsync(Guid id, CancellationToken ct = default) {
        var entity = await context.Assets
                    .Include(a => a.Portrait)
                    .Include(a => a.TopDown)
                    .Include(a => a.Miniature)
                    .Include(a => a.Photo)
                  .AsNoTrackingWithIdentityResolution()
                  .FirstOrDefaultAsync(a => a.Id == id, ct);
        return entity?.ToModel();
    }

    /// <inheritdoc />
    public async Task<Asset?> GetByNameAndOwnerAsync(string name, Guid ownerId, CancellationToken ct = default) {
        var entity = await context.Assets
                    .Include(a => a.Portrait)
                    .Include(a => a.TopDown)
                    .Include(a => a.Miniature)
                    .Include(a => a.Photo)
                  .AsNoTrackingWithIdentityResolution()
                  .FirstOrDefaultAsync(a => a.Name == name && a.OwnerId == ownerId, ct);
        return entity?.ToModel();
    }

    /// <inheritdoc />
    public async Task AddAsync(Asset asset, CancellationToken ct = default) {
        var entity = asset.ToEntity();
        await context.Assets.AddAsync(entity, ct);
        await context.SaveChangesAsync(ct);
    }

    /// <inheritdoc />
    public async Task<bool> UpdateAsync(Asset asset, CancellationToken ct = default) {
        var entity = await context.Assets
            .Include(a => a.Portrait)
            .Include(a => a.TopDown)
            .Include(a => a.Miniature)
            .Include(a => a.Photo)
            .FirstOrDefaultAsync(a => a.Id == asset.Id, ct);
        if (entity == null)
            return false;
        entity.UpdateFrom(asset);
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