using SignInResult = VttTools.Identity.Model.SignInResult;
using User = VttTools.Identity.Model.User;
using UserEntity = VttTools.Data.Identity.Entities.User;

namespace VttTools.Data.Identity;

public class UserStorage(
    ApplicationDbContext context,
    UserManager<UserEntity> userManager,
    ILogger<UserStorage> logger)
    : IUserStorage {

    public async Task<User?> FindByIdAsync(Guid id, CancellationToken ct = default) {
        var entity = await userManager.FindByIdAsync(id.ToString());
        if (entity is null)
            return null;
        var roles = await userManager.GetRolesAsync(entity);
        return entity.ToModel([.. roles]);
    }

    public async Task<User?> FindByEmailAsync(string email, CancellationToken ct = default) {
        var entity = await userManager.FindByEmailAsync(email);
        if (entity is null)
            return null;
        var roles = await userManager.GetRolesAsync(entity);
        return entity.ToModel([.. roles]);
    }

    public async Task<IReadOnlyList<User>> GetAllAsync(CancellationToken ct = default) {
        var entities = await userManager.Users.ToListAsync(ct);
        var users = new List<User>();
        foreach (var entity in entities) {
            var roles = await userManager.GetRolesAsync(entity);
            users.Add(entity.ToModel([.. roles]));
        }
        return users;
    }

    public Task<int> GetTotalUserCountAsync(CancellationToken ct = default)
        => userManager.Users.CountAsync(ct);

    public async Task<IReadOnlyDictionary<Guid, string?>> GetDisplayNamesAsync(
        IEnumerable<Guid> userIds, CancellationToken ct = default) {
        var ids = userIds.Distinct().ToList();
        return ids.Count == 0
                   ? []
                   : await userManager.Users
                                      .Where(u => ids.Contains(u.Id))
                                      .ToDictionaryAsync(u => u.Id, u => u.DisplayName ?? u.UserName, ct);
    }

    public async Task<IReadOnlyList<User>> GetUsersInRoleAsync(string roleName, CancellationToken ct = default) {
        var entities = await userManager.GetUsersInRoleAsync(roleName);
        var users = new List<User>();
        foreach (var entity in entities) {
            var roles = await userManager.GetRolesAsync(entity);
            users.Add(entity.ToModel([.. roles]));
        }
        return users;
    }

    public async Task<Result<User>> CreateAsync(User user, string password, CancellationToken ct = default) {
        var entity = user.ToEntity();
        var result = await userManager.CreateAsync(entity, password);
        if (!result.Succeeded) {
            var errors = ToErrors(result);
            logger.LogWarning("Failed to create user {Email}: {Errors}", user.Email, string.Join(", ", result.Errors.Select(e => e.Description)));
            return Result.Failure<User>(null!, errors);
        }
        var roles = await userManager.GetRolesAsync(entity);
        return entity.ToModel([.. roles]);
    }

    public async Task<Result> UpdateAsync(User user, CancellationToken ct = default) {
        var entity = await userManager.FindByIdAsync(user.Id.ToString());
        if (entity is null)
            return Result.Failure(new Error("User not found."));

        var wasLockedOut = entity is { LockoutEnabled: true, LockoutEnd: not null } &&
                           entity.LockoutEnd > DateTimeOffset.UtcNow;
        var isBeingUnlocked = wasLockedOut &&
                              (user.LockoutEnd is null || user.LockoutEnd <= DateTimeOffset.UtcNow);

        entity.UpdateFrom(user);
        var result = await userManager.UpdateAsync(entity);
        if (!result.Succeeded) {
            var errors = ToErrors(result);
            logger.LogWarning("Failed to update user {Id}: {Errors}", user.Id, string.Join(", ", result.Errors.Select(e => e.Description)));
            return Result.Failure(errors);
        }

        if (!isBeingUnlocked)
            return Result.Success();
        var resetResult = await userManager.ResetAccessFailedCountAsync(entity);

        if (!resetResult.Succeeded)
            logger.LogWarning("Failed to reset access failed count for user {Id}: {Errors}", user.Id, string.Join(", ", resetResult.Errors.Select(e => e.Description)));
        return Result.Success();
    }

    public async Task<Result> DeleteAsync(Guid id, CancellationToken ct = default) {
        var entity = await userManager.FindByIdAsync(id.ToString());
        if (entity is null)
            return Result.Failure(new Error("User not found."));
        var result = await userManager.DeleteAsync(entity);
        if (!result.Succeeded) {
            var errors = ToErrors(result);
            logger.LogWarning("Failed to delete user {Id}: {Errors}", id, string.Join(", ", result.Errors.Select(e => e.Description)));
            return Result.Failure(errors);
        }
        return Result.Success();
    }

    public async Task<Result> AddToRoleAsync(Guid userId, string roleName, CancellationToken ct = default) {
        var entity = await userManager.FindByIdAsync(userId.ToString());
        if (entity is null)
            return Result.Failure(new Error("User not found."));
        var result = await userManager.AddToRoleAsync(entity, roleName);
        if (!result.Succeeded) {
            var errors = ToErrors(result);
            logger.LogWarning("Failed to add user {Id} to role {Role}: {Errors}", userId, roleName, string.Join(", ", result.Errors.Select(e => e.Description)));
            return Result.Failure(errors);
        }
        return Result.Success();
    }

    public async Task<Result> RemoveFromRoleAsync(Guid userId, string roleName, CancellationToken ct = default) {
        var entity = await userManager.FindByIdAsync(userId.ToString());
        if (entity is null)
            return Result.Failure(new Error("User not found."));
        var result = await userManager.RemoveFromRoleAsync(entity, roleName);
        if (!result.Succeeded) {
            var errors = ToErrors(result);
            logger.LogWarning("Failed to remove user {Id} from role {Role}: {Errors}", userId, roleName, string.Join(", ", result.Errors.Select(e => e.Description)));
            return Result.Failure(errors);
        }
        return Result.Success();
    }

    public async Task<Result> ChangePasswordAsync(Guid userId, string currentPassword, string newPassword, CancellationToken ct = default) {
        var entity = await userManager.FindByIdAsync(userId.ToString());
        if (entity is null)
            return Result.Failure(new Error("User not found."));
        var result = await userManager.ChangePasswordAsync(entity, currentPassword, newPassword);
        if (!result.Succeeded) {
            var errors = ToErrors(result);
            logger.LogWarning("Failed to change password for user {Id}: {Errors}", userId, string.Join(", ", result.Errors.Select(e => e.Description)));
            return Result.Failure(errors);
        }
        return Result.Success();
    }

    public async Task<Result> SetPasswordAsync(Guid userId, string password, CancellationToken ct = default) {
        var entity = await userManager.FindByIdAsync(userId.ToString());
        if (entity is null)
            return Result.Failure(new Error("User not found."));

        if (await userManager.HasPasswordAsync(entity)) {
            var removeResult = await userManager.RemovePasswordAsync(entity);
            if (!removeResult.Succeeded) {
                var errors = ToErrors(removeResult);
                logger.LogWarning("Failed to remove password for user {Id}: {Errors}", userId, string.Join(", ", removeResult.Errors.Select(e => e.Description)));
                return Result.Failure(errors);
            }
        }

        var result = await userManager.AddPasswordAsync(entity, password);
        if (!result.Succeeded) {
            var errors = ToErrors(result);
            logger.LogWarning("Failed to set password for user {Id}: {Errors}", userId, string.Join(", ", result.Errors.Select(e => e.Description)));
            return Result.Failure(errors);
        }
        return Result.Success();
    }

    public async Task<bool> CheckPasswordAsync(Guid userId, string password, CancellationToken ct = default) {
        var entity = await userManager.FindByIdAsync(userId.ToString());
        return entity is not null && await userManager.CheckPasswordAsync(entity, password);
    }

    public async Task<(User[] Users, int TotalCount)> SearchAsync(
        string? search = null,
        string? status = null,
        string? role = null,
        string? sortBy = null,
        string? sortOrder = null,
        Pagination? pagination = null,
        CancellationToken ct = default) {
        var query = userManager.Users.AsQueryable();

        if (!string.IsNullOrWhiteSpace(search)) {
            var searchTerm = search.Trim().ToLowerInvariant();
            query = query.Where(u =>
                u.Email!.Contains(searchTerm, StringComparison.InvariantCultureIgnoreCase) ||
                u.DisplayName.Contains(searchTerm, StringComparison.InvariantCultureIgnoreCase));
        }

        if (!string.IsNullOrWhiteSpace(status)) {
            query = status.ToLowerInvariant() switch {
                "active" => query.Where(u =>
                    u.EmailConfirmed &&
                    (!u.LockoutEnabled || u.LockoutEnd == null || u.LockoutEnd <= DateTimeOffset.UtcNow)),
                "locked" => query.Where(u =>
                    u.LockoutEnabled &&
                    u.LockoutEnd != null &&
                    u.LockoutEnd > DateTimeOffset.UtcNow),
                "unconfirmed" => query.Where(u => !u.EmailConfirmed),
                _ => query,
            };
        }

        // Apply role filtering at database level BEFORE pagination
        if (!string.IsNullOrWhiteSpace(role)) {
            var userIdsWithRole = context.UserRoles
                .Join(context.Roles, ur => ur.RoleId, r => r.Id, (ur, r) => new { ur.UserId, r.Name })
                .Where(x => x.Name == role)
                .Select(x => x.UserId);
            query = query.Where(u => userIdsWithRole.Contains(u.Id));
        }

        var totalCount = await query.CountAsync(ct);

        var skip = pagination?.Index ?? 0;
        var take = pagination?.Size ?? 20;

        // Apply sorting at database level
        var sortByField = sortBy?.ToLowerInvariant() ?? "email";
        var sortOrderDir = sortOrder?.ToLowerInvariant() ?? "asc";

        query = sortByField switch {
            "displayname" => sortOrderDir == "desc"
                ? query.OrderByDescending(u => u.DisplayName)
                : query.OrderBy(u => u.DisplayName),
            _ => sortOrderDir == "desc"
                ? query.OrderByDescending(u => u.Email)
                : query.OrderBy(u => u.Email),
        };

        var entities = await query
            .Skip(skip)
            .Take(take)
            .ToListAsync(ct);

        var users = new List<User>();
        foreach (var entity in entities) {
            var roles = await userManager.GetRolesAsync(entity);
            users.Add(entity.ToModel([.. roles]));
        }

        return ([.. users], totalCount);
    }

    public async Task<UsersSummary> GetSummaryAsync(CancellationToken ct = default) {
        var totalUsers = await userManager.Users.CountAsync(ct);

        // Use a single query to count administrators instead of N+1 queries
        var totalAdministrators = await context.UserRoles
            .Join(context.Roles, ur => ur.RoleId, r => r.Id, (ur, r) => new { ur.UserId, r.Name })
            .Where(x => x.Name == nameof(RoleName.Administrator))
            .Select(x => x.UserId)
            .Distinct()
            .CountAsync(ct);

        var lockedUsers = await userManager.Users
            .Where(u => u.LockoutEnabled && u.LockoutEnd != null && u.LockoutEnd > DateTimeOffset.UtcNow)
            .CountAsync(ct);

        var unconfirmedEmails = await userManager.Users
            .Where(u => !u.EmailConfirmed)
            .CountAsync(ct);

        return new UsersSummary {
            TotalUsers = totalUsers,
            TotalAdministrators = totalAdministrators,
            LockedUsers = lockedUsers,
            UnconfirmedEmails = unconfirmedEmails,
        };
    }

    public async Task<SignInResult> ValidateCredentialsAsync(string email, string password, bool lockoutOnFailure = true, CancellationToken ct = default) {
        var entity = await userManager.FindByEmailAsync(email);
        if (entity is null)
            return new SignInResult { Succeeded = false };

        if (!entity.EmailConfirmed)
            return new SignInResult { Succeeded = false, IsNotAllowed = true };

        if (await userManager.IsLockedOutAsync(entity))
            return new SignInResult { Succeeded = false, IsLockedOut = true };

        var passwordValid = await userManager.CheckPasswordAsync(entity, password);
        if (!passwordValid) {
            if (lockoutOnFailure)
                await userManager.AccessFailedAsync(entity);
            return new SignInResult { Succeeded = false };
        }

        await userManager.ResetAccessFailedCountAsync(entity);

        if (await userManager.GetTwoFactorEnabledAsync(entity))
            return new SignInResult { Succeeded = false, RequiresTwoFactor = true };

        var roles = await userManager.GetRolesAsync(entity);
        return new SignInResult {
            Succeeded = true,
            User = entity.ToModel([.. roles]),
        };
    }

    public async Task RecordAccessFailedAsync(Guid userId, CancellationToken ct = default) {
        var entity = await userManager.FindByIdAsync(userId.ToString());
        if (entity is not null)
            await userManager.AccessFailedAsync(entity);
    }

    public async Task ResetAccessFailedCountAsync(Guid userId, CancellationToken ct = default) {
        var entity = await userManager.FindByIdAsync(userId.ToString());
        if (entity is not null)
            await userManager.ResetAccessFailedCountAsync(entity);
    }

    public async Task<string?> GeneratePasswordResetTokenAsync(Guid userId, CancellationToken ct = default) {
        var entity = await userManager.FindByIdAsync(userId.ToString());
        return entity is null ? null : await userManager.GeneratePasswordResetTokenAsync(entity);
    }

    public async Task<bool> VerifyPasswordResetTokenAsync(Guid userId, string token, CancellationToken ct = default) {
        var entity = await userManager.FindByIdAsync(userId.ToString());
        return entity is not null && await userManager.VerifyUserTokenAsync(
            entity,
            userManager.Options.Tokens.PasswordResetTokenProvider,
            "ResetPassword",
            token);
    }

    public async Task<Result> ResetPasswordWithTokenAsync(Guid userId, string token, string newPassword, CancellationToken ct = default) {
        var entity = await userManager.FindByIdAsync(userId.ToString());
        if (entity is null)
            return Result.Failure(new Error("User not found."));

        var result = await userManager.ResetPasswordAsync(entity, token, newPassword);
        if (!result.Succeeded) {
            var errors = ToErrors(result);
            logger.LogWarning("Failed to reset password for user {Id}: {Errors}", userId, string.Join(", ", result.Errors.Select(e => e.Description)));
            return Result.Failure(errors);
        }
        return Result.Success();
    }

    public async Task<string?> GenerateEmailConfirmationTokenAsync(Guid userId, CancellationToken ct = default) {
        var entity = await userManager.FindByIdAsync(userId.ToString());
        return entity is null ? null : await userManager.GenerateEmailConfirmationTokenAsync(entity);
    }

    public async Task<Result> ConfirmEmailAsync(Guid userId, CancellationToken ct = default) {
        var entity = await userManager.FindByIdAsync(userId.ToString());
        if (entity is null)
            return Result.Failure(new Error("User not found."));

        if (entity.EmailConfirmed)
            return Result.Success();

        var token = await userManager.GenerateEmailConfirmationTokenAsync(entity);
        var result = await userManager.ConfirmEmailAsync(entity, token);
        if (result.Succeeded)
            return Result.Success();
        var errors = ToErrors(result);
        logger.LogWarning("Failed to confirm email for user {Id}: {Errors}", userId, string.Join(", ", result.Errors.Select(e => e.Description)));
        return Result.Failure(errors);
    }

    public async Task<Result> ConfirmEmailWithTokenAsync(Guid userId, string token, CancellationToken ct = default) {
        var entity = await userManager.FindByIdAsync(userId.ToString());
        if (entity is null)
            return Result.Failure(new Error("User not found."));

        if (entity.EmailConfirmed)
            return Result.Success();

        var result = await userManager.ConfirmEmailAsync(entity, token);
        if (result.Succeeded)
            return Result.Success();
        var errors = ToErrors(result);
        logger.LogWarning("Failed to confirm email with token for user {Id}: {Errors}", userId, string.Join(", ", result.Errors.Select(e => e.Description)));
        return Result.Failure(errors);
    }

    public async Task<string?> GetAuthenticatorKeyAsync(Guid userId, CancellationToken ct = default) {
        var entity = await userManager.FindByIdAsync(userId.ToString());
        return entity is null ? null : await userManager.GetAuthenticatorKeyAsync(entity);
    }

    public async Task<string?> ResetAuthenticatorKeyAsync(Guid userId, CancellationToken ct = default) {
        var entity = await userManager.FindByIdAsync(userId.ToString());
        if (entity is null)
            return null;
        await userManager.ResetAuthenticatorKeyAsync(entity);
        return await userManager.GetAuthenticatorKeyAsync(entity);
    }

    public async Task<bool> VerifyTwoFactorCodeAsync(Guid userId, string code, CancellationToken ct = default) {
        var entity = await userManager.FindByIdAsync(userId.ToString());
        return entity is not null && await userManager.VerifyTwoFactorTokenAsync(entity, "Authenticator", code);
    }

    public async Task<Result> SetTwoFactorEnabledAsync(Guid userId, bool enabled, CancellationToken ct = default) {
        var entity = await userManager.FindByIdAsync(userId.ToString());
        if (entity is null)
            return Result.Failure(new Error("User not found."));

        var result = await userManager.SetTwoFactorEnabledAsync(entity, enabled);
        if (!result.Succeeded) {
            var errors = ToErrors(result);
            logger.LogWarning("Failed to set two-factor enabled for user {Id}: {Errors}", userId, string.Join(", ", result.Errors.Select(e => e.Description)));
            return Result.Failure(errors);
        }
        return Result.Success();
    }

    public async Task<string[]?> GenerateRecoveryCodesAsync(Guid userId, int count, CancellationToken ct = default) {
        var entity = await userManager.FindByIdAsync(userId.ToString());
        if (entity is null)
            return null;
        var codes = await userManager.GenerateNewTwoFactorRecoveryCodesAsync(entity, count);
        return codes?.ToArray();
    }

    public async Task<int> CountRecoveryCodesAsync(Guid userId, CancellationToken ct = default) {
        var entity = await userManager.FindByIdAsync(userId.ToString());
        return entity is null ? 0 : await userManager.CountRecoveryCodesAsync(entity);
    }

    private static Error[] ToErrors(IdentityResult result)
        => [.. result.Errors.Select(e => new Error(e.Description))];
}
