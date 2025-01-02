namespace HttpServices.Data;

public class IdentityApiDbContext(DbContextOptions options)
    : IdentityApiDbContext<ApiClient, User, Role>(options);

public class IdentityApiDbContext<TClient, TUser, TRole>(DbContextOptions options)
    : IdentityApiDbContext<TClient, ApiClientClaim, TUser, UserClaim, UserLogin, UserToken, TRole, UserRole, RoleClaim>(options)
    where TClient : ApiClient
    where TUser : User
    where TRole : Role;

public class IdentityApiDbContext<TClient, TClientClaim, TUser, TUserClaim, TUserLogin, TUserToken, TRole, TUserRole, TRoleClaim>(DbContextOptions options)
    : IdentityApiDbContext<Guid, TClient, TClientClaim, TUser, TUserClaim, TUserLogin, TUserToken, TRole, TUserRole, TRoleClaim>(options)
    where TClient : ApiClient
    where TClientClaim : ApiClientClaim
    where TUser : User
    where TUserClaim : UserClaim
    where TUserLogin : UserLogin
    where TUserToken : UserToken
    where TRole : Role
    where TUserRole : UserRole
    where TRoleClaim : RoleClaim;

public class IdentityApiDbContext<TKey>(DbContextOptions options)
    : IdentityApiDbContext<TKey, ApiClient<TKey>, User<TKey>, Role<TKey>>(options)
    where TKey : IEquatable<TKey>;

public class IdentityApiDbContext<TKey, TClient, TUser, TRole>(DbContextOptions options)
    : IdentityApiDbContext<TKey, TClient, ApiClientClaim<TKey>, TUser, UserClaim<TKey>, UserLogin<TKey>, UserToken<TKey>, TRole, UserRole<TKey>, RoleClaim<TKey>>(options)
    where TKey : IEquatable<TKey>
    where TClient : ApiClient<TKey>
    where TUser : User<TKey>
    where TRole : Role<TKey>;

public class IdentityApiDbContext<TKey, TClient, TClientClaim, TUser, TUserClaim, TUserLogin, TUserToken, TRole, TUserRole, TRoleClaim>(DbContextOptions options)
    : IdentityDbContext<TUser, TRole, TKey, TUserClaim, TUserRole, TUserLogin, TRoleClaim, TUserToken>(options)
    where TKey : IEquatable<TKey>
    where TClient : ApiClient<TKey>
    where TClientClaim : ApiClientClaim<TKey>
    where TUser : User<TKey>
    where TUserClaim : UserClaim<TKey>
    where TUserLogin : UserLogin<TKey>
    where TUserToken : UserToken<TKey>
    where TRole : Role<TKey>
    where TUserRole : UserRole<TKey>
    where TRoleClaim : RoleClaim<TKey> {
    public virtual DbSet<TClient> Clients { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder builder) {
        base.OnModelCreating(builder);

        builder.Entity<TClient>(b => {
            b.ToTable("ApiClients");
            if (typeof(TKey) == typeof(Guid))
                builder.Entity<TClient>().Property(x => x.Id).HasValueGenerator<SequentialGuidValueGenerator>();
            b.HasMany<TClientClaim>().WithOne().HasForeignKey(e => e.ApiClientId).IsRequired();
            b.HasMany<TRole>().WithOne().HasForeignKey(e => e.ApiClientId).IsRequired();
            b.HasMany<TUser>().WithOne().HasForeignKey(e => e.ApiClientId).IsRequired();
        });

        builder.Entity<TClientClaim>(b => {
            b.ToTable("ApiClientClaims");
            b.HasKey(e => e.Id);
            b.Property(e => e.ClaimType).HasMaxLength(64);
            b.Property(e => e.ClaimValue).HasMaxLength(256);
        });

        builder.Entity<TUser>(b => {
            b.ToTable("Users");
            if (typeof(TKey) == typeof(Guid))
                b.Property(x => x.Id).HasValueGenerator<SequentialGuidValueGenerator>();
            b.Property(e => e.Name).HasMaxLength(256);
            b.Property(e => e.PhoneNumber).HasMaxLength(25);
            b.Property(e => e.SecurityStamp).HasMaxLength(48);
            b.Property(e => e.ConcurrencyStamp).HasMaxLength(48);
            b.Property(e => e.TwoFactorType).HasConversion<string>();
        });

        builder.Entity<TUserClaim>(b => {
            b.ToTable("UserClaims");
            b.Property(e => e.ClaimType).HasMaxLength(64);
            b.Property(e => e.ClaimValue).HasMaxLength(256);
        });

        builder.Entity<TUserLogin>(b => {
            b.ToTable("UserLogins");
            b.Property(e => e.LoginProvider).HasMaxLength(64);
            b.Property(e => e.ProviderKey).HasMaxLength(128);
            b.Property(e => e.ProviderDisplayName).HasMaxLength(64);
        });

        builder.Entity<TUserToken>(b => {
            b.ToTable("UserTokens");
            b.Property(e => e.LoginProvider).HasMaxLength(64);
            b.Property(e => e.Name).HasMaxLength(32);
        });

        builder.Entity<TRole>(b => {
            b.ToTable("Roles");
            if (typeof(TKey) == typeof(Guid))
                b.Property(x => x.Id).HasValueGenerator<SequentialGuidValueGenerator>();
            b.Property(e => e.Name).HasMaxLength(64);
            b.Property(e => e.NormalizedName).HasMaxLength(64);
            b.Property(e => e.ConcurrencyStamp).HasMaxLength(48);
        });

        builder.Entity<TRoleClaim>(b => {
            b.ToTable("RoleClaims");
            b.Property(e => e.ClaimType).HasMaxLength(64);
            b.Property(e => e.ClaimValue).HasMaxLength(256);
        });

        builder.Entity<TUserRole>(b => b.ToTable("UserRoles"));

        builder.ApplyConfigurationsFromAssembly(typeof(ApiDbContext).Assembly);
    }
}
