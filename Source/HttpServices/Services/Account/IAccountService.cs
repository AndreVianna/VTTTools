namespace HttpServices.Services.Account;

internal interface IAccountService
    : IAccountService<string>;

internal interface IAccountService<TKey>
    where TKey : IEquatable<TKey> {
    Task<Result<RegisterUserResponse>> CreateAsync(RegisterUserRequest request);
    Task<FindUserResponse?> FindAsync(string? id, string? email);
}