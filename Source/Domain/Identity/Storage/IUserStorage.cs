using VttTools.Common.Model;

namespace VttTools.Identity.Storage;

public interface IUserStorage {
    // Basic CRUD operations
    Task<User?> FindByIdAsync(Guid id, CancellationToken ct = default);
    Task<User?> FindByEmailAsync(string email, CancellationToken ct = default);
    Task<IReadOnlyList<User>> GetAllAsync(CancellationToken ct = default);
    Task<IReadOnlyList<User>> GetUsersInRoleAsync(string roleName, CancellationToken ct = default);
    Task<Result<User>> CreateAsync(User user, string password, CancellationToken ct = default);
    Task<Result> UpdateAsync(User user, CancellationToken ct = default);
    Task<Result> DeleteAsync(Guid id, CancellationToken ct = default);

    // Role management
    Task<Result> AddToRoleAsync(Guid userId, string roleName, CancellationToken ct = default);
    Task<Result> RemoveFromRoleAsync(Guid userId, string roleName, CancellationToken ct = default);

    // Password management
    Task<Result> ChangePasswordAsync(Guid userId, string currentPassword, string newPassword, CancellationToken ct = default);
    Task<Result> SetPasswordAsync(Guid userId, string password, CancellationToken ct = default);
    Task<bool> CheckPasswordAsync(Guid userId, string password, CancellationToken ct = default);

    // Search and stats
    Task<(User[] Users, int TotalCount)> SearchAsync(
        string? search = null,
        string? status = null,
        string? role = null,
        string? sortBy = null,
        string? sortOrder = null,
        Pagination? pagination = null,
        CancellationToken ct = default);
    Task<UsersSummary> GetSummaryAsync(CancellationToken ct = default);

    // Admin operations - email confirmation (admin bypass)
    Task<Result> ConfirmEmailAsync(Guid userId, CancellationToken ct = default);

    // Admin operations - password reset token generation
    Task<string?> GeneratePasswordResetTokenAsync(Guid userId, CancellationToken ct = default);
}
