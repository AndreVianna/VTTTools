using System.Text.Json;

namespace HttpServices.Services.Authentication;

internal sealed class AuthenticationService(IConfiguration configuration,
                                            IHostEnvironment environment,
                                            IOptions<AuthenticationServiceOptions> identityOptions,
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
                                            IOptions<AuthenticationServiceOptions> identityOptions,
                                            UserManager<TUser> userManager,
                                            SignInManager<TUser> signInManager,
                                            IMessagingService<TUser> messagingService,
                                            ILogger<AuthenticationService<TUser, TProfile>> logger)
    : IAuthenticationService
    where TUser : class, IIdentityUser<TProfile>, new()
    where TProfile : class, IUserProfile, new() {
    private readonly AuthenticationServiceOptions _options = identityOptions.Value;
    private readonly JwtSecurityTokenHandler _jwtHandler = new();

    public async Task<TypedResult<SignInStatus, string>> PasswordSignIn(PasswordSignInRequest request) {
        logger.LogInformation("Login attempt for '{Email}'.", request.Identifier);
        if (TryValidateMasterUser(request, _options.Master, out var master)) {
            var token = GenerateUserToken(master.Id, master.Identifier, [Roles.Admin], master.Email, master.PhoneNumber, master.Profile);
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
            var token = await GenerateAndSendTwoFactorToken(user);
            var error = new Error("Two factor authentication required.", nameof(request.Identifier));
            return TypedResult.As(SignInStatus.RequiresTwoFactor, token, error);
        }

        if (result.Succeeded) {
            logger.LogInformation("Account '{UserId}' logged in.", user.Id);
            var roles = await userManager.GetRolesAsync(user);
            var token = GenerateUserToken(user.Id, user.Identifier, roles, user.Email, user.PhoneNumber, user.Profile);
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

        user.Profile = new() { Name = masterUser.Name ?? masterUser.Identifier };
        return true;
    }

    private string GenerateUserToken(string id, string identifier, IEnumerable<string> roles, string? email, string? phoneNumber, IUserProfile? profile) {
        var claims = new List<Claim> {
            new(_options.ClaimsIdentity.IdClaimType, id),
            new(_options.ClaimsIdentity.IdentifierClaimType, identifier),
        };
        if (!string.IsNullOrWhiteSpace(email))
            claims.Add(new(_options.ClaimsIdentity.EmailClaimType, email));
        if (!string.IsNullOrWhiteSpace(phoneNumber))
            claims.Add(new(_options.ClaimsIdentity.PhoneNumberClaimType, phoneNumber));
        claims.AddRange(roles.Select(role => new Claim(_options.ClaimsIdentity.RoleClaimType, role)));
        if (profile is not null)
            claims.Add(new(_options.ClaimsIdentity.ProfileClaimType, JsonSerializer.Serialize(profile)));
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
