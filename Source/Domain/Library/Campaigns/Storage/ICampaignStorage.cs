namespace VttTools.Library.Campaigns.Storage;

/// <summary>
/// Storage interface for Campaign entities.
/// </summary>
public interface ICampaignStorage {
    /// <summary>
    /// Retrieves all campaign templates.
    /// </summary>
    Task<Campaign[]> GetAllAsync(CancellationToken ct = default);

    /// <summary>
    /// Retrieves all campaign templates.
    /// </summary>
    Task<Campaign[]> GetManyAsync(string filterDefinition, CancellationToken ct = default);

    /// <summary>
    /// Retrieves a campaign by its ID.
    /// </summary>
    Task<Campaign?> GetByIdAsync(Guid id, CancellationToken ct = default);

    /// <summary>
    /// Adds a new campaign template.
    /// </summary>
    Task AddAsync(Campaign campaign, CancellationToken ct = default);

    /// <summary>
    /// Updates an existing campaign template.
    /// </summary>
    Task<bool> UpdateAsync(Campaign campaign, CancellationToken ct = default);

    /// <summary>
    /// Deletes a campaign template.
    /// </summary>
    Task<bool> DeleteAsync(Guid id, CancellationToken ct = default);
}
