namespace HttpServices.Services.Authentication;

internal sealed class AuthenticationService(IConfiguration configuration,
                                            IHostEnvironment environment,
                                            IOptions<ExtendedIdentityOptions> identityOptions,
                                            UserManager<User> userManager,
                                            SignInManager<User> signInManager,
                                            IMessagingService<User> messagingService,
                                            ILogger<AuthenticationService> logger)
    : AuthenticationService<User, NamedUserProfile>(configuration,
                                                      environment,
                                                      identityOptions,
                                                      userManager,
                                                      signInManager,
                                                      messagingService,
                                                      logger);

internal class AuthenticationService<TUser, TProfile>(IConfiguration configuration,
                                            IHostEnvironment environment,
                                            IOptions<ExtendedIdentityOptions> identityOptions,
                                            UserManager<TUser> userManager,
                                            SignInManager<TUser> signInManager,
                                            IMessagingService<TUser> messagingService,
                                            ILogger<AuthenticationService<TUser, TProfile>> logger)
    : IAuthenticationService
    where TUser : class, IIdentityUser<TProfile>, new()
    where TProfile : class, IUserProfile, new() {
    private readonly ExtendedIdentityOptions _options = identityOptions.Value;
    private readonly JwtSecurityTokenHandler _jwtHandler = new();

    public async Task<TypedResult<SignInStatus, string>> PasswordSignIn(PasswordSignInRequest request) {
        logger.LogInformation("Login attempt for '{Email}'.", request.Email);
        if (TryValidateMasterUser(request, _options.MasterUser, out var master)) {
            var token = GenerateUserToken(master.Id, master.Profile?.Name ?? master.Email!, master.Email!, [Roles.Admin]);
            await signInManager.SignInAsync(master, true);
            logger.LogInformation("Master user logged in.");
            return TypedResult.As(SignInStatus.Success, token);
        }

        var user = await userManager.FindByEmailAsync(request.Email);
        if (user is null) {
            logger.LogInformation("Account '{Email}' not found.", request.Email);
            var error = new Error($"Account '{request.Email}' not found.", nameof(request.Email));
            return TypedResult.As(SignInStatus.AccountNotFound, [error]).WithNo<string>();
        }

        var result = await signInManager.PasswordSignInAsync(user, request.Password, request.RememberMe, lockoutOnFailure: user.LockoutEnabled);

        if (!user.AccountConfirmed && _options.SignIn.RequireConfirmedAccount) {
            logger.LogInformation("Account '{UserId}' requires confirmation.", user.Id);
            var token = await GenerateEmailConfirmationToken(user);
            var error = new Error("Account requires confirmation.", nameof(request.Email));
            return TypedResult.As(SignInStatus.EmailNotConfirmed, token, error);
        }

        if (result.RequiresTwoFactor) {
            logger.LogInformation("Account '{UserId}' requires two factor.", user.Id);
            var token = await GenerateAndSendTwoFactorToken(user);
            var error = new Error("Two factor authentication required.", nameof(request.Email));
            return TypedResult.As(SignInStatus.RequiresTwoFactor, token, error);
        }

        if (result.Succeeded) {
            logger.LogInformation("Account '{UserId}' logged in.", user.Id);
            var roles = await userManager.GetRolesAsync(user);
            var token = GenerateUserToken(user.Id, user.Profile?.Name ?? user.Email!, user.Email!, roles);
            return TypedResult.As(SignInStatus.Success, token);
        }

        if (result.IsLockedOut) {
            logger.LogInformation("Account '{UserId}' is locked out.", user.Id);
            var error = new Error("Account is temporarily locked.", nameof(request.Email));
            return TypedResult.As(SignInStatus.LockedAccount, [error]).WithNo<string>();
        }

        if (result.IsNotAllowed) {
            logger.LogInformation("Account '{UserId}' is blocked.", user.Id);
            var error = new Error("Account is blocked.", nameof(request.Email));
            return TypedResult.As(SignInStatus.BlockedAccount, [error]).WithNo<string>();
        }

        logger.LogInformation("Invalid login for '{UserId}'", user.Id);
        var failure = new Error("Invalid login.", nameof(request.Email));
        return TypedResult.As(SignInStatus.IncorrectLogin, [failure]).WithNo<string>();
    }

    public Task SignOut(SignOutRequest _)
        => signInManager.SignOutAsync();

    public async Task<AuthenticationScheme[]> GetSchemes()
        => [.. await signInManager.GetExternalAuthenticationSchemesAsync()];

    private Task<string> GenerateEmailConfirmationToken(TUser user)
        => userManager.GenerateEmailConfirmationTokenAsync(user);

    private async Task<string> GenerateAndSendTwoFactorToken(TUser user) {
        var provider = user.TwoFactorType switch {
            TwoFactorType.Phone => TokenOptions.DefaultPhoneProvider,
            TwoFactorType.Authenticator => TokenOptions.DefaultAuthenticatorProvider,
            _ => TokenOptions.DefaultEmailProvider,
        };
        var token = await userManager.GenerateTwoFactorTokenAsync(user, provider);
        await messagingService.SendTwoFactorMessageAsync(user, token);
        return token;
    }

    private bool TryValidateMasterUser(PasswordSignInRequest request, MasterUserOptions? master, [NotNullWhen(true)] out TUser? user) {
        user = null;
        if (master is null
          || !request.Email.Equals(master.Email, StringComparison.OrdinalIgnoreCase)
          || request.Password != (environment.IsDevelopment()
                                        ? master.Password
                                        : Convert.ToBase64String(SHA512.HashData(Encoding.UTF8.GetBytes(master.Password))))) {
            return false;
        }

        user = InstanceFactory.Create<TUser>();
        user.Id = master.Id;
        user.UserName = master.Email;
        user.NormalizedUserName = master.Email.ToUpperInvariant();
        user.Email = master.Email;
        user.NormalizedEmail = master.Email.ToUpperInvariant();
        user.SecurityStamp = Guid.NewGuid().ToString();
        user.EmailConfirmed = true;
        user.TwoFactorEnabled = false;
        user.LockoutEnabled = false;

        user.Profile = new() { Name = master.Profile?.Name ?? master.Email };
        return true;
    }

    private string GenerateUserToken(string id, string name, string email, IEnumerable<string> roles) {
        var claims = new Claim[] {
            new(_options.ClaimsIdentity.UserIdClaimType, id),
            new(_options.ClaimsIdentity.UserNameClaimType, email),
            new(_options.ClaimsIdentity.EmailClaimType, email),
            new("name", name),
        };
        claims = [.. claims, .. roles.Select(role => new Claim(_options.ClaimsIdentity.RoleClaimType, role))];
        var identity = new ClaimsIdentity(claims,
                                          IdentityConstants.ExternalScheme,
                                          _options.ClaimsIdentity.UserIdClaimType,
                                          _options.ClaimsIdentity.RoleClaimType);
        var jwtSettings = configuration.GetSection("Jwt").Get<JwtSettings>()!;
        var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings.Key));
        return _jwtHandler.CreateEncodedJwt(issuer: jwtSettings.Issuer,
                                            audience: jwtSettings.Audience,
                                            subject: identity,
                                            notBefore: null,
                                            expires: DateTime.UtcNow.AddMinutes(30),
                                            issuedAt: DateTime.UtcNow,
                                            signingCredentials: new(securityKey, SecurityAlgorithms.HmacSha256));
    }
}
