namespace VttTools.GameService.Services.Game;

/// <summary>
/// Implements IAdventureService using EF Core storage.
/// </summary>
public class AdventureService(IAdventureStorage adventureStorage, IEpisodeStorage episodeStorage)
    : IAdventureService {
    /// <inheritdoc />
    public Task<Adventure[]> GetAdventuresAsync(CancellationToken ct = default)
        => adventureStorage.GetAllAsync(ct);

    /// <inheritdoc />
    public Task<Adventure?> GetAdventureByIdAsync(Guid id, CancellationToken ct = default)
        => adventureStorage.GetByIdAsync(id, ct);

    /// <inheritdoc />
    public async Task<Adventure?> CreateAdventureAsync(Guid userId, CreateAdventureRequest data, CancellationToken ct = default) {
        if (string.IsNullOrWhiteSpace(data.Name))
            return null;
        var adventure = new Adventure {
            OwnerId = userId,
            ParentId = data.CampaignId,
            Name = data.Name,
            Visibility = data.Visibility,
        };
        return await adventureStorage.AddAsync(adventure, ct);
    }

    /// <inheritdoc />
    public async Task<Adventure?> CloneAdventureAsync(Guid userId, Guid templateId, CloneAdventureRequest data, CancellationToken ct = default) {
        var original = await adventureStorage.GetByIdAsync(templateId, ct);
        if (original is null || original.OwnerId != userId)
            return null;
        var clone = Cloner.CloneAdventure(original, userId);
        if (data.CampaignId.IsSet)
            clone.ParentId = data.CampaignId.Value;
        if (data.Name.IsSet)
            clone.Name = data.Name.Value;
        await adventureStorage.AddAsync(clone, ct);
        return clone;
    }

    /// <inheritdoc />
    public async Task<Adventure?> UpdateAdventureAsync(Guid userId, Guid id, UpdateAdventureRequest data, CancellationToken ct = default) {
        var adventure = await adventureStorage.GetByIdAsync(id, ct);
        if (adventure is null || adventure.OwnerId != userId)
            return null;
        if (data.Name.IsSet)
            adventure.Name = data.Name.Value;
        if (data.Visibility.IsSet)
            adventure.Visibility = data.Visibility.Value;
        return await adventureStorage.UpdateAsync(adventure, ct);
    }

    /// <inheritdoc />
    public async Task<bool> DeleteAdventureAsync(Guid userId, Guid id, CancellationToken ct = default) {
        var adventure = await adventureStorage.GetByIdAsync(id, ct);
        if (adventure is null || adventure.OwnerId != userId)
            return false;
        await adventureStorage.DeleteAsync(adventure, ct);
        return true;
    }

    /// <inheritdoc />
    public Task<Episode[]> GetEpisodesAsync(Guid id, CancellationToken ct = default)
        => episodeStorage.GetByParentIdAsync(id, ct);

    /// <inheritdoc />
    public async Task<bool> AddEpisodeAsync(Guid userId, Guid id, Guid episodeId, CancellationToken ct = default) {
        var adventure = await adventureStorage.GetByIdAsync(id, ct);
        if (adventure is null || adventure.OwnerId != userId)
            return false;
        var episode = await episodeStorage.GetByIdAsync(episodeId, ct);
        if (episode is null)
            return false;
        var clone = Cloner.CloneEpisode(episode, adventure.Id, userId);
        adventure.Episodes.Add(clone);
        await adventureStorage.UpdateAsync(adventure, ct);
        return true;
    }

    /// <inheritdoc />
    public async Task<bool> RemoveEpisodeAsync(Guid userId, Guid id, Guid episodeId, CancellationToken ct = default) {
        var adventure = await adventureStorage.GetByIdAsync(id, ct);
        if (adventure is null || adventure.OwnerId != userId)
            return false;
        adventure.Episodes.RemoveWhere(e => e.Id == episodeId);
        await adventureStorage.UpdateAsync(adventure, ct);
        return true;
    }
}