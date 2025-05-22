namespace VttTools.Assets.Services;

/// <summary>
/// Implements IAssetService using EF Core storage.
/// </summary>
public class AssetService(IAssetStorage assetStorage)
    : IAssetService {
    /// <inheritdoc />
    public Task<Asset[]> GetAssetsAsync(CancellationToken ct = default)
        => assetStorage.GetAllAsync(ct);

    /// <inheritdoc />
    public Task<Asset?> GetAssetByIdAsync(Guid id, CancellationToken ct = default)
        => assetStorage.GetByIdAsync(id, ct);

    /// <inheritdoc />
    public async Task<Result<Asset>> CreateAssetAsync(Guid userId, CreateAssetData data, CancellationToken ct = default) {
        var result = data.Validate();
        if (result.HasErrors) return result;
        var asset = new Asset {
            Name = data.Name,
            Type = data.Type,
            Description = data.Description,
            Shape = data.Shape,
        };
        await assetStorage.AddAsync(asset, ct);
        return asset;
    }

    public async Task<Result<Asset>> CloneAssetAsync(Guid userId, Guid templateId, CloneAssetData data, CancellationToken ct = default) {
        var original = await assetStorage.GetByIdAsync(templateId, ct);
        if (original is null) return Result.Failure("NotFound");
        if (original.OwnerId != userId || original is { IsPublic: true, IsPublished: true }) return Result.Failure("NotAllowed");
        var result = data.Validate();
        if (result.HasErrors) return result;
        var clone = Cloner.CloneAsset(original, userId, data);
        await assetStorage.AddAsync(clone, ct);
        return clone;
    }

    /// <inheritdoc />
    public async Task<Result<Asset>> UpdateAssetAsync(Guid userId, Guid id, UpdateAssetData data, CancellationToken ct = default) {
        var asset = await assetStorage.GetByIdAsync(id, ct);
        if (asset is null) return Result.Failure("NotFound");
        if (asset.OwnerId != userId) return Result.Failure("NotAllowed");
        var result = data.Validate();
        if (result.HasErrors) return result;
        asset = asset with {
            Name = data.Name.IsSet ? data.Name.Value : asset.Name,
            Type = data.Type.IsSet ? data.Type.Value : asset.Type,
            Description = data.Description.IsSet ? data.Description.Value : asset.Description,
            Shape = data.Shape.IsSet ? data.Shape.Value : asset.Shape,
            IsPublished = data.IsPublished.IsSet ? data.IsPublished.Value : asset.IsPublished,
            IsPublic = data.IsPublic.IsSet ? data.IsPublic.Value : asset.IsPublic,
        };
        await assetStorage.UpdateAsync(asset, ct);
        return asset;
    }

    /// <inheritdoc />
    public async Task<Result> DeleteAssetAsync(Guid userId, Guid id, CancellationToken ct = default) {
        var asset = await assetStorage.GetByIdAsync(id, ct);
        if (asset is null) return Result.Failure("NotFound");
        if (asset.OwnerId != userId) return Result.Failure("NotAllowed");
        await assetStorage.DeleteAsync(id, ct);
        return Result.Success();
    }
}