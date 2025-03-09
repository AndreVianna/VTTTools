namespace HttpServices.Identity.Data;

public interface IUserIdentityDbContext<TKey, TUser, TUserClaim, TUserLogin, TUserToken>
    where TKey : IEquatable<TKey>
    where TUser : IdentityUser<TKey>
    where TUserClaim : IdentityUserClaim<TKey>
    where TUserLogin : IdentityUserLogin<TKey>
    where TUserToken : IdentityUserToken<TKey> {
    DbSet<TUserClaim> UserClaims { get; set; }
    DbSet<TUserLogin> UserLogins { get; set; }
    DbSet<TUser> Users { get; set; }
    DbSet<TUserToken> UserTokens { get; set; }
}