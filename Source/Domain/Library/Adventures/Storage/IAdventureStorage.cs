namespace VttTools.Library.Adventures.Storage;

public interface IAdventureStorage {
    Task<(Adventure[] Items, int TotalCount)> SearchAsync(
        Guid masterUserId,
        LibrarySearchFilter filter,
        CancellationToken ct = default);

    Task<Adventure[]> GetByCampaignIdAsync(Guid campaignId, CancellationToken ct = default);

    Task<Adventure[]> GetAllAsync(CancellationToken ct = default);

    Task<Adventure[]> GetManyAsync(string filterDefinition, CancellationToken ct = default);

    Task<Adventure?> GetByIdAsync(Guid id, CancellationToken ct = default);

    Task AddAsync(Adventure adventure, CancellationToken ct = default);

    Task<bool> UpdateAsync(Adventure adventure, CancellationToken ct = default);

    Task<bool> DeleteAsync(Guid id, CancellationToken ct = default);
}