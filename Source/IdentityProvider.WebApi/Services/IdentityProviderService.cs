namespace WebApi.Services;

public class IdentityProviderService(IHostEnvironment environment,
                                       IIdentityDataStore<User> identityDataStore,
                                       IAccountManagementTokenFactory<User> tokenFactory,
                                       IOptions<IdentityProviderWebApiOptions> identityOptions,
                                       ILogger<IdentityProviderService> logger)
    : IdentityProviderService<IdentityProviderService, User>(environment,
                                                                 identityDataStore,
                                                                 tokenFactory,
                                                                 identityOptions,
                                                                 logger);

public class IdentityProviderService<TSelf, TDomainUser>(IHostEnvironment environment,
                                                         IIdentityDataStore<TDomainUser> identityDataStore,
                                                         IAccountManagementTokenFactory<TDomainUser> tokenFactory,
                                                         IOptions<IdentityProviderWebApiOptions> identityOptions,
                                                         ILogger<TSelf> logger)
    : IIdentityManagementService
    where TSelf : IdentityProviderService<TSelf, TDomainUser>
    where TDomainUser : User, new() {
    private readonly IdentityProviderWebApiOptions _options = identityOptions.Value;

    public async Task<TypedResult<SignInStatus, TemporaryToken>> PasswordSignIn(PasswordSignInRequest request) {
        logger.LogInformation("Login attempt for '{Email}'.", request.Identifier);
        if (TryValidateMasterUser(request, _options.Master, out var master))
            return HandleMasterLogin(master);

        var user = await identityDataStore.FindAsync(request.Identifier);
        if (user is null)
            return HandleUserNotFound(request);

        var login = user.Logins.FirstOrDefault();
        return string.IsNullOrWhiteSpace(login?.HashedSecret) ? HandleLoginNotFound(user)
             : user.IsLocked ? HandleLockedUser(user)
             : await identityDataStore.TryPasswordLoginAsync(user.Identifier, request.Password, login.Provider) ? await HandleSuccessLogin(user)
             : HandleFailedLogin(user);
    }

    public async Task SignOut(SignOutRequest request) {
        var user = await identityDataStore.FindAsync(request.Identifier);
        if (user is null) {
            logger.LogInformation("Account '{Email}' not found when signing out.", request.Identifier);
            return;
        }

        logger.LogInformation("Account '{UserId}' logged out.", user.Id);
    }

    public Task<AuthenticationScheme[]> GetSchemes() => Task.FromResult<AuthenticationScheme[]>([]);

    private TypedResult<SignInStatus, TemporaryToken> HandleMasterLogin(TDomainUser master) {
        var token = GenerateUserToken(master, [Roles.Admin]);
        logger.LogInformation("Master user logged in.");
        return TypedResult.As(SignInStatus.Success, token);
    }

    private TypedResult<SignInStatus, TemporaryToken> HandleUserNotFound(PasswordSignInRequest request) {
        logger.LogInformation("Account '{Email}' not found.", request.Identifier);
        var error = new Error($"Account '{request.Identifier}' not found.", nameof(PasswordSignInRequest.Identifier));
        return TypedResult.As(SignInStatus.AccountNotFound, [error]).WithNo<TemporaryToken>();
    }

    private TypedResult<SignInStatus, TemporaryToken> HandleLoginNotFound(TDomainUser user) {
        logger.LogInformation("Account '{UserId}' does not have a local login.", user.Id);
        var error = new Error($"Account '{user.Identifier}' is allowed to login.", nameof(PasswordSignInRequest.Identifier));
        return TypedResult.As(SignInStatus.BlockedAccount, [error]).WithNo<TemporaryToken>();
    }

    private TypedResult<SignInStatus, TemporaryToken> HandleLockedUser(TDomainUser user) {
        logger.LogInformation("Account '{UserId}' does not have a local login.", user.Id);
        var error = new Error($"Account '{user.Identifier}' is allowed to login.", nameof(PasswordSignInRequest.Identifier));
        return TypedResult.As(SignInStatus.BlockedAccount, [error]).WithNo<TemporaryToken>();
    }

    private TypedResult<SignInStatus, TemporaryToken> HandleFailedLogin(TDomainUser user) {
        logger.LogInformation("Invalid login for '{UserId}'.", user.Id);
        var error = new Error("Invalid login.", nameof(PasswordSignInRequest.Password));
        return TypedResult.As(SignInStatus.IncorrectLogin, [error]).WithNo<TemporaryToken>();
    }

    private async Task<TypedResult<SignInStatus, TemporaryToken>> HandleSuccessLogin(TDomainUser user) {
        logger.LogInformation("Valid login for '{UserId}'.", user.Id);
        if (_options.RequiresConfirmedAccount && !user.AccountConfirmed) {
            logger.LogInformation("Account '{UserId}' confirmation is pending.", user.Id);
            var confirmationToken = await tokenFactory.CreateAccountConfirmationToken(user, _options.AccountConfirmationToken);
            return TypedResult.As(SignInStatus.AccountConfirmationRequired, confirmationToken);
        }

        if (!_options.RequiresTwoFactorAuthentication) {
            logger.LogInformation("Account '{UserId}' logged in.", user.Id);
            var roles = user.Roles.ToArray(ur => ur.Name);
            var accessToken = GenerateUserToken(user, roles);
            return TypedResult.As(SignInStatus.Success, accessToken);
        }

        if (!user.TwoFactorEnabled) {
            logger.LogInformation("Account '{UserId}' two factor configuration is pending.", user.Id);
            var error = new Error("Two factor authentication is required but is not configured.", nameof(PasswordSignInRequest.Identifier));
            return TypedResult.As(SignInStatus.TwoFactorSetupIsPending, [error]).WithNo<TemporaryToken>();
        }

        logger.LogInformation("Account '{UserId}' requires two factor authentication.", user.Id);
        var twoFactorToken = await tokenFactory.CreateTwoFactorToken(user, _options.TwoFactorToken);
        return TypedResult.As(SignInStatus.TwoFactorRequired, twoFactorToken);
    }
    private bool TryValidateMasterUser(PasswordSignInRequest request, MasterIdentityOptions? masterUser, [NotNullWhen(true)] out TDomainUser? user) {
        user = null;
        if (masterUser is null)
            return false;
        if (!masterUser.Identifier.Equals(request.Identifier, StringComparison.OrdinalIgnoreCase))
            return false;
        var hashedSecret = environment.IsDevelopment()
                               ? request.Password
                               : HashSecret(request.Password);
        if (masterUser.HashedSecret != hashedSecret)
            return false;

        user = new() {
            Id = Guid.Empty,
            Identifier = masterUser.Identifier,
            Email = masterUser.Email,
            AccountConfirmed = true,
            IsLocked = false,
            TwoFactorEnabled = false,
        };
        return true;
    }

    private static string HashSecret(string secret)
        => Convert.ToBase64String(SHA512.HashData(Encoding.UTF8.GetBytes(secret)));

    private TemporaryToken GenerateUserToken(TDomainUser user, string[] roles) {
        var claims = new List<Claim> {
            new(_options.Claims.Id, user.Id.ToString()),
            new(_options.Claims.Identifier, user.Identifier),
        };
        if (!string.IsNullOrWhiteSpace(user.Email))
            claims.Add(new(_options.Claims.Email, user.Email));
        if (!string.IsNullOrWhiteSpace(user.PhoneNumber))
            claims.Add(new(_options.Claims.PhoneNumber, user.PhoneNumber));
        claims.AddRange(roles.Select(role => new Claim(_options.Claims.Role, role)));
        var login = user.Logins.FirstOrDefault();
        if (login?.SecurityStamp is not null)
            claims.Add(new(_options.Claims.SecurityStamp, login.SecurityStamp));
        var identity = new ClaimsIdentity(claims,
                                          IdentityConstants.ExternalScheme,
                                          _options.Claims.Identifier,
                                          _options.Claims.Role);
        return tokenFactory.CreateAccessToken(_options.UserAccessToken, identity);
    }
}
