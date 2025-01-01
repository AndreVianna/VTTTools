namespace ApiService.Data;

public class IdentityApiDbContext(DbContextOptions options)
    : IdentityApiDbContext<ApiClient>(options);

public class IdentityApiDbContext<TClient>(DbContextOptions options)
    : IdentityApiDbContext<TClient, ApiClientUser>(options)
    where TClient : ApiClient;

public class IdentityApiDbContext<TClient, TUser>(DbContextOptions options)
    : IdentityApiDbContext<TClient, TUser, ApiClientRole, Guid>(options)
    where TClient : ApiClient
    where TUser : ApiClientUser;

public class IdentityApiDbContext<TClient, TUser, TRole>(DbContextOptions options)
    : IdentityApiDbContext<TClient, TUser, TRole, Guid>(options)
    where TClient : ApiClient
    where TUser : ApiClientUser
    where TRole : ApiClientRole;

public class IdentityApiDbContext<TClient, TUser, TRole, TKey>(DbContextOptions options)
    : IdentityApiDbContext<TClient, TUser, TRole, ApiClientUserClaim<TKey>, ApiClientUserRole<TKey>, ApiClientUserLogin<TKey>, ApiClientRoleClaim<TKey>, ApiClientUserToken<TKey>, TKey>(options)
    where TClient : ApiClient<TKey>
    where TUser : ApiClientUser<TKey>
    where TRole : ApiClientRole<TKey>
    where TKey : IEquatable<TKey>;

public class IdentityApiDbContext<TClient, TUser, TRole, TUserClaim, TUserRole, TUserLogin, TRoleClaim, TUserToken, TKey>(DbContextOptions options)
    : IdentityDbContext<TUser, TRole, TKey, TUserClaim, TUserRole, TUserLogin, TRoleClaim, TUserToken>(options)
    where TClient : ApiClient<TKey>
    where TUser : ApiClientUser<TKey>
    where TRole : ApiClientRole<TKey>
    where TUserClaim : ApiClientUserClaim<TKey>
    where TUserRole : ApiClientUserRole<TKey>
    where TUserLogin : ApiClientUserLogin<TKey>
    where TRoleClaim : ApiClientRoleClaim<TKey>
    where TUserToken : ApiClientUserToken<TKey>
    where TKey : IEquatable<TKey> {
    public virtual DbSet<TClient> Clients { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder builder) {
        base.OnModelCreating(builder);

        builder.Entity<TClient>().ToTable("Clients");
        if (typeof(TKey) != typeof(string))
            builder.Entity<TClient>().Property(x => x.Id).ValueGeneratedOnAdd();
        if (typeof(TKey) == typeof(Guid))
            builder.Entity<TClient>().Property(x => x.Id).HasValueGenerator<SequentialGuidValueGenerator>();

        builder.Entity<TUser>().ToTable("Users");
        if (typeof(TKey) != typeof(string))
            builder.Entity<TUser>().Property(x => x.Id).ValueGeneratedOnAdd();
        if (typeof(TKey) == typeof(Guid))
            builder.Entity<TUser>().Property(x => x.Id).HasValueGenerator<SequentialGuidValueGenerator>();
        builder.Entity<TUser>().Property(e => e.Name).HasMaxLength(256);
        builder.Entity<TUser>().Property(e => e.PhoneNumber).HasMaxLength(25);
        builder.Entity<TUser>().Property(e => e.SecurityStamp).HasMaxLength(50);
        builder.Entity<TUser>().Property(e => e.ConcurrencyStamp).HasMaxLength(50);
        builder.Entity<TUser>().Property(e => e.TwoFactorType).HasConversion<string>();

        builder.Entity<TUserClaim>().ToTable("UserClaims");
        builder.Entity<TUserClaim>().Property(e => e.ClaimType).HasMaxLength(128);

        builder.Entity<TUserLogin>().ToTable("UserLogins");
        builder.Entity<TUserLogin>().Property(e => e.LoginProvider).HasMaxLength(64);
        builder.Entity<TUserLogin>().Property(e => e.ProviderKey).HasMaxLength(128);
        builder.Entity<TUserLogin>().Property(e => e.ProviderDisplayName).HasMaxLength(64);

        builder.Entity<TUserToken>().ToTable("UserTokens");
        builder.Entity<TUserToken>().Property(e => e.LoginProvider).HasMaxLength(64);
        builder.Entity<TUserToken>().Property(e => e.Name).HasMaxLength(32);

        builder.Entity<TRole>().ToTable("Roles");
        if (typeof(TKey) != typeof(string))
            builder.Entity<TRole>().Property(x => x.Id).ValueGeneratedOnAdd();
        if (typeof(TKey) == typeof(Guid))
            builder.Entity<TRole>().Property(x => x.Id).HasValueGenerator<SequentialGuidValueGenerator>();
        builder.Entity<TRole>().Property(e => e.Name).HasMaxLength(64);
        builder.Entity<TRole>().Property(e => e.NormalizedName).HasMaxLength(64);
        builder.Entity<TRole>().Property(e => e.ConcurrencyStamp).HasMaxLength(50);

        builder.Entity<TRoleClaim>().ToTable("RoleClaims");
        builder.Entity<TRoleClaim>().Property(e => e.ClaimType).HasMaxLength(128);

        builder.Entity<TUserRole>().ToTable("UserRoles");

        builder.ApplyConfigurationsFromAssembly(typeof(ApiDbContext).Assembly);
    }
}
