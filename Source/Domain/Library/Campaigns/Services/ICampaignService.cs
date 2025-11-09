namespace VttTools.Library.Campaigns.Services;

/// <summary>
/// Service for retrieving and managing Campaigns and their Adventures.
/// </summary>
public interface ICampaignService {
    /// <summary>
    /// Gets all campaign templates.
    /// </summary>
    /// <param name="ct">Cancellation token for async operations.</param>
    /// <returns>An array of campaign templates.</returns>
    Task<Campaign[]> GetCampaignsAsync(CancellationToken ct = default);

    /// <summary>
    /// Gets owned campaign templates.
    /// </summary>
    /// <param name="filterDefinition">The definition of the filter to apply.</param>
    /// <param name="ct">Cancellation token for async operations.</param>
    /// <returns>An array of campaign templates.</returns>
    Task<Campaign[]> GetCampaignsAsync(string filterDefinition, CancellationToken ct = default);

    /// <summary>
    /// Gets a specific campaign by ID.
    /// </summary>
    /// <param name="id">The ID of the campaign.</param>
    /// <param name="ct">Cancellation token for async operations.</param>
    /// <returns>A campaign associated with the specified ID.</returns>
    Task<Campaign?> GetCampaignByIdAsync(Guid id, CancellationToken ct = default);

    /// <summary>
    /// Creates a new campaign template.
    /// </summary>
    /// <param name="userId">The ID of the user requesting the creation.</param>
    /// <param name="data">The data containing campaign details.</param>
    /// <param name="ct">Cancellation token for async operations.</param>
    /// <returns>The result of the operation that may contain the created campaign when successful or the errors if the operation fails.</returns>
    Task<Result<Campaign>> CreateCampaignAsync(Guid userId, CreateCampaignData data, CancellationToken ct = default);

    /// <summary>
    /// Deep-clones an existing Campaign template, including nested Adventures.
    /// </summary>
    /// <param name="userId">The ID of the user requesting the clone.</param>
    /// <param name="templateId">The id of the campaign to be cloned.</param>
    /// <param name="ct">Cancellation token for async operations.</param>
    /// <returns>The result of the operation that may contain the cloned campaign when successful or the errors if the operation fails.</returns>
    Task<Result<Campaign>> CloneCampaignAsync(Guid userId, Guid templateId, CancellationToken ct = default);

    /// <summary>
    /// Updates an existing campaign template.
    /// </summary>
    /// <param name="userId">The ID of the user requesting the update.</param>
    /// <param name="id">The ID of the campaign.</param>
    /// <param name="data">The data containing campaign details.</param>
    /// <param name="ct">Cancellation token for async operations.</param>
    /// <returns>The result of the operation that may contain the updated campaign when successful or the errors if the operation fails.</returns>
    Task<Result<Campaign>> UpdateCampaignAsync(Guid userId, Guid id, UpdatedCampaignData data, CancellationToken ct = default);

    /// <summary>
    /// Deletes a campaign template.
    /// </summary>
    /// <param name="userId">The ID of the user requesting the deletion.</param>
    /// <param name="id">The ID of the campaign.</param>
    /// <param name="ct">Cancellation token for async operations.</param>
    /// <returns>The result of the operation, it can be successful or contain errors if the operation fails.</returns>
    Task<Result> DeleteCampaignAsync(Guid userId, Guid id, CancellationToken ct = default);

    /// <summary>
    /// Gets all adventures for a specific campaign by ID.
    /// </summary>
    /// <param name="id">The ID of the campaign.</param>
    /// <param name="ct">Cancellation token for async operations.</param>
    /// <returns>An array of adventures associated with the specified campaign.</returns>
    Task<Adventure[]> GetAdventuresAsync(Guid id, CancellationToken ct = default);

    /// <summary>
    /// Adds a new adventure to a specific campaign by ID.
    /// </summary>
    /// <param name="userId">The ID of the user requesting the clone.</param>
    /// <param name="id">The ID of the campaign that will contain the new adventure.</param>
    /// <param name="ct">Cancellation token for async operations.</param>
    /// <returns>The result of the operation that may contain the new adventure when successful or the errors if the operation fails.</returns>
    Task<Result<Adventure>> AddNewAdventureAsync(Guid userId, Guid id, CancellationToken ct = default);

    /// <summary>
    /// Adds a cloned adventure to a specific campaign by ID.
    /// </summary>
    /// <param name="userId">The ID of the user requesting the clone.</param>
    /// <param name="id">The ID of the campaign that will contain the new adventure.</param>
    /// <param name="templateId">The id of the adventure to be cloned.</param>
    /// <param name="ct">Cancellation token for async operations.</param>
    /// <returns>The result of the operation that may contain the cloned adventure when successful or the errors if the operation fails.</returns>
    Task<Result<Adventure>> AddClonedAdventureAsync(Guid userId, Guid id, Guid templateId, CancellationToken ct = default);

    /// <summary>
    /// Removes an adventure from a specific campaign by ID.
    /// </summary>
    /// <param name="userId">The ID of the user requesting the removal.</param>
    /// <param name="id">The ID of the campaign to be removed.</param>
    /// <param name="adventureId">The ID of the adventure.</param>
    /// <param name="ct">Cancellation token for async operations.</param>
    /// <returns>The result of the operation indicating if the adventure was removed or an error.</returns>
    Task<Result> RemoveAdventureAsync(Guid userId, Guid id, Guid adventureId, CancellationToken ct = default);
}
