namespace HttpServices.Accounts;

public interface IAccountService
    : IAccountService<string>;

public interface IAccountService<TKey>
    where TKey : IEquatable<TKey> {
    Task<Result<RegisterUserResponse>> CreateAsync(RegisterUserRequest request);
    Task<FindUserResponse?> FindAsync(string? id, string? email);
}