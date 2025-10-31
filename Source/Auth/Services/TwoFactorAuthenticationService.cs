namespace VttTools.Auth.Services;

using VttTools.Auth.ApiContracts;
using VttTools.Common.ApiContracts;
using VttTools.Identity.Model;

public class TwoFactorAuthenticationService(
    UserManager<User> userManager,
    ILogger<TwoFactorAuthenticationService> logger) : ITwoFactorService {

    public async Task<TwoFactorSetupResponse> InitiateSetupAsync(Guid userId, CancellationToken ct = default) {
        try {
            var user = await userManager.FindByIdAsync(userId.ToString());
            if (user is null) {
                logger.LogWarning("Two-factor setup initiation attempted for non-existent user ID: {UserId}", userId);
                return new TwoFactorSetupResponse {
                    Success = false,
                    Message = "User not found",
                    SharedKey = string.Empty,
                    AuthenticatorUri = string.Empty
                };
            }

            var key = await userManager.GetAuthenticatorKeyAsync(user);
            if (key is null) {
                await userManager.ResetAuthenticatorKeyAsync(user);
                key = await userManager.GetAuthenticatorKeyAsync(user);

                if (key is null) {
                    logger.LogError("Failed to generate authenticator key for user: {UserId}", userId);
                    return new TwoFactorSetupResponse {
                        Success = false,
                        Message = "Failed to generate authenticator key",
                        SharedKey = string.Empty,
                        AuthenticatorUri = string.Empty
                    };
                }
            }

            var email = user.Email ?? user.UserName ?? userId.ToString();
            var authenticatorUri = $"otpauth://totp/VTTTools:{email}?secret={key}&issuer=VTTTools";

            logger.LogInformation("Two-factor setup initiated for user: {UserId}", userId);
            return new TwoFactorSetupResponse {
                Success = true,
                Message = null,
                SharedKey = key,
                AuthenticatorUri = authenticatorUri
            };
        }
        catch (Exception ex) {
            logger.LogError(ex, "Error initiating two-factor setup for user ID: {UserId}", userId);
            return new TwoFactorSetupResponse {
                Success = false,
                Message = "Internal server error",
                SharedKey = string.Empty,
                AuthenticatorUri = string.Empty
            };
        }
    }

    public async Task<TwoFactorVerifyResponse> VerifySetupAsync(Guid userId, VerifySetupRequest request, CancellationToken ct = default) {
        try {
            var user = await userManager.FindByIdAsync(userId.ToString());
            if (user is null) {
                logger.LogWarning("Two-factor setup verification attempted for non-existent user ID: {UserId}", userId);
                return new TwoFactorVerifyResponse {
                    Success = false,
                    Message = "User not found",
                    RecoveryCodes = null
                };
            }

            var isCodeValid = await userManager.VerifyTwoFactorTokenAsync(user, "Authenticator", request.Code);
            if (!isCodeValid) {
                logger.LogWarning("Two-factor setup verification failed - invalid code for user: {UserId}", userId);
                return new TwoFactorVerifyResponse {
                    Success = false,
                    Message = "Invalid verification code",
                    RecoveryCodes = null
                };
            }

            await userManager.SetTwoFactorEnabledAsync(user, true);
            var codes = await userManager.GenerateNewTwoFactorRecoveryCodesAsync(user, 10);

            logger.LogInformation("Two-factor authentication enabled successfully for user: {UserId}", userId);
            return new TwoFactorVerifyResponse {
                Success = true,
                Message = "Two-factor authentication enabled successfully",
                RecoveryCodes = codes?.ToArray()
            };
        }
        catch (Exception ex) {
            logger.LogError(ex, "Error verifying two-factor setup for user ID: {UserId}", userId);
            return new TwoFactorVerifyResponse {
                Success = false,
                Message = "Internal server error",
                RecoveryCodes = null
            };
        }
    }

    public async Task<TwoFactorDisableResponse> DisableTwoFactorAsync(Guid userId, DisableTwoFactorRequest request, CancellationToken ct = default) {
        try {
            var user = await userManager.FindByIdAsync(userId.ToString());
            if (user is null) {
                logger.LogWarning("Two-factor authentication disable attempted for non-existent user ID: {UserId}", userId);
                return new TwoFactorDisableResponse {
                    Success = false,
                    Message = "User not found"
                };
            }

            var isPasswordValid = await userManager.CheckPasswordAsync(user, request.Password);
            if (!isPasswordValid) {
                logger.LogWarning("Two-factor authentication disable failed - incorrect password for user: {UserId}", userId);
                return new TwoFactorDisableResponse {
                    Success = false,
                    Message = "Password is incorrect"
                };
            }

            await userManager.SetTwoFactorEnabledAsync(user, false);

            logger.LogInformation("Two-factor authentication disabled successfully for user: {UserId}", userId);
            return new TwoFactorDisableResponse {
                Success = true,
                Message = "Two-factor authentication disabled successfully"
            };
        }
        catch (Exception ex) {
            logger.LogError(ex, "Error disabling two-factor authentication for user ID: {UserId}", userId);
            return new TwoFactorDisableResponse {
                Success = false,
                Message = "Internal server error"
            };
        }
    }
}
