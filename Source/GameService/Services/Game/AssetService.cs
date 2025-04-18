namespace GameService.Services.Game;

using VttTools.Contracts.Game;
using VttTools.Model.Game;
using VttTools.Storage.Game;
using VttTools.Services.Game;

/// <summary>
/// Implements IAssetService using EF Core storage.
/// </summary>
public class AssetService(
    IAssetStorage assetStorage)
    : IAssetService
{
    /// <inheritdoc />
    public Task<Asset[]> GetAssetsAsync(CancellationToken ct = default)
        => assetStorage.GetAllAsync(ct);

    /// <inheritdoc />
    public Task<Asset?> GetAssetAsync(Guid assetId, CancellationToken ct = default)
        => assetStorage.GetByIdAsync(assetId, ct);

    /// <inheritdoc />
    public async Task<Asset> CreateAssetAsync(Guid userId, CreateAssetRequest request, CancellationToken ct = default)
    {
        var asset = new Asset
        {
            Id = Guid.NewGuid(),
            OwnerId = userId,
            Name = request.Name,
            Type = request.Type,
            Source = request.Source,
            Visibility = request.Visibility
        };
        return await assetStorage.AddAsync(asset, ct);
    }

    /// <inheritdoc />
    public async Task<Asset?> UpdateAssetAsync(Guid userId, Guid assetId, UpdateAssetRequest request, CancellationToken ct = default)
    {
        var asset = await assetStorage.GetByIdAsync(assetId, ct);
        if (asset is null || asset.OwnerId != userId)
            return null;
        if (!string.IsNullOrWhiteSpace(request.Name))
            asset.Name = request.Name;
        if (request.Type.HasValue)
            asset.Type = request.Type.Value;
        if (!string.IsNullOrWhiteSpace(request.Source))
            asset.Source = request.Source;
        if (request.Visibility.HasValue)
            asset.Visibility = request.Visibility.Value;
        return await assetStorage.UpdateAsync(asset, ct);
    }

    /// <inheritdoc />
    public async Task<bool> DeleteAssetAsync(Guid userId, Guid assetId, CancellationToken ct = default)
    {
        var asset = await assetStorage.GetByIdAsync(assetId, ct);
        if (asset is null || asset.OwnerId != userId)
            return false;
        await assetStorage.DeleteAsync(asset, ct);
        return true;
    }
}