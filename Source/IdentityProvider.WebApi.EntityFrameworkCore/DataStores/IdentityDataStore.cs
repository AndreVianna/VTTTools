namespace WebApi.Identity.EntityFrameworkCore.DataStores;

public class IdentityDataStore(IdentityDataContext context, IIdentityMapper<User, UserEntity> map)
    : IdentityDataStore<IdentityDataStore, User, UserEntity>(context, map);

public class IdentityDataStore<TStore, TUser, TUserEntity>(IdentityDataContext<TUserEntity, RoleEntity> context,
                                                           IIdentityMapper<TUser, TUserEntity> map)
    : IIdentityDataStore<TUser>
    where TStore : IdentityDataStore<TStore, TUser, TUserEntity>
    where TUser : User, new()
    where TUserEntity : UserEntity, new() {
    public async Task<TUser?> FindAsync(string identifier) {
        var entity = await context.Users
                                  .Include(u => u.Logins)
                                  .Include(u => u.Claims)
                                  .FirstOrDefaultAsync(u => u.Identifier.Equals(identifier, StringComparison.Ordinal));
        return map.ToDomainModel(entity);
    }

    public async Task<bool> TryPasswordLoginAsync(string identifier, string hashedSecret, string? loginProvider = null) {
        var user = await context.Users
            .Include(u => u.Logins)
                .ThenInclude(l => l.Provider)
            .FirstOrDefaultAsync(u => u.Identifier == identifier);

        if (user is null)
            return false;

        var login = user.Logins.FirstOrDefault(l =>
            loginProvider == null || l.Provider.Name == loginProvider);

        return login is not null && string.Equals(login.HashedSecret, hashedSecret, StringComparison.Ordinal);
    }
}
