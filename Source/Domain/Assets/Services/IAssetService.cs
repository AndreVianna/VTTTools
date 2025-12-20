namespace VttTools.Assets.Services;

public interface IAssetService {
    Task<Asset[]> GetAssetsAsync(CancellationToken ct = default);
    Task<(Asset[] assets, int totalCount)> SearchAssetsAsync(Guid userId,
                                                             Availability? availability,
                                                             AssetKind? kind,
                                                             string? category,
                                                             string? type,
                                                             string? subtype,
                                                             string? basicSearch,
                                                             string[]? tags,
                                                             ICollection<AdvancedSearchFilter>? advancedSearch,
                                                             AssetSortBy? sortBy,
                                                             SortDirection? sortDirection,
                                                             Pagination? pagination,
                                                             CancellationToken ct = default);
    Task<Asset?> GetAssetByIdAsync(Guid userId, Guid id, CancellationToken ct = default);
    Task<Result<Asset>> CreateAssetAsync(Guid userId, CreateAssetData data, CancellationToken ct = default);
    Task<Result<Asset>> CloneAssetAsync(Guid userId, Guid templateId, CancellationToken ct = default);
    Task<Result<Asset>> UpdateAssetAsync(Guid userId, Guid id, UpdateAssetData data, CancellationToken ct = default);
    Task<Result> DeleteAssetAsync(Guid userId, Guid id, CancellationToken ct = default);
    Task<Result> AddTokenAsync(Guid userId, Guid assetId, AddTokenData data, CancellationToken ct = default);
    Task<Result> RemoveTokenAsync(Guid userId, Guid assetId, RemoveTokenData data, CancellationToken ct = default);
}