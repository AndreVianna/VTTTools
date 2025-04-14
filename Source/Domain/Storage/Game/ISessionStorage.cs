namespace VttTools.Storage.Game;

/// <summary>
/// Storage interface for GameSession entities
/// </summary>
public interface ISessionStorage {
    /// <summary>
    /// Retrieves a session by its ID
    /// </summary>
    /// <param name="id">The session ID</param>
    /// <param name="ct">Cancellation token</param>
    /// <returns>The game session</returns>
    Task<Session> GetByIdAsync(Guid id, CancellationToken ct = default);

    /// <summary>
    /// Retrieves all sessions
    /// </summary>
    /// <param name="ct">Cancellation token</param>
    /// <returns>Collection of all game sessions</returns>
    Task<IEnumerable<Session>> GetAllAsync(CancellationToken ct = default);

    /// <summary>
    /// Retrieves all sessions for a specific user
    /// </summary>
    /// <param name="userId">The user ID</param>
    /// <param name="ct">Cancellation token</param>
    /// <returns>Collection of game sessions for the user</returns>
    Task<IEnumerable<Session>> GetByUserIdAsync(Guid userId, CancellationToken ct = default);

    /// <summary>
    /// Adds a new session
    /// </summary>
    /// <param name="session">The session to add</param>
    /// <param name="ct">Cancellation token</param>
    Task AddAsync(Session session, CancellationToken ct = default);

    /// <summary>
    /// Updates an existing session
    /// </summary>
    /// <param name="session">The session with updated data</param>
    /// <param name="ct">Cancellation token</param>
    Task UpdateAsync(Session session, CancellationToken ct = default);

    /// <summary>
    /// Deletes a session
    /// </summary>
    /// <param name="id">The ID of the session to delete</param>
    /// <param name="ct">Cancellation token</param>
    Task DeleteAsync(Guid id, CancellationToken ct = default);
}