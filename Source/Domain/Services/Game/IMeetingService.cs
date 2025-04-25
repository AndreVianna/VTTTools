namespace VttTools.Services.Game;

/// <summary>
/// Service for managing game meetings
/// </summary>
public interface IMeetingService {
    /// <summary>
    /// Gets all meetings a user is part of
    /// </summary>
    /// <param name="userId">ID of the user making the request</param>
    /// <param name="ct">Cancellation token</param>
    /// <returns>Collection of game meetings the user is part of</returns>
    Task<Meeting[]> GetMeetingsAsync(Guid userId, CancellationToken ct = default);

    /// <summary>
    /// Gets a game meeting by ID
    /// </summary>
    /// <param name="userId">ID of the user making the request</param>
    /// <param name="meetingId">ID of the meeting to get the meeting's details</param>
    /// <param name="ct">Cancellation token</param>
    /// <returns>The game meeting if found, null otherwise</returns>
    Task<Meeting?> GetMeetingByIdAsync(Guid userId, Guid meetingId, CancellationToken ct = default);

    /// <summary>
    /// Creates a new game meeting
    /// </summary>
    /// <param name="userId">ID of the user making the request</param>
    /// <param name="data">The data to create the meeting</param>
    /// <param name="ct">Cancellation token</param>
    /// <returns>The created game meeting</returns>
    Task<TypedResult<HttpStatusCode, Meeting>> CreateMeetingAsync(Guid userId, CreateMeetingData data, CancellationToken ct = default);

    /// <summary>
    /// Updates a game meeting's details
    /// </summary>
    /// <param name="userId">ID of the user making the request</param>
    /// <param name="meetingId">ID of the meeting to update</param>
    /// <param name="data">The data to create the meeting</param>
    /// <param name="ct">Cancellation token</param>
    Task<TypedResult<HttpStatusCode, Meeting>> UpdateMeetingAsync(Guid userId, Guid meetingId, UpdateMeetingData data, CancellationToken ct = default);

    /// <summary>
    /// Deletes a game meeting
    /// </summary>
    /// <param name="userId">ID of the user making the request</param>
    /// <param name="meetingId">ID of the meeting to delete</param>
    /// <param name="ct">Cancellation token</param>
    Task<TypedResult<HttpStatusCode>> DeleteMeetingAsync(Guid userId, Guid meetingId, CancellationToken ct = default);

    /// <summary>
    /// Adds a user to a game meeting
    /// </summary>
    /// <param name="userId">ID of the user making the request</param>
    /// <param name="meetingId">ID of the meeting to join</param>
    /// <param name="joinAs">The type of player the user will be in the meeting</param>
    /// <param name="ct">Cancellation token</param>
    Task<TypedResult<HttpStatusCode>> JoinMeetingAsync(Guid userId, Guid meetingId, PlayerType joinAs, CancellationToken ct = default);

    /// <summary>
    /// Removes a user from a game meeting
    /// </summary>
    /// <param name="userId">ID of the user making the request</param>
    /// <param name="meetingId">ID of the meeting to leave</param>
    /// <param name="ct">Cancellation token</param>
    Task<TypedResult<HttpStatusCode>> LeaveMeetingAsync(Guid userId, Guid meetingId, CancellationToken ct = default);

    /// <summary>
    /// Starts a game meeting
    /// </summary>
    /// <param name="userId">ID of the user making the request</param>
    /// <param name="meetingId">ID of the meeting to start</param>
    /// <param name="ct">Cancellation token</param>
    Task<TypedResult<HttpStatusCode>> StartMeetingAsync(Guid userId, Guid meetingId, CancellationToken ct = default);

    /// <summary>
    /// Ends a game meeting
    /// </summary>
    /// <param name="userId">ID of the user making the request</param>
    /// <param name="meetingId">ID of the meeting to start</param>
    /// <param name="ct">Cancellation token</param>
    Task<TypedResult<HttpStatusCode>> StopMeetingAsync(Guid userId, Guid meetingId, CancellationToken ct = default);

    /// <summary>
    /// Sets the active episode for a game meeting
    /// </summary>
    /// <param name="userId">ID of the user making the request</param>
    /// <param name="meetingId">ID of the meeting to update</param>
    /// <param name="episodeId">ID of the episode to set as active</param>
    /// <param name="ct">Cancellation token</param>
    Task<TypedResult<HttpStatusCode>> SetActiveEpisodeAsync(Guid userId, Guid meetingId, Guid episodeId, CancellationToken ct = default);
}