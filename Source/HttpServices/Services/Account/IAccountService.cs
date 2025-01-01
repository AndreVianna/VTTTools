namespace HttpServices.Services.Account;

internal interface IAccountService {
    Task<Result<RegisterUserResponse>> CreateAsync(RegisterUserRequest request);
    Task<FindUserResponse?> FindAsync(string? id, string? email);
}