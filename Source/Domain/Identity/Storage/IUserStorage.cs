namespace VttTools.Identity.Storage;

public interface IUserStorage {
    Task<User?> FindByIdAsync(Guid id, CancellationToken ct = default);
    Task<User?> FindByEmailAsync(string email, CancellationToken ct = default);
    Task<IReadOnlyList<User>> GetAllAsync(CancellationToken ct = default);
    Task<int> GetTotalUserCountAsync(CancellationToken ct = default);
    Task<IReadOnlyDictionary<Guid, string?>> GetDisplayNamesAsync(IEnumerable<Guid> userIds, CancellationToken ct = default);
    Task<IReadOnlyList<User>> GetUsersInRoleAsync(string roleName, CancellationToken ct = default);
    Task<Result<User>> CreateAsync(User user, string password, CancellationToken ct = default);
    Task<Result> UpdateAsync(User user, CancellationToken ct = default);
    Task<Result> DeleteAsync(Guid id, CancellationToken ct = default);

    Task<Result> AddToRoleAsync(Guid userId, string roleName, CancellationToken ct = default);
    Task<Result> RemoveFromRoleAsync(Guid userId, string roleName, CancellationToken ct = default);

    Task<Result> ChangePasswordAsync(Guid userId, string currentPassword, string newPassword, CancellationToken ct = default);
    Task<Result> SetPasswordAsync(Guid userId, string password, CancellationToken ct = default);
    Task<bool> CheckPasswordAsync(Guid userId, string password, CancellationToken ct = default);

    Task<(User[] Users, int TotalCount)> SearchAsync(
        string? search = null,
        string? status = null,
        string? role = null,
        string? sortBy = null,
        string? sortOrder = null,
        Pagination? pagination = null,
        CancellationToken ct = default);
    Task<UsersSummary> GetSummaryAsync(CancellationToken ct = default);

    Task<SignInResult> ValidateCredentialsAsync(string email, string password, bool lockoutOnFailure = true, CancellationToken ct = default);
    Task RecordAccessFailedAsync(Guid userId, CancellationToken ct = default);
    Task ResetAccessFailedCountAsync(Guid userId, CancellationToken ct = default);

    Task<string?> GeneratePasswordResetTokenAsync(Guid userId, CancellationToken ct = default);
    Task<bool> VerifyPasswordResetTokenAsync(Guid userId, string token, CancellationToken ct = default);
    Task<Result> ResetPasswordWithTokenAsync(Guid userId, string token, string newPassword, CancellationToken ct = default);

    Task<string?> GenerateEmailConfirmationTokenAsync(Guid userId, CancellationToken ct = default);
    Task<Result> ConfirmEmailAsync(Guid userId, CancellationToken ct = default);
    Task<Result> ConfirmEmailWithTokenAsync(Guid userId, string token, CancellationToken ct = default);

    Task<string?> GetAuthenticatorKeyAsync(Guid userId, CancellationToken ct = default);
    Task<string?> ResetAuthenticatorKeyAsync(Guid userId, CancellationToken ct = default);
    Task<bool> VerifyTwoFactorCodeAsync(Guid userId, string code, CancellationToken ct = default);
    Task<Result> SetTwoFactorEnabledAsync(Guid userId, bool enabled, CancellationToken ct = default);
    Task<string[]?> GenerateRecoveryCodesAsync(Guid userId, int count, CancellationToken ct = default);
    Task<int> CountRecoveryCodesAsync(Guid userId, CancellationToken ct = default);
}
