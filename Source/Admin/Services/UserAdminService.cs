namespace VttTools.Admin.Services;

public sealed class UserAdminService(
    UserManager<User> userManager,
    RoleManager<Role> roleManager,
    IAuditLogService auditLogService,
    ILogger<UserAdminService> logger) : IUserAdminService {

    public async Task<UserSearchResponse> SearchUsersAsync(UserSearchRequest request, CancellationToken ct = default) {
        try {
            var query = userManager.Users.AsQueryable();

            if (!string.IsNullOrWhiteSpace(request.Search)) {
                var searchTerm = request.Search.Trim().ToLowerInvariant();
                query = query.Where(u =>
                    u.Email.Contains(searchTerm, StringComparison.InvariantCultureIgnoreCase) ||
                    u.DisplayName.Contains(searchTerm, StringComparison.InvariantCultureIgnoreCase));
            }

            if (!string.IsNullOrWhiteSpace(request.Status)) {
                query = request.Status.ToLowerInvariant() switch {
                    "active" => query.Where(u =>
                        u.EmailConfirmed &&
                        (!u.LockoutEnabled || u.LockoutEnd == null || u.LockoutEnd <= DateTimeOffset.UtcNow)),
                    "locked" => query.Where(u =>
                        u.LockoutEnabled &&
                        u.LockoutEnd != null &&
                        u.LockoutEnd > DateTimeOffset.UtcNow),
                    "unconfirmed" => query.Where(u => !u.EmailConfirmed),
                    _ => query
                };
            }

            var totalCount = await query.CountAsync(ct);

            var users = await query
                .Skip(request.Skip)
                .Take(request.Take + 1)
                .ToListAsync(ct);

            var userListItems = new List<UserListItem>();

            foreach (var user in users) {
                var roles = await userManager.GetRolesAsync(user);
                var isLockedOut = user.LockoutEnabled &&
                                  user.LockoutEnd.HasValue &&
                                  user.LockoutEnd.Value > DateTimeOffset.UtcNow;

                userListItems.Add(new UserListItem {
                    Id = user.Id,
                    Email = user.Email,
                    Name = user.Name,
                    DisplayName = user.DisplayName,
                    EmailConfirmed = user.EmailConfirmed,
                    LockoutEnabled = user.LockoutEnabled,
                    IsLockedOut = isLockedOut,
                    TwoFactorEnabled = user.TwoFactorEnabled,
                    Roles = roles.ToList().AsReadOnly()
                });
            }

            if (!string.IsNullOrWhiteSpace(request.Role)) {
                var usersWithRole = new List<UserListItem>();
                foreach (var userItem in userListItems) {
                    if (userItem.Roles.Any(r => r.Equals(request.Role, StringComparison.OrdinalIgnoreCase))) {
                        usersWithRole.Add(userItem);
                    }
                }
                userListItems = usersWithRole;
                totalCount = userListItems.Count;
            }

            var sortBy = request.SortBy?.ToLowerInvariant() ?? "email";
            var sortOrder = request.SortOrder?.ToLowerInvariant() ?? "asc";

            userListItems = sortBy switch {
                "displayname" => sortOrder == "desc"
                    ? [.. userListItems.OrderByDescending(u => u.DisplayName)]
                    : [.. userListItems.OrderBy(u => u.DisplayName)],
                _ => sortOrder == "desc"
                    ? [.. userListItems.OrderByDescending(u => u.Email)]
                    : [.. userListItems.OrderBy(u => u.Email)]
            };

            var hasMore = userListItems.Count > request.Take;
            if (hasMore) {
                userListItems = [.. userListItems.Take(request.Take)];
            }

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
            var user = await userManager.FindByIdAsync(userId.ToString()) ?? throw new UserNotFoundException(userId);

            var roles = await userManager.GetRolesAsync(user);
            var isLockedOut = user.LockoutEnabled &&
                              user.LockoutEnd.HasValue &&
                              user.LockoutEnd.Value > DateTimeOffset.UtcNow;

            var createdDate = await auditLogService.GetUserCreatedDateAsync(userId, ct);
            var lastLoginDate = await auditLogService.GetUserLastLoginDateAsync(userId, ct);
            var lastModifiedDate = await auditLogService.GetUserLastModifiedDateAsync(userId, ct);

            logger.LogInformation("Retrieved user details for user {UserId}", userId);

            return new UserDetailResponse {
                Id = user.Id,
                Email = user.Email,
                DisplayName = user.DisplayName,
                PhoneNumber = user.PhoneNumber,
                EmailConfirmed = user.EmailConfirmed,
                PhoneNumberConfirmed = user.PhoneNumberConfirmed,
                TwoFactorEnabled = user.TwoFactorEnabled,
                LockoutEnabled = user.LockoutEnabled,
                LockoutEnd = user.LockoutEnd,
                IsLockedOut = isLockedOut,
                AccessFailedCount = user.AccessFailedCount,
                Roles = roles.ToList().AsReadOnly(),
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
            var user = (await userManager.FindByIdAsync(userId.ToString()))
                ?? throw new UserNotFoundException(userId);

            var roles = await userManager.GetRolesAsync(user);
            if (roles.Contains("Administrator")) {
                var adminCount = await CountAdministratorsAsync(ct);
                if (adminCount <= 1) {
                    throw new LastAdminException();
                }
            }

            var lockoutEnd = DateTimeOffset.UtcNow.AddYears(100);

            var enableResult = await userManager.SetLockoutEnabledAsync(user, true);
            if (!enableResult.Succeeded) {
                logger.LogError("Failed to enable lockout for user {UserId}: {Errors}",
                    userId, string.Join(", ", enableResult.Errors.Select(e => e.Description)));
                return new LockUserResponse {
                    Success = false,
                    LockedUntil = null
                };
            }

            var lockResult = await userManager.SetLockoutEndDateAsync(user, lockoutEnd);
            if (!lockResult.Succeeded) {
                logger.LogError("Failed to set lockout end date for user {UserId}: {Errors}",
                    userId, string.Join(", ", lockResult.Errors.Select(e => e.Description)));
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
            var user = await userManager.FindByIdAsync(userId.ToString()) ?? throw new UserNotFoundException(userId);

            var unlockResult = await userManager.SetLockoutEndDateAsync(user, null);
            if (!unlockResult.Succeeded) {
                logger.LogError("Failed to unlock user {UserId}: {Errors}",
                    userId, string.Join(", ", unlockResult.Errors.Select(e => e.Description)));
                return new UnlockUserResponse { Success = false };
            }

            var resetResult = await userManager.ResetAccessFailedCountAsync(user);
            if (!resetResult.Succeeded) {
                logger.LogError("Failed to reset access failed count for user {UserId}: {Errors}",
                    userId, string.Join(", ", resetResult.Errors.Select(e => e.Description)));
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
            var user = await userManager.FindByIdAsync(userId.ToString()) ?? throw new UserNotFoundException(userId);

            if (user.EmailConfirmed) {
                logger.LogInformation("User {UserId} ({Email}) email already confirmed", userId, user.Email);
                return new VerifyEmailResponse {
                    Success = true,
                    EmailConfirmed = true
                };
            }

            var token = await userManager.GenerateEmailConfirmationTokenAsync(user);
            var result = await userManager.ConfirmEmailAsync(user, token);

            if (!result.Succeeded) {
                logger.LogError("Failed to verify email for user {UserId}: {Errors}",
                    userId, string.Join(", ", result.Errors.Select(e => e.Description)));
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
            var user = await userManager.FindByIdAsync(userId.ToString());
            if (user is null) {
                return new PasswordResetResponse {
                    Success = true,
                    EmailSent = true
                };
            }

            var token = await userManager.GeneratePasswordResetTokenAsync(user);

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

            var user = await userManager.FindByIdAsync(userId.ToString()) ?? throw new UserNotFoundException(userId);

            var roleExists = await roleManager.RoleExistsAsync(roleName);
            if (!roleExists) {
                throw new ArgumentException($"IsDefault '{roleName}' does not exist.", nameof(roleName));
            }

            var result = await userManager.AddToRoleAsync(user, roleName);
            if (!result.Succeeded) {
                logger.LogError("Failed to assign role {RoleName} to user {UserId}: {Errors}",
                    roleName, userId, string.Join(", ", result.Errors.Select(e => e.Description)));
                return new AssignRoleResponse {
                    Success = false,
                    Roles = []
                };
            }

            var updatedRoles = await userManager.GetRolesAsync(user);

            logger.LogInformation(
                "IsDefault {RoleName} assigned to user {UserId} ({Email}) by admin {AdminUserId}",
                roleName, userId, user.Email, adminUserId);

            return new AssignRoleResponse {
                Success = true,
                Roles = updatedRoles.ToList().AsReadOnly()
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

            var user = await userManager.FindByIdAsync(userId.ToString()) ?? throw new UserNotFoundException(userId);

            if (roleName.Equals("Administrator", StringComparison.OrdinalIgnoreCase)) {
                var adminCount = await CountAdministratorsAsync(ct);
                var userRoles = await userManager.GetRolesAsync(user);
                if (userRoles.Contains("Administrator") && adminCount <= 1) {
                    throw new LastAdminException();
                }
            }

            var result = await userManager.RemoveFromRoleAsync(user, roleName);
            if (!result.Succeeded) {
                logger.LogError("Failed to remove role {RoleName} from user {UserId}: {Errors}",
                    roleName, userId, string.Join(", ", result.Errors.Select(e => e.Description)));
                return new RemoveRoleResponse {
                    Success = false,
                    Roles = []
                };
            }

            var updatedRoles = await userManager.GetRolesAsync(user);

            logger.LogInformation(
                "IsDefault {RoleName} removed from user {UserId} ({Email}) by admin {AdminUserId}",
                roleName, userId, user.Email, adminUserId);

            return new RemoveRoleResponse {
                Success = true,
                Roles = updatedRoles.ToList().AsReadOnly()
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

            var (logs, totalCount) = await auditLogService.QueryAsync(
                userId: userId,
                skip: skip,
                take: pageSize,
                ct: ct);

            var auditLogSummaries = logs.Select(log => new AuditLogSummary {
                Id = log.Id,
                Timestamp = log.Timestamp,
                Action = log.Action,
                EntityType = log.EntityType ?? "Unknown",
                EntityId = string.IsNullOrEmpty(log.EntityId) ? null : Guid.Parse(log.EntityId),
                Result = log.Result,
                IpAddress = log.IpAddress,
                DurationInMilliseconds = log.DurationInMilliseconds
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
            var totalUsers = await userManager.Users.CountAsync(ct);

            const string adminRoleName = "Administrator";
            var adminRole = await roleManager.FindByNameAsync(adminRoleName);
            var totalAdministrators = 0;

            if (adminRole is not null) {
                var allUsers = await userManager.Users.ToListAsync(ct);
                foreach (var user in allUsers) {
                    var roles = await userManager.GetRolesAsync(user);
                    if (roles.Contains(adminRoleName)) {
                        totalAdministrators++;
                    }
                }
            }

            var lockedUsers = await userManager.Users
                .Where(u => u.LockoutEnabled && u.LockoutEnd != null && u.LockoutEnd > DateTimeOffset.UtcNow)
                .CountAsync(ct);

            var unconfirmedEmails = await userManager.Users
                .Where(u => !u.EmailConfirmed)
                .CountAsync(ct);

            logger.LogInformation(
                "User stats retrieved: Total={Total}, Admins={Admins}, Locked={Locked}, Unconfirmed={Unconfirmed}",
                totalUsers, totalAdministrators, lockedUsers, unconfirmedEmails);

            return new UserStatsResponse {
                TotalUsers = totalUsers,
                TotalAdministrators = totalAdministrators,
                LockedUsers = lockedUsers,
                UnconfirmedEmails = unconfirmedEmails
            };
        }
        catch (Exception ex) {
            logger.LogError(ex, "Error retrieving user statistics");
            throw;
        }
    }

    private async Task<int> CountAdministratorsAsync(CancellationToken ct = default) {
        const string adminRoleName = "Administrator";
        var adminRole = await roleManager.FindByNameAsync(adminRoleName);
        if (adminRole is null) {
            return 0;
        }

        var allUsers = await userManager.Users.ToListAsync(ct);
        var adminCount = 0;

        foreach (var user in allUsers) {
            var roles = await userManager.GetRolesAsync(user);
            if (roles.Contains(adminRoleName)) {
                adminCount++;
            }
        }

        return adminCount;
    }
}
