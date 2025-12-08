namespace VttTools.Assets.Services;

public class AssetService(IAssetStorage assetStorage, IMediaStorage mediaStorage)
    : IAssetService {
    public Task<Asset[]> GetAssetsAsync(CancellationToken ct = default)
        => assetStorage.GetAllAsync(ct);

    public Task<(Asset[] assets, int totalCount)> SearchAssetsAsync(Guid userId,
                                                                    Availability? availability,
                                                                    AssetKind? kind,
                                                                    string? category,
                                                                    string? type,
                                                                    string? subtype,
                                                                    string? basicSearch,
                                                                    ICollection<AdvancedSearchFilter>? advancedSearch,
                                                                    AssetSortBy? sortBy,
                                                                    SortDirection? sortDirection,
                                                                    Pagination? pagination,
                                                                    CancellationToken ct = default)
        => assetStorage.SearchAsync(userId, availability, kind, category, type, subtype, basicSearch, advancedSearch, sortBy, sortDirection, pagination, ct);

    public Task<Asset?> GetAssetByIdAsync(Guid userId, Guid id, CancellationToken ct = default)
        => assetStorage.FindByIdAsync(userId, id, ct);

    public async Task<Result<Asset>> CreateAssetAsync(Guid userId, CreateAssetData data, CancellationToken ct = default) {
        var result = data.Validate();
        if (result.HasErrors)
            return result;

        var (found, _) = await assetStorage.SearchAsync(userId, search: data.Name, ct: ct);
        if (found.Length > 0)
            return Result.Failure($"Duplicate asset name. An asset named '{data.Name}' already exists for this user.");

        var portrait = !data.PortraitId.HasValue ? null : await mediaStorage.FindByIdAsync(data.PortraitId.Value, ct);

        var asset = new Asset {
            OwnerId = userId,
            Name = data.Name,
            Classification = new(data.Kind, data.Category, data.Type, data.Subtype),
            Description = data.Description,
            Portrait = portrait,
            TokenSize = data.TokenSize,
        };

        await assetStorage.AddAsync(asset, ct);
        return asset;
    }

    public async Task<Result<Asset>> CloneAssetAsync(Guid userId, Guid templateId, CancellationToken ct = default) {
        var original = await assetStorage.FindByIdAsync(userId, templateId, ct);
        if (original is null)
            return Result.Failure("NotFound");
        var clone = original.Clone(userId);
        await assetStorage.AddAsync(clone, ct);
        return clone;
    }

    public async Task<Result<Asset>> UpdateAssetAsync(Guid userId, Guid id, UpdateAssetData data, CancellationToken ct = default) {
        var asset = await assetStorage.FindByIdAsync(userId, id, ct);
        if (asset is null)
            return Result.Failure("NotFound");
        if (asset.OwnerId != userId)
            return Result.Failure("NotAllowed");
        var result = data.Validate();
        if (result.HasErrors)
            return result;

        var portrait = data.PortraitId.IsSet
                        ? !data.PortraitId.Value.HasValue
                            ? null
                            : await mediaStorage.FindByIdAsync(data.PortraitId.Value.Value, ct)
                        : asset.Portrait;

        asset = asset with {
            Name = data.Name.IsSet ? data.Name.Value : asset.Name,
            Description = data.Description.IsSet ? data.Description.Value : asset.Description,
            Classification = new(
                data.Kind.IsSet ? data.Kind.Value : asset.Classification.Kind,
                data.Category.IsSet ? data.Category.Value : asset.Classification.Category,
                data.Type.IsSet ? data.Type.Value : asset.Classification.Type,
                data.Subtype.IsSet ? data.Subtype.Value : asset.Classification.Subtype
            ),
            Portrait = portrait,
            TokenSize = data.TokenSize.IsSet ? data.TokenSize.Value : asset.TokenSize,
            IsPublished = data.IsPublished.IsSet ? data.IsPublished.Value : asset.IsPublished,
            IsPublic = data.IsPublic.IsSet ? data.IsPublic.Value : asset.IsPublic,
        };

        await assetStorage.UpdateAsync(asset, ct);
        return asset;
    }

    public async Task<Result> DeleteAssetAsync(Guid userId, Guid id, CancellationToken ct = default) {
        var asset = await assetStorage.FindByIdAsync(userId, id, ct);
        if (asset is null)
            return Result.Failure("NotFound");
        if (asset.OwnerId != userId)
            return Result.Failure("NotAllowed");
        await assetStorage.DeleteAsync(id, ct);
        return Result.Success();
    }
}