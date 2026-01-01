using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Logging;

using DotNetToolbox;
using DotNetToolbox.Results;

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
        entity.UpdateFrom(user);
        var result = await userManager.UpdateAsync(entity);
        if (!result.Succeeded) {
            var errors = ToErrors(result);
            logger.LogWarning("Failed to update user {Id}: {Errors}", user.Id, string.Join(", ", result.Errors.Select(e => e.Description)));
            return Result.Failure(errors);
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

    private static Error[] ToErrors(IdentityResult result)
        => [.. result.Errors.Select(e => new Error(e.Description))];
}
