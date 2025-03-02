namespace HttpServices.Data;

internal static class IdentityProviderApiDbContextBuilder {
    public static void ConfigureModel<TKey, TClient, TToken, TUser, TProfile, TUserClaim, TUserLogin, TUserToken, TRole, TUserRole, TRoleClaim>(DbContext context, ModelBuilder modelBuilder)
        where TKey : IEquatable<TKey>
        where TClient : ApiClient<TKey>
        where TToken : ApiToken<TKey>
        where TUser : User<TKey, TProfile>
        where TProfile : class, IUserProfile
        where TUserClaim : UserClaim<TKey>
        where TUserLogin : UserLogin<TKey>
        where TUserToken : UserToken<TKey>
        where TRole : Role<TKey>
        where TUserRole : UserRole<TKey>
        where TRoleClaim : RoleClaim<TKey> {

        ApiDbContextBuilder.ConfigureModel<TKey, TClient, TToken>(context, modelBuilder);

        var storeOptions = context.GetService<IDbContextOptions>()
                                  .Extensions.OfType<CoreOptionsExtension>()
                                  .FirstOrDefault()?.ApplicationServiceProvider
                                 ?.GetService<IOptions<IdentityOptions>>()
                                 ?.Value.Stores;
        var maxKeyLength = storeOptions?.MaxLengthForKeys ?? 0;
        if (maxKeyLength == 0)
            maxKeyLength = 128;
        var encryptPersonalData = storeOptions?.ProtectPersonalData ?? false;
        var converter = encryptPersonalData
                            ? new PersonalDataConverter(context.GetService<IPersonalDataProtector>())
                            : null;

        modelBuilder.Entity<TClient>(b => {
            b.ToTable("Clients");
            b.HasKey(e => e.Id);

            b.Property(e => e.Id).ValueGeneratedOnAdd().SetDefaultValueGeneration();
            b.Property(e => e.Name).HasMaxLength(256).IsRequired();

            b.HasMany<TToken>().WithOne().HasForeignKey(e => e.ApiClientId).IsRequired(false).OnDelete(DeleteBehavior.Cascade);
            b.HasMany<TRole>().WithOne().HasForeignKey(e => e.ApiClientId).IsRequired(false).OnDelete(DeleteBehavior.SetNull);
            b.HasMany<TUser>().WithOne().HasForeignKey(e => e.ApiClientId).IsRequired(false).OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<TToken>(b => {
            b.ToTable("Tokens");
            b.HasKey(i => i.Id);

            b.Property(i => i.Id).ValueGeneratedOnAdd().SetDefaultValueGeneration();

            b.ConvertPersonalDataProperties(converter);
        });

        modelBuilder.Entity<TUser>(b => {
            b.ToTable("Users");

            b.Property(i => i.Id).ValueGeneratedOnAdd().SetDefaultValueGeneration();
            b.Property(e => e.UserName).HasMaxLength(256).IsRequired();
            b.Property(e => e.NormalizedUserName).HasMaxLength(256).IsRequired();
            b.Property(e => e.Email).HasMaxLength(256).IsRequired();
            b.Property(e => e.NormalizedEmail).HasMaxLength(256).IsRequired();
            b.Property(e => e.PhoneNumber).HasMaxLength(32);
            b.Property(e => e.SecurityStamp).HasMaxLength(256);
            b.Property(e => e.ConcurrencyStamp).HasMaxLength(48).IsConcurrencyToken();
            b.Property(e => e.TwoFactorType).HasConversion<string>().IsRequired().HasDefaultValue(TwoFactorType.Undefined);

            b.OwnsOne(u => u.Profile);

            b.HasMany<TUserClaim>().WithOne().HasForeignKey(e => e.UserId).IsRequired();
            b.HasMany<TUserLogin>().WithOne().HasForeignKey(e => e.UserId).IsRequired();
            b.HasMany<TUserToken>().WithOne().HasForeignKey(e => e.UserId).IsRequired();
            b.HasMany<TUserRole>().WithOne().HasForeignKey(e => e.UserId).IsRequired();

            b.HasIndex(e => e.NormalizedEmail).HasDatabaseName("EmailIndex").IsUnique();
            b.HasIndex(e => e.NormalizedUserName).HasDatabaseName("UserNameIndex").IsUnique();

            b.ConvertPersonalDataProperties(converter);
        });

        modelBuilder.Entity<TUserClaim>(b => {
            b.ToTable("UserClaims");
            b.HasKey(e => e.Id);
            b.Property(e => e.ClaimType).HasMaxLength(64);
            b.Property(e => e.ClaimValue).HasMaxLength(256);
        });

        modelBuilder.Entity<TUserLogin>(b => {
            b.ToTable("UserLogins");
            b.HasKey(e => new { e.LoginProvider, e.ProviderKey });
            b.Property(e => e.LoginProvider).HasMaxLength(64);
            b.Property(e => e.ProviderKey).HasMaxLength(maxKeyLength);
            b.Property(e => e.ProviderDisplayName).HasMaxLength(64);
        });

        modelBuilder.Entity<TUserToken>(b => {
            b.ToTable("UserTokens");
            b.HasKey(t => new { t.UserId, t.LoginProvider, t.Name });
            b.Property(e => e.LoginProvider).HasMaxLength(64);
            b.Property(e => e.Name).HasMaxLength(64);

            b.ConvertPersonalDataProperties(converter);
        });

        modelBuilder.Entity<TRole>(b => {
            b.ToTable("Roles");
            b.HasKey(e => e.Id);

            b.Property(i => i.Id).ValueGeneratedOnAdd().SetDefaultValueGeneration();
            b.Property(e => e.Name).HasMaxLength(64).IsRequired();
            b.Property(e => e.NormalizedName).HasMaxLength(64).IsRequired();
            b.Property(e => e.ConcurrencyStamp).IsConcurrencyToken().HasMaxLength(36);

            b.HasMany<TRoleClaim>().WithOne().HasForeignKey(e => e.RoleId).IsRequired();
            b.HasMany<TUserRole>().WithOne().HasForeignKey(e => e.RoleId).IsRequired();

            b.HasIndex(r => r.NormalizedName).HasDatabaseName("RoleNameIndex").IsUnique();
        });

        modelBuilder.Entity<TRoleClaim>(b => {
            b.ToTable("RoleClaims");
            b.HasKey(rc => rc.Id);
            b.Property(e => e.ClaimType).HasMaxLength(64);
            b.Property(e => e.ClaimValue).HasMaxLength(256);
        });

        modelBuilder.Entity<TUserRole>(b => {
            b.ToTable("UserRoles");
            b.HasKey(r => new { r.UserId, r.RoleId });
        });
    }
}
