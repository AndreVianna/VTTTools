using UpdateAssetRequest = VttTools.Assets.ApiContracts.UpdateAssetRequest;

namespace VttTools.WebApp.Clients;

public interface IAssetsServerHttpClient {
    Task<Asset[]> GetAssetsAsync();
    Task<Result<Asset>> CreateAssetAsync(CreateAssetRequest request);
    Task<Result> UpdateAssetAsync(Guid id, UpdateAssetRequest request);
    Task<bool> DeleteAssetAsync(Guid id);
}