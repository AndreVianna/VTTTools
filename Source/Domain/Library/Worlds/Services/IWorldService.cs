namespace VttTools.Library.Worlds.Services;

/// <summary>
/// Service for retrieving and managing Worlds and their Campaigns.
/// </summary>
public interface IWorldService {
    /// <summary>
    /// Gets all world templates.
    /// </summary>
    /// <param name="ct">Cancellation token for async operations.</param>
    /// <returns>An array of world templates.</returns>
    Task<World[]> GetWorldsAsync(CancellationToken ct = default);

    /// <summary>
    /// Gets owned world templates.
    /// </summary>
    /// <param name="filterDefinition">The definition of the filter to apply.</param>
    /// <param name="ct">Cancellation token for async operations.</param>
    /// <returns>An array of world templates.</returns>
    Task<World[]> GetWorldsAsync(string filterDefinition, CancellationToken ct = default);

    /// <summary>
    /// Gets a specific world by ID.
    /// </summary>
    /// <param name="id">The ID of the world.</param>
    /// <param name="ct">Cancellation token for async operations.</param>
    /// <returns>An world associated with the specified ID.</returns>
    Task<World?> GetWorldByIdAsync(Guid id, CancellationToken ct = default);

    /// <summary>
    /// Creates a new world template.
    /// </summary>
    /// <param name="userId">The ID of the user requesting the creation.</param>
    /// <param name="data">The data containing world details.</param>
    /// <param name="ct">Cancellation token for async operations.</param>
    /// <returns>The result of the operation that may contain the created world when successful or the errors if the operation fails.</returns>
    Task<Result<World>> CreateWorldAsync(Guid userId, CreateWorldData data, CancellationToken ct = default);

    /// <summary>
    /// Deep-clones an existing World template, including nested Campaigns.
    /// </summary>
    /// <param name="userId">The ID of the user requesting the clone.</param>
    /// <param name="templateId">The id of the world to be cloned.</param>
    /// <param name="ct">Cancellation token for async operations.</param>
    /// <returns>The result of the operation that may contain the cloned world when successful or the errors if the operation fails.</returns>
    Task<Result<World>> CloneWorldAsync(Guid userId, Guid templateId, CancellationToken ct = default);

    /// <summary>
    /// Updates an existing world template.
    /// </summary>
    /// <param name="userId">The ID of the user requesting the update.</param>
    /// <param name="id">The ID of the world.</param>
    /// <param name="data">The data containing world details.</param>
    /// <param name="ct">Cancellation token for async operations.</param>
    /// <returns>The result of the operation that may contain the updated world when successful or the errors if the operation fails.</returns>
    Task<Result<World>> UpdateWorldAsync(Guid userId, Guid id, UpdatedWorldData data, CancellationToken ct = default);

    /// <summary>
    /// Deletes an world template.
    /// </summary>
    /// <param name="userId">The ID of the user requesting the deletion.</param>
    /// <param name="id">The ID of the world.</param>
    /// <param name="ct">Cancellation token for async operations.</param>
    /// <returns>The result of the operation, it can be successful or contain errors if the operation fails.</returns>
    Task<Result> DeleteWorldAsync(Guid userId, Guid id, CancellationToken ct = default);

    /// <summary>
    /// Gets all campaigns for a specific world by ID.
    /// </summary>
    /// <param name="id">The ID of the world.</param>
    /// <param name="ct">Cancellation token for async operations.</param>
    /// <returns>An array of campaigns associated with the specified world.</returns>
    Task<Campaign[]> GetCampaignsAsync(Guid id, CancellationToken ct = default);

    /// <summary>
    /// Adds a new campaign to a specific world by ID.
    /// </summary>
    /// <param name="userId">The ID of the user requesting the clone.</param>
    /// <param name="id">The ID of the world that will contain the new campaign.</param>
    /// <param name="ct">Cancellation token for async operations.</param>
    /// <returns>The result of the operation that may contain the new campaign when successful or the errors if the operation fails.</returns>
    Task<Result<Campaign>> AddNewCampaignAsync(Guid userId, Guid id, CancellationToken ct = default);

    /// <summary>
    /// Adds a cloned campaign to a specific world by ID.
    /// </summary>
    /// <param name="userId">The ID of the user requesting the clone.</param>
    /// <param name="id">The ID of the world that will contain the new campaign.</param>
    /// <param name="templateId">The id of the campaign to be cloned.</param>
    /// <param name="ct">Cancellation token for async operations.</param>
    /// <returns>The result of the operation that may contain the cloned campaign when successful or the errors if the operation fails.</returns>
    Task<Result<Campaign>> AddClonedCampaignAsync(Guid userId, Guid id, Guid templateId, CancellationToken ct = default);

    /// <summary>
    /// Removes a campaign from a specific world by ID.
    /// </summary>
    /// <param name="userId">The ID of the user requesting the removal.</param>
    /// <param name="id">The ID of the world to be removed.</param>
    /// <param name="campaignId">The ID of the campaign.</param>
    /// <param name="ct">Cancellation token for async operations.</param>
    /// <returns>The result of the operation indicating if the campaign was removed or an error.</returns>
    Task<Result> RemoveCampaignAsync(Guid userId, Guid id, Guid campaignId, CancellationToken ct = default);
}