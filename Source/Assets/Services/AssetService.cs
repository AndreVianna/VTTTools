namespace VttTools.Assets.Services;

/// <summary>
/// Implements IAssetService using EF Core storage.
/// </summary>
public class AssetService(IAssetStorage assetStorage, IMediaStorage mediaStorage)
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
        if (result.HasErrors)
            return result;

        var resource = data.ResourceId is not null
            ? await mediaStorage.GetByIdAsync(data.ResourceId.Value, ct)
            : null;

        Asset asset = data.Kind switch {
            AssetKind.Object => new ObjectAsset {
                OwnerId = userId,
                Name = data.Name,
                Description = data.Description,
                Resource = resource,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                Properties = data.ObjectProps ?? new()
            },
            AssetKind.Creature => new CreatureAsset {
                OwnerId = userId,
                Name = data.Name,
                Description = data.Description,
                Resource = resource,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                Properties = data.CreatureProps ?? new()
            },
            _ => throw new InvalidOperationException($"Unknown asset kind: {data.Kind}")
        };

        await assetStorage.AddAsync(asset, ct);
        return asset;
    }

    public async Task<Result<Asset>> CloneAssetAsync(Guid userId, Guid templateId, CancellationToken ct = default) {
        var original = await assetStorage.GetByIdAsync(templateId, ct);
        if (original is null)
            return Result.Failure("NotFound");
        if (original.OwnerId != userId || original is { IsPublic: true, IsPublished: true })
            return Result.Failure("NotAllowed");
        var clone = original.Clone(userId);
        await assetStorage.AddAsync(clone, ct);
        return clone;
    }

    /// <inheritdoc />
    public async Task<Result<Asset>> UpdateAssetAsync(Guid userId, Guid id, UpdateAssetData data, CancellationToken ct = default) {
        var asset = await assetStorage.GetByIdAsync(id, ct);
        if (asset is null)
            return Result.Failure("NotFound");
        if (asset.OwnerId != userId)
            return Result.Failure("NotAllowed");
        var result = data.Validate();
        if (result.HasErrors)
            return result;

        var resource = data.ResourceId.IsSet
            ? await mediaStorage.GetByIdAsync(data.ResourceId.Value, ct) ?? asset.Resource
            : asset.Resource;

        // Update based on asset type
        asset = asset switch {
            ObjectAsset obj => obj with {
                Name = data.Name.IsSet ? data.Name.Value : obj.Name,
                Description = data.Description.IsSet ? data.Description.Value : obj.Description,
                Resource = resource,
                IsPublished = data.IsPublished.IsSet ? data.IsPublished.Value : obj.IsPublished,
                IsPublic = data.IsPublic.IsSet ? data.IsPublic.Value : obj.IsPublic,
                UpdatedAt = DateTime.UtcNow,
                Properties = data.ObjectProps.IsSet ? data.ObjectProps.Value : obj.Properties
            },
            CreatureAsset creature => creature with {
                Name = data.Name.IsSet ? data.Name.Value : creature.Name,
                Description = data.Description.IsSet ? data.Description.Value : creature.Description,
                Resource = resource,
                IsPublished = data.IsPublished.IsSet ? data.IsPublished.Value : creature.IsPublished,
                IsPublic = data.IsPublic.IsSet ? data.IsPublic.Value : creature.IsPublic,
                UpdatedAt = DateTime.UtcNow,
                Properties = data.CreatureProps.IsSet ? data.CreatureProps.Value : creature.Properties
            },
            _ => throw new InvalidOperationException($"Unknown asset type: {asset.GetType()}")
        };

        await assetStorage.UpdateAsync(asset, ct);
        return asset;
    }

    /// <inheritdoc />
    public async Task<Result> DeleteAssetAsync(Guid userId, Guid id, CancellationToken ct = default) {
        var asset = await assetStorage.GetByIdAsync(id, ct);
        if (asset is null)
            return Result.Failure("NotFound");
        if (asset.OwnerId != userId)
            return Result.Failure("NotAllowed");
        await assetStorage.DeleteAsync(id, ct);
        return Result.Success();
    }
}
