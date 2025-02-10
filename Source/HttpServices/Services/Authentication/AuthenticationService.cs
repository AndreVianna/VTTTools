using SignInResult = DotNetToolbox.Results.SignInResult;

namespace HttpServices.Services.Authentication;

internal sealed class AuthenticationService(IConfiguration configuration,
                                            IHostEnvironment environment,
                                            IOptions<ExtendedIdentityOptions> identityOptions,
                                            UserManager<User> userManager,
                                            SignInManager<User> signInManager,
                                            IMessagingService messagingService,
                                            ILogger<AuthenticationService> logger)
    : AuthenticationService<User>(configuration,
                                  environment,
                                  identityOptions,
                                  userManager,
                                  signInManager,
                                  messagingService,
                                  logger);

internal class AuthenticationService<TUser>(IConfiguration configuration,
                                            IHostEnvironment environment,
                                            IOptions<ExtendedIdentityOptions> identityOptions,
                                            UserManager<TUser> userManager,
                                            SignInManager<TUser> signInManager,
                                            IMessagingService<TUser> messagingService,
                                            ILogger<AuthenticationService<TUser>> logger)
    : IAuthenticationService
    where TUser : User {
    private readonly ExtendedIdentityOptions _options = identityOptions.Value;
    private static readonly JwtSecurityTokenHandler _jwtHandler = new();

    public async Task<SignInResult> PasswordSignIn(PasswordSignInRequest request) {
        logger.LogInformation("Login attempt for '{Email}'.", request.Email);
        if (TryValidateMasterUser(request, _options.MasterUser, out var master)) {
            var token = GenerateUserToken(master.Id, master.Name!, master.Email!, [Roles.Admin]);
            await signInManager.SignInAsync(master, true);
            logger.LogInformation("Master user logged in.");
            return SignInResult.Success(token);
        }

        var user = await userManager.FindByEmailAsync(request.Email);
        if (user is null) {
            logger.LogInformation("Account for '{Email}' not found.", request.Email);
            return SignInResult.FailedAttempt();
        }

        var result = await signInManager.PasswordSignInAsync(user, request.Password, request.RememberMe, lockoutOnFailure: user.LockoutEnabled);

        if (!user.AccountConfirmed && _options.SignIn.RequireConfirmedAccount) {
            logger.LogInformation("Account '{UserId}' requires confirmation.", user.Id);
            var token = await GenerateEmailConfirmationToken(user);
            return SignInResult.ConfirmationIsPending(token);
        }

        if (result.RequiresTwoFactor) {
            logger.LogInformation("Account '{UserId}' requires two factor.", user.Id);
            var token = await GenerateAndSendTwoFactorToken(user);
            return SignInResult.TwoFactorIsRequired(token);
        }

        if (result.Succeeded) {
            logger.LogInformation("Account '{UserId}' logged in.", user.Id);
            var roles = await userManager.GetRolesAsync(user);
            var token = GenerateUserToken(user.Id, user.Name!, user.Email!, roles);
            return SignInResult.Success(token);
        }

        if (result.IsLockedOut) {
            logger.LogInformation("Account '{UserId}' is locked out.", user.Id);
            return SignInResult.LockedAccount();
        }

        if (result.IsNotAllowed) {
            logger.LogInformation("Account '{UserId}' is blocked.", user.Id);
            return SignInResult.BlockedAccount();
        }

        logger.LogInformation("Account '{UserId}' invalid login.", user.Id);
        return SignInResult.FailedAttempt();
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
        user.UserName = master.Name;
        user.Email = master.Email;
        return true;
    }

    private string GenerateUserToken(string id, string name, string email, IEnumerable<string> roles) {
        var claims = new Claim[] {
            new(_options.ClaimsIdentity.UserIdClaimType, id),
            new(_options.ClaimsIdentity.UserNameClaimType, name),
            new(_options.ClaimsIdentity.EmailClaimType, email),
        };
        claims = [.. claims, .. roles.Select(role => new Claim(ClaimTypes.Role, role))];
        var identity = new ClaimsIdentity(claims,
                                          "password",
                                          _options.ClaimsIdentity.UserNameClaimType,
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
