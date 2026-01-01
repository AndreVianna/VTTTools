namespace VttTools.Identity.Storage;

public interface IUserStorage {
    Task<User?> FindByIdAsync(Guid id, CancellationToken ct = default);
    Task<User?> FindByEmailAsync(string email, CancellationToken ct = default);
    Task<IReadOnlyList<User>> GetAllAsync(CancellationToken ct = default);
    Task<IReadOnlyList<User>> GetUsersInRoleAsync(string roleName, CancellationToken ct = default);
    Task<Result<User>> CreateAsync(User user, string password, CancellationToken ct = default);
    Task<Result> UpdateAsync(User user, CancellationToken ct = default);
    Task<Result> DeleteAsync(Guid id, CancellationToken ct = default);
    Task<Result> AddToRoleAsync(Guid userId, string roleName, CancellationToken ct = default);
    Task<Result> RemoveFromRoleAsync(Guid userId, string roleName, CancellationToken ct = default);
    Task<Result> ChangePasswordAsync(Guid userId, string currentPassword, string newPassword, CancellationToken ct = default);
    Task<Result> SetPasswordAsync(Guid userId, string password, CancellationToken ct = default);
    Task<bool> CheckPasswordAsync(Guid userId, string password, CancellationToken ct = default);
}
