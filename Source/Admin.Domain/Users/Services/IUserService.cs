namespace VttTools.Admin.Users.Services;

public interface IUserService {
    Task<UserSearchResponse> SearchAsync(UserSearchRequest request, CancellationToken ct = default);
    Task<UserDetailResponse?> GetByIdAsync(Guid userId, CancellationToken ct = default);
    Task<LockUserResponse> LockAsync(Guid userId, CancellationToken ct = default);
    Task<UnlockUserResponse> UnlockAsync(Guid userId, CancellationToken ct = default);
    Task<VerifyEmailResponse> VerifyEmailAsync(Guid userId, CancellationToken ct = default);
    Task<PasswordResetResponse> SendPasswordResetAsync(Guid userId, CancellationToken ct = default);
    Task<AssignRoleResponse> AssignRoleAsync(Guid userId, string roleName, Guid adminUserId, CancellationToken ct = default);
    Task<RemoveRoleResponse> RevokeRoleAsync(Guid userId, string roleName, Guid adminUserId, CancellationToken ct = default);
    Task<AuditTrailResponse> GetAuditTrailAsync(Guid userId, int page, int pageSize, CancellationToken ct = default);
    Task<UserStatsResponse> GetSummaryAsync(CancellationToken ct = default);
}