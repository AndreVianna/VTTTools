namespace VttTools.Services.Game;

/// <summary>
/// Service for retrieving and managing Adventures and their Episodes.
/// </summary>
public interface IAdventureService {
    /// <summary>
    /// Gets all adventure templates.
    /// </summary>
    Task<Adventure[]> GetAdventuresAsync(CancellationToken ct = default);

    /// <summary>
    /// Gets a specific adventure by ID.
    /// </summary>
    Task<Adventure?> GetAdventureAsync(Guid id, CancellationToken ct = default);

    /// <summary>
    /// Gets all episode templates for a given adventure.
    /// </summary>
    Task<Episode[]> GetEpisodesAsync(Guid id, CancellationToken ct = default);

    /// <summary>
    /// Gets a specific episode by ID.
    /// </summary>
    Task<Episode?> GetEpisodeAsync(Guid id, CancellationToken ct = default);

    /// <summary>
    /// Creates a new episode template under a given adventure.
    /// </summary>
    Task<Episode?> CreateEpisodeAsync(Guid userId, Guid adventureId, CreateEpisodeRequest request, CancellationToken ct = default);

    /// <summary>
    /// Updates an existing episode template.
    /// </summary>
    Task<Episode?> UpdateEpisodeAsync(Guid userId, Guid episodeId, UpdateEpisodeRequest request, CancellationToken ct = default);

    /// <summary>
    /// Deletes an episode template.
    /// </summary>
    Task<bool> DeleteEpisodeAsync(Guid userId, Guid episodeId, CancellationToken ct = default);

    /// <summary>
    /// Clones an existing episode template.
    /// </summary>
    Task<Episode?> CloneEpisodeAsync(Guid userId, Guid episodeId, CancellationToken ct = default);

    /// <summary>
    /// Creates a new adventure template.
    /// </summary>
    Task<Adventure> CreateAdventureAsync(Guid userId, CreateAdventureRequest request, CancellationToken ct = default);

    /// <summary>
    /// Updates an existing adventure template.
    /// </summary>
    Task<Adventure?> UpdateAdventureAsync(Guid userId, Guid adventureId, UpdateAdventureRequest request, CancellationToken ct = default);

    /// <summary>
    /// Deletes an adventure template.
    /// </summary>
    Task<bool> DeleteAdventureAsync(Guid userId, Guid adventureId, CancellationToken ct = default);

    /// <summary>
    /// Deep-clones an existing Adventure template, including nested Episodes, Stage data, and EpisodeAssets.
    /// </summary>
    Task<Adventure?> CloneAdventureAsync(Guid userId, Guid adventureId, CancellationToken ct = default);
}