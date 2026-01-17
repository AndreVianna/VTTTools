namespace VttTools.Admin.Auth.Services;

public class AdminAuthService(
    IUserStorage userStorage,
    ISignInService signInService,
    IJwtTokenService jwtTokenService,
    ILogger<AdminAuthService> logger)
    : IAdminAuthService {

    public async Task<AdminLoginResponse> LoginAsync(AdminLoginRequest request, CancellationToken ct = default) {
        try {
            var user = await userStorage.FindByEmailAsync(request.Email, ct);
            if (user is null) {
                logger.LogWarning("Admin login attempt with non-existent account");
                return new AdminLoginResponse { Success = false };
            }

            if (!user.EmailConfirmed) {
                logger.LogWarning("Admin login attempt with unconfirmed account: {UserId}", user.Id);
                return new AdminLoginResponse { Success = false };
            }

            var isLockedOut = user is { LockoutEnabled: true, LockoutEnd: not null } &&
                              user.LockoutEnd.Value > DateTimeOffset.UtcNow;
            if (isLockedOut) {
                logger.LogWarning("Admin login attempt for locked account: {UserId}", user.Id);
                return new AdminLoginResponse { Success = false };
            }

            if (!user.Roles.Contains("Administrator")) {
                logger.LogWarning("Non-admin user attempted admin login: {UserId}", user.Id);
                return new AdminLoginResponse { Success = false };
            }

            var passwordValid = await userStorage.CheckPasswordAsync(user.Id, request.Password, ct);
            if (!passwordValid) {
                await userStorage.RecordAccessFailedAsync(user.Id, ct);
                logger.LogWarning("Admin login attempt with invalid password: {UserId}", user.Id);
                return new AdminLoginResponse { Success = false };
            }

            await signInService.SignInAsync(user.Id, isPersistent: false, ct);
            await userStorage.ResetAccessFailedCountAsync(user.Id, ct);

            logger.LogInformation("Admin user logged in successfully: {UserId}", user.Id);

            var token = jwtTokenService.GenerateToken(user, user.Roles, rememberMe: false);

            return new AdminLoginResponse {
                Success = true,
                User = new AdminUserInfo {
                    Id = user.Id,
                    Email = user.Email,
                    Name = user.Name,
                    DisplayName = user.DisplayName,
                    IsAdmin = true,
                },
                Token = token,
            };
        }
        catch (Exception ex) {
            logger.LogError(ex, "Error during admin login");
            return new AdminLoginResponse { Success = false };
        }
    }

    public async Task<AdminLoginResponse> LogoutAsync(CancellationToken ct = default) {
        try {
            await signInService.SignOutAsync(ct);
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
            var user = await userStorage.FindByIdAsync(userId, ct);
            if (user is null) {
                logger.LogWarning("GetCurrentUser called for non-existent user ID: {UserId}", userId);
                return null;
            }

            if (!user.Roles.Contains("Administrator")) {
                logger.LogWarning("GetCurrentUser called for non-admin user: {UserId}", userId);
                return null;
            }

            return new AdminUserInfo {
                Id = user.Id,
                Email = user.Email,
                Name = user.Name,
                DisplayName = user.DisplayName,
                IsAdmin = true,
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
            ExpiresAt = DateTime.UtcNow.AddMinutes(30),
        };
    }
}
