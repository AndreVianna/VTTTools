namespace HttpServices.Identity.Data;

public class IdentityProviderDbContext(DbContextOptions options)
    : IdentityProviderDbContext<UserIdentity, Role>(options);

public class IdentityProviderDbContext<TUser, TRole>(DbContextOptions options)
    : IdentityProviderDbContext<TUser, UserClaim, UserLogin, UserToken, TRole, UserRole, RoleClaim>(options)
    where TUser : UserIdentity, new()
    where TRole : Role;

public class IdentityProviderDbContext<TUser, TUserClaim, TUserLogin, TUserToken, TRole, TUserRole, TRoleClaim>(DbContextOptions options)
    : IdentityProviderDbContext<string, TUser, TUserClaim, TUserLogin, TUserToken, TRole, TUserRole, TRoleClaim>(options)
    where TUser : UserIdentity, new()
    where TUserClaim : UserClaim
    where TUserLogin : UserLogin
    where TUserToken : UserToken
    where TRole : Role
    where TUserRole : UserRole
    where TRoleClaim : RoleClaim;

public class IdentityProviderDbContext<TKey>(DbContextOptions options)
    : IdentityProviderDbContext<TKey, UserIdentity<TKey>, Role<TKey>>(options)
    where TKey : IEquatable<TKey>;

public class IdentityProviderDbContext<TKey, TUser, TRole>(DbContextOptions options)
    : IdentityProviderDbContext<TKey, TUser, UserClaim<TKey>, UserLogin<TKey>, UserToken<TKey>, TRole, UserRole<TKey>, RoleClaim<TKey>>(options)
    where TKey : IEquatable<TKey>
    where TUser : UserIdentity<TKey>, new()
    where TRole : Role<TKey>;

public class IdentityProviderDbContext<TKey, TUser, TUserClaim, TUserLogin, TUserToken, TRole, TUserRole, TRoleClaim>(DbContextOptions options)
    : IdentityDbContext<TUser, TRole, TKey, TUserClaim, TUserRole, TUserLogin, TRoleClaim, TUserToken>(options)
    , IUserIdentityDbContext<TKey, TUser, TUserClaim, TUserLogin, TUserToken>
    , IUserRoleDbContext<TKey, TRole, TUserRole, TRoleClaim>
    where TKey : IEquatable<TKey>
    where TUser : UserIdentity<TKey>, new()
    where TUserClaim : UserClaim<TKey>
    where TUserLogin : UserLogin<TKey>
    where TUserToken : UserToken<TKey>
    where TRole : Role<TKey>
    where TUserRole : UserRole<TKey>
    where TRoleClaim : RoleClaim<TKey> {
    protected override void OnModelCreating(ModelBuilder builder) {
        base.OnModelCreating(builder);
        UserIdentityDbContextBuilder.ConfigureModel<TKey, TUser, TUserClaim, TUserLogin, TUserToken>(this, builder);
        UserRoleDbContextBuilder.ConfigureModel<TKey, TUser, TRole, TUserRole, TRoleClaim>(this, builder);
    }
}