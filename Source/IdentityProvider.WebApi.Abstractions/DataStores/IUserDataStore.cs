namespace WebApi.DataStores;

public interface IUserDataStore<TUser>
    where TUser : User {
    Task<TUser?> FindAsync(string identifier);
    Task<bool> TryPasswordSignInAsync(string identifier, string hashedSecret, string? loginProvider = null);
}
