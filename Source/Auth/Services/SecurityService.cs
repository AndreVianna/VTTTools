namespace VttTools.Auth.Services;

public class SecurityService(
    IUserStorage userStorage,
    ILogger<SecurityService> logger) : ISecurityService {

    public async Task<SecuritySettingsResponse> GetSecuritySettingsAsync(Guid userId, CancellationToken ct = default) {
        try {
            var user = await userStorage.FindByIdAsync(userId, ct);
            if (user is null) {
                logger.LogWarning("Security settings request for non-existent user ID: {UserId}", userId);
                return new SecuritySettingsResponse {
                    Success = false,
                    Message = "User not found",
                    HasPassword = false,
                    TwoFactorEnabled = false,
                    RecoveryCodesRemaining = 0,
                };
            }

            var recoveryCodesRemaining = await userStorage.CountRecoveryCodesAsync(userId, ct);

            logger.LogInformation("Security settings retrieved for user: {UserId}", userId);
            return new SecuritySettingsResponse {
                Success = true,
                Message = null,
                HasPassword = user.HasPassword,
                TwoFactorEnabled = user.TwoFactorEnabled,
                RecoveryCodesRemaining = recoveryCodesRemaining,
            };
        }
        catch (Exception ex) {
            logger.LogError(ex, "Error getting security settings for user ID: {UserId}", userId);
            return new SecuritySettingsResponse {
                Success = false,
                Message = "Internal server error",
                HasPassword = false,
                TwoFactorEnabled = false,
                RecoveryCodesRemaining = 0,
            };
        }
    }
}
