using Role = VttTools.Identity.Model.Role;
using RoleEntity = VttTools.Data.Identity.Entities.Role;
using User = VttTools.Identity.Model.User;
using UserEntity = VttTools.Data.Identity.Entities.User;

namespace VttTools.Data.Identity;

public static class Mapper {
    [return: NotNullIfNotNull(nameof(entity))]
    public static User? ToModel(this UserEntity? entity, IReadOnlyList<string>? roles = null)
        => entity is null
           ? null
           : new User {
               Id = entity.Id,
               Email = entity.Email ?? string.Empty,
               Name = entity.Name,
               DisplayName = entity.DisplayName,
               AvatarId = entity.AvatarId,
               UnitSystem = entity.UnitSystem,
               EmailConfirmed = entity.EmailConfirmed,
               TwoFactorEnabled = entity.TwoFactorEnabled,
               LockoutEnabled = entity.LockoutEnabled,
               LockoutEnd = entity.LockoutEnd,
               HasPassword = !string.IsNullOrEmpty(entity.PasswordHash),
               Roles = roles ?? [],
           };

    [return: NotNullIfNotNull(nameof(entity))]
    public static Role? ToModel(this RoleEntity? entity, IReadOnlyList<string>? claims = null)
        => entity is null
           ? null
           : new Role {
               Id = entity.Id,
               Name = entity.Name ?? string.Empty,
               Claims = claims ?? [],
           };

    public static UserEntity ToEntity(this User model) => new() {
        Id = model.Id,
        Email = model.Email,
        UserName = model.Email,
        NormalizedEmail = model.Email.ToUpperInvariant(),
        NormalizedUserName = model.Email.ToUpperInvariant(),
        Name = model.Name,
        DisplayName = string.IsNullOrEmpty(model.DisplayName)
            ? (model.Name.Split(' ', StringSplitOptions.RemoveEmptyEntries).FirstOrDefault() ?? model.Name)
            : model.DisplayName,
        AvatarId = model.AvatarId,
        UnitSystem = model.UnitSystem,
        EmailConfirmed = model.EmailConfirmed,
        TwoFactorEnabled = model.TwoFactorEnabled,
        LockoutEnabled = model.LockoutEnabled,
        LockoutEnd = model.LockoutEnd,
    };

    public static RoleEntity ToEntity(this Role model) => new() {
        Id = model.Id,
        Name = model.Name,
        NormalizedName = model.Name.ToUpperInvariant(),
    };

    public static void UpdateFrom(this UserEntity entity, User model) {
        entity.Email = model.Email;
        entity.UserName = model.Email;
        entity.NormalizedEmail = model.Email.ToUpperInvariant();
        entity.NormalizedUserName = model.Email.ToUpperInvariant();
        entity.Name = model.Name;
        entity.DisplayName = string.IsNullOrEmpty(model.DisplayName)
            ? (model.Name.Split(' ', StringSplitOptions.RemoveEmptyEntries).FirstOrDefault() ?? model.Name)
            : model.DisplayName;
        entity.AvatarId = model.AvatarId;
        entity.UnitSystem = model.UnitSystem;
        entity.EmailConfirmed = model.EmailConfirmed;
        entity.TwoFactorEnabled = model.TwoFactorEnabled;
        entity.LockoutEnabled = model.LockoutEnabled;
        entity.LockoutEnd = model.LockoutEnd;
    }

    public static void UpdateFrom(this RoleEntity entity, Role model) {
        entity.Name = model.Name;
        entity.NormalizedName = model.Name.ToUpperInvariant();
    }
}
