namespace VttTools.Auth.Services;

using VttTools.Auth.ApiContracts;
using VttTools.Identity.Model;

public class SecurityService(
    UserManager<User> userManager,
    ILogger<SecurityService> logger) : ISecurityService {

    public async Task<SecuritySettingsResponse> GetSecuritySettingsAsync(Guid userId, CancellationToken ct = default) {
        try {
            var user = await userManager.FindByIdAsync(userId.ToString());
            if (user is null) {
                logger.LogWarning("Security settings request for non-existent user ID: {UserId}", userId);
                return new SecuritySettingsResponse {
                    Success = false,
                    Message = "User not found",
                    HasPassword = false,
                    TwoFactorEnabled = false,
                    RecoveryCodesRemaining = 0
                };
            }

            var recoveryCodesRemaining = await userManager.CountRecoveryCodesAsync(user);

            logger.LogInformation("Security settings retrieved for user: {UserId}", userId);
            return new SecuritySettingsResponse {
                Success = true,
                Message = null,
                HasPassword = !string.IsNullOrEmpty(user.PasswordHash),
                TwoFactorEnabled = user.TwoFactorEnabled,
                RecoveryCodesRemaining = recoveryCodesRemaining
            };
        }
        catch (Exception ex) {
            logger.LogError(ex, "Error getting security settings for user ID: {UserId}", userId);
            return new SecuritySettingsResponse {
                Success = false,
                Message = "Internal server error",
                HasPassword = false,
                TwoFactorEnabled = false,
                RecoveryCodesRemaining = 0
            };
        }
    }

    public async Task<PasswordChangeResponse> ChangePasswordAsync(Guid userId, ChangePasswordRequest request, CancellationToken ct = default) {
        try {
            var user = await userManager.FindByIdAsync(userId.ToString());
            if (user is null) {
                logger.LogWarning("Password change attempted for non-existent user ID: {UserId}", userId);
                return new PasswordChangeResponse {
                    Success = false,
                    Message = "User not found"
                };
            }

            var isCurrentPasswordValid = await userManager.CheckPasswordAsync(user, request.CurrentPassword);
            if (!isCurrentPasswordValid) {
                logger.LogWarning("Password change failed - incorrect current password for user: {UserId}", userId);
                return new PasswordChangeResponse {
                    Success = false,
                    Message = "Current password is incorrect"
                };
            }

            var result = await userManager.ChangePasswordAsync(user, request.CurrentPassword, request.NewPassword);
            if (!result.Succeeded) {
                var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                logger.LogWarning("Password change failed for user {UserId}: {Errors}", userId, errors);
                return new PasswordChangeResponse {
                    Success = false,
                    Message = errors
                };
            }

            logger.LogInformation("Password changed successfully for user: {UserId}", userId);
            return new PasswordChangeResponse {
                Success = true,
                Message = "Password changed successfully"
            };
        }
        catch (Exception ex) {
            logger.LogError(ex, "Error changing password for user ID: {UserId}", userId);
            return new PasswordChangeResponse {
                Success = false,
                Message = "Internal server error"
            };
        }
    }
}
