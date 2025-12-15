namespace VttTools.Library.Campaigns.Storage;

public interface ICampaignStorage {
    Task<(Campaign[] Items, int TotalCount)> SearchAsync(
        Guid masterUserId,
        LibrarySearchFilter filter,
        CancellationToken ct = default);

    Task<Campaign[]> GetByWorldIdAsync(Guid worldId, CancellationToken ct = default);

    Task<Campaign[]> GetAllAsync(CancellationToken ct = default);

    Task<Campaign[]> GetManyAsync(string filterDefinition, CancellationToken ct = default);

    Task<Campaign?> GetByIdAsync(Guid id, CancellationToken ct = default);

    Task AddAsync(Campaign campaign, CancellationToken ct = default);

    Task<bool> UpdateAsync(Campaign campaign, CancellationToken ct = default);

    Task<bool> DeleteAsync(Guid id, CancellationToken ct = default);
}