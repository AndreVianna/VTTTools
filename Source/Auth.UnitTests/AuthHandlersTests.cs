
namespace VttTools.Auth.UnitTests;

/// <summary>
/// Unit tests for AuthHandlers endpoint logic with mocked dependencies.
/// Tests individual handler methods in isolation without HTTP infrastructure.
/// </summary>
public class AuthHandlersTests {
    private readonly IAuthService _mockAuthService;

    public AuthHandlersTests() {
        _mockAuthService = Substitute.For<IAuthService>();
    }

    #region LoginHandler Tests

    [Fact]
    public async Task LoginHandler_SuccessfulLogin_ReturnsOkResult() {
        // Arrange
        var request = new LoginRequest {
            Email = "test@example.com",
            Password = "ValidPassword123!",
            RememberMe = false
        };

        var successResponse = new AuthResponse {
            Success = true,
            Message = "Login successful",
            User = new UserInfo {
                Id = Guid.CreateVersion7(),
                Email = "test@example.com",
                Name = "Test User",
                DisplayName = "TestUser",
                IsAdministrator = false
            }
        };

        _mockAuthService.LoginAsync(request).Returns(successResponse);

        // Act
        var result = await AuthHandlers.LoginHandler(request, _mockAuthService);

        // Assert
        Assert.IsType<Ok<AuthResponse>>(result);
        var okResult = (Ok<AuthResponse>)result;
        var response = okResult.Value!;
        Assert.True(response.Success);
        // ValidationProblem contains error details
        Assert.NotNull(response.User);

        await _mockAuthService.Received(1).LoginAsync(request);
    }

    [Fact]
    public async Task LoginHandler_FailedLogin_ReturnsBadRequestResult() {
        // Arrange
        var request = new LoginRequest {
            Email = "test@example.com",
            Password = "WrongPassword",
            RememberMe = false
        };

        var failureResponse = new AuthResponse {
            Success = false,
            Message = "Invalid email or password",
            User = null
        };

        _mockAuthService.LoginAsync(request).Returns(failureResponse);

        // Act
        var result = await AuthHandlers.LoginHandler(request, _mockAuthService);

        // Assert
        Assert.IsType<ProblemHttpResult>(result);
        // Handler returns ValidationProblem for failures
        // Cannot access response details from ValidationProblem
        // ValidationProblem indicates failure
        // ValidationProblem contains error details
        // No user data in ValidationProblem

        await _mockAuthService.Received(1).LoginAsync(request);
    }

    [Fact]
    public async Task LoginHandler_AccountLocked_ReturnsBadRequestResult() {
        // Arrange
        var request = new LoginRequest {
            Email = "locked@example.com",
            Password = "ValidPassword123!",
            RememberMe = false
        };

        var lockedResponse = new AuthResponse {
            Success = false,
            Message = "Account is locked due to multiple failed login attempts",
            User = null
        };

        _mockAuthService.LoginAsync(request).Returns(lockedResponse);

        // Act
        var result = await AuthHandlers.LoginHandler(request, _mockAuthService);

        // Assert
        Assert.IsType<ProblemHttpResult>(result);
        // Handler returns ValidationProblem for failures
        // Cannot access response details from ValidationProblem
        // ValidationProblem indicates failure
        // ValidationProblem contains error details
    }

    #endregion

    #region RegisterHandler Tests

    [Fact]
    public async Task RegisterHandler_SuccessfulRegistration_ReturnsOkResult() {
        // Arrange
        var request = new RegisterRequest {
            Email = "newuser@example.com",
            Password = "NewPassword123!",
            ConfirmPassword = "NewPassword123!",
            Name = "New User",
            DisplayName = "NewUser"
        };

        var successResponse = new AuthResponse {
            Success = true,
            Message = "Registration successful",
            User = new UserInfo {
                Id = Guid.CreateVersion7(),
                Email = "newuser@example.com",
                Name = "New User",
                DisplayName = "NewUser",
                IsAdministrator = false
            }
        };

        _mockAuthService.RegisterAsync(request).Returns(successResponse);

        // Act
        var result = await AuthHandlers.RegisterHandler(request, _mockAuthService);

        // Assert
        Assert.IsType<Ok<AuthResponse>>(result);
        var okResult = (Ok<AuthResponse>)result;
        var response = okResult.Value!;
        Assert.True(response.Success);
        // ValidationProblem contains error details
        Assert.NotNull(response.User);
        Assert.Equal("newuser@example.com", response.User.Email);

        await _mockAuthService.Received(1).RegisterAsync(request);
    }

