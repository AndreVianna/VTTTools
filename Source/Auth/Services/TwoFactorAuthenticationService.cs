namespace VttTools.Auth.Services;

public class TwoFactorAuthenticationService(
    IUserStorage userStorage,
    ILogger<TwoFactorAuthenticationService> logger) : ITwoFactorService {

    public async Task<TwoFactorSetupResponse> InitiateSetupAsync(Guid userId, CancellationToken ct = default) {
        try {
            var user = await userStorage.FindByIdAsync(userId, ct);
            if (user is null) {
                logger.LogWarning("Two-factor setup initiation attempted for non-existent user ID: {UserId}", userId);
                return new() {
                    Success = false,
                    Message = "User not found",
                    SharedKey = string.Empty,
                    AuthenticatorUri = string.Empty,
                };
            }

            var key = await userStorage.GetAuthenticatorKeyAsync(userId, ct);
            if (key is null) {
                key = await userStorage.ResetAuthenticatorKeyAsync(userId, ct);

                if (key is null) {
                    logger.LogError("Failed to generate authenticator key for user: {UserId}", userId);
                    return new() {
                        Success = false,
                        Message = "Failed to generate authenticator key",
                        SharedKey = string.Empty,
                        AuthenticatorUri = string.Empty,
                    };
                }
            }

            var accountIdentifier = !string.IsNullOrWhiteSpace(user.Email)
                ? user.Email
                : userId.ToString();
            var authenticatorUri = $"otpauth://totp/VTTTools:{accountIdentifier}?secret={key}&issuer=VTTTools";

            logger.LogInformation("Two-factor setup initiated for user: {UserId}", userId);
            return new() {
                Success = true,
                Message = null,
                SharedKey = key,
                AuthenticatorUri = authenticatorUri,
            };
        }
        catch (Exception ex) {
            logger.LogError(ex, "Error initiating two-factor setup for user ID: {UserId}", userId);
            return new() {
                Success = false,
                Message = "Internal server error",
                SharedKey = string.Empty,
                AuthenticatorUri = string.Empty,
            };
        }
    }

    public async Task<TwoFactorVerifyResponse> VerifySetupAsync(Guid userId, VerifySetupRequest request, CancellationToken ct = default) {
        try {
            var user = await userStorage.FindByIdAsync(userId, ct);
            if (user is null) {
                logger.LogWarning("Two-factor setup verification attempted for non-existent user ID: {UserId}", userId);
                return new() {
                    Success = false,
                    Message = "User not found",
                    RecoveryCodes = null,
                };
            }

            var isCodeValid = await userStorage.VerifyTwoFactorCodeAsync(userId, request.Code, ct);
            if (!isCodeValid) {
                logger.LogWarning("Two-factor setup verification failed - invalid code for user: {UserId}", userId);
                return new() {
                    Success = false,
                    Message = "Invalid verification code",
                    RecoveryCodes = null,
                };
            }

            await userStorage.SetTwoFactorEnabledAsync(userId, true, ct);
            var codes = await userStorage.GenerateRecoveryCodesAsync(userId, 10, ct);

            logger.LogInformation("Two-factor authentication enabled successfully for user: {UserId}", userId);
            return new() {
                Success = true,
                Message = "Two-factor authentication enabled successfully",
                RecoveryCodes = codes,
            };
        }
        catch (Exception ex) {
            logger.LogError(ex, "Error verifying two-factor setup for user ID: {UserId}", userId);
            return new() {
                Success = false,
                Message = "Internal server error",
                RecoveryCodes = null,
            };
        }
    }

    public async Task<TwoFactorDisableResponse> DisableTwoFactorAsync(Guid userId, DisableTwoFactorRequest request, CancellationToken ct = default) {
        try {
            var user = await userStorage.FindByIdAsync(userId, ct);
            if (user is null) {
                logger.LogWarning("Two-factor authentication disable attempted for non-existent user ID: {UserId}", userId);
                return new() { Success = false, Message = "User not found" };
            }

            var isPasswordValid = await userStorage.CheckPasswordAsync(userId, request.Password, ct);
            if (!isPasswordValid) {
                logger.LogWarning("Two-factor authentication disable failed - incorrect password for user: {UserId}", userId);
                return new() { Success = false, Message = "Password is incorrect" };
            }

            await userStorage.SetTwoFactorEnabledAsync(userId, false, ct);

            logger.LogInformation("Two-factor authentication disabled successfully for user: {UserId}", userId);
            return new() {
                Success = true,
                Message = "Two-factor authentication disabled successfully",
            };
        }
        catch (Exception ex) {
            logger.LogError(ex, "Error disabling two-factor authentication for user ID: {UserId}", userId);
            return new() { Success = false, Message = "Internal server error" };
        }
    }
}