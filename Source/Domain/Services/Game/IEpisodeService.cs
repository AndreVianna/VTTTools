namespace VttTools.Services.Game;

public interface IEpisodeService {
    /// <summary>
    /// Gets a specific episode by ID.
    /// </summary>
    Task<Episode[]> GetEpisodesAsync(CancellationToken ct = default);

    /// <summary>
    /// Gets a specific episode by ID.
    /// </summary>
    Task<Episode?> GetEpisodeByIdAsync(Guid id, CancellationToken ct = default);

    /// <summary>
    /// Updates an existing episode template.
    /// </summary>
    Task<Episode?> UpdateEpisodeAsync(Guid userId, Guid id, UpdateEpisodeRequest data, CancellationToken ct = default);

    Task<EpisodeAsset[]> GetAssetsAsync(Guid id, CancellationToken ct = default);

    Task<bool> AddAssetAsync(Guid userId, Guid id, AddEpisodeAssetData data, CancellationToken ct = default);

    Task<bool> UpdateAssetAsync(Guid userId, Guid id, Guid assetId, UpdateEpisodeAssetData data, CancellationToken ct = default);

    Task<bool> RemoveAssetAsync(Guid userId, Guid id, Guid assetId, CancellationToken ct = default);
}