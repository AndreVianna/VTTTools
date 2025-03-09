namespace HttpServices.Identity;

internal sealed class AuthenticationService(IConfiguration configuration,
                                            IHostEnvironment environment,
                                            IOptions<AuthenticationServiceOptions> identityOptions,
                                            UserManager<UserIdentity> userManager,
                                            SignInManager<UserIdentity> signInManager,
                                            ILogger<AuthenticationService> logger)
    : AuthenticationService<UserIdentity>(configuration,
                                  environment,
                                  identityOptions,
                                  userManager,
                                  signInManager,
                                  logger);

internal class AuthenticationService<TUser>(IConfiguration configuration,
                                            IHostEnvironment environment,
                                            IOptions<AuthenticationServiceOptions> identityOptions,
                                            UserManager<TUser> userManager,
                                            SignInManager<TUser> signInManager,
                                            ILogger<AuthenticationService<TUser>> logger)
    : IAuthenticationService
    where TUser : class, IUserIdentity, new() {
    private readonly AuthenticationServiceOptions _options = identityOptions.Value;
    private readonly JwtSecurityTokenHandler _jwtHandler = new();

    public async Task<TypedResult<SignInStatus, string>> PasswordSignIn(PasswordSignInRequest request) {
        logger.LogInformation("Login attempt for '{Email}'.", request.Identifier);
        if (TryValidateMasterUser(request, _options.Master, out var master)) {
            var token = GenerateUserToken(master.Id, master.Identifier, [Roles.Admin], master.Email, master.PhoneNumber);
            await signInManager.SignInAsync(master, true);
            logger.LogInformation("Master user logged in.");
            return TypedResult.As(SignInStatus.Success, token);
        }

        var user = await userManager.FindByEmailAsync(request.Identifier);
        if (user is null) {
            logger.LogInformation("Account '{Email}' not found.", request.Identifier);
            var error = new Error($"Account '{request.Identifier}' not found.", nameof(request.Identifier));
            return TypedResult.As(SignInStatus.AccountNotFound, [error]).WithNo<string>();
        }

        var result = await signInManager.PasswordSignInAsync(user, request.Password, request.RememberMe, lockoutOnFailure: user.LockoutEnabled);

        if (!user.AccountConfirmed && _options.SignIn.RequireConfirmedAccount) {
            logger.LogInformation("Account '{UserId}' requires confirmation.", user.Id);
            var token = await GenerateEmailConfirmationToken(user);
            var error = new Error("Account requires confirmation.", nameof(request.Identifier));
            return TypedResult.As(SignInStatus.EmailNotConfirmed, token, error);
        }

        if (result.RequiresTwoFactor) {
            logger.LogInformation("Account '{UserId}' requires two factor.", user.Id);
            var token = await GenerateTwoFactorToken(user);
            var error = new Error("Two factor authentication required.", nameof(request.Identifier));
            return TypedResult.As(SignInStatus.RequiresTwoFactor, token, error);
        }

        if (result.Succeeded) {
            logger.LogInformation("Account '{UserId}' logged in.", user.Id);
            var roles = await userManager.GetRolesAsync(user);
            var token = GenerateUserToken(user.Id, user.Identifier, roles, user.Email, user.PhoneNumber);
            return TypedResult.As(SignInStatus.Success, token);
        }

        if (result.IsLockedOut) {
            logger.LogInformation("Account '{UserId}' is locked out.", user.Id);
            var error = new Error("Account is temporarily locked.", nameof(request.Identifier));
            return TypedResult.As(SignInStatus.LockedAccount, [error]).WithNo<string>();
        }

        if (result.IsNotAllowed) {
            logger.LogInformation("Account '{UserId}' is blocked.", user.Id);
            var error = new Error("Account is blocked.", nameof(request.Identifier));
            return TypedResult.As(SignInStatus.BlockedAccount, [error]).WithNo<string>();
        }

        logger.LogInformation("Invalid login for '{UserId}'", user.Id);
        var failure = new Error("Invalid login.", nameof(request.Identifier));
        return TypedResult.As(SignInStatus.IncorrectLogin, [failure]).WithNo<string>();
    }

    public Task SignOut(SignOutRequest _)
        => signInManager.SignOutAsync();

    public async Task<AuthenticationScheme[]> GetSchemes()
        => [.. await signInManager.GetExternalAuthenticationSchemesAsync()];

    private Task<string> GenerateEmailConfirmationToken(TUser user)
        => userManager.GenerateEmailConfirmationTokenAsync(user);

    private Task<string> GenerateTwoFactorToken(TUser user) {
        var provider = user.TwoFactorType switch {
            TwoFactorType.Phone => TokenOptions.DefaultPhoneProvider,
            TwoFactorType.Authenticator => TokenOptions.DefaultAuthenticatorProvider,
            _ => TokenOptions.DefaultEmailProvider,
        };
        return userManager.GenerateTwoFactorTokenAsync(user, provider);
    }

    private bool TryValidateMasterUser(PasswordSignInRequest request, MasterOptions? masterUser, [NotNullWhen(true)] out TUser? user) {
        user = null;
        if (masterUser?.Identifier.Equals(request.Identifier, StringComparison.OrdinalIgnoreCase) != true
         || masterUser.HashedSecret != (environment.IsDevelopment()
                                            ? request.Password
                                            : Convert.ToBase64String(SHA512.HashData(Encoding.UTF8.GetBytes(request.Password))))) {
            return false;
        }

        user = InstanceFactory.Create<TUser>();
        user.Id = masterUser.Id;
        user.Identifier = masterUser.Identifier;
        user.Email = masterUser.Email;
        user.NormalizedEmail = user.Email?.ToUpperInvariant();
        user.UserName = masterUser.Identifier;
        user.NormalizedUserName = user.UserName?.ToUpperInvariant();
        user.SecurityStamp = Guid.NewGuid().ToString();
        user.EmailConfirmed = true;
        user.LockoutEnabled = true;
        user.TwoFactorEnabled = false;
        return true;
    }

    private string GenerateUserToken(string id, string identifier, IEnumerable<string> roles, string? email, string? phoneNumber) {
        var claims = new List<Claim> {
            new(_options.ClaimsIdentity.IdClaimType, id),
            new(_options.ClaimsIdentity.IdentifierClaimType, identifier),
        };
        if (!string.IsNullOrWhiteSpace(email))
            claims.Add(new(_options.ClaimsIdentity.EmailClaimType, email));
        if (!string.IsNullOrWhiteSpace(phoneNumber))
            claims.Add(new(_options.ClaimsIdentity.PhoneNumberClaimType, phoneNumber));
        claims.AddRange(roles.Select(role => new Claim(_options.ClaimsIdentity.RoleClaimType, role)));
        var identity = new ClaimsIdentity(claims,
                                          IdentityConstants.ExternalScheme,
                                          _options.ClaimsIdentity.IdentifierClaimType,
                                          _options.ClaimsIdentity.RoleClaimType);
        var jwtSettings = configuration.GetSection("Jwt").Get<JwtSettings>()!;
        var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings.Key));
        var now = DateTime.UtcNow;
        return _jwtHandler.CreateEncodedJwt(issuer: jwtSettings.Issuer,
                                            audience: jwtSettings.Audience,
                                            subject: identity,
                                            notBefore: now,
                                            expires: now.AddMinutes(30),
                                            issuedAt: now,
                                            signingCredentials: new(securityKey, SecurityAlgorithms.HmacSha256));
    }
}