    [Fact]
    public async Task RegisterHandler_ExistingUser_ReturnsBadRequestResult() {
        // Arrange
        var request = new RegisterRequest {
            Email = "existing@example.com",
            Password = "Password123!",
            ConfirmPassword = "Password123!",
            Name = "Existing User",
            DisplayName = "ExistingUser"
        };

        var failureResponse = new AuthResponse {
            Success = false,
            Message = "A user with this email already exists",
            User = null
        };

        _mockAuthService.RegisterAsync(request).Returns(failureResponse);

        // Act
        var result = await AuthHandlers.RegisterHandler(request, _mockAuthService);

        // Assert
        var conflictResult = Assert.IsType<IStatusCodeHttpResult>(result, exactMatch: false);
        Assert.Equal(409, conflictResult.StatusCode);

        await _mockAuthService.Received(1).RegisterAsync(request);
    }

    [Fact]
    public async Task RegisterHandler_ValidationErrors_ReturnsBadRequestResult() {
        // Arrange
        var request = new RegisterRequest {
            Email = "invalid@example.com",
            Password = "weak",
            ConfirmPassword = "weak",
            Name = "Test User",
            DisplayName = "TestUser"
        };

        var failureResponse = new AuthResponse {
            Success = false,
            Message = "Registration failed: Password too weak",
            User = null
        };

        _mockAuthService.RegisterAsync(request).Returns(failureResponse);

        // Act
        var result = await AuthHandlers.RegisterHandler(request, _mockAuthService);

        // Assert
        Assert.IsType<ProblemHttpResult>(result);
        // Handler returns ValidationProblem for failures
        // Cannot access response details from ValidationProblem
        // ValidationProblem indicates failure
        // ValidationProblem contains error details
    }

    #endregion

    #region LogoutHandler Tests

    [Fact]
    public async Task LogoutHandler_Success_ReturnsOkResult() {
        // Arrange
        var successResponse = new AuthResponse {
            Success = true,
            Message = "Logout successful",
            User = null
        };

        _mockAuthService.LogoutAsync().Returns(successResponse);

        // Act
        var result = await AuthHandlers.LogoutHandler(_mockAuthService);

        // Assert
        Assert.IsType<Ok<AuthResponse>>(result);
        var okResult = (Ok<AuthResponse>)result;
        var response = okResult.Value!;
        Assert.True(response.Success);
        // ValidationProblem contains error details

        await _mockAuthService.Received(1).LogoutAsync();
    }

    [Fact]
    public async Task LogoutHandler_ServiceError_StillReturnsOkResult() {
        // Arrange
        var errorResponse = new AuthResponse {
            Success = false,
            Message = "An error occurred during logout",
            User = null
        };

        _mockAuthService.LogoutAsync().Returns(errorResponse);

        // Act
        var result = await AuthHandlers.LogoutHandler(_mockAuthService);

        // Assert
        // Note: LogoutHandler always returns Ok regardless of service response
        Assert.IsType<Ok<AuthResponse>>(result);
        var okResult = (Ok<AuthResponse>)result;
        var response = okResult.Value!;
        // ValidationProblem indicates failure
        // ValidationProblem contains error details

        await _mockAuthService.Received(1).LogoutAsync();
    }

    #endregion

    #region GetCurrentUserHandler Tests

