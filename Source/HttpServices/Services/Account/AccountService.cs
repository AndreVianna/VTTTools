namespace HttpServices.Services.Account;

internal sealed class AccountService(UserManager<User> userManager,
                                     IOptions<ExtendedIdentityOptions> identityOptions,
                                     IMessagingService<User> messagingService,
                                     ILogger<AccountService> logger)
    : AccountService<User, NamedUserProfile>(userManager, identityOptions, messagingService, logger)
    , IAccountService;

internal class AccountService<TUser, TProfile>(UserManager<TUser> userManager,
                                     IOptions<ExtendedIdentityOptions> identityOptions,
                                     IMessagingService<TUser> messagingService,
                                     ILogger<AccountService<TUser, TProfile>> logger)
    : AccountService<TUser, string, TProfile>(userManager, identityOptions, messagingService, logger)
    where TUser : class, IIdentityUser<string, TProfile>, new()
    where TProfile : class, IUserProfile, new();

internal class AccountService<TUser, TKey, TProfile>(UserManager<TUser> userManager,
                                                     IOptions<ExtendedIdentityOptions> identityOptions,
                                                     IMessagingService<TUser> messagingService,
                                                     ILogger<AccountService<TUser, TKey, TProfile>> logger)
    : IAccountService<TKey>
    where TUser : class, IIdentityUser<TKey, TProfile>, new()
    where TKey : IEquatable<TKey>
    where TProfile : class, IUserProfile, new() {
    private readonly ExtendedIdentityOptions _options = identityOptions.Value;

    public async Task<FindUserResponse?> FindAsync(string? id, string? email) {
        var user = id is not null ? await userManager.FindByIdAsync(id)
                 : email is not null ? await userManager.FindByEmailAsync(email)
                 : null;
        return string.IsNullOrWhiteSpace(user?.Email) ? null
             : new() {
                 Id = user.Id.ToString()!,
                 Email = user.Email,
                 Name = user.Profile?.Name ?? user.Email,
             };
    }

    public async Task<Result<RegisterUserResponse>> CreateAsync(RegisterUserRequest request) {
        var result = request.Validate();
        if (result.HasErrors)
            return result;

        if (request.Email.Equals(_options.MasterUser?.Email, StringComparison.OrdinalIgnoreCase))
            return new[] { new Error("Email", "A user with this email already exists.") };

        if (await userManager.FindByEmailAsync(request.Email) != null)
            return new[] { new Error("Email", "A user with this email already exists.") };

        var user = Activator.CreateInstance<TUser>();
        user.Profile = Activator.CreateInstance<TProfile>();
        user.Profile.Name = request.Name ?? user.UserName ?? user.Email ?? string.Empty;
        await userManager.SetUserNameAsync(user, request.Email);
        await userManager.SetEmailAsync(user, request.Email);
        var identityResult = await userManager.CreateAsync(user, request.Password);

        if (!identityResult.Succeeded)
            return identityResult.Errors.ToArray(e => new Error(e.Description, GetSource(e.Code)));

        logger.LogInformation("New user account created.");

        var response = new RegisterUserResponse {
            Id = await userManager.GetUserIdAsync(user),
            RequiresConfirmation = userManager.Options.SignIn.RequireConfirmedAccount,
        };
        await SendConfirmationEmail(request, user);

        return response;
    }

    private static string GetSource(string code)
        => code switch {
            _ when code.StartsWith("Duplicate") => "Email",
            _ when code.StartsWith("Password") => "Password",
            _ => "",
        };

    private async Task SendConfirmationEmail(RegisterUserRequest request, TUser user) {
        var code = await userManager.GenerateEmailConfirmationTokenAsync(user);
        await messagingService.SendConfirmationEmailAsync(user, code, request.ConfirmationUrl, request.ReturnUrl);
    }
}