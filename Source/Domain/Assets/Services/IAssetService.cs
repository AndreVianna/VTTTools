using UpdateAssetData = VttTools.Assets.ServiceContracts.UpdateAssetData;

namespace VttTools.Assets.Services;

public interface IAssetService {
    Task<Asset[]> GetAssetsAsync(CancellationToken ct = default);
    Task<Asset[]> GetAssetsAsync(Guid userId, AssetKind? kind, string? search, bool? published, CancellationToken ct = default);
    Task<Asset?> GetAssetByIdAsync(Guid id, CancellationToken ct = default);
    Task<Result<Asset>> CreateAssetAsync(Guid userId, CreateAssetData data, CancellationToken ct = default);
    Task<Result<Asset>> CloneAssetAsync(Guid userId, Guid templateId, CancellationToken ct = default);
    Task<Result<Asset>> UpdateAssetAsync(Guid userId, Guid id, UpdateAssetData data, CancellationToken ct = default);
    Task<Result> DeleteAssetAsync(Guid userId, Guid id, CancellationToken ct = default);
}