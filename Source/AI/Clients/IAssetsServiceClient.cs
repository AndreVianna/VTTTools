namespace VttTools.AI.Clients;

public interface IAssetsServiceClient {
    Task<Result<Guid>> CreateAssetAsync(Guid ownerId, CreateAssetRequest request, CancellationToken ct = default);
}