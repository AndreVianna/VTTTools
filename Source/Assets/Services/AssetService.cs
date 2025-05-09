namespace VttTools.Assets.Services;

/// <summary>
/// Implements IAssetService using EF Core storage.
/// </summary>
public class AssetService(
    IAssetStorage assetStorage)
    : IAssetService {
    /// <inheritdoc />
    public Task<Asset[]> GetAssetsAsync(CancellationToken ct = default)
        => assetStorage.GetAllAsync(ct);

    /// <inheritdoc />
    public Task<Asset?> GetAssetAsync(Guid assetId, CancellationToken ct = default)
        => assetStorage.GetByIdAsync(assetId, ct);

    /// <inheritdoc />
    public Task<Asset> CreateAssetAsync(Guid userId, CreateAssetRequest request, CancellationToken ct = default) {
        var asset = new Asset {
            OwnerId = userId,
            Name = request.Name,
            Type = request.Type,
            Source = request.Source,
            Visibility = request.Visibility
        };
        return assetStorage.AddAsync(asset, ct);
    }

    /// <inheritdoc />
    public async Task<Asset?> UpdateAssetAsync(Guid userId, Guid id, UpdateAssetRequest request, CancellationToken ct = default) {
        var asset = await assetStorage.GetByIdAsync(id, ct);
        if (asset?.OwnerId != userId)
            return null;
        if (request.Name.IsSet)
            asset.Name = request.Name.Value;
        if (request.Type.IsSet)
            asset.Type = request.Type.Value;
        if (request.Source.IsSet)
            asset.Source = request.Source.Value;
        if (request.Visibility.IsSet)
            asset.Visibility = request.Visibility.Value;
        return await assetStorage.UpdateAsync(asset, ct);
    }

    /// <inheritdoc />
    public async Task<bool> DeleteAssetAsync(Guid userId, Guid id, CancellationToken ct = default) {
        var asset = await assetStorage.GetByIdAsync(id, ct);
        return asset?.OwnerId == userId
            && await assetStorage.DeleteAsync(id, ct);
    }
}