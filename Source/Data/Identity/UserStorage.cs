using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

using DotNetToolbox;
using DotNetToolbox.Results;

using VttTools.Common.Model;
using VttTools.Identity.Model;
using VttTools.Identity.Storage;

using User = VttTools.Identity.Model.User;
using UserEntity = VttTools.Data.Identity.Entities.User;

namespace VttTools.Data.Identity;

public class UserStorage(
    UserManager<UserEntity> userManager,
    ILogger<UserStorage> logger)
    : IUserStorage {

    public async Task<User?> FindByIdAsync(Guid id, CancellationToken ct = default) {
        var entity = await userManager.FindByIdAsync(id.ToString());
        if (entity is null) return null;
        var roles = await userManager.GetRolesAsync(entity);
        return entity.ToModel(roles.ToList());
    }

    public async Task<User?> FindByEmailAsync(string email, CancellationToken ct = default) {
        var entity = await userManager.FindByEmailAsync(email);
        if (entity is null) return null;
        var roles = await userManager.GetRolesAsync(entity);
        return entity.ToModel(roles.ToList());
    }

    public async Task<IReadOnlyList<User>> GetAllAsync(CancellationToken ct = default) {
        var entities = userManager.Users.ToList();
        var users = new List<User>();
        foreach (var entity in entities) {
            var roles = await userManager.GetRolesAsync(entity);
            users.Add(entity.ToModel(roles.ToList())!);
        }
        return users;
    }

    public async Task<IReadOnlyList<User>> GetUsersInRoleAsync(string roleName, CancellationToken ct = default) {
        var entities = await userManager.GetUsersInRoleAsync(roleName);
        var users = new List<User>();
        foreach (var entity in entities) {
            var roles = await userManager.GetRolesAsync(entity);
            users.Add(entity.ToModel(roles.ToList())!);
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
        return entity.ToModel(roles.ToList())!;
    }

    public async Task<Result> UpdateAsync(User user, CancellationToken ct = default) {
        var entity = await userManager.FindByIdAsync(user.Id.ToString());
        if (entity is null) {
            return Result.Failure(new Error("User not found."));
        }

        // Check if lockout is being cleared (was locked, now unlocking)
        var wasLockedOut = entity.LockoutEnabled &&
                           entity.LockoutEnd is not null &&
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

        // Implicitly reset access failed count when unlocking
        if (isBeingUnlocked) {
            var resetResult = await userManager.ResetAccessFailedCountAsync(entity);
            if (!resetResult.Succeeded) {
                logger.LogWarning("Failed to reset access failed count for user {Id}: {Errors}", user.Id, string.Join(", ", resetResult.Errors.Select(e => e.Description)));
            }
        }

        return Result.Success();
    }

    public async Task<Result> DeleteAsync(Guid id, CancellationToken ct = default) {
        var entity = await userManager.FindByIdAsync(id.ToString());
        if (entity is null) {
            return Result.Failure(new Error("User not found."));
        }
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
        if (entity is null) {
            return Result.Failure(new Error("User not found."));
        }
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
        if (entity is null) {
            return Result.Failure(new Error("User not found."));
        }
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
        if (entity is null) {
            return Result.Failure(new Error("User not found."));
        }
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
        if (entity is null) {
            return Result.Failure(new Error("User not found."));
        }

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
        if (entity is null) {
            return false;
        }
        return await userManager.CheckPasswordAsync(entity, password);
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
                u.Email.Contains(searchTerm, StringComparison.InvariantCultureIgnoreCase) ||
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
                _ => query
            };
        }

        var totalCount = await query.CountAsync(ct);

        var skip = pagination?.Index ?? 0;
        var take = pagination?.Size ?? 20;

        var entities = await query
            .Skip(skip)
            .Take(take)
            .ToListAsync(ct);

        var users = new List<User>();
        foreach (var entity in entities) {
            var roles = await userManager.GetRolesAsync(entity);
            users.Add(entity.ToModel(roles.ToList())!);
        }

        if (!string.IsNullOrWhiteSpace(role)) {
            users = users
                .Where(u => u.Roles.Any(r => r.Equals(role, StringComparison.OrdinalIgnoreCase)))
                .ToList();
            totalCount = users.Count;
        }

        var sortByField = sortBy?.ToLowerInvariant() ?? "email";
        var sortOrderDir = sortOrder?.ToLowerInvariant() ?? "asc";

        users = sortByField switch {
            "displayname" => sortOrderDir == "desc"
                ? [.. users.OrderByDescending(u => u.DisplayName)]
                : [.. users.OrderBy(u => u.DisplayName)],
            _ => sortOrderDir == "desc"
                ? [.. users.OrderByDescending(u => u.Email)]
                : [.. users.OrderBy(u => u.Email)]
        };

        return ([.. users], totalCount);
    }

    public async Task<UsersSummary> GetSummaryAsync(CancellationToken ct = default) {
        var totalUsers = await userManager.Users.CountAsync(ct);

        var allUsers = await userManager.Users.ToListAsync(ct);
        var totalAdministrators = 0;
        foreach (var user in allUsers) {
            var roles = await userManager.GetRolesAsync(user);
            if (roles.Contains(nameof(RoleName.Administrator))) {
                totalAdministrators++;
            }
        }

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
            UnconfirmedEmails = unconfirmedEmails
        };
    }

    public async Task<Result> ConfirmEmailAsync(Guid userId, CancellationToken ct = default) {
        var entity = await userManager.FindByIdAsync(userId.ToString());
        if (entity is null) {
            return Result.Failure(new Error("User not found."));
        }

        if (entity.EmailConfirmed) {
            return Result.Success();
        }

        var token = await userManager.GenerateEmailConfirmationTokenAsync(entity);
        var result = await userManager.ConfirmEmailAsync(entity, token);
        if (!result.Succeeded) {
            var errors = ToErrors(result);
            logger.LogWarning("Failed to confirm email for user {Id}: {Errors}", userId, string.Join(", ", result.Errors.Select(e => e.Description)));
            return Result.Failure(errors);
        }

        return Result.Success();
    }

    public async Task<string?> GeneratePasswordResetTokenAsync(Guid userId, CancellationToken ct = default) {
        var entity = await userManager.FindByIdAsync(userId.ToString());
        if (entity is null) {
            return null;
        }
        return await userManager.GeneratePasswordResetTokenAsync(entity);
    }

    private static Error[] ToErrors(IdentityResult result)
        => [.. result.Errors.Select(e => new Error(e.Description))];
}
