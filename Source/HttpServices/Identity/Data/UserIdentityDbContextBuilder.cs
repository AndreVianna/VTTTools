namespace HttpServices.Identity.Data;

internal static class UserIdentityDbContextBuilder {
    public static void ConfigureModel<TKey, TUser, TUserClaim, TUserLogin, TUserToken>(DbContext context, ModelBuilder modelBuilder)
        where TKey : IEquatable<TKey>
        where TUser : UserIdentity<TKey>
        where TUserClaim : UserClaim<TKey>
        where TUserLogin : UserLogin<TKey>
        where TUserToken : UserToken<TKey> {
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
            b.Property(e => e.TwoFactorType).HasConversion<string>().IsRequired().HasDefaultValue(TwoFactorType.None);
            b.Property(e => e.IdentifierType).HasConversion<string>().IsRequired().HasDefaultValue(IdentifierType.Email);

            b.HasMany<TUserClaim>().WithOne().HasForeignKey(e => e.UserId).IsRequired();
            b.HasMany<TUserLogin>().WithOne().HasForeignKey(e => e.UserId).IsRequired();
            b.HasMany<TUserToken>().WithOne().HasForeignKey(e => e.UserId).IsRequired();

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
    }
}