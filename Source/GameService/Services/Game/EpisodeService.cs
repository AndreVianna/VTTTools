namespace VttTools.GameService.Services.Game;

public class EpisodeService(IEpisodeStorage episodeStorage)
    : IEpisodeService {
    /// <inheritdoc />
    public Task<Episode[]> GetEpisodesAsync(CancellationToken ct = default)
        => episodeStorage.GetAllAsync(ct);

    /// <inheritdoc />
    public Task<Episode?> GetEpisodeByIdAsync(Guid id, CancellationToken ct = default)
        => episodeStorage.GetByIdAsync(id, ct);

    /// <inheritdoc />
    public async Task<Episode?> UpdateEpisodeAsync(Guid userId, Guid id, UpdateEpisodeRequest data, CancellationToken ct = default) {
        var episode = await episodeStorage.GetByIdAsync(id, ct);
        if (episode?.OwnerId != userId)
            return null;
        if (data.Name.IsSet)
            episode.Name = data.Name.Value;
        if (data.Visibility.IsSet)
            episode.Visibility = data.Visibility.Value;
        return await episodeStorage.UpdateAsync(episode, ct);
    }

    /// <inheritdoc />
    public async Task<EpisodeAsset[]> GetAssetsAsync(Guid id, CancellationToken ct = default) {
        var episode = await episodeStorage.GetByIdAsync(id, ct);
        return episode?.EpisodeAssets.ToArray() ?? [];
    }

    /// <inheritdoc />
    public async Task<bool> AddAssetAsync(Guid userId, Guid id, AddEpisodeAssetData data, CancellationToken ct = default) {
        var episode = await episodeStorage.GetByIdAsync(id, ct);
        if (episode?.OwnerId != userId)
            return false;
        var episodeAsset = new EpisodeAsset {
            AssetId = data.Id,
            Name = data.Name,
            Position = data.Position,
            Scale = data.Scale,
            IsLocked = false,
        };
        episode.EpisodeAssets.Add(episodeAsset);
        await episodeStorage.UpdateAsync(episode, ct);
        return true;
    }

    /// <inheritdoc />
    public async Task<bool> RemoveAssetAsync(Guid userId, Guid id, Guid assetId, CancellationToken ct = default) {
        var episode = await episodeStorage.GetByIdAsync(id, ct);
        if (episode?.OwnerId != userId)
            return false;
        episode.EpisodeAssets.RemoveAll(a => a.AssetId == assetId);
        await episodeStorage.UpdateAsync(episode, ct);
        return true;
    }

    /// <inheritdoc />
    public async Task<bool> UpdateAssetAsync(Guid userId, Guid id, Guid assetId, UpdateEpisodeAssetData data, CancellationToken ct = default) {
        var episode = await episodeStorage.GetByIdAsync(id, ct);
        if (episode?.OwnerId != userId)
            return false;
        var episodeAsset = episode.EpisodeAssets.FirstOrDefault(a => a.AssetId == assetId);
        if (episodeAsset == null)
            return false;
        if (data.Position.IsSet)
            episodeAsset.Position = data.Position.Value;
        await episodeStorage.UpdateAsync(episode, ct);
        return true;
    }
}