using Asset = VttTools.Assets.Model.Asset;
using AssetEntity = VttTools.Data.Assets.Entities.Asset;

namespace VttTools.Data.Assets;

/// <summary>
/// EF Core storage implementation for Asset entities.
/// </summary>
public class AssetStorage(ApplicationDbContext context)
    : IAssetStorage {
    /// <inheritdoc />
    public Task<Asset[]> GetAllAsync(CancellationToken ct = default)
        => context.Assets
                  .AsNoTrackingWithIdentityResolution()
                  .Select(a => new Asset {
                      OwnerId = a.OwnerId,
                      Id = a.Id,
                      Name = a.Name,
                      Description = a.Description,
                      Type = a.Type,
                      Shape = a.Shape,
                      IsPublic = a.IsPublic,
                      IsPublished = a.IsPublished,
                  })
                  .ToArrayAsync(ct);

    /// <inheritdoc />
    public Task<Asset?> GetByIdAsync(Guid id, CancellationToken ct = default)
        => context.Assets
                  .AsNoTrackingWithIdentityResolution()
                  .Select(a => new Asset {
                      OwnerId = a.OwnerId,
                      Id = a.Id,
                      Name = a.Name,
                      Description = a.Description,
                      Type = a.Type,
                      Shape = a.Shape,
                      IsPublic = a.IsPublic,
                      IsPublished = a.IsPublished,
                  })
                  .FirstOrDefaultAsync(a => a.Id == id, ct);

    /// <inheritdoc />
    public async Task<Asset> AddAsync(Asset asset, CancellationToken ct = default) {
        var entity = new AssetEntity {
            OwnerId = asset.OwnerId,
            Id = asset.Id,
            Name = asset.Name,
            Description = asset.Description,
            Type = asset.Type,
            Shape = asset.Shape,
            IsPublic = asset.IsPublic,
            IsPublished = asset.IsPublished,
        };
        await context.Assets.AddAsync(entity, ct);
        await context.SaveChangesAsync(ct);
        return asset;
    }

    /// <inheritdoc />
    public async Task<Asset?> UpdateAsync(Asset asset, CancellationToken ct = default) {
        var entity = await context.Assets.FindAsync([asset.Id], ct);
        if (entity == null) return null;
        entity.OwnerId = asset.OwnerId;
        entity.Name = asset.Name;
        entity.Description = asset.Description;
        entity.Type = asset.Type;
        entity.Shape = asset.Shape;
        entity.IsPublic = asset.IsPublic;
        entity.IsPublished = asset.IsPublished;
        context.Assets.Update(entity);
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