namespace VttTools.Auth.Services;

public class RecoveryCodeService(
    IUserStorage userStorage,
    ILogger<RecoveryCodeService> logger) : IRecoveryCodeService {

    public async Task<GenerateRecoveryCodesResponse> GenerateNewCodesAsync(Guid userId, GenerateRecoveryCodesRequest request, CancellationToken ct = default) {
        try {
            var user = await userStorage.FindByIdAsync(userId, ct);
            if (user is null) {
                logger.LogWarning("Recovery code generation attempted for non-existent user ID: {UserId}", userId);
                return new() {
                    Success = false,
                    Message = "User not found",
                    RecoveryCodes = null,
                };
            }

            var isPasswordValid = await userStorage.CheckPasswordAsync(userId, request.Password, ct);
            if (!isPasswordValid) {
                logger.LogWarning("Recovery code generation failed - incorrect password for user: {UserId}", userId);
                return new() {
                    Success = false,
                    Message = "Password is incorrect",
                    RecoveryCodes = null,
                };
            }

            var codes = await userStorage.GenerateRecoveryCodesAsync(userId, 10, ct);

            logger.LogInformation("Recovery codes generated successfully for user: {UserId}", userId);
            return new() {
                Success = true,
                Message = "Recovery codes generated successfully",
                RecoveryCodes = codes,
            };
        }
        catch (Exception ex) {
            logger.LogError(ex, "Error generating recovery codes for user ID: {UserId}", userId);
            return new() {
                Success = false,
                Message = "Internal server error",
                RecoveryCodes = null,
            };
        }
    }

    public async Task<RecoveryCodesStatusResponse> GetStatusAsync(Guid userId, CancellationToken ct = default) {
        try {
            var user = await userStorage.FindByIdAsync(userId, ct);
            if (user is null) {
                logger.LogWarning("Recovery code status check attempted for non-existent user ID: {UserId}", userId);
                return new() {
                    Success = false,
                    Message = "User not found",
                    RemainingCount = 0,
                };
            }

            var remainingCount = await userStorage.CountRecoveryCodesAsync(userId, ct);

            logger.LogInformation("Recovery code status retrieved for user: {UserId}, remaining count: {RemainingCount}", userId, remainingCount);
            return new() {
                Success = true,
                Message = null,
                RemainingCount = remainingCount,
            };
        }
        catch (Exception ex) {
            logger.LogError(ex, "Error retrieving recovery code status for user ID: {UserId}", userId);
            return new() {
                Success = false,
                Message = "Internal server error",
                RemainingCount = 0,
            };
        }
    }
}