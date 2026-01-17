namespace VttTools.Auth.Services;

public class AuthService(
    IUserStorage userStorage,
    ISignInService signInService,
    IEmailService emailService,
    IJwtTokenService jwtTokenService,
    ILogger<AuthService> logger) : IAuthService {

    public async Task<AuthResponse> LoginAsync(LoginRequest request) {
        try {
            var result = await userStorage.ValidateCredentialsAsync(request.Email, request.Password, lockoutOnFailure: true);

            if (result.IsNotAllowed) {
                logger.LogInformation("User not confirmed");
                return new() { Message = "NotAllowed" };
            }

            if (result.IsLockedOut) {
                logger.LogWarning("Account locked");
                return new() { Message = "LockedAccount" };
            }

            if (result.RequiresTwoFactor) {
                logger.LogWarning("Two factor verification is required");
                return new() { Message = "RequiresTwoFactor" };
            }

            if (!result.Succeeded || result.User is null) {
                logger.LogWarning("Failed login attempt");
                return new() { Message = "FailedLogin" };
            }

            logger.LogInformation("User logged in successfully: {UserId}", result.User.Id);

            var token = jwtTokenService.GenerateToken(result.User, result.User.Roles, request.RememberMe);

            return new() {
                Success = true,
                Message = "Success",
                User = MapUserToUserInfo(result.User),
                Token = token,
            };
        }
        catch (Exception ex) {
            logger.LogError(ex, "Error during login");
            return new() { Message = "InternalServerError" };
        }
    }

    public async Task<AuthResponse> RegisterAsync(RegisterRequest request) {
        try {
            var existingUser = await userStorage.FindByEmailAsync(request.Email);
            if (existingUser is not null)
                return new() { Message = "DuplicatedUser" };

            var user = new User {
                Email = request.Email,
                Name = request.Name ?? string.Empty,
                DisplayName = request.DisplayName ?? request.Name?.Split(' ', StringSplitOptions.RemoveEmptyEntries).FirstOrDefault() ?? request.Name ?? string.Empty,
                EmailConfirmed = true,
            };

            var createResult = await userStorage.CreateAsync(user, request.Password);
            if (!createResult.IsSuccessful) {
                var errors = string.Join("; ", createResult.Errors.Select(e => e.Message));
                logger.LogWarning("Registration failed: {Errors}", errors);
                return new() { Success = false, Message = errors };
            }

            var createdUser = createResult.Value!;
            logger.LogInformation("User registered successfully: {UserId}", createdUser.Id);

            await signInService.SignInAsync(createdUser.Id, isPersistent: false);

            var token = jwtTokenService.GenerateToken(createdUser, createdUser.Roles, rememberMe: false);

            return new() {
                Success = true,
                Message = "RegistrationSuccess",
                User = MapUserToUserInfo(createdUser),
                Token = token,
            };
        }
        catch (Exception ex) {
            logger.LogError(ex, "Error during registration");
            return new() { Message = "InternalServerError" };
        }
    }

    public async Task<AuthResponse> LogoutAsync() {
        try {
            await signInService.SignOutAsync();
            logger.LogInformation("User logged out successfully");

            return new() { Success = true, Message = "LogoutSuccess" };
        }
        catch (Exception ex) {
            logger.LogError(ex, "Error during logout");
            return new() { Message = "InternalServerError" };
        }
    }

    public async Task<AuthResponse> GetCurrentUserAsync(Guid userId) {
        try {
            var user = await userStorage.FindByIdAsync(userId);
            return user is null
                ? new() { Message = "NotFound" }
                : new AuthResponse {
                    Success = true,
                    User = MapUserToUserInfo(user),
                };
        }
        catch (Exception ex) {
            logger.LogError(ex, "Error getting current user with ID: {UserId}", userId);
            return new() { Message = "InternalServerError" };
        }
    }

    public async Task<AuthResponse> ForgotPasswordAsync(string email) {
        try {
            var user = await userStorage.FindByEmailAsync(email);

            if (user is null) {
                logger.LogInformation("Password reset requested for non-existent account");
                return new() {
                    Success = true,
                    Message = "If that email exists, reset instructions have been sent",
                };
            }

            var token = await userStorage.GeneratePasswordResetTokenAsync(user.Id);
            if (token is null)
                return new() { Success = true, Message = "If that email exists, reset instructions have been sent" };

            var encodedEmail = Uri.EscapeDataString(email);
            var encodedToken = Uri.EscapeDataString(token);
            var resetLink = $"http://localhost:5000/api/auth/password/reset?email={encodedEmail}&token={encodedToken}";

            await emailService.SendPasswordResetEmailAsync(email, resetLink);

            logger.LogInformation("Password reset email sent for user: {UserId}", user.Id);

            return new() {
                Success = true,
                Message = "If that email exists, reset instructions have been sent",
            };
        }
        catch (Exception ex) {
            logger.LogError(ex, "Error during forgot password");
            return new() { Message = "InternalServerError" };
        }
    }

    public async Task<AuthResponse> ValidateResetTokenAsync(string email, string token) {
        try {
            var user = await userStorage.FindByEmailAsync(email);
            if (user is null) {
                logger.LogWarning("Token validation attempted for non-existent account");
                return new() { Success = false, Message = "Invalid reset link" };
            }

            var isValid = await userStorage.VerifyPasswordResetTokenAsync(user.Id, token);

            if (!isValid) {
                logger.LogWarning("Invalid or expired reset token for user: {UserId}", user.Id);
                return new() { Success = false, Message = "Reset link has expired or is invalid" };
            }

            logger.LogInformation("Reset token validated successfully for user: {UserId}", user.Id);
            return new() { Success = true };
        }
        catch (Exception ex) {
            logger.LogError(ex, "Error validating reset token");
            return new() { Message = "InternalServerError" };
        }
    }

    public async Task<AuthResponse> ResetPasswordAsync(string email, string token, string newPassword) {
        try {
            var user = await userStorage.FindByEmailAsync(email);
            if (user is null) {
                logger.LogWarning("Password reset attempted for non-existent account");
                return new() { Success = false, Message = "Invalid reset link" };
            }

            var result = await userStorage.ResetPasswordWithTokenAsync(user.Id, token, newPassword);

            if (!result.IsSuccessful) {
                var errors = string.Join("; ", result.Errors.Select(e => e.Message));
                logger.LogWarning("Password reset failed for user {UserId}: {Errors}", user.Id, errors);
                return new() { Success = false, Message = errors };
            }

            logger.LogInformation("Password reset successfully for user: {UserId}", user.Id);
            return new() { Success = true, Message = "Password updated successfully" };
        }
        catch (Exception ex) {
            logger.LogError(ex, "Error during password reset");
            return new() { Message = "InternalServerError" };
        }
    }

    public async Task<AuthResponse> ResendEmailConfirmationAsync(string email) {
        try {
            var user = await userStorage.FindByEmailAsync(email);

            if (user is null) {
                logger.LogInformation("Email confirmation requested for non-existent account");
                return new() {
                    Success = true,
                    Message = "If that email exists, confirmation instructions have been sent",
                };
            }

            if (user.EmailConfirmed) {
                logger.LogInformation("Email confirmation requested for already confirmed user: {UserId}", user.Id);
                return new() { Success = true, Message = "Email is already confirmed" };
            }

            var token = await userStorage.GenerateEmailConfirmationTokenAsync(user.Id);
            if (token is null)
                return new() { Success = true, Message = "If that email exists, confirmation instructions have been sent" };

            var encodedEmail = Uri.EscapeDataString(email);
            var encodedToken = Uri.EscapeDataString(token);
            var confirmationLink = $"http://localhost:5000/api/auth/confirm-email?email={encodedEmail}&token={encodedToken}";

            await emailService.SendEmailConfirmationAsync(email, confirmationLink);

            logger.LogInformation("Email confirmation sent for user: {UserId}", user.Id);

            return new() {
                Success = true,
                Message = "If that email exists, confirmation instructions have been sent",
            };
        }
        catch (Exception ex) {
            logger.LogError(ex, "Error during resend email confirmation");
            return new() { Message = "InternalServerError" };
        }
    }

    public async Task<AuthResponse> ConfirmEmailAsync(string email, string token) {
        try {
            var user = await userStorage.FindByEmailAsync(email);
            if (user is null) {
                logger.LogWarning("Email confirmation attempted for non-existent account");
                return new() { Success = false, Message = "Invalid confirmation link" };
            }

            if (user.EmailConfirmed) {
                logger.LogInformation("Email already confirmed for user: {UserId}", user.Id);
                return new() { Success = true, Message = "Email already confirmed" };
            }

            var result = await userStorage.ConfirmEmailWithTokenAsync(user.Id, token);

            if (!result.IsSuccessful) {
                logger.LogWarning("Email confirmation failed for user: {UserId}", user.Id);
                return new() { Success = false, Message = "Confirmation link has expired or is invalid" };
            }

            logger.LogInformation("Email confirmed successfully for user: {UserId}", user.Id);
            return new() { Success = true, Message = "Email confirmed successfully" };
        }
        catch (Exception ex) {
            logger.LogError(ex, "Error during email confirmation");
            return new() { Message = "InternalServerError" };
        }
    }

    private static UserInfo MapUserToUserInfo(User user)
        => new() {
            Id = user.Id,
            Email = user.Email,
            EmailConfirmed = user.EmailConfirmed,
            Name = user.Name,
            DisplayName = user.DisplayName,
            IsAdministrator = user.IsAdministrator,
            TwoFactorEnabled = user.TwoFactorEnabled,
            PreferredUnitSystem = user.UnitSystem,
        };
}
