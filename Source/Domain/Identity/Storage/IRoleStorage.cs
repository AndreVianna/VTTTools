namespace VttTools.Identity.Storage;

public interface IRoleStorage {
    Task<Role?> FindByIdAsync(Guid id, CancellationToken ct = default);
    Task<Role?> FindByNameAsync(string name, CancellationToken ct = default);
    Task<IReadOnlyList<Role>> GetAllAsync(CancellationToken ct = default);
    Task<Result<Role>> CreateAsync(Role role, CancellationToken ct = default);
    Task<Result> UpdateAsync(Role role, CancellationToken ct = default);
    Task<Result> DeleteAsync(Guid id, CancellationToken ct = default);
    Task<Result> AddClaimAsync(Guid roleId, string claim, CancellationToken ct = default);
    Task<Result> RemoveClaimAsync(Guid roleId, string claim, CancellationToken ct = default);
}
