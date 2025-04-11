namespace WebApi.Identity.EntityFrameworkCore.DataStores;

public class UserDataStore(IdentityDataContext context, IUserMapper<User, UserEntity> map)
    : UserDataStore<UserDataStore, User, UserEntity>(context, map);

public class UserDataStore<TStore, TUser, TUserEntity>(IdentityDataContext<TUserEntity> context,
                                                           IUserMapper<TUser, TUserEntity> map)
    : IUserDataStore<TUser>
    where TStore : UserDataStore<TStore, TUser, TUserEntity>
    where TUser : User, new()
    where TUserEntity : UserEntity, new() {
    public async Task<TUser?> FindAsync(string identifier) {
        var entity = await context.Users
                                  .Include(u => u.Logins)
                                    .ThenInclude(r => r.Provider)
                                  .Include(u => u.Claims)
                                  .Include(u => u.Roles)
                                    .ThenInclude(r => r.Name)
                                  .FirstOrDefaultAsync(u => u.Identifier.Equals(identifier, StringComparison.Ordinal));
        return map.ToDomainModel(entity);
    }

    public async Task<bool> TryPasswordSignInAsync(string identifier, string hashedSecret, string? loginProvider = null) {
        var user = await context.Users
            .Include(u => u.Logins)
                .ThenInclude(l => l.Provider)
            .FirstOrDefaultAsync(u => u.Identifier == identifier);

        if (user is null)
            return false;

        var login = user.Logins.FirstOrDefault(l =>
            loginProvider == null || l.Provider?.Name == loginProvider);

        return login is not null && string.Equals(login.HashedSecret, hashedSecret, StringComparison.Ordinal);
    }
}
