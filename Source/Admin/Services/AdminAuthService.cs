namespace VttTools.Admin.Services;

public class AdminAuthService(
    UserManager<User> userManager,
    SignInManager<User> signInManager,
    IJwtTokenService jwtTokenService,
    ILogger<AdminAuthService> logger)
    : IAdminAuthService {

    public async Task<AdminLoginResponse> LoginAsync(AdminLoginRequest request, CancellationToken ct = default) {
        try {
            var user = await userManager.FindByEmailAsync(request.Email);
            if (user is null) {
                logger.LogWarning("Admin login attempt with non-existent email: {Email}", request.Email);
                return new AdminLoginResponse { Success = false };
            }

            if (!user.EmailConfirmed) {
                logger.LogWarning("Admin login attempt with unconfirmed email: {Email}", request.Email);
                return new AdminLoginResponse { Success = false };
            }

            if (await userManager.IsLockedOutAsync(user)) {
                logger.LogWarning("Admin login attempt for locked account: {Email}", request.Email);
                return new AdminLoginResponse { Success = false };
            }

            var roles = await userManager.GetRolesAsync(user);
            if (!roles.Contains("Administrator")) {
                logger.LogWarning("Non-admin user attempted admin login: {Email}", request.Email);
                return new AdminLoginResponse { Success = false };
            }

            // TODO: Re-enable when 2FA feature is implemented
            // TEMPORARY: 2FA requirement disabled for development/testing
            // if (!user.TwoFactorEnabled) {
            //     logger.LogWarning("Admin user without 2FA attempted login: {Email}", request.Email);
            //     return new AdminLoginResponse { Success = false };
            // }

            var passwordValid = await userManager.CheckPasswordAsync(user, request.Password);
            if (!passwordValid) {
                await userManager.AccessFailedAsync(user);
                logger.LogWarning("Admin login attempt with invalid password: {Email}", request.Email);
                return new AdminLoginResponse { Success = false };
            }

            // TODO: Re-enable when 2FA feature is implemented
            // TEMPORARY: 2FA validation disabled for development/testing
            // if (string.IsNullOrEmpty(request.TwoFactorCode)) {
            //     logger.LogInformation("Admin login requires 2FA code: {Email}", request.Email);
            //     return new AdminLoginResponse {
            //         Success = false,
            //         RequiresTwoFactor = true
            //     };
            // }
            //
            // var twoFactorResult = await signInManager.TwoFactorAuthenticatorSignInAsync(
            //     request.TwoFactorCode,
            //     isPersistent: false,
            //     rememberClient: false);
            //
            // if (!twoFactorResult.Succeeded) {
            //     await userManager.AccessFailedAsync(user);
            //     logger.LogWarning("Admin login attempt with invalid 2FA code: {Email}", request.Email);
            //     return new AdminLoginResponse { Success = false };
            // }

            await signInManager.SignInAsync(user, isPersistent: false);
            await userManager.ResetAccessFailedCountAsync(user);

            logger.LogInformation("Admin user logged in successfully: {Email}", request.Email);

            var token = jwtTokenService.GenerateToken(user, roles, rememberMe: false);

            return new AdminLoginResponse {
                Success = true,
                User = new AdminUserInfo {
                    Id = user.Id,
                    Email = user.Email,
                    Name = user.Name,
                    DisplayName = user.DisplayName,
                    IsAdmin = true
                },
                Token = token
            };
        }
        catch (Exception ex) {
            logger.LogError(ex, "Error during admin login for email: {Email}", request.Email);
            return new AdminLoginResponse { Success = false };
        }
    }

    public async Task<AdminLoginResponse> LogoutAsync(CancellationToken ct = default) {
        try {
            await signInManager.SignOutAsync();
            logger.LogInformation("Admin user logged out successfully");

            return new AdminLoginResponse { Success = true };
        }
        catch (Exception ex) {
            logger.LogError(ex, "Error during admin logout");
            return new AdminLoginResponse { Success = false };
        }
    }

    public async Task<AdminUserInfo?> GetCurrentUserAsync(Guid userId, CancellationToken ct = default) {
        try {
            var user = await userManager.FindByIdAsync(userId.ToString());
            if (user is null) {
                logger.LogWarning("GetCurrentUser called for non-existent user ID: {UserId}", userId);
                return null;
            }

            var roles = await userManager.GetRolesAsync(user);
            if (!roles.Contains("Administrator")) {
                logger.LogWarning("GetCurrentUser called for non-admin user: {UserId}", userId);
                return null;
            }

            return new AdminUserInfo {
                Id = user.Id,
                Email = user.Email,
                Name = user.Name,
                DisplayName = user.DisplayName,
                IsAdmin = true
            };
        }
        catch (Exception ex) {
            logger.LogError(ex, "Error getting current admin user with ID: {UserId}", userId);
            return null;
        }
    }

    public async Task<AdminSessionResponse> GetSessionStatusAsync(CancellationToken ct = default) {
        await Task.CompletedTask;
        return new AdminSessionResponse {
            IsValid = true,
            ExpiresAt = DateTime.UtcNow.AddMinutes(30)
        };
    }
}
