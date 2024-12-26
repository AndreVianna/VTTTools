﻿
using Domain.Contracts.Account;

namespace AuthService.Handlers.Account;
internal interface IUserAccountHandler {
    Task<Result<RegisterUserResponse>> CreateAsync(RegisterUserRequest request);
    Task<FindUserResponse?> FindAsync(string id, string email);
}