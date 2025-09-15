namespace VttTools.Auth.Services;

public class AuthService(
    UserManager<User> userManager,
    SignInManager<User> signInManager,
    ILogger<AuthService> logger) : IAuthService {

    public async Task<AuthResponse> LoginAsync(LoginRequest request) {
        try {
            var user = await userManager.FindByEmailAsync(request.Email);
            if (user == null) {
                logger.LogWarning("Login attempt with non-existent email: {Email}", request.Email);
                return new AuthResponse {
                    Success = false,
                    Message = "Invalid email or password",
                };
            }

            var result = await signInManager.PasswordSignInAsync(
                user,
                request.Password,
                request.RememberMe,
                lockoutOnFailure: true);

            if (result.Succeeded) {
                logger.LogInformation("User {Email} logged in successfully", request.Email);

                // Get user roles for IsAdministrator flag
                var roles = await userManager.GetRolesAsync(user);
                user.IsAdministrator = roles.Contains("Administrator");

                return new AuthResponse {
                    Success = true,
                    Message = "Login successful",
                    User = MapUserToUserInfo(user),
                };
            }

            if (result.IsLockedOut) {
                logger.LogWarning("Account locked for email: {Email}", request.Email);
                return new AuthResponse {
                    Success = false,
                    Message = "Account is locked due to multiple failed login attempts",
                };
            }

            logger.LogWarning("Failed login attempt for email: {Email}", request.Email);
            return new AuthResponse {
                Success = false,
                Message = "Invalid email or password",
            };
        }
        catch (Exception ex) {
            logger.LogError(ex, "Error during login for email: {Email}", request.Email);
            return new AuthResponse {
                Success = false,
                Message = "An error occurred during login",
            };
        }
    }

    public async Task<AuthResponse> RegisterAsync(RegisterRequest request) {
        try {
            var existingUser = await userManager.FindByEmailAsync(request.Email);
            if (existingUser != null) {
                return new AuthResponse {
                    Success = false,
                    Message = "A user with this email already exists",
                };
            }

            var user = new User {
                UserName = request.Email,
                Email = request.Email,
                Name = request.Name,
                DisplayName = request.DisplayName,
                EmailConfirmed = true, // For now, skip email confirmation
            };

            var result = await userManager.CreateAsync(user, request.Password);
            if (result.Succeeded) {
                logger.LogInformation("User {Email} registered successfully", request.Email);

                // Sign in the user automatically after registration
                await signInManager.SignInAsync(user, isPersistent: false);

                return new AuthResponse {
                    Success = true,
                    Message = "Registration successful",
                    User = MapUserToUserInfo(user),
                };
            }

            var errors = string.Join(", ", result.Errors.Select(e => e.Description));
            logger.LogWarning("Registration failed for email {Email}: {Errors}", request.Email, errors);

            return new AuthResponse {
                Success = false,
                Message = $"Registration failed: {errors}",
            };
        }
        catch (Exception ex) {
            logger.LogError(ex, "Error during registration for email: {Email}", request.Email);
            return new AuthResponse {
                Success = false,
                Message = "An error occurred during registration",
            };
        }
    }

    public async Task<AuthResponse> LogoutAsync() {
        try {
            await signInManager.SignOutAsync();
            logger.LogInformation("User logged out successfully");

            return new AuthResponse {
                Success = true,
                Message = "Logout successful",
            };
        }
        catch (Exception ex) {
            logger.LogError(ex, "Error during logout");
            return new AuthResponse {
                Success = false,
                Message = "An error occurred during logout",
            };
        }
    }

    public async Task<AuthResponse> GetCurrentUserAsync(Guid userId) {
        try {
            var user = await userManager.FindByIdAsync(userId.ToString());
            if (user == null) {
                return new AuthResponse {
                    Success = false,
                    Message = "User not found",
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
                Success = false,
                Message = "An error occurred retrieving user information",
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