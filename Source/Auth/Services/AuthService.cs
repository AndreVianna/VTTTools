namespace VttTools.Auth.Services;

public class AuthService(
    UserManager<User> userManager,
    SignInManager<User> signInManager,
    IEmailService emailService,
    ILogger<AuthService> logger) : IAuthService {

    public async Task<AuthResponse> LoginAsync(LoginRequest request) {
        try {
            var user = await userManager.FindByEmailAsync(request.Email);
            if (user == null) {
                logger.LogWarning("Login attempt with non-existent email: {Email}", request.Email);
                return new AuthResponse {
                    Message = "FailedLogin",
                };
            }

            var result = await signInManager.PasswordSignInAsync(
                user,
                request.Password,
                request.RememberMe,
                lockoutOnFailure: true);

            if (result.IsNotAllowed) {
                logger.LogInformation("User {Email} not confirmed", request.Email);
                return new AuthResponse {
                    Message = "NotAllowed"
                };
            }

            if (result.IsLockedOut) {
                logger.LogWarning("Account locked for email: {Email}", request.Email);
                return new AuthResponse {
                    Message = "LockedAccount",
                };
            }

            if (result.RequiresTwoFactor) {
                logger.LogWarning("Two factor verification is required: {Email}", request.Email);
                return new AuthResponse {
                    Message = "RequiresTwoFactor",
                };
            }

            if (!result.Succeeded) {
                logger.LogWarning("Failed login attempt for email: {Email}", request.Email);
                return new AuthResponse {
                    Message = "FailedLogin",
                };
            }

            logger.LogInformation("User {Email} logged in successfully", request.Email);

            var roles = await userManager.GetRolesAsync(user);
            user.IsAdministrator = roles.Contains("Administrator");

            return new AuthResponse {
                Success = true,
                Message = "Success",
                User = MapUserToUserInfo(user),
            };
        }
        catch (Exception ex) {
            logger.LogError(ex, "Error during login for email: {Email}", request.Email);
            return new AuthResponse {
                Message = "InternalServerError",
            };
        }
    }

    public async Task<AuthResponse> RegisterAsync(RegisterRequest request) {
        try {
            var existingUser = await userManager.FindByEmailAsync(request.Email);
            if (existingUser != null) {
                return new AuthResponse {
                    Message = "DuplicatedUser",
                };
            }

            var user = new User {
                UserName = request.Email,
                Email = request.Email,
                Name = request.Name,
                DisplayName = request.DisplayName ?? request.Name?.Split(' ', StringSplitOptions.RemoveEmptyEntries).FirstOrDefault() ?? request.Name,
                EmailConfirmed = true,
            };

            var result = await userManager.CreateAsync(user, request.Password);
            if (result.Succeeded) {
                logger.LogInformation("User {Email} registered successfully", request.Email);

                await signInManager.SignInAsync(user, isPersistent: false);

                return new AuthResponse {
                    Success = true,
                    Message = "RegistrationSuccess",
                    User = MapUserToUserInfo(user),
                };
            }

            var errors = string.Join("; ", result.Errors.Select(e => e.Description));
            logger.LogWarning("Registration failed for email {Email}: {Errors}", request.Email, errors);

            return new AuthResponse {
                Success = false,
                Message = errors,  // Return actual Identity errors, not generic message
            };
        }
        catch (Exception ex) {
            logger.LogError(ex, "Error during registration for email: {Email}. Exception: {Message}", request.Email, ex.Message);
            return new AuthResponse {
                Message = "InternalServerError",  // Include exception message for debugging
            };
        }
    }

    public async Task<AuthResponse> LogoutAsync() {
        try {
            await signInManager.SignOutAsync();
            logger.LogInformation("User logged out successfully");

            return new AuthResponse {
                Message = "LogoutSuccess",
            };
        }
        catch (Exception ex) {
            logger.LogError(ex, "Error during logout");
            return new AuthResponse {
                Message = "InternalServerError",
            };
        }
    }

    public async Task<AuthResponse> GetCurrentUserAsync(Guid userId) {
        try {
            var user = await userManager.FindByIdAsync(userId.ToString());
            if (user == null) {
                return new AuthResponse {
                    Message = "NotFound",
                };
            }

            // Get user roles for IsAdministrator flag
            var roles = await userManager.GetRolesAsync(user);
            user.IsAdministrator = roles.Contains("Administrator");

            return new AuthResponse {
                Success = true,
                User = MapUserToUserInfo(user),
            };
        }
        catch (Exception ex) {
            logger.LogError(ex, "Error getting current user with ID: {UserId}", userId);
            return new AuthResponse {
                Message = "InternalServerError",
            };
        }
    }

    public async Task<AuthResponse> ForgotPasswordAsync(string email) {
        try {
            var user = await userManager.FindByEmailAsync(email);

            if (user == null) {
                logger.LogInformation("Password reset requested for non-existent email: {Email}", email);
                return new AuthResponse {
                    Success = true,
                    Message = "If that email exists, reset instructions have been sent",
                };
            }

            var token = await userManager.GeneratePasswordResetTokenAsync(user);

            var encodedEmail = Uri.EscapeDataString(email);
            var encodedToken = Uri.EscapeDataString(token);
            var resetLink = $"http://localhost:5000/api/auth/password/reset?email={encodedEmail}&token={encodedToken}";

            await emailService.SendPasswordResetEmailAsync(email, resetLink);

            logger.LogInformation("Password reset email sent to: {Email}", email);

            return new AuthResponse {
                Success = true,
                Message = "If that email exists, reset instructions have been sent",
            };
        }
        catch (Exception ex) {
            logger.LogError(ex, "Error during forgot password for email: {Email}", email);
            return new AuthResponse {
                Message = "InternalServerError",
            };
        }
    }

    public async Task<AuthResponse> ValidateResetTokenAsync(string email, string token) {
        try {
            var user = await userManager.FindByEmailAsync(email);
            if (user == null) {
                logger.LogWarning("Token validation attempted for non-existent email: {Email}", email);
                return new AuthResponse {
                    Success = false,
                    Message = "Invalid reset link",
                };
            }

            var isValid = await userManager.VerifyUserTokenAsync(
                user,
                userManager.Options.Tokens.PasswordResetTokenProvider,
                "ResetPassword",
                token
            );

            if (!isValid) {
                logger.LogWarning("Invalid or expired reset token for email: {Email}", email);
                return new AuthResponse {
                    Success = false,
                    Message = "Reset link has expired or is invalid",
                };
            }

            logger.LogInformation("Reset token validated successfully for email: {Email}", email);
            return new AuthResponse {
                Success = true,
            };
        }
        catch (Exception ex) {
            logger.LogError(ex, "Error validating reset token for email: {Email}", email);
            return new AuthResponse {
                Message = "InternalServerError",
            };
        }
    }

    public async Task<AuthResponse> ResetPasswordAsync(string email, string token, string newPassword) {
        try {
            var user = await userManager.FindByEmailAsync(email);
            if (user == null) {
                logger.LogWarning("Password reset attempted for non-existent email: {Email}", email);
                return new AuthResponse {
                    Success = false,
                    Message = "Invalid reset link",
                };
            }

            var result = await userManager.ResetPasswordAsync(user, token, newPassword);

            if (!result.Succeeded) {
                var errors = string.Join("; ", result.Errors.Select(e => e.Description));
                logger.LogWarning("Password reset failed for email {Email}: {Errors}", email, errors);
                return new AuthResponse {
                    Success = false,
                    Message = errors,
                };
            }

            logger.LogInformation("Password reset successfully for email: {Email}", email);
            return new AuthResponse {
                Success = true,
                Message = "Password updated successfully",
            };
        }
        catch (Exception ex) {
            logger.LogError(ex, "Error during password reset for email: {Email}", email);
            return new AuthResponse {
                Message = "InternalServerError",
            };
        }
    }

    private static UserInfo MapUserToUserInfo(User user)
        => new() {
            Id = user.Id,
            Email = user.Email,
            Name = user.Name,
            DisplayName = user.DisplayName,
            IsAdministrator = user.IsAdministrator,
        };
}