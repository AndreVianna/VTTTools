namespace VttTools.Data.Builders;

internal static class IdentitySchemaBuilder {
    public static void ConfigureModel(ModelBuilder builder) {
        builder.Entity<User>().ToTable("Users");
        builder.Entity<User>()
            .HasOne<Resource>()
            .WithMany()
            .HasForeignKey(u => u.AvatarResourceId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.Entity<UserClaim>().ToTable("UserClaims");
        builder.Entity<UserLogin>().ToTable("UserLogins");
        builder.Entity<UserToken>().ToTable("UserTokens");
        builder.Entity<Role>().ToTable("Roles");
        builder.Entity<RoleClaim>().ToTable("RoleClaims");
        builder.Entity<UserRole>().ToTable("UserRoles");
    }
    public static void SeedIdentity(ModelBuilder builder) {
        builder.Entity<Role>().HasData([
            new() {
                Id = Guid.Parse("019639ea-c7de-7e6f-b549-baf14386ad2f"),
                Name = "Administrator",
                NormalizedName = "ADMINISTRATOR",
                ConcurrencyStamp = "b62e16a3-1d3a-4ae3-8c30-9bc628231f7a",
            },
            new() {
                Id = Guid.Parse("019639ea-c7de-786f-9f95-b397ca9509df"),
                Name = "User",
                NormalizedName = "USER",
                ConcurrencyStamp = "11d8a8d1-3a54-4464-890f-5e8c71b46c0b",
            },
        ]);

        builder.Entity<User>().HasData([
            new() {
                Id = Guid.Parse("019639ea-c7de-7a01-8548-41edfccde206"),
                Name = "Master",
                DisplayName = "Master",
                UserName = "master@host.com",
                NormalizedUserName = "MASTER@HOST.COM",
                Email = "master@host.com",
                NormalizedEmail = "MASTER@HOST.COM",
                EmailConfirmed = true,
                PasswordHash = "AQAAAAIAAYagAAAAEGCIPOjKQsg/WIuLEYnhnyHOsif13MaeUlO0J2ZVkMe41HuVFCqudWtLqGMKQXNBNA==",
                SecurityStamp = "QAZB7SA3GUP4I2DQCDEDORPB5Q5ICUQG",
                ConcurrencyStamp = "54c61fbd-4b9f-4a08-a6ce-c46443f8afb8",
                PhoneNumber = null,
                PhoneNumberConfirmed = false,
                TwoFactorEnabled = false,
                LockoutEnd = null,
                LockoutEnabled = false,
                AccessFailedCount = 0,
            },
        ]);

        builder.Entity<UserRole>().HasData([
            new() {
                UserId = Guid.Parse("019639ea-c7de-7a01-8548-41edfccde206"),
                RoleId = Guid.Parse("019639ea-c7de-7e6f-b549-baf14386ad2f"),
            },
        ]);
    }
}