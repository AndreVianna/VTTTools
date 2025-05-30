using UpdateAssetRequest = VttTools.Assets.ApiContracts.UpdateAssetRequest;

namespace VttTools.WebApp.Contracts.Assets;

public interface IAssetsHttpClient {
    Task<AssetListItem[]> GetAssetsAsync();
    Task<Result<AssetListItem>> CreateAssetAsync(CreateAssetRequest request);
    Task<Result> UpdateAssetAsync(Guid id, UpdateAssetRequest request);
    Task<bool> DeleteAssetAsync(Guid id);
    Task<string> UploadAssetFileAsync(Guid id, Stream fileStream, string fileName);
}