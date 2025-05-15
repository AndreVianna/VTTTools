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
            OwnerId = userId,
            Name = data.Name,
            Type = data.Type,
            Description = data.Description,
            Format = data.Format,
        };
        await assetStorage.AddAsync(asset, ct);
        return asset;
    }

    public async Task<Result<Asset>> CloneAssetAsync(Guid userId, CloneAssetData data, CancellationToken ct = default) {
        var original = await assetStorage.GetByIdAsync(data.TemplateId, ct);
        if (original is null) return Result.Failure("NotFound");
        if (original.OwnerId != userId || original is { IsPublic: true, IsListed: true }) return Result.Failure("NotAllowed");
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
        if (data.Name.IsSet) asset.Name = data.Name.Value;
        if (data.Type.IsSet) asset.Type = data.Type.Value;
        if (data.Description.IsSet) asset.Description = data.Description.Value;
        if (data.Format.IsSet) asset.Format = data.Format.Value;
        if (data.IsListed.IsSet) asset.IsListed = data.IsListed.Value;
        if (data.IsPublic.IsSet) asset.IsPublic = data.IsPublic.Value;
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