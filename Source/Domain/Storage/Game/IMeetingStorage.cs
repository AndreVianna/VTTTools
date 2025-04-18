namespace VttTools.Storage.Game;

/// <summary>
/// Storage interface for GameMeeting entities
/// </summary>
public interface IMeetingStorage {
    /// <summary>
    /// Retrieves a meeting by its ID
    /// </summary>
    /// <param name="id">The meeting ID</param>
    /// <param name="ct">Cancellation token</param>
    /// <returns>The game meeting</returns>
    Task<Meeting?> GetByIdAsync(Guid id, CancellationToken ct = default);

    /// <summary>
    /// Retrieves all meetings
    /// </summary>
    /// <param name="ct">Cancellation token</param>
    /// <returns>Collection of all game meetings</returns>
    Task<Meeting[]> GetAllAsync(CancellationToken ct = default);

    /// <summary>
    /// Retrieves all meetings for a specific user
    /// </summary>
    /// <param name="userId">The user ID</param>
    /// <param name="ct">Cancellation token</param>
    /// <returns>Collection of game meetings for the user</returns>
    Task<Meeting[]> GetByUserIdAsync(Guid userId, CancellationToken ct = default);

    /// <summary>
    /// Adds a new meeting
    /// </summary>
    /// <param name="meeting">The meeting to add</param>
    /// <param name="ct">Cancellation token</param>
    Task AddAsync(Meeting meeting, CancellationToken ct = default);

    /// <summary>
    /// Updates an existing meeting
    /// </summary>
    /// <param name="meeting">The meeting with updated data</param>
    /// <param name="ct">Cancellation token</param>
    Task UpdateAsync(Meeting meeting, CancellationToken ct = default);

    /// <summary>
    /// Deletes a meeting
    /// </summary>
    /// <param name="id">The ID of the meeting to delete</param>
    /// <param name="ct">Cancellation token</param>
    Task DeleteAsync(Guid id, CancellationToken ct = default);
}