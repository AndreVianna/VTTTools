namespace WebApi.Identity.EntityFrameworkCore.Builders;

internal static class IdentityDataContextBuilder {
    public static void ConfigureModel<TUser, TRole>(DbContext context, ModelBuilder modelBuilder)
        where TUser : UserEntity
        where TRole : RoleEntity {
        var storeOptions = context.GetService<IDbContextOptions>()
                                  .Extensions.OfType<CoreOptionsExtension>().FirstOrDefault()?
                                  .ApplicationServiceProvider?.GetService<IOptions<IdentityOptions>>()?
                                  .Value.Stores;
        var maxKeyLength = storeOptions?.MaxLengthForKeys ?? 0;
        if (maxKeyLength == 0)
            maxKeyLength = 128;
        var encryptPersonalData = storeOptions?.ProtectPersonalData ?? false;
        var converter = encryptPersonalData
                            ? new PersonalDataConverter(context.GetService<IPersonalDataProtector>())
                            : null;

        modelBuilder.Entity<TUser>(b => {
            b.ToTable("Users");
            b.Property(i => i.Id).ValueGeneratedOnAdd().SetDefaultValueGeneration();
            b.Property(e => e.Identifier).HasMaxLength(256).IsRequired();
            b.Property(e => e.Email).HasMaxLength(256);
            b.Property(e => e.PhoneNumber).HasMaxLength(32);
            b.Property(e => e.ConcurrencyStamp).HasMaxLength(36).IsConcurrencyToken();
            b.Property(e => e.TwoFactorType).HasConversion<string>().IsRequired().HasDefaultValue(TwoFactorType.Default);

            b.HasMany(r => r.Claims).WithOne().HasForeignKey(e => e.UserId).IsRequired().OnDelete(DeleteBehavior.Cascade);
            b.HasMany(r => r.Logins).WithOne().HasForeignKey(e => e.UserId).IsRequired().OnDelete(DeleteBehavior.ClientCascade);
            b.HasMany(r => r.Roles).WithOne().HasForeignKey(e => e.UserId).IsRequired().OnDelete(DeleteBehavior.ClientCascade);

            b.HasIndex(e => e.Identifier).HasDatabaseName("UX_UserIdentifier").IsUnique();

            b.ConvertPersonalDataProperties(converter);
        });

        modelBuilder.Entity<UserClaim>(b => {
            b.ToTable("UserClaims");
            b.HasKey(e => e.Id);
            b.Property(e => e.Type).HasMaxLength(64);
            b.Property(e => e.Value).HasMaxLength(256);
        });

        modelBuilder.Entity<LoginProviderEntity>(b => {
            b.ToTable("LoginProviders");
            b.HasKey(e => e.Id);
            b.HasData(new LoginProviderEntity {
                Id = Guid.Empty,
                Name = "Internal",
            });
        });

        modelBuilder.Entity<UserLogin>(b => {
            b.ToTable("UserLogins");
            b.HasKey(e => new { e.UserId, e.ProviderId });
            b.Property(e => e.HashedSecret).HasMaxLength(256).IsRequired();
            b.Property(e => e.Token).HasMaxLength(4096).IsRequired();
            b.Property(e => e.SecurityStamp).HasMaxLength(64);

            b.HasOne(r => r.Provider).WithMany().HasForeignKey(e => e.ProviderId).IsRequired().OnDelete(DeleteBehavior.ClientCascade);

            b.ConvertPersonalDataProperties(converter);
        });

        modelBuilder.Entity<TRole>(b => {
            b.ToTable("Roles");
            b.HasKey(e => e.Id);

            b.Property(e => e.Name).HasMaxLength(64).IsRequired();
            b.Property(e => e.ConcurrencyStamp).HasMaxLength(64).IsConcurrencyToken();

            b.HasMany(r => r.Claims).WithOne().HasForeignKey(e => e.RoleId).IsRequired().OnDelete(DeleteBehavior.Cascade);

            b.HasIndex(r => r.Name).HasDatabaseName("UX_RoleName").IsUnique();
        });

        modelBuilder.Entity<RoleClaim>(b => {
            b.ToTable("RoleClaims");
            b.HasKey(rc => rc.Id);

            b.Property(e => e.Id).HasMaxLength(maxKeyLength);
            b.Property(e => e.ClaimType).HasMaxLength(128);
            b.Property(e => e.ClaimValue).HasMaxLength(4094);
        });

        modelBuilder.Entity<UserRole>(b => {
            b.ToTable("UserRoles");
            b.HasKey(ur => new { ur.UserId, ur.RoleId });

            b.HasOne(r => r.Role).WithMany().HasForeignKey(e => e.RoleId).IsRequired().OnDelete(DeleteBehavior.ClientCascade);
        });
    }
}
