namespace WebApi.Services;

public class IdentityProviderService(IHostEnvironment environment,
                                     IUserDataStore<User> userDataStore,
                                     IAccountManagementTokenFactory<User> tokenFactory,
                                     IOptions<IdentityProviderWebApiOptions> identityOptions,
                                     TimeProvider clock,
                                     ILogger<IdentityProviderService> logger)
    : IdentityProviderService<User>(environment,
                                    userDataStore,
                                    tokenFactory,
                                    identityOptions,
                                    clock,
                                    logger);

public class IdentityProviderService<TUser>(IHostEnvironment environment,
                                            IUserDataStore<TUser> userDataStore,
                                            IAccountManagementTokenFactory<TUser> tokenFactory,
                                            IOptions<IdentityProviderWebApiOptions> identityOptions,
                                            TimeProvider clock,
                                            ILogger logger)
    : IAuthenticationService
    where TUser : User, new() {
    private readonly IdentityProviderWebApiOptions _options = identityOptions.Value;

    public async Task<TypedResult<SignInStatus, TemporaryToken>> PasswordSignIn(PasswordSignInRequest request) {
        logger.LogInformation("Login attempt for '{Identifier}'.", request.Identifier);
        if (TryValidateMasterUser(request, _options.Master, out var master))
            return HandleMasterLogin(master);

        var user = await userDataStore.FindAsync(request.Identifier);
        if (user is null)
            return HandleUserNotFound(request);

        var login = user.Logins.FirstOrDefault();
        var now = clock.GetUtcNow();
        return string.IsNullOrWhiteSpace(login?.HashedSecret) ? HandleLoginNotFound(user)
             : user.IsBlocked ? HandleBlockedUser(user)
             : user.LockoutEnd < now ? HandleLockedUser(user)
             : await userDataStore.TryPasswordSignInAsync(user.Identifier, request.Password, login.Provider) ? await HandleSuccessLogin(user)
             : HandleFailedSignIn(user);
    }

    public async Task SignOut(SignOutRequest request) {
        var user = await userDataStore.FindAsync(request.Identifier);
        if (user is null) {
            logger.LogInformation("Account '{Identifier}' not found when signing out.", request.Identifier);
            return;
        }

        logger.LogInformation("Account '{Identifier}' logged out.", user.Identifier);
    }

    public Task<AuthenticationScheme[]> GetSchemes() => Task.FromResult<AuthenticationScheme[]>([]);

    private TypedResult<SignInStatus, TemporaryToken> HandleMasterLogin(TUser master) {
        var token = GenerateUserAccessToken(master);
        logger.LogInformation("Master user logged in.");
        return TypedResult.As(SignInStatus.Success, token);
    }

    private TypedResult<SignInStatus, TemporaryToken> HandleUserNotFound(PasswordSignInRequest request) {
        logger.LogInformation("Account '{Identifier}' not found.", request.Identifier);
        return TypedResult.As(SignInStatus.AccountNotFound).WithNo<TemporaryToken>();
    }

    private TypedResult<SignInStatus, TemporaryToken> HandleLoginNotFound(TUser user) {
        logger.LogInformation("Account '{Identifier}' does not have a valid login.", user.Identifier);
        return TypedResult.As(SignInStatus.LoginProviderNotFound).WithNo<TemporaryToken>();
    }

    private TypedResult<SignInStatus, TemporaryToken> HandleBlockedUser(TUser user) {
        logger.LogInformation("Account '{Identifier}' is blocked.", user.Identifier);
        return TypedResult.As(SignInStatus.AccountIsBlocked).WithNo<TemporaryToken>();
    }

    private TypedResult<SignInStatus, TemporaryToken> HandleLockedUser(TUser user) {
        logger.LogInformation("Account '{Identifier}' does not have a local login.", user.Identifier);
        return TypedResult.As(SignInStatus.AccountIsLocked).WithNo<TemporaryToken>();
    }

    private TypedResult<SignInStatus, TemporaryToken> HandleFailedSignIn(TUser user) {
        logger.LogInformation("Invalid login for '{Identifier}'.", user.Identifier);
        return TypedResult.As(SignInStatus.Incorrect).WithNo<TemporaryToken>();
    }

    private async Task<TypedResult<SignInStatus, TemporaryToken>> HandleSuccessLogin(TUser user) {
        logger.LogInformation("Valid login for '{Identifier}'.", user.Identifier);
        if (_options.AccountConfirmation.IsRequired && !user.AccountIsConfirmed) {
            logger.LogInformation("Account '{Identifier}' confirmation is pending.", user.Identifier);
            var confirmationToken = await tokenFactory.CreateAccountConfirmationToken(user, _options.AccountConfirmation);
            return TypedResult.As(SignInStatus.AccountConfirmationRequired, confirmationToken);
        }

        if (_options.TwoFactorAuthentication.IsRequired && !user.TwoFactorIsSetup) {
            logger.LogInformation("Account '{Identifier}' two factor configuration is pending or incorrect.", user.Identifier);
            return TypedResult.As(SignInStatus.TwoFactorIsNotSetup).WithNo<TemporaryToken>();
        }

        if (!_options.TwoFactorAuthentication.IsRequired) {
            logger.LogInformation("Account '{Identifier}' requires two factor authentication.", user.Identifier);
            var twoFactorToken = await tokenFactory.CreateTwoFactorToken(user, _options.TwoFactorAuthentication);
            return TypedResult.As(SignInStatus.TwoFactorRequired, twoFactorToken);
        }

        logger.LogInformation("Account '{Identifier}' logged in.", user.Identifier);
        var accessToken = GenerateUserAccessToken(user);
        return TypedResult.As(SignInStatus.Success, accessToken);
    }
    private bool TryValidateMasterUser(PasswordSignInRequest request, MasterIdentityOptions? masterUserOptions, [NotNullWhen(true)] out TUser? user) {
        user = null;
        if (masterUserOptions is null)
            return false;
        if (!masterUserOptions.Identifier.Equals(request.Identifier, StringComparison.OrdinalIgnoreCase))
            return false;
        var hashedSecret = environment.IsDevelopment()
                               ? request.Password
                               : HashSecret(request.Password);
        if (masterUserOptions.HashedSecret != hashedSecret)
            return false;

        user = new() {
            Identifier = masterUserOptions.Identifier,
            Email = masterUserOptions.Email,
            AccountIsConfirmed = true,
            EmailIsConfirmed = true,
            PhoneNumber = masterUserOptions.PhoneNumber,
            PhoneNumberIsConfirmed = true,
            Roles = [Roles.Admin],
        };
        return true;
    }

    private static string HashSecret(string secret)
        => Convert.ToBase64String(SHA512.HashData(Encoding.UTF8.GetBytes(secret)));

    private TemporaryToken GenerateUserAccessToken(TUser user) {
        var claims = new List<Claim> {
            new(_options.UserClaims.Id, user.Identifier),
            new(_options.UserClaims.Identifier, user.Identifier),
        };
        if (!string.IsNullOrWhiteSpace(user.Email))
            claims.Add(new(_options.UserClaims.Email, user.Email));
        if (!string.IsNullOrWhiteSpace(user.PhoneNumber))
            claims.Add(new(_options.UserClaims.PhoneNumber, user.PhoneNumber));
        claims.AddRange(user.Roles.Select(ur => new Claim(_options.UserClaims.Role, ur)));
        var login = user.Logins.FirstOrDefault();
        if (login?.SecurityStamp is not null)
            claims.Add(new(_options.UserClaims.SecurityStamp, login.SecurityStamp));
        var identity = new ClaimsIdentity(claims,
                                          IdentityConstants.ExternalScheme,
                                          _options.UserClaims.Identifier,
                                          _options.UserClaims.Role);
        return tokenFactory.CreateAccessToken(_options.UserAccessToken, identity);
    }
}
