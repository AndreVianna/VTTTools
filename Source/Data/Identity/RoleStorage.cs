using Role = VttTools.Identity.Model.Role;
using RoleEntity = VttTools.Data.Identity.Entities.Role;

namespace VttTools.Data.Identity;

public class RoleStorage(
    RoleManager<RoleEntity> roleManager,
    ILogger<RoleStorage> logger)
    : IRoleStorage {

    public async Task<Role?> FindByIdAsync(Guid id, CancellationToken ct = default) {
        var entity = await roleManager.FindByIdAsync(id.ToString());
        if (entity is null)
            return null;
        var claims = await roleManager.GetClaimsAsync(entity);
        return entity.ToModel([.. claims.Select(c => c.Value)]);
    }

    public async Task<Role?> FindByNameAsync(string name, CancellationToken ct = default) {
        var entity = await roleManager.FindByNameAsync(name);
        if (entity is null)
            return null;
        var claims = await roleManager.GetClaimsAsync(entity);
        return entity.ToModel([.. claims.Select(c => c.Value)]);
    }

    public async Task<IReadOnlyList<Role>> GetAllAsync(CancellationToken ct = default) {
        var entities = roleManager.Roles.ToList();
        var roles = new List<Role>();
        foreach (var entity in entities) {
            var claims = await roleManager.GetClaimsAsync(entity);
            roles.Add(entity.ToModel([.. claims.Select(c => c.Value)]));
        }
        return roles;
    }

    public async Task<Result<Role>> CreateAsync(Role role, CancellationToken ct = default) {
        var entity = role.ToEntity();
        var result = await roleManager.CreateAsync(entity);
        if (result.Succeeded)
            return entity.ToModel();
        var errors = ToErrors(result);
        logger.LogWarning("Failed to create role {Name}: {Errors}", role.Name, string.Join(", ", result.Errors.Select(e => e.Description)));
        return Result.Failure<Role>(null!, errors);
    }

    public async Task<Result> UpdateAsync(Role role, CancellationToken ct = default) {
        var entity = await roleManager.FindByIdAsync(role.Id.ToString());
        if (entity is null)
            return Result.Failure(new Error("Role not found."));
        entity.UpdateFrom(role);
        var result = await roleManager.UpdateAsync(entity);
        if (result.Succeeded)
            return Result.Success();
        var errors = ToErrors(result);
        logger.LogWarning("Failed to update role {Id}: {Errors}", role.Id, string.Join(", ", result.Errors.Select(e => e.Description)));
        return Result.Failure(errors);
    }

    public async Task<Result> DeleteAsync(Guid id, CancellationToken ct = default) {
        var entity = await roleManager.FindByIdAsync(id.ToString());
        if (entity is null)
            return Result.Failure(new Error("Role not found."));
        var result = await roleManager.DeleteAsync(entity);
        if (result.Succeeded)
            return Result.Success();
        var errors = ToErrors(result);
        logger.LogWarning("Failed to delete role {Id}: {Errors}", id, string.Join(", ", result.Errors.Select(e => e.Description)));
        return Result.Failure(errors);
    }

    public async Task<Result> AddClaimAsync(Guid roleId, string claim, CancellationToken ct = default) {
        var entity = await roleManager.FindByIdAsync(roleId.ToString());
        if (entity is null)
            return Result.Failure(new Error("Role not found."));
        var result = await roleManager.AddClaimAsync(entity, new Claim("Permission", claim));
        if (!result.Succeeded) {
            var errors = ToErrors(result);
            logger.LogWarning("Failed to add claim {Claim} to role {Id}: {Errors}", claim, roleId, string.Join(", ", result.Errors.Select(e => e.Description)));
            return Result.Failure(errors);
        }
        return Result.Success();
    }

    public async Task<Result> RemoveClaimAsync(Guid roleId, string claim, CancellationToken ct = default) {
        var entity = await roleManager.FindByIdAsync(roleId.ToString());
        if (entity is null)
            return Result.Failure(new Error("Role not found."));
        var result = await roleManager.RemoveClaimAsync(entity, new Claim("Permission", claim));
        if (!result.Succeeded) {
            var errors = ToErrors(result);
            logger.LogWarning("Failed to remove claim {Claim} from role {Id}: {Errors}", claim, roleId, string.Join(", ", result.Errors.Select(e => e.Description)));
            return Result.Failure(errors);
        }
        return Result.Success();
    }

    private static Error[] ToErrors(IdentityResult result)
        => [.. result.Errors.Select(e => new Error(e.Description))];
}