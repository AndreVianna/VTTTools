namespace VttTools.Library.Epics.Services;

/// <summary>
/// Service for retrieving and managing Epics and their Campaigns.
/// </summary>
public interface IEpicService {
    /// <summary>
    /// Gets all epic templates.
    /// </summary>
    /// <param name="ct">Cancellation token for async operations.</param>
    /// <returns>An array of epic templates.</returns>
    Task<Epic[]> GetEpicsAsync(CancellationToken ct = default);

    /// <summary>
    /// Gets owned epic templates.
    /// </summary>
    /// <param name="filterDefinition">The definition of the filter to apply.</param>
    /// <param name="ct">Cancellation token for async operations.</param>
    /// <returns>An array of epic templates.</returns>
    Task<Epic[]> GetEpicsAsync(string filterDefinition, CancellationToken ct = default);

    /// <summary>
    /// Gets a specific epic by ID.
    /// </summary>
    /// <param name="id">The ID of the epic.</param>
    /// <param name="ct">Cancellation token for async operations.</param>
    /// <returns>An epic associated with the specified ID.</returns>
    Task<Epic?> GetEpicByIdAsync(Guid id, CancellationToken ct = default);

    /// <summary>
    /// Creates a new epic template.
    /// </summary>
    /// <param name="userId">The ID of the user requesting the creation.</param>
    /// <param name="data">The data containing epic details.</param>
    /// <param name="ct">Cancellation token for async operations.</param>
    /// <returns>The result of the operation that may contain the created epic when successful or the errors if the operation fails.</returns>
    Task<Result<Epic>> CreateEpicAsync(Guid userId, CreateEpicData data, CancellationToken ct = default);

    /// <summary>
    /// Deep-clones an existing Epic template, including nested Campaigns.
    /// </summary>
    /// <param name="userId">The ID of the user requesting the clone.</param>
    /// <param name="templateId">The id of the epic to be cloned.</param>
    /// <param name="ct">Cancellation token for async operations.</param>
    /// <returns>The result of the operation that may contain the cloned epic when successful or the errors if the operation fails.</returns>
    Task<Result<Epic>> CloneEpicAsync(Guid userId, Guid templateId, CancellationToken ct = default);

    /// <summary>
    /// Updates an existing epic template.
    /// </summary>
    /// <param name="userId">The ID of the user requesting the update.</param>
    /// <param name="id">The ID of the epic.</param>
    /// <param name="data">The data containing epic details.</param>
    /// <param name="ct">Cancellation token for async operations.</param>
    /// <returns>The result of the operation that may contain the updated epic when successful or the errors if the operation fails.</returns>
    Task<Result<Epic>> UpdateEpicAsync(Guid userId, Guid id, UpdatedEpicData data, CancellationToken ct = default);

    /// <summary>
    /// Deletes an epic template.
    /// </summary>
    /// <param name="userId">The ID of the user requesting the deletion.</param>
    /// <param name="id">The ID of the epic.</param>
    /// <param name="ct">Cancellation token for async operations.</param>
    /// <returns>The result of the operation, it can be successful or contain errors if the operation fails.</returns>
    Task<Result> DeleteEpicAsync(Guid userId, Guid id, CancellationToken ct = default);

    /// <summary>
    /// Gets all campaigns for a specific epic by ID.
    /// </summary>
    /// <param name="id">The ID of the epic.</param>
    /// <param name="ct">Cancellation token for async operations.</param>
    /// <returns>An array of campaigns associated with the specified epic.</returns>
    Task<Campaign[]> GetCampaignsAsync(Guid id, CancellationToken ct = default);

    /// <summary>
    /// Adds a new campaign to a specific epic by ID.
    /// </summary>
    /// <param name="userId">The ID of the user requesting the clone.</param>
    /// <param name="id">The ID of the epic that will contain the new campaign.</param>
    /// <param name="ct">Cancellation token for async operations.</param>
    /// <returns>The result of the operation that may contain the new campaign when successful or the errors if the operation fails.</returns>
    Task<Result<Campaign>> AddNewCampaignAsync(Guid userId, Guid id, CancellationToken ct = default);

    /// <summary>
    /// Adds a cloned campaign to a specific epic by ID.
    /// </summary>
    /// <param name="userId">The ID of the user requesting the clone.</param>
    /// <param name="id">The ID of the epic that will contain the new campaign.</param>
    /// <param name="templateId">The id of the campaign to be cloned.</param>
    /// <param name="ct">Cancellation token for async operations.</param>
    /// <returns>The result of the operation that may contain the cloned campaign when successful or the errors if the operation fails.</returns>
    Task<Result<Campaign>> AddClonedCampaignAsync(Guid userId, Guid id, Guid templateId, CancellationToken ct = default);

    /// <summary>
    /// Removes a campaign from a specific epic by ID.
    /// </summary>
    /// <param name="userId">The ID of the user requesting the removal.</param>
    /// <param name="id">The ID of the epic to be removed.</param>
    /// <param name="campaignId">The ID of the campaign.</param>
    /// <param name="ct">Cancellation token for async operations.</param>
    /// <returns>The result of the operation indicating if the campaign was removed or an error.</returns>
    Task<Result> RemoveCampaignAsync(Guid userId, Guid id, Guid campaignId, CancellationToken ct = default);
}
