namespace VttTools.Auth.Services;

public class RecoveryCodeService(
    UserManager<User> userManager,
    ILogger<RecoveryCodeService> logger) : IRecoveryCodeService {

    public async Task<GenerateRecoveryCodesResponse> GenerateNewCodesAsync(Guid userId, GenerateRecoveryCodesRequest request, CancellationToken ct = default) {
        try {
            var user = await userManager.FindByIdAsync(userId.ToString());
            if (user is null) {
                logger.LogWarning("Recovery code generation attempted for non-existent user ID: {UserId}", userId);
                return new GenerateRecoveryCodesResponse {
                    Success = false,
                    Message = "User not found",
                    RecoveryCodes = null
                };
            }

            var isPasswordValid = await userManager.CheckPasswordAsync(user, request.Password);
            if (!isPasswordValid) {
                logger.LogWarning("Recovery code generation failed - incorrect password for user: {UserId}", userId);
                return new GenerateRecoveryCodesResponse {
                    Success = false,
                    Message = "Password is incorrect",
                    RecoveryCodes = null
                };
            }

            var codes = await userManager.GenerateNewTwoFactorRecoveryCodesAsync(user, 10);

            logger.LogInformation("Recovery codes generated successfully for user: {UserId}", userId);
            return new GenerateRecoveryCodesResponse {
                Success = true,
                Message = "Recovery codes generated successfully",
                RecoveryCodes = codes?.ToArray()
            };
        }
        catch (Exception ex) {
            logger.LogError(ex, "Error generating recovery codes for user ID: {UserId}", userId);
            return new GenerateRecoveryCodesResponse {
                Success = false,
                Message = "Internal server error",
                RecoveryCodes = null
            };
        }
    }

    public async Task<RecoveryCodesStatusResponse> GetStatusAsync(Guid userId, CancellationToken ct = default) {
        try {
            var user = await userManager.FindByIdAsync(userId.ToString());
            if (user is null) {
                logger.LogWarning("Recovery code status check attempted for non-existent user ID: {UserId}", userId);
                return new RecoveryCodesStatusResponse {
                    Success = false,
                    Message = "User not found",
                    RemainingCount = 0
                };
            }

            var remainingCount = await userManager.CountRecoveryCodesAsync(user);

            logger.LogInformation("Recovery code status retrieved for user: {UserId}, remaining count: {RemainingCount}", userId, remainingCount);
            return new RecoveryCodesStatusResponse {
                Success = true,
                Message = null,
                RemainingCount = remainingCount
            };
        }
        catch (Exception ex) {
            logger.LogError(ex, "Error retrieving recovery code status for user ID: {UserId}", userId);
            return new RecoveryCodesStatusResponse {
                Success = false,
                Message = "Internal server error",
                RemainingCount = 0
            };
        }
    }
}