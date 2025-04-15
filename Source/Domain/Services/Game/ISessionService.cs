using System.Net;

namespace VttTools.Services.Game;

/// <summary>
/// Service for managing game sessions
/// </summary>
public interface ISessionService {
    /// <summary>
    /// Creates a new game session
    /// </summary>
    /// <param name="userId">ID of the user making the request</param>
    /// <param name="data">The data to create the session</param>
    /// <param name="ct">Cancellation token</param>
    /// <returns>The created game session</returns>
    Task<Result<Session>> CreateSessionAsync(Guid userId, CreateSessionData data, CancellationToken ct = default);

    /// <summary>
    /// Gets a game session by ID
    /// </summary>
    /// <param name="userId">ID of the user making the request</param>
    /// <param name="sessionId">ID of the session to get the session's details</param>
    /// <param name="ct">Cancellation token</param>
    /// <returns>The game session if found, null otherwise</returns>
    Task<Session?> GetSessionAsync(Guid userId, Guid sessionId, CancellationToken ct = default);

    /// <summary>
    /// Gets all sessions a user is part of
    /// </summary>
    /// <param name="userId">ID of the user making the request</param>
    /// <param name="ct">Cancellation token</param>
    /// <returns>Collection of game sessions the user is part of</returns>
    Task<Session[]> GetSessionsAsync(Guid userId, CancellationToken ct = default);

    /// <summary>
    /// Updates a game session's details
    /// </summary>
    /// <param name="userId">ID of the user making the request</param>
    /// <param name="sessionId">ID of the session to update</param>
    /// <param name="data">The data to create the session</param>
    /// <param name="ct">Cancellation token</param>
    Task<TypedResult<HttpStatusCode>> UpdateSessionAsync(Guid userId, Guid sessionId, UpdateSessionData data, CancellationToken ct = default);

    /// <summary>
    /// Deletes a game session
    /// </summary>
    /// <param name="userId">ID of the user making the request</param>
    /// <param name="sessionId">ID of the session to delete</param>
    /// <param name="ct">Cancellation token</param>
    Task<TypedResult<HttpStatusCode>> DeleteSessionAsync(Guid userId, Guid sessionId, CancellationToken ct = default);

    /// <summary>
    /// Sets the active map for a game session
    /// </summary>
    /// <param name="userId">ID of the user making the request</param>
    /// <param name="sessionId">ID of the session to update</param>
    /// <param name="mapNumber">Number of the map to set as active</param>
    /// <param name="ct">Cancellation token</param>
    Task<TypedResult<HttpStatusCode>> SetActiveMapAsync(Guid userId, Guid sessionId, int mapNumber, CancellationToken ct = default);

    /// <summary>
    /// Starts a game session
    /// </summary>
    /// <param name="userId">ID of the user making the request</param>
    /// <param name="sessionId">ID of the session to start</param>
    /// <param name="ct">Cancellation token</param>
    Task<TypedResult<HttpStatusCode>> StartSessionAsync(Guid userId, Guid sessionId, CancellationToken ct = default);

    /// <summary>
    /// Ends a game session
    /// </summary>
    /// <param name="userId">ID of the user making the request</param>
    /// <param name="sessionId">ID of the session to start</param>
    /// <param name="ct">Cancellation token</param>
    Task<TypedResult<HttpStatusCode>> StopSessionAsync(Guid userId, Guid sessionId, CancellationToken ct = default);

    /// <summary>
    /// Adds a user to a game session
    /// </summary>
    /// <param name="userId">ID of the user making the request</param>
    /// <param name="sessionId">ID of the session to join</param>
    /// <param name="joinAs">The type of player the user will be in the session</param>
    /// <param name="ct">Cancellation token</param>
    Task<TypedResult<HttpStatusCode>> JoinSessionAsync(Guid userId, Guid sessionId, PlayerType joinAs, CancellationToken ct = default);

    /// <summary>
    /// Removes a user from a game session
    /// </summary>
    /// <param name="userId">ID of the user making the request</param>
    /// <param name="sessionId">ID of the session to leave</param>
    /// <param name="ct">Cancellation token</param>
    Task<TypedResult<HttpStatusCode>> LeaveSessionAsync(Guid userId, Guid sessionId, CancellationToken ct = default);
}
