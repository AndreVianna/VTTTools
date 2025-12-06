namespace VttTools.Assets.Storage;

public interface IAssetStorage {
    Task<Asset[]> GetAllAsync(CancellationToken ct = default);

    Task<(Asset[] assets, int totalCount)> SearchAsync(
        Guid userId,
        Availability? availability = null,
        AssetKind? kind = null,
        string? category = null,
        string? type = null,
        string? subtype = null,
        string? search = null,
        ICollection<AdvancedSearchFilter>? filters = null,
        Pagination? pagination = null,
        CancellationToken ct = default);

    Task<Asset?> FindByIdAsync(Guid userId, Guid id, CancellationToken ct = default);
    Task AddAsync(Asset asset, CancellationToken ct = default);
    Task<bool> UpdateAsync(Asset asset, CancellationToken ct = default);
    Task<bool> DeleteAsync(Guid id, CancellationToken ct = default);
}