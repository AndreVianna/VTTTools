namespace VttTools.AI.Clients;

public interface IAssetsServiceClient {
    Task<Result<Guid>> CreateAssetAsync(CreateAssetRequest request, CancellationToken ct = default);
}