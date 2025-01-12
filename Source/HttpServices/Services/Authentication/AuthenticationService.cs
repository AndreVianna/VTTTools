using SignInResult = DotNetToolbox.Results.SignInResult;

namespace HttpServices.Services.Authentication;

internal static class AuthenticationService {
    public static JwtSecurityTokenHandler JwtHandler { get; } = new();
}

internal sealed class AuthenticationService<TUser>(IConfiguration configuration,
                                                   IOptions<IdentityOptions> identityOptions,
                                                   UserManager<TUser> userManager,
                                                   SignInManager<TUser> signInManager,
                                                   IMessagingService<TUser> messagingService,
                                                   ILogger<AuthenticationService<TUser>> logger)
    : IAuthenticationService
    where TUser : User {
    private readonly IdentityOptions _options = identityOptions.Value;

    public async Task<SignInResult> PasswordSignInAsync(PasswordSignInRequest request) {
        logger.LogInformation("Login attempt for '{Email}'.", request.Email);
        var user = await userManager.FindByEmailAsync(request.Email);
        if (user is null) {
            logger.LogInformation("Account for '{Email}' not found.", request.Email);
            return SignInResult.FailedAttempt();
        }

        var result = await signInManager.PasswordSignInAsync(request.Email,
                                                             request.Password,
                                                             request.RememberMe,
                                                             lockoutOnFailure: user.LockoutEnabled);

        if (!user.AccountConfirmed && _options.SignIn.RequireConfirmedAccount) {
            logger.LogInformation("Account '{UserId}' requires confirmation.", user.Id);
            var token = await userManager.GenerateEmailConfirmationTokenAsync(user);
            return SignInResult.ConfirmationIsPending(token);
        }

        if (result.RequiresTwoFactor) {
            logger.LogInformation("Account '{USerId}' requires two factor.", user.Id);
            var provider = user.TwoFactorType switch {
                TwoFactorType.Phone => TokenOptions.DefaultPhoneProvider,
                TwoFactorType.Authenticator => TokenOptions.DefaultAuthenticatorProvider,
                _ => TokenOptions.DefaultEmailProvider,
            };
            var token = await userManager.GenerateTwoFactorTokenAsync(user, provider);
            await messagingService.SendTwoFactorMessageAsync(user, token);
            return SignInResult.TwoFactorIsRequired(token);
        }

        if (result.Succeeded) {
            logger.LogInformation("Account '{UserId}' logged in.", user.Id);
            var roles = await userManager.GetRolesAsync(user);
            var claims = new Claim[] {
                new(_options.ClaimsIdentity.UserIdClaimType, user.Id),
                new(_options.ClaimsIdentity.EmailClaimType, user.Email!),
            };
            claims = [.. claims, .. roles.Select(role => new Claim(ClaimTypes.Role, role))];
            var identity = new ClaimsIdentity(claims,
                                              "password",
                                              _options.ClaimsIdentity.UserNameClaimType,
                                              _options.ClaimsIdentity.RoleClaimType);
            var jwtSettings = configuration.GetSection("Jwt").Get<JwtSettings>()!;
            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings.Key));
            var token = AuthenticationService.JwtHandler.CreateEncodedJwt(
                issuer: jwtSettings.Issuer,
                audience: jwtSettings.Audience,
                subject: identity,
                notBefore: null,
                expires: DateTime.UtcNow.AddMinutes(30),
                issuedAt: DateTime.UtcNow,
                signingCredentials: new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256));
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
}
