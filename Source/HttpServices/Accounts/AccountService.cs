namespace HttpServices.Accounts;

public class AccountService<TSelf, TDatabase, TProfile>(UserManager<UserIdentity> userManager,
                                                        IOptions<AuthenticationServiceOptions> identityOptions,
                                                        ILogger<TSelf> logger)
    : AccountService<TSelf, TDatabase, UserIdentity, TProfile>(userManager, identityOptions, logger)
    , IAccountService
    where TSelf : AccountService<TSelf, TDatabase, UserIdentity, TProfile>
    where TDatabase : DbContext;

public class AccountService<TSelf, TDatabase, TUser, TProfile>(UserManager<TUser> userManager,
                                                                 IOptions<AuthenticationServiceOptions> identityOptions,
                                                                 ILogger<TSelf> logger)
    : AccountService<TSelf, TDatabase, TUser, string, TProfile>(userManager, identityOptions, logger)
    where TSelf : AccountService<TSelf, TDatabase, TUser, string, TProfile>
    where TDatabase : DbContext
    where TUser : class, IUserIdentity<string>, new();

public class AccountService<TSelf, TDatabase, TUser, TKey, TProfile>(UserManager<TUser> userManager,
                                                                     IOptions<AuthenticationServiceOptions> identityOptions,
                                                                     ILogger<TSelf> logger)
    where TSelf : AccountService<TSelf, TDatabase, TUser, TKey, TProfile>
    where TDatabase : DbContext
    where TUser : class, IUserIdentity<TKey>, new()
    where TKey : IEquatable<TKey> {
    private readonly AuthenticationServiceOptions _options = identityOptions.Value;

    public async Task<FindUserResponse?> FindAsync(string? id, string? email) {
        var user = id is not null ? await userManager.FindByIdAsync(id)
                 : email is not null ? await userManager.FindByEmailAsync(email)
                 : null;
        return string.IsNullOrWhiteSpace(user?.Email) ? null
             : new() {
                 Id = user.Id.ToString()!,
                 Identifier = user.IdentifierType switch {
                     IdentifierType.Email => user.Email!,
                     IdentifierType.UserName => user.UserName!,
                     _ => user.Id.ToString()!,
                 },
                 Email = user.Email,
                 UserName = user.UserName,
             };
    }

    public async Task<Result<RegisterUserResponse>> CreateAsync(RegisterUserRequest request) {
        var result = request.Validate();
        if (result.HasErrors)
            return result;

        if (request.Email.Equals(_options.Master?.Identifier, StringComparison.OrdinalIgnoreCase))
            return new[] { new Error("Email", "A user with this email already exists.") };

        if (await userManager.FindByEmailAsync(request.Email) != null)
            return new[] { new Error("Email", "A user with this email already exists.") };

        var user = Activator.CreateInstance<TUser>();
        user.Email = request.Email;
        await userManager.SetUserNameAsync(user, request.Email);
        await userManager.SetEmailAsync(user, request.Email);
        var identityResult = await userManager.CreateAsync(user, request.Password);

        if (!identityResult.Succeeded)
            return identityResult.Errors.ToArray(e => new Error(e.Description, GetSource(e.Code)));

        logger.LogInformation("New user account created.");

        return new RegisterUserResponse {
            Id = await userManager.GetUserIdAsync(user),
            RequiresAccountConfirmation = userManager.Options.SignIn.RequireConfirmedAccount,
            AccountConfirmationToken = await userManager.GenerateEmailConfirmationTokenAsync(user),
        };
    }

    private static string GetSource(string code)
        => code switch {
            _ when code.StartsWith("Duplicate") => "Email",
            _ when code.StartsWith("Password") => "Password",
            _ => "",
        };
}
