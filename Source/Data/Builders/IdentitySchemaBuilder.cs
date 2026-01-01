using Role = VttTools.Data.Identity.Entities.Role;
using RoleClaim = VttTools.Data.Identity.Entities.RoleClaim;
using User = VttTools.Data.Identity.Entities.User;
using UserClaim = VttTools.Data.Identity.Entities.UserClaim;
using UserLogin = VttTools.Data.Identity.Entities.UserLogin;
using UserRole = VttTools.Data.Identity.Entities.UserRole;
using UserToken = VttTools.Data.Identity.Entities.UserToken;

namespace VttTools.Data.Builders;

internal static class IdentitySchemaBuilder {
    public static void ConfigureModel(ModelBuilder builder) {
        builder.Entity<User>().ToTable("Users");
        builder.Entity<UserClaim>().ToTable("UserClaims");
        builder.Entity<UserLogin>().ToTable("UserLogins");
        builder.Entity<UserToken>().ToTable("UserTokens");
        builder.Entity<Role>().ToTable("Roles");
        builder.Entity<RoleClaim>().ToTable("RoleClaims");
        builder.Entity<UserRole>().ToTable("UserRoles");
    }
}