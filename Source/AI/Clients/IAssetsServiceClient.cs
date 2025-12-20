namespace VttTools.AI.Clients;

public interface IAssetsServiceClient {
    Task<Result<Guid>> CreateAssetAsync(Guid ownerId, CreateAssetRequest request, CancellationToken ct = default);
    Task<Result> UpdateAssetAsync(Guid assetId, UpdateAssetRequest request, CancellationToken ct = default);
    Task<Result> AddTokenAsync(Guid assetId, AddTokenRequest request, CancellationToken ct = default);
}