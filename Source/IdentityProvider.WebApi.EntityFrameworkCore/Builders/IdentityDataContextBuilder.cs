namespace WebApi.Identity.EntityFrameworkCore.Builders;

internal static class IdentityDataContextBuilder {
    public static void ConfigureModel<TUser>(DbContext context, ModelBuilder modelBuilder)
        where TUser : UserEntity {
        var storeOptions = context.GetService<IDbContextOptions>()
                                  .Extensions.OfType<CoreOptionsExtension>().FirstOrDefault()?
                                  .ApplicationServiceProvider?.GetService<IOptions<IdentityOptions>>()?
                                  .Value.Stores;
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

            b.Property(e => e.Name).HasMaxLength(128).IsRequired();

            b.HasIndex(r => r.Name).HasDatabaseName("UX_ProviderName").IsUnique();

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

        modelBuilder.Entity<UserRole>(b => {
            b.ToTable("UserRoles");
            b.HasKey(ur => new { ur.UserId, ur.Name });
        });
    }
}
