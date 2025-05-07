namespace VttTools.Game.Sessions.Storage;

/// <summary>
/// Storage interface for GameGameSession entities
/// </summary>
public interface IGameSessionStorage {
    /// <summary>
    /// Retrieves a game session by its ID
    /// </summary>
    /// <param name="id">The game session ID</param>
    /// <param name="ct">Cancellation token</param>
    /// <returns>The game session</returns>
    Task<GameSession?> GetByIdAsync(Guid id, CancellationToken ct = default);

    /// <summary>
    /// Retrieves all game sessions for a specific user
    /// </summary>
    /// <param name="userId">The user ID</param>
    /// <param name="ct">Cancellation token</param>
    /// <returns>Collection of game sessions for the user</returns>
    Task<GameSession[]> GetByUserIdAsync(Guid userId, CancellationToken ct = default);

    /// <summary>
    /// Adds a new game session
    /// </summary>
    /// <param name="session">The game session to add</param>
    /// <param name="ct">Cancellation token</param>
    Task<GameSession> AddAsync(GameSession session, CancellationToken ct = default);

    /// <summary>
    /// Updates an existing game session
    /// </summary>
    /// <param name="session">The game session with updated data</param>
    /// <param name="ct">Cancellation token</param>
    Task<GameSession?> UpdateAsync(GameSession session, CancellationToken ct = default);

    /// <summary>
    /// Deletes a game session
    /// </summary>
    /// <param name="id">The ID of the game session to delete</param>
    /// <param name="ct">Cancellation token</param>
    Task<bool> DeleteAsync(Guid id, CancellationToken ct = default);
}