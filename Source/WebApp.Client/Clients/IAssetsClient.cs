using VttTools.Assets.ApiContracts;
using VttTools.Assets.Model;
using VttTools.WebApp.Client.Models;

namespace VttTools.WebApp.Client.Clients;

public interface IAssetsClient
{
    Task<Asset?> GetAssetByIdAsync(Guid id);
    Task<Result<Asset>> CreateAssetAsync(CreateAssetRequest request);
    Task<string> UploadAssetFileAsync(Guid assetId, Stream fileStream, string fileName);
}