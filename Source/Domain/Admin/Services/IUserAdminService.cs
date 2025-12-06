namespace VttTools.Domain.Admin.Services;

public interface IUserAdminService {
    /// <summary>
    /// Searches for users based on the specified criteria including filtering by role,
    /// status, registration date range, and sorting options. Uses cursor-based pagination
    /// for infinite scroll support.
    /// </summary>
    /// <param name="request">The search criteria and pagination parameters.</param>
    /// <param name="ct">Cancellation token for the operation.</param>
    /// <returns>A list of users matching the search criteria with hasMore indicator.</returns>
    /// <remarks>
    /// Note: TotalCount may be cached for performance. For large datasets (>10,000 users),
    /// exact count may be approximate.
    /// </remarks>
    Task<UserSearchResponse> SearchUsersAsync(UserSearchRequest request, CancellationToken ct = default);

    /// <summary>
    /// Retrieves detailed information about a specific user by their ID.
    /// </summary>
    /// <param name="userId">The unique identifier of the user.</param>
    /// <param name="ct">Cancellation token for the operation.</param>
    /// <returns>The user's detailed information, or null if not found.</returns>
    Task<UserDetailResponse?> GetUserByIdAsync(Guid userId, CancellationToken ct = default);

    /// <summary>
    /// Locks a user account, preventing them from logging in until unlocked.
    /// </summary>
    /// <param name="userId">The unique identifier of the user to lock.</param>
    /// <param name="ct">Cancellation token for the operation.</param>
    /// <returns>The result of the lock operation including lockout end time.</returns>
    Task<LockUserResponse> LockUserAsync(Guid userId, CancellationToken ct = default);

    /// <summary>
    /// Unlocks a previously locked user account, allowing them to log in.
    /// </summary>
    /// <param name="userId">The unique identifier of the user to unlock.</param>
    /// <param name="ct">Cancellation token for the operation.</param>
    /// <returns>The result of the unlock operation.</returns>
    Task<UnlockUserResponse> UnlockUserAsync(Guid userId, CancellationToken ct = default);

    /// <summary>
    /// Manually verifies a user's email address without requiring them to click a confirmation link.
    /// </summary>
    /// <param name="userId">The unique identifier of the user whose email to verify.</param>
    /// <param name="ct">Cancellation token for the operation.</param>
    /// <returns>The result of the email verification operation.</returns>
    Task<VerifyEmailResponse> VerifyEmailAsync(Guid userId, CancellationToken ct = default);

    /// <summary>
    /// Sends a password reset email to the specified user.
    /// </summary>
    /// <param name="userId">The unique identifier of the user who needs a password reset.</param>
    /// <param name="ct">Cancellation token for the operation.</param>
    /// <returns>The result of the password reset email operation.</returns>
    Task<PasswordResetResponse> SendPasswordResetAsync(Guid userId, CancellationToken ct = default);

    /// <summary>
    /// Assigns a role to a user, granting them the associated permissions.
    /// </summary>
    /// <param name="userId">The unique identifier of the user to assign the role to.</param>
    /// <param name="roleName">The name of the role to assign.</param>
    /// <param name="adminUserId">The unique identifier of the administrator performing the operation.</param>
    /// <param name="ct">Cancellation token for the operation.</param>
    /// <returns>The result of the role assignment including the user's updated role list.</returns>
    /// <exception cref="InvalidOperationException">Thrown when admin attempts to modify their own roles.</exception>
    /// <exception cref="ArgumentException">Thrown when role name is invalid or doesn't exist.</exception>
    Task<AssignRoleResponse> AssignRoleAsync(Guid userId, string roleName, Guid adminUserId, CancellationToken ct = default);

    /// <summary>
    /// Removes a role from a user, revoking the associated permissions.
    /// </summary>
    /// <param name="userId">The unique identifier of the user to remove the role from.</param>
    /// <param name="roleName">The name of the role to remove.</param>
    /// <param name="adminUserId">The unique identifier of the administrator performing the operation.</param>
    /// <param name="ct">Cancellation token for the operation.</param>
    /// <returns>The result of the role removal including the user's updated role list.</returns>
    /// <exception cref="InvalidOperationException">Thrown when admin attempts to modify their own roles or when attempting to remove the last Administrator role.</exception>
    Task<RemoveRoleResponse> RemoveRoleAsync(Guid userId, string roleName, Guid adminUserId, CancellationToken ct = default);

    /// <summary>
    /// Retrieves the audit trail for a specific user, showing all actions performed by or on the user.
    /// </summary>
    /// <param name="userId">The unique identifier of the user whose audit trail to retrieve.</param>
    /// <param name="page">The page number to retrieve (1-based).</param>
    /// <param name="pageSize">The number of items per page.</param>
    /// <param name="ct">Cancellation token for the operation.</param>
    /// <returns>A paginated list of audit log entries for the user.</returns>
    Task<AuditTrailResponse> GetUserAuditTrailAsync(Guid userId, int page, int pageSize, CancellationToken ct = default);

    /// <summary>
    /// Retrieves aggregate statistics about users in the system, including counts of total users,
    /// administrators, locked accounts, and unconfirmed emails.
    /// </summary>
    /// <param name="ct">Cancellation token for the operation.</param>
    /// <returns>Aggregate user statistics.</returns>
    Task<UserStatsResponse> GetUserStatsAsync(CancellationToken ct = default);
}