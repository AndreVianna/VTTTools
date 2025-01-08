namespace HttpServices.Data;

public class IdentityProviderApiDbContext(DbContextOptions options)
    : IdentityProviderApiDbContext<ApiClient, ApiToken, User, Role>(options);

public class IdentityProviderApiDbContext<TClient, TToken, TUser, TRole>(DbContextOptions options)
    : IdentityProviderApiDbContext<TClient, TToken, TUser, UserClaim, UserLogin, UserToken, TRole, UserRole, RoleClaim>(options)
    where TClient : ApiClient
    where TToken : ApiToken
    where TUser : User
    where TRole : Role;

public class IdentityProviderApiDbContext<TClient, TToken, TUser, TUserClaim, TUserLogin, TUserToken, TRole, TUserRole, TRoleClaim>(DbContextOptions options)
    : IdentityProviderApiDbContext<string, TClient, TToken, TUser, TUserClaim, TUserLogin, TUserToken, TRole, TUserRole, TRoleClaim>(options)
    , IApiDbContext<TClient, TToken>
    where TClient : ApiClient
    where TToken : ApiToken
    where TUser : User
    where TUserClaim : UserClaim
    where TUserLogin : UserLogin
    where TUserToken : UserToken
    where TRole : Role
    where TUserRole : UserRole
    where TRoleClaim : RoleClaim;

public class IdentityProviderApiDbContext<TKey>(DbContextOptions options)
    : IdentityProviderApiDbContext<TKey, ApiClient<TKey>, ApiToken<TKey>, User<TKey>, Role<TKey>>(options)
    , IApiDbContext<TKey>
    where TKey : IEquatable<TKey>;

public class IdentityProviderApiDbContext<TKey, TClient, TToken, TUser, TRole>(DbContextOptions options)
    : IdentityProviderApiDbContext<TKey, TClient, TToken, TUser, UserClaim<TKey>, UserLogin<TKey>, UserToken<TKey>, TRole, UserRole<TKey>, RoleClaim<TKey>>(options)
    where TKey : IEquatable<TKey>
    where TClient : ApiClient<TKey>
    where TToken : ApiToken<TKey>
    where TUser : User<TKey>
    where TRole : Role<TKey>;

public class IdentityProviderApiDbContext<TKey, TClient, TToken, TUser, TUserClaim, TUserLogin, TUserToken, TRole, TUserRole, TRoleClaim>(DbContextOptions options)
    : IdentityDbContext<TUser, TRole, TKey, TUserClaim, TUserRole, TUserLogin, TRoleClaim, TUserToken>(options), IIdentityApiDbContext<TKey, TClient, TToken>
    , IApiDbContext<TKey, TClient, TToken>
    where TKey : IEquatable<TKey>
    where TClient : ApiClient<TKey>
    where TToken : ApiToken<TKey>
    where TUser : User<TKey>
    where TUserClaim : UserClaim<TKey>
    where TUserLogin : UserLogin<TKey>
    where TUserToken : UserToken<TKey>
    where TRole : Role<TKey>
    where TUserRole : UserRole<TKey>
    where TRoleClaim : RoleClaim<TKey> {
    public DbSet<TClient> Clients { get; set; } = null!;
    public DbSet<TToken> Tokens { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder builder) {
        base.OnModelCreating(builder);
        IdentityProviderApiDbContextBuilder.CreateModel<TKey, TClient, TToken, TUser, TUserClaim, TUserLogin, TUserToken, TRole, TUserRole, TRoleClaim>(this, builder);
    }
}