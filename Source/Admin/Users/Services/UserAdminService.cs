using VttTools.Common.Model;
using VttTools.Identity.Model;
using VttTools.Identity.Storage;

namespace VttTools.Admin.Users.Services;

public sealed class UserAdminService(
    IUserStorage userStorage,
    IRoleStorage roleStorage,
    IAuditLogService auditLogService,
    ILogger<UserAdminService> logger) : IUserAdminService {

    public async Task<UserSearchResponse> SearchUsersAsync(UserSearchRequest request, CancellationToken ct = default) {
        try {
            var pagination = new Pagination(request.Skip, request.Take);

            (var users, var totalCount) = await userStorage.SearchAsync(
                search: request.Search,
                status: request.Status,
                role: request.Role,
                sortBy: request.SortBy,
                sortOrder: request.SortOrder,
                pagination: pagination,
                ct: ct);

            var userListItems = users.Select(user => new UserListItem {
                Id = user.Id,
                Email = user.Email,
                Name = user.Name,
                DisplayName = user.DisplayName,
                EmailConfirmed = user.EmailConfirmed,
                LockoutEnabled = user.LockoutEnabled,
                IsLockedOut = user is { LockoutEnabled: true, LockoutEnd: not null } &&
                              user.LockoutEnd.Value > DateTimeOffset.UtcNow,
                TwoFactorEnabled = user.TwoFactorEnabled,
                Roles = user.Roles.ToList().AsReadOnly()
            }).ToList();

            var hasMore = request.Skip + users.Length < totalCount;

            logger.LogInformation(
                "User search completed: {UserCount} users found (Skip: {Skip}, Take: {Take}, Total: {Total})",
                userListItems.Count, request.Skip, request.Take, totalCount);

            return new UserSearchResponse {
                Users = userListItems.AsReadOnly(),
                TotalCount = totalCount,
                HasMore = hasMore
            };
        }
        catch (Exception ex) {
            logger.LogError(ex, "Error searching users");
            throw;
        }
    }

    public async Task<UserDetailResponse?> GetUserByIdAsync(Guid userId, CancellationToken ct = default) {
        try {
            var user = await userStorage.FindByIdAsync(userId, ct) ?? throw new UserNotFoundException(userId);

            var isLockedOut = user is { LockoutEnabled: true, LockoutEnd: not null } &&
                              user.LockoutEnd.Value > DateTimeOffset.UtcNow;

            var createdDate = await auditLogService.GetUserCreatedDateAsync(userId, ct);
            var lastLoginDate = await auditLogService.GetUserLastLoginDateAsync(userId, ct);
            var lastModifiedDate = await auditLogService.GetUserLastModifiedDateAsync(userId, ct);

            logger.LogInformation("Retrieved user details for user {UserId}", userId);

            return new UserDetailResponse {
                Id = user.Id,
                Email = user.Email,
                DisplayName = user.DisplayName,
                PhoneNumber = null,
                EmailConfirmed = user.EmailConfirmed,
                PhoneNumberConfirmed = false,
                TwoFactorEnabled = user.TwoFactorEnabled,
                LockoutEnabled = user.LockoutEnabled,
                LockoutEnd = user.LockoutEnd,
                IsLockedOut = isLockedOut,
                AccessFailedCount = 0,
                Roles = user.Roles.ToList().AsReadOnly(),
                CreatedDate = createdDate,
                LastLoginDate = lastLoginDate,
                LastModifiedDate = lastModifiedDate
            };
        }
        catch (UserNotFoundException) {
            throw;
        }
        catch (Exception ex) {
            logger.LogError(ex, "Error retrieving user {UserId}", userId);
            throw;
        }
    }

    public async Task<LockUserResponse> LockUserAsync(Guid userId, CancellationToken ct = default) {
        try {
            var user = await userStorage.FindByIdAsync(userId, ct)
                ?? throw new UserNotFoundException(userId);

            if (user.Roles.Contains("Administrator")) {
                var adminCount = await CountAdministratorsAsync(ct);
                if (adminCount <= 1) {
                    throw new LastAdminException();
                }
            }

            var lockoutEnd = DateTimeOffset.UtcNow.AddYears(100);
            var lockedUser = user with { LockoutEnabled = true, LockoutEnd = lockoutEnd };

            var result = await userStorage.UpdateAsync(lockedUser, ct);
            if (!result.IsSuccessful) {
                logger.LogError("Failed to lock user {UserId}", userId);
                return new LockUserResponse {
                    Success = false,
                    LockedUntil = null
                };
            }

            logger.LogInformation("User {UserId} ({Email}) has been locked", userId, user.Email);

            return new LockUserResponse {
                Success = true,
                LockedUntil = lockoutEnd
            };
        }
        catch (UserNotFoundException) {
            throw;
        }
        catch (LastAdminException) {
            throw;
        }
        catch (Exception ex) {
            logger.LogError(ex, "Error locking user {UserId}", userId);
            throw;
        }
    }

    public async Task<UnlockUserResponse> UnlockUserAsync(Guid userId, CancellationToken ct = default) {
        try {
            var user = await userStorage.FindByIdAsync(userId, ct) ?? throw new UserNotFoundException(userId);

            // Clearing LockoutEnd will trigger implicit access failed count reset in storage
            var unlockedUser = user with { LockoutEnd = null };

            var result = await userStorage.UpdateAsync(unlockedUser, ct);
            if (!result.IsSuccessful) {
                logger.LogError("Failed to unlock user {UserId}", userId);
                return new UnlockUserResponse { Success = false };
            }

            logger.LogInformation("User {UserId} ({Email}) has been unlocked", userId, user.Email);

            return new UnlockUserResponse { Success = true };
        }
        catch (UserNotFoundException) {
            throw;
        }
        catch (Exception ex) {
            logger.LogError(ex, "Error unlocking user {UserId}", userId);
            throw;
        }
    }

    public async Task<VerifyEmailResponse> VerifyEmailAsync(Guid userId, CancellationToken ct = default) {
        try {
            var user = await userStorage.FindByIdAsync(userId, ct) ?? throw new UserNotFoundException(userId);

            if (user.EmailConfirmed) {
                logger.LogInformation("User {UserId} ({Email}) email already confirmed", userId, user.Email);
                return new VerifyEmailResponse {
                    Success = true,
                    EmailConfirmed = true
                };
            }

            var result = await userStorage.ConfirmEmailAsync(userId, ct);

            if (!result.IsSuccessful) {
                logger.LogError("Failed to verify email for user {UserId}", userId);
                return new VerifyEmailResponse {
                    Success = false,
                    EmailConfirmed = false
                };
            }

            logger.LogInformation("Email verified for user {UserId} ({Email})", userId, user.Email);

            return new VerifyEmailResponse {
                Success = true,
                EmailConfirmed = true
            };
        }
        catch (UserNotFoundException) {
            throw;
        }
        catch (Exception ex) {
            logger.LogError(ex, "Error verifying email for user {UserId}", userId);
            throw;
        }
    }

    public async Task<PasswordResetResponse> SendPasswordResetAsync(Guid userId, CancellationToken ct = default) {
        try {
            var user = await userStorage.FindByIdAsync(userId, ct);
            if (user is null) {
                return new PasswordResetResponse {
                    Success = true,
                    EmailSent = true
                };
            }

            var token = await userStorage.GeneratePasswordResetTokenAsync(userId, ct);

            logger.LogInformation("Password reset token generated for user {UserId} ({Email})", userId, user.Email);

            return new PasswordResetResponse {
                Success = true,
                EmailSent = true
            };
        }
        catch (Exception ex) {
            logger.LogError(ex, "Error generating password reset for user {UserId}", userId);
            throw;
        }
    }

    public async Task<AssignRoleResponse> AssignRoleAsync(
        Guid userId,
        string roleName,
        Guid adminUserId,
        CancellationToken ct = default) {
        try {
            if (userId == adminUserId) {
                throw new CannotModifySelfException();
            }

            var user = await userStorage.FindByIdAsync(userId, ct) ?? throw new UserNotFoundException(userId);

            var role = await roleStorage.FindByNameAsync(roleName, ct);
            if (role is null) {
                throw new ArgumentException($"Role '{roleName}' does not exist.", nameof(roleName));
            }

            var result = await userStorage.AddToRoleAsync(userId, roleName, ct);
            if (!result.IsSuccessful) {
                logger.LogError("Failed to assign role {RoleName} to user {UserId}", roleName, userId);
                return new AssignRoleResponse {
                    Success = false,
                    Roles = []
                };
            }

            var updatedUser = await userStorage.FindByIdAsync(userId, ct);

            logger.LogInformation(
                "Role {RoleName} assigned to user {UserId} ({Email}) by admin {AdminUserId}",
                roleName, userId, user.Email, adminUserId);

            return new AssignRoleResponse {
                Success = true,
                Roles = updatedUser?.Roles.ToList().AsReadOnly() ?? []
            };
        }
        catch (CannotModifySelfException) {
            throw;
        }
        catch (UserNotFoundException) {
            throw;
        }
        catch (ArgumentException) {
            throw;
        }
        catch (Exception ex) {
            logger.LogError(ex, "Error assigning role {RoleName} to user {UserId}", roleName, userId);
            throw;
        }
    }

    public async Task<RemoveRoleResponse> RemoveRoleAsync(
        Guid userId,
        string roleName,
        Guid adminUserId,
        CancellationToken ct = default) {
        try {
            if (userId == adminUserId) {
                throw new CannotModifySelfException();
            }

            var user = await userStorage.FindByIdAsync(userId, ct) ?? throw new UserNotFoundException(userId);

            if (roleName.Equals("Administrator", StringComparison.OrdinalIgnoreCase)) {
                var adminCount = await CountAdministratorsAsync(ct);
                if (user.Roles.Contains("Administrator") && adminCount <= 1) {
                    throw new LastAdminException();
                }
            }

            var result = await userStorage.RemoveFromRoleAsync(userId, roleName, ct);
            if (!result.IsSuccessful) {
                logger.LogError("Failed to remove role {RoleName} from user {UserId}", roleName, userId);
                return new RemoveRoleResponse {
                    Success = false,
                    Roles = []
                };
            }

            var updatedUser = await userStorage.FindByIdAsync(userId, ct);

            logger.LogInformation(
                "Role {RoleName} removed from user {UserId} ({Email}) by admin {AdminUserId}",
                roleName, userId, user.Email, adminUserId);

            return new RemoveRoleResponse {
                Success = true,
                Roles = updatedUser?.Roles.ToList().AsReadOnly() ?? []
            };
        }
        catch (CannotModifySelfException) {
            throw;
        }
        catch (UserNotFoundException) {
            throw;
        }
        catch (LastAdminException) {
            throw;
        }
        catch (Exception ex) {
            logger.LogError(ex, "Error removing role {RoleName} from user {UserId}", roleName, userId);
            throw;
        }
    }

    public async Task<AuditTrailResponse> GetUserAuditTrailAsync(
        Guid userId,
        int page,
        int pageSize,
        CancellationToken ct = default) {
        try {
            var skip = (page - 1) * pageSize;

            (var logs, var totalCount) = await auditLogService.QueryAsync(
                                                                          userId: userId,
                                                                          skip: skip,
                                                                          take: pageSize,
                                                                          ct: ct);

            var auditLogSummaries = logs.Select(log => new AuditLogSummary {
                Id = log.Id,
                Timestamp = log.Timestamp,
                Action = log.Action,
                EntityType = log.EntityType,
                EntityId = string.IsNullOrEmpty(log.EntityId) ? null : Guid.Parse(log.EntityId),
                ErrorMessage = log.ErrorMessage,
                Payload = log.Payload,
            }).ToList();

            logger.LogInformation(
                "Retrieved {Count} audit log entries for user {UserId} (Page: {Page}, PageSize: {PageSize})",
                auditLogSummaries.Count, userId, page, pageSize);

            return new AuditTrailResponse {
                Logs = auditLogSummaries.AsReadOnly(),
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize
            };
        }
        catch (Exception ex) {
            logger.LogError(ex, "Error retrieving audit trail for user {UserId}", userId);
            throw;
        }
    }

    public async Task<UserStatsResponse> GetUserStatsAsync(CancellationToken ct = default) {
        try {
            var summary = await userStorage.GetSummaryAsync(ct);

            logger.LogInformation(
                "User stats retrieved: Total={Total}, Admins={Admins}, Locked={Locked}, Unconfirmed={Unconfirmed}",
                summary.TotalUsers, summary.TotalAdministrators, summary.LockedUsers, summary.UnconfirmedEmails);

            return new UserStatsResponse {
                TotalUsers = summary.TotalUsers,
                TotalAdministrators = summary.TotalAdministrators,
                LockedUsers = summary.LockedUsers,
                UnconfirmedEmails = summary.UnconfirmedEmails
            };
        }
        catch (Exception ex) {
            logger.LogError(ex, "Error retrieving user statistics");
            throw;
        }
    }

    private async Task<int> CountAdministratorsAsync(CancellationToken ct = default) {
        var summary = await userStorage.GetSummaryAsync(ct);
        return summary.TotalAdministrators;
    }
}