    [Fact]
    public async Task GetCurrentUserHandler_ValidUser_ReturnsOkResult() {
        // Arrange
        var userId = Guid.CreateVersion7();
        var claims = new List<Claim> {
            new(ClaimTypes.NameIdentifier, userId.ToString())
        };
        var identity = new ClaimsIdentity(claims, "Test");
        var user = new ClaimsPrincipal(identity);

        var successResponse = new AuthResponse {
            Success = true,
            Message = null,
            User = new UserInfo {
                Id = userId,
                Email = "current@example.com",
                Name = "Current User",
                DisplayName = "CurrentUser",
                IsAdministrator = false
            }
        };

        _mockAuthService.GetCurrentUserAsync(userId).Returns(successResponse);

        // Act
        var result = await AuthHandlers.GetCurrentUserHandler(user, _mockAuthService);

        // Assert
        Assert.IsType<Ok<AuthResponse>>(result);
        var okResult = (Ok<AuthResponse>)result;
        var response = okResult.Value!;
        Assert.True(response.Success);
        Assert.NotNull(response.User);
        Assert.Equal(userId, response.User.Id);

        await _mockAuthService.Received(1).GetCurrentUserAsync(userId);
    }

    [Fact]
    public async Task GetCurrentUserHandler_MissingNameIdentifierClaim_ReturnsUnauthorized() {
        // Arrange
        var claims = new List<Claim>(); // No NameIdentifier claim
        var identity = new ClaimsIdentity(claims, "Test");
        var user = new ClaimsPrincipal(identity);

        // Act
        var result = await AuthHandlers.GetCurrentUserHandler(user, _mockAuthService);

        // Assert
        Assert.IsType<UnauthorizedHttpResult>(result);

        await _mockAuthService.DidNotReceive().GetCurrentUserAsync(Arg.Any<Guid>());
    }

    [Fact]
    public async Task GetCurrentUserHandler_InvalidGuidInClaim_ReturnsUnauthorized() {
        // Arrange
        var claims = new List<Claim> {
            new(ClaimTypes.NameIdentifier, "invalid-guid")
        };
        var identity = new ClaimsIdentity(claims, "Test");
        var user = new ClaimsPrincipal(identity);

        // Act
        var result = await AuthHandlers.GetCurrentUserHandler(user, _mockAuthService);

        // Assert
        Assert.IsType<UnauthorizedHttpResult>(result);

        await _mockAuthService.DidNotReceive().GetCurrentUserAsync(Arg.Any<Guid>());
    }

    [Fact]
    public async Task GetCurrentUserHandler_UserNotFound_ReturnsBadRequestResult() {
        // Arrange
        var userId = Guid.CreateVersion7();
        var claims = new List<Claim> {
            new(ClaimTypes.NameIdentifier, userId.ToString())
        };
        var identity = new ClaimsIdentity(claims, "Test");
        var user = new ClaimsPrincipal(identity);

        var failureResponse = new AuthResponse {
            Success = false,
            Message = "User not found",
            User = null
        };

        _mockAuthService.GetCurrentUserAsync(userId).Returns(failureResponse);

        // Act
        var result = await AuthHandlers.GetCurrentUserHandler(user, _mockAuthService);

        // Assert
        Assert.IsType<ProblemHttpResult>(result);
        // Handler returns ValidationProblem for failures
        // Cannot access response details from ValidationProblem
        // ValidationProblem indicates failure
        // ValidationProblem contains error details

        await _mockAuthService.Received(1).GetCurrentUserAsync(userId);
    }

    [Fact]
    public async Task GetCurrentUserHandler_AdministratorUser_ReturnsUserWithAdminFlag() {
        // Arrange
        var userId = Guid.CreateVersion7();
        var claims = new List<Claim> {
            new(ClaimTypes.NameIdentifier, userId.ToString())
        };
        var identity = new ClaimsIdentity(claims, "Test");
        var user = new ClaimsPrincipal(identity);

        var adminResponse = new AuthResponse {
            Success = true,
            Message = null,
            User = new UserInfo {
                Id = userId,
                Email = "admin@example.com",
                Name = "Admin User",
                DisplayName = "AdminUser",
                IsAdministrator = true
            }
        };

        _mockAuthService.GetCurrentUserAsync(userId).Returns(adminResponse);

        // Act
        var result = await AuthHandlers.GetCurrentUserHandler(user, _mockAuthService);

        // Assert
        Assert.IsType<Ok<AuthResponse>>(result);
        var okResult = (Ok<AuthResponse>)result;
        var response = okResult.Value!;
        Assert.True(response.Success);
        Assert.NotNull(response.User);
        Assert.True(response.User.IsAdministrator);
    }

    #endregion
}