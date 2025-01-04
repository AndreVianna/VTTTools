namespace HttpServices.Data;

public class IdentityApiDbContext(DbContextOptions options)
    : IdentityApiDbContext<Client, User, Role>(options);

public class IdentityApiDbContext<TClient, TUser, TRole>(DbContextOptions options)
    : IdentityApiDbContext<TClient, TUser, UserClaim, UserLogin, UserToken, TRole, UserRole, RoleClaim>(options)
    where TClient : Client
    where TUser : User
    where TRole : Role;

public class IdentityApiDbContext<TClient, TUser, TUserClaim, TUserLogin, TUserToken, TRole, TUserRole, TRoleClaim>(DbContextOptions options)
    : IdentityApiDbContext<string, TClient, TUser, TUserClaim, TUserLogin, TUserToken, TRole, TUserRole, TRoleClaim>(options)
    where TClient : Client
    where TUser : User
    where TUserClaim : UserClaim
    where TUserLogin : UserLogin
    where TUserToken : UserToken
    where TRole : Role
    where TUserRole : UserRole
    where TRoleClaim : RoleClaim;

public class IdentityApiDbContext<TKey>(DbContextOptions options)
    : IdentityApiDbContext<TKey, Client<TKey>, NamedUser<TKey>, Role<TKey>>(options)
    where TKey : IEquatable<TKey>;

public class IdentityApiDbContext<TKey, TClient, TUser, TRole>(DbContextOptions options)
    : IdentityApiDbContext<TKey, TClient, TUser, UserClaim<TKey>, UserLogin<TKey>, UserToken<TKey>, TRole, UserRole<TKey>, RoleClaim<TKey>>(options)
    where TKey : IEquatable<TKey>
    where TClient : Client<TKey>
    where TUser : NamedUser<TKey>
    where TRole : Role<TKey>;

public class IdentityApiDbContext<TKey, TClient, TUser, TUserClaim, TUserLogin, TUserToken, TRole, TUserRole, TRoleClaim>(DbContextOptions options)
    : IdentityDbContext<TUser, TRole, TKey, TUserClaim, TUserRole, TUserLogin, TRoleClaim, TUserToken>(options)
    where TKey : IEquatable<TKey>
    where TClient : Client<TKey>
    where TUser : NamedUser<TKey>
    where TUserClaim : UserClaim<TKey>
    where TUserLogin : UserLogin<TKey>
    where TUserToken : UserToken<TKey>
    where TRole : Role<TKey>
    where TUserRole : UserRole<TKey>
    where TRoleClaim : RoleClaim<TKey> {
    public virtual DbSet<TClient> Clients { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder builder) {
        var storeOptions = GetStoreOptions();
        var maxKeyLength = storeOptions?.MaxLengthForKeys ?? 0;
        if (maxKeyLength == 0)
            maxKeyLength = 128;
        var encryptPersonalData = storeOptions?.ProtectPersonalData ?? false;
        var converter = encryptPersonalData
                            ? new PersonalDataConverter(this.GetService<IPersonalDataProtector>())
                            : null;

        builder.Entity<TClient>(b => {
            b.ToTable("Clients");
            b.HasKey(e => e.Id);

            b.Property(i => i.Id).ValueGeneratedOnAdd().SetDefaultValueGeneration();
            b.Property(e => e.Name).HasMaxLength(256).IsRequired();
            b.Property(e => e.HashedSecret).IsRequired();

            b.HasMany<TRole>().WithOne().HasForeignKey(e => e.ApiClientId).IsRequired(false).OnDelete(DeleteBehavior.SetNull);
            b.HasMany<TUser>().WithOne().HasForeignKey(e => e.ApiClientId).IsRequired(false).OnDelete(DeleteBehavior.SetNull);
        });

        builder.Entity<TUser>(b => {
            b.ToTable("Users");

            b.Property(i => i.Id).ValueGeneratedOnAdd().SetDefaultValueGeneration();
            b.Property(e => e.UserName).HasMaxLength(256).IsRequired();
            b.Property(e => e.NormalizedUserName).HasMaxLength(256).IsRequired();
            b.Property(e => e.Email).HasMaxLength(256).IsRequired();
            b.Property(e => e.NormalizedEmail).HasMaxLength(256).IsRequired();
            b.Property(e => e.Name).HasMaxLength(256).IsRequired();
            b.Property(e => e.PhoneNumber).HasMaxLength(32);
            b.Property(e => e.SecurityStamp).HasMaxLength(256);
            b.Property(u => u.ConcurrencyStamp).HasMaxLength(48).IsConcurrencyToken();
            b.Property(e => e.TwoFactorType).HasConversion<string>().IsRequired().HasDefaultValue(TwoFactorType.Email);

            b.HasMany<TUserClaim>().WithOne().HasForeignKey(e => e.UserId).IsRequired();
            b.HasMany<TUserLogin>().WithOne().HasForeignKey(e => e.UserId).IsRequired();
            b.HasMany<TUserToken>().WithOne().HasForeignKey(e => e.UserId).IsRequired();
            b.HasMany<TUserRole>().WithOne().HasForeignKey(e => e.UserId).IsRequired();

            b.HasIndex(u => u.NormalizedEmail).HasDatabaseName("EmailIndex").IsUnique();
            b.HasIndex(u => u.NormalizedUserName).HasDatabaseName("UserNameIndex").IsUnique();

            b.ConvertPersonalDataProperties(converter);
        });

        builder.Entity<TUserClaim>(b => {
            b.ToTable("UserClaims");
            b.HasKey(e => e.Id);
            b.Property(e => e.ClaimType).HasMaxLength(64);
            b.Property(e => e.ClaimValue).HasMaxLength(256);
        });

        builder.Entity<TUserLogin>(b => {
            b.ToTable("UserLogins");
            b.HasKey(e => new { e.LoginProvider, e.ProviderKey });
            b.Property(e => e.LoginProvider).HasMaxLength(64);
            b.Property(e => e.ProviderKey).HasMaxLength(maxKeyLength);
            b.Property(e => e.ProviderDisplayName).HasMaxLength(64);
        });

        builder.Entity<TUserToken>(b => {
            b.ToTable("UserTokens");
            b.HasKey(t => new { t.UserId, t.LoginProvider, t.Name });
            b.Property(e => e.LoginProvider).HasMaxLength(64);
            b.Property(e => e.Name).HasMaxLength(32);

            b.ConvertPersonalDataProperties(converter);
        });

        builder.Entity<TRole>(b => {
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

        builder.Entity<TRoleClaim>(b => {
            b.ToTable("RoleClaims");
            b.HasKey(rc => rc.Id);
            b.Property(e => e.ClaimType).HasMaxLength(64);
            b.Property(e => e.ClaimValue).HasMaxLength(256);
        });

        builder.Entity<TUserRole>(b => {
            b.ToTable("UserRoles");
            b.HasKey(r => new { r.UserId, r.RoleId });
        });
    }

    private StoreOptions? GetStoreOptions() => this.GetService<IDbContextOptions>()
                       .Extensions.OfType<CoreOptionsExtension>()
                       .FirstOrDefault()?.ApplicationServiceProvider
                       ?.GetService<IOptions<IdentityOptions>>()
                       ?.Value.Stores;
}