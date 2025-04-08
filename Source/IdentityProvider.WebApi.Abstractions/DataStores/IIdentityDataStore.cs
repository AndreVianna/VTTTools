namespace WebApi.DataStores;

public interface IIdentityDataStore<TUser>
    where TUser : User {
    Task<TUser?> FindAsync(string identifier);
    Task<bool> TryPasswordLoginAsync(string identifier, string hashedSecret, string? loginProvider = null);
}
