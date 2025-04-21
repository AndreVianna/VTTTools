namespace VttTools.GameService.Services.Game;

/// <summary>
/// Implements IAdventureService using EF Core storage.
/// </summary>
public class AdventureService(
    IAdventureStorage adventureStorage,
    IEpisodeStorage episodeStorage)
    : IAdventureService {
    /// <inheritdoc />
    public Task<Adventure[]> GetAdventuresAsync(CancellationToken ct = default)
        => adventureStorage.GetAllAsync(ct);

    /// <inheritdoc />
    public Task<Adventure?> GetAdventureAsync(Guid id, CancellationToken ct = default)
        => adventureStorage.GetByIdAsync(id, ct);

    /// <inheritdoc />
    public Task<Episode[]> GetEpisodesAsync(Guid id, CancellationToken ct = default)
        => episodeStorage.GetByParentIdAsync(id, ct);

    /// <inheritdoc />
    public Task<Episode?> GetEpisodeAsync(Guid id, CancellationToken ct = default)
        => episodeStorage.GetByIdAsync(id, ct);

    /// <inheritdoc />
    public async Task<Episode?> CreateEpisodeAsync(Guid userId, Guid adventureId, CreateEpisodeRequest request, CancellationToken ct = default) {
        var adventure = await adventureStorage.GetByIdAsync(adventureId, ct);
        if (adventure is null || adventure.OwnerId != userId)
            return null;
        var episode = new Episode {
            Id = Guid.NewGuid(),
            OwnerId = userId,
            ParentId = adventureId,
            Name = request.Name,
            Visibility = request.Visibility,
            IsTemplate = true,
        };
        return await episodeStorage.AddAsync(episode, ct);
    }

    /// <inheritdoc />
    public async Task<Episode?> UpdateEpisodeAsync(Guid userId, Guid episodeId, UpdateEpisodeRequest request, CancellationToken ct = default) {
        var episode = await episodeStorage.GetByIdAsync(episodeId, ct);
        if (episode is null || episode.OwnerId != userId)
            return null;
        if (request.Name.IsSet)
            episode.Name = request.Name.Value;
        if (request.Visibility.IsSet)
            episode.Visibility = request.Visibility.Value;
        return await episodeStorage.UpdateAsync(episode, ct);
    }

    /// <inheritdoc />
    public async Task<bool> DeleteEpisodeAsync(Guid userId, Guid episodeId, CancellationToken ct = default) {
        var episode = await episodeStorage.GetByIdAsync(episodeId, ct);
        if (episode is null || episode.OwnerId != userId)
            return false;
        await episodeStorage.DeleteAsync(episode, ct);
        return true;
    }

    /// <inheritdoc />
    public async Task<Episode?> CloneEpisodeAsync(Guid userId, Guid episodeId, CancellationToken ct = default) {
        var original = await episodeStorage.GetByIdAsync(episodeId, ct);
        if (original is null || original.OwnerId != userId)
            return null;
        var clone = new Episode {
            Id = Guid.NewGuid(),
            OwnerId = userId,
            ParentId = original.ParentId,
            Name = original.Name,
            Visibility = original.Visibility,
            IsTemplate = true,
            TemplateId = original.Id,
        };
        return await episodeStorage.AddAsync(clone, ct);
    }

    /// <inheritdoc />
    public async Task<Adventure?> CreateAdventureAsync(Guid userId, CreateAdventureRequest request, CancellationToken ct = default) {
        if (string.IsNullOrWhiteSpace(request.Name))
            return null;
        var adventure = new Adventure {
            Id = Guid.NewGuid(),
            OwnerId = userId,
            Name = request.Name,
            Visibility = request.Visibility,
        };
        return await adventureStorage.AddAsync(adventure, ct);
    }

    /// <inheritdoc />
    public async Task<Adventure?> UpdateAdventureAsync(Guid userId, Guid adventureId, UpdateAdventureRequest request, CancellationToken ct = default) {
        var adventure = await adventureStorage.GetByIdAsync(adventureId, ct);
        if (adventure is null || adventure.OwnerId != userId)
            return null;
        if (request.Name.IsSet)
            adventure.Name = request.Name.Value;
        if (request.Visibility.IsSet)
            adventure.Visibility = request.Visibility.Value;
        return await adventureStorage.UpdateAsync(adventure, ct);
    }

    /// <inheritdoc />
    public async Task<bool> DeleteAdventureAsync(Guid userId, Guid adventureId, CancellationToken ct = default) {
        var adventure = await adventureStorage.GetByIdAsync(adventureId, ct);
        if (adventure is null || adventure.OwnerId != userId)
            return false;
        await adventureStorage.DeleteAsync(adventure, ct);
        return true;
    }

    /// <inheritdoc />
    public async Task<Adventure?> CloneAdventureAsync(Guid userId, Guid adventureId, CancellationToken ct = default) {
        var original = await adventureStorage.GetByIdAsync(adventureId, ct);
        if (original is null || original.OwnerId != userId)
            return null;
        // clone Adventure metadata
        var clone = new Adventure {
            Id = Guid.NewGuid(),
            OwnerId = userId,
            ParentId = original.ParentId,
            Name = original.Name,
            Visibility = original.Visibility,
            TemplateId = original.Id,
        };
        clone = await adventureStorage.AddAsync(clone, ct);
        // deep-clone nested episodes (with stage and assets)
        var episodes = await episodeStorage.GetByParentIdAsync(adventureId, ct);
        foreach (var ep in episodes) {
            var newEp = new Episode {
                Id = Guid.NewGuid(),
                OwnerId = userId,
                ParentId = clone.Id,
                Name = ep.Name,
                Visibility = ep.Visibility,
                TemplateId = ep.Id,
                Stage = new() {
                    MapType = ep.Stage.MapType,
                    Source = ep.Stage.Source,
                    Size = new() { Width = ep.Stage.Size.Width, Height = ep.Stage.Size.Height },
                    Grid = new() {
                        Offset = new() { Left = ep.Stage.Grid.Offset.Left, Top = ep.Stage.Grid.Offset.Top },
                        CellSize = new() { Width = ep.Stage.Grid.CellSize.Width, Height = ep.Stage.Grid.CellSize.Height },
                    },
                },
                EpisodeAssets = [..ep.EpisodeAssets.Select(ea => new EpisodeAsset {
                    AssetId = ea.AssetId,
                    Name = ea.Name,
                    Position = new() { Left = ea.Position.Left, Top = ea.Position.Top },
                    Scale = ea.Scale,
                    IsLocked = ea.IsLocked,
                    ControlledBy = ea.ControlledBy,
                                                                                  })],
            };
            await episodeStorage.AddAsync(newEp, ct);
        }
        return clone;
    }
}