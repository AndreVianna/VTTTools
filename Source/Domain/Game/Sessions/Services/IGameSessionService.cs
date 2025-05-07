namespace VttTools.Game.Sessions.Services;

/// <summary>
/// Service for managing game sessions
/// </summary>
public interface IGameSessionService {
    /// <summary>
    /// Gets all game sessions a user is part of
    /// </summary>
    /// <param name="userId">ID of the user making the request</param>
    /// <param name="ct">Cancellation token</param>
    /// <returns>Collection of game sessions the user is part of</returns>
    Task<GameSession[]> GetGameSessionsAsync(Guid userId, CancellationToken ct = default);

    /// <summary>
    /// Gets a game session by ID
    /// </summary>
    /// <param name="userId">ID of the user making the request</param>
    /// <param name="sessionId">ID of the game session to get the game session's details</param>
    /// <param name="ct">Cancellation token</param>
    /// <returns>The game session if found, null otherwise</returns>
    Task<GameSession?> GetGameSessionByIdAsync(Guid userId, Guid sessionId, CancellationToken ct = default);

    /// <summary>
    /// Creates a new game session
    /// </summary>
    /// <param name="userId">ID of the user making the request</param>
    /// <param name="data">The data to create the game session</param>
    /// <param name="ct">Cancellation token</param>
    /// <returns>The created game session</returns>
    Task<TypedResult<HttpStatusCode, GameSession>> CreateGameSessionAsync(Guid userId, CreateGameSessionData data, CancellationToken ct = default);

    /// <summary>
    /// Updates a game session's details
    /// </summary>
    /// <param name="userId">ID of the user making the request</param>
    /// <param name="sessionId">ID of the game session to update</param>
    /// <param name="data">The data to create the game session</param>
    /// <param name="ct">Cancellation token</param>
    Task<TypedResult<HttpStatusCode, GameSession>> UpdateGameSessionAsync(Guid userId, Guid sessionId, UpdateGameSessionData data, CancellationToken ct = default);

    /// <summary>
    /// Deletes a game session
    /// </summary>
    /// <param name="userId">ID of the user making the request</param>
    /// <param name="sessionId">ID of the game session to delete</param>
    /// <param name="ct">Cancellation token</param>
    Task<TypedResult<HttpStatusCode>> DeleteGameSessionAsync(Guid userId, Guid sessionId, CancellationToken ct = default);

    /// <summary>
    /// Adds a user to a game session
    /// </summary>
    /// <param name="userId">ID of the user making the request</param>
    /// <param name="sessionId">ID of the game session to join</param>
    /// <param name="joinAs">The type of player the user will be in the game session</param>
    /// <param name="ct">Cancellation token</param>
    Task<TypedResult<HttpStatusCode>> JoinGameSessionAsync(Guid userId, Guid sessionId, PlayerType joinAs, CancellationToken ct = default);

    /// <summary>
    /// Removes a user from a game session
    /// </summary>
    /// <param name="userId">ID of the user making the request</param>
    /// <param name="sessionId">ID of the game session to leave</param>
    /// <param name="ct">Cancellation token</param>
    Task<TypedResult<HttpStatusCode>> LeaveGameSessionAsync(Guid userId, Guid sessionId, CancellationToken ct = default);

    /// <summary>
    /// Starts a game session
    /// </summary>
    /// <param name="userId">ID of the user making the request</param>
    /// <param name="sessionId">ID of the game session to start</param>
    /// <param name="ct">Cancellation token</param>
    Task<TypedResult<HttpStatusCode>> StartGameSessionAsync(Guid userId, Guid sessionId, CancellationToken ct = default);

    /// <summary>
    /// Ends a game session
    /// </summary>
    /// <param name="userId">ID of the user making the request</param>
    /// <param name="sessionId">ID of the game session to start</param>
    /// <param name="ct">Cancellation token</param>
    Task<TypedResult<HttpStatusCode>> StopGameSessionAsync(Guid userId, Guid sessionId, CancellationToken ct = default);

    /// <summary>
    /// Sets the active scene for a game session
    /// </summary>
    /// <param name="userId">ID of the user making the request</param>
    /// <param name="sessionId">ID of the game session to update</param>
    /// <param name="sceneId">ID of the scene to set as active</param>
    /// <param name="ct">Cancellation token</param>
    Task<TypedResult<HttpStatusCode>> SetActiveSceneAsync(Guid userId, Guid sessionId, Guid sceneId, CancellationToken ct = default);
}