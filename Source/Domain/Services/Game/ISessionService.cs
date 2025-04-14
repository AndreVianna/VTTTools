namespace VttTools.Services.Game;

/// <summary>
/// Service for managing game sessions
/// </summary>
public interface ISessionService {
    /// <summary>
    /// Creates a new game session
    /// </summary>
    /// <param name="name">Name of the session</param>
    /// <param name="creatorUserId">ID of the user creating the session</param>
    /// <param name="ct">Cancellation token</param>
    /// <returns>The created game session</returns>
    Task<Session> CreateSessionAsync(string name, Guid creatorUserId, CancellationToken ct = default);

    /// <summary>
    /// Gets a game session by ID
    /// </summary>
    /// <param name="sessionId">ID of the session to retrieve</param>
    /// <param name="ct">Cancellation token</param>
    /// <returns>The game session if found, null otherwise</returns>
    Task<Session?> GetSessionAsync(Guid sessionId, CancellationToken ct = default);

    /// <summary>
    /// Gets all sessions a user is part of
    /// </summary>
    /// <param name="userId">ID of the user</param>
    /// <param name="ct">Cancellation token</param>
    /// <returns>Collection of game sessions the user is part of</returns>
    Task<IEnumerable<Session>> GetUserSessionsAsync(Guid userId, CancellationToken ct = default);

    /// <summary>
    /// Updates a game session's details
    /// </summary>
    /// <param name="sessionId">ID of the session to update</param>
    /// <param name="name">New name for the session</param>
    /// <param name="ct">Cancellation token</param>
    Task UpdateSessionAsync(Guid sessionId, string name, CancellationToken ct = default);

    /// <summary>
    /// Deletes a game session
    /// </summary>
    /// <param name="sessionId">ID of the session to delete</param>
    /// <param name="userId">ID of the user attempting to delete the session</param>
    /// <param name="ct">Cancellation token</param>
    Task DeleteSessionAsync(Guid sessionId, Guid userId, CancellationToken ct = default);

    /// <summary>
    /// Sets the active map for a game session
    /// </summary>
    /// <param name="sessionId">ID of the session</param>
    /// <param name="mapNumber">Number of the map to set as active</param>
    /// <param name="ct">Cancellation token</param>
    Task SetActiveMapAsync(Guid sessionId, int mapNumber, CancellationToken ct = default);

    /// <summary>
    /// Starts a game session
    /// </summary>
    /// <param name="sessionId">ID of the session to start</param>
    /// <param name="userId">ID of the user attempting to start the session</param>
    /// <param name="ct">Cancellation token</param>
    Task StartSessionAsync(Guid sessionId, Guid userId, CancellationToken ct = default);

    /// <summary>
    /// Adds a user to a game session
    /// </summary>
    /// <param name="sessionId">ID of the session to join</param>
    /// <param name="user">The user joining the session</param>
    /// <param name="type">Role of the user in the session</param>
    /// <param name="ct">Cancellation token</param>
    Task JoinSessionAsync(Guid sessionId, User user, PlayerType type = PlayerType.Player, CancellationToken ct = default);

    /// <summary>
    /// Removes a user from a game session
    /// </summary>
    /// <param name="sessionId">ID of the session to leave</param>
    /// <param name="userId">ID of the user leaving the session</param>
    /// <param name="ct">Cancellation token</param>
    Task LeaveSessionAsync(Guid sessionId, Guid userId, CancellationToken ct = default);
}
