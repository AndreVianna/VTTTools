namespace VttTools.Library.Worlds.Storage;

public interface IWorldStorage {
    Task<(World[] Items, int TotalCount)> SearchAsync(
        Guid masterUserId,
        LibrarySearchFilter filter,
        CancellationToken ct = default);

    Task<World[]> GetAllAsync(CancellationToken ct = default);

    Task<World[]> SearchAsync(string filterDefinition, CancellationToken ct = default);

    Task<World?> GetByIdAsync(Guid id, CancellationToken ct = default);

    Task AddAsync(World world, CancellationToken ct = default);

    Task<bool> UpdateAsync(World world, CancellationToken ct = default);

    Task<bool> DeleteAsync(Guid id, CancellationToken ct = default);
}