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