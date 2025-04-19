namespace VttTools.Services.Game;

public interface IEpisodeService {
    Task<Guid> AddAssetAsync(int episodeId, Guid assetId, AddEpisodeAssetData data, CancellationToken ct = default);
    Task<Result> UpdateAssetAsync(int episodeId, Guid assetId, ChangeEpisodeAssetData data, CancellationToken ct = default);
    Task<Result> RemoveAssetAsync(int episodeId, Guid assetId, CancellationToken ct = default);
}