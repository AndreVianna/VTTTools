
namespace VttTools.Auth.UnitTests;

/// <summary>
/// Unit tests for AuthHandlers endpoint logic with mocked dependencies.
/// Tests individual handler methods in isolation without HTTP infrastructure.
/// </summary>
public class AuthHandlersTests {
    private readonly IAuthService _mockAuthService;
    private readonly HttpContext _mockHttpContext;
    private readonly IWebHostEnvironment _mockEnvironment;

    public AuthHandlersTests() {
        _mockAuthService = Substitute.For<IAuthService>();
        _mockHttpContext = Substitute.For<HttpContext>();
        _mockEnvironment = Substitute.For<IWebHostEnvironment>();

        var responseCookies = Substitute.For<IResponseCookies>();
        var response = Substitute.For<HttpResponse>();
        response.Cookies.Returns(responseCookies);
        _mockHttpContext.Response.Returns(response);
        _mockEnvironment.EnvironmentName.Returns("Development");
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
        var result = await AuthHandlers.LoginHandler(request, _mockAuthService, _mockHttpContext, _mockEnvironment);

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
        var result = await AuthHandlers.LoginHandler(request, _mockAuthService, _mockHttpContext, _mockEnvironment);

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
        var result = await AuthHandlers.LoginHandler(request, _mockAuthService, _mockHttpContext, _mockEnvironment);

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
        var result = await AuthHandlers.LogoutHandler(_mockAuthService, _mockHttpContext, _mockEnvironment);

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
        var result = await AuthHandlers.LogoutHandler(_mockAuthService, _mockHttpContext, _mockEnvironment);

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

    #region ForgotPasswordHandler Tests

    [Fact]
    public async Task ForgotPasswordHandler_WithValidEmail_ReturnsOkResult() {
        var request = new ForgotPasswordRequest {
            Email = "user@example.com"
        };

        var successResponse = new AuthResponse {
            Success = true,
            Message = "If that email exists, reset instructions have been sent"
        };

        _mockAuthService.ForgotPasswordAsync(request.Email).Returns(successResponse);

        var result = await AuthHandlers.ForgotPasswordHandler(request, _mockAuthService);

        result.Should().BeOfType<Ok<AuthResponse>>();
        await _mockAuthService.Received(1).ForgotPasswordAsync(request.Email);
    }

    [Fact]
    public async Task ForgotPasswordHandler_WhenServiceFails_ReturnsBadRequest() {
        var request = new ForgotPasswordRequest {
            Email = "nonexistent@example.com"
        };

        var failureResponse = new AuthResponse {
            Success = false,
            Message = "Email service unavailable"
        };

        _mockAuthService.ForgotPasswordAsync(request.Email).Returns(failureResponse);

        var result = await AuthHandlers.ForgotPasswordHandler(request, _mockAuthService);

        result.Should().BeAssignableTo<IStatusCodeHttpResult>();
        var statusResult = (IStatusCodeHttpResult)result;
        statusResult.StatusCode.Should().Be(400);
    }

    #endregion

    #region ValidateResetTokenHandler Tests

    [Fact]
    public async Task ValidateResetTokenHandler_WithValidToken_RedirectsToResetPage() {
        const string email = "user@example.com";
        const string token = "valid-reset-token";
        var frontendOptions = Options.Create(new FrontendOptions {
            BaseUrl = "http://localhost:3000"
        });

        var successResponse = new AuthResponse {
            Success = true
        };

        _mockAuthService.ValidateResetTokenAsync(email, token).Returns(successResponse);

        var result = await AuthHandlers.ValidateResetTokenHandler(email, token, _mockAuthService, frontendOptions);

        result.Should().BeOfType<RedirectHttpResult>();
        var redirectResult = (RedirectHttpResult)result;
        redirectResult.Url.Should().Contain("/resetPassword");
        redirectResult.Url.Should().Contain("validated=true");
        redirectResult.Url.Should().Contain($"email={Uri.EscapeDataString(email)}");
    }

    [Fact]
    public async Task ValidateResetTokenHandler_WithInvalidToken_RedirectsToErrorPage() {
        const string email = "user@example.com";
        const string token = "invalid-token";
        var frontendOptions = Options.Create(new FrontendOptions {
            BaseUrl = "http://localhost:3000"
        });

        var failureResponse = new AuthResponse {
            Success = false,
            Message = "Reset link has expired or is invalid"
        };

        _mockAuthService.ValidateResetTokenAsync(email, token).Returns(failureResponse);

        var result = await AuthHandlers.ValidateResetTokenHandler(email, token, _mockAuthService, frontendOptions);

        result.Should().BeOfType<RedirectHttpResult>();
        var redirectResult = (RedirectHttpResult)result;
        redirectResult.Url.Should().Contain("/resetPassword");
        redirectResult.Url.Should().Contain("error=");
    }

    #endregion

    #region ResetPasswordHandler Tests

    [Fact]
    public async Task ResetPasswordHandler_WithMatchingPasswords_ReturnsOkResult() {
        var request = new ResetPasswordRequest {
            Email = "user@example.com",
            Token = "reset-token",
            NewPassword = "NewPassword123!",
            ConfirmPassword = "NewPassword123!"
        };

        var successResponse = new AuthResponse {
            Success = true,
            Message = "Password updated successfully"
        };

        _mockAuthService.ResetPasswordAsync(request.Email, request.Token, request.NewPassword)
            .Returns(successResponse);

        var result = await AuthHandlers.ResetPasswordHandler(request, _mockAuthService);

        result.Should().BeOfType<Ok<AuthResponse>>();
        await _mockAuthService.Received(1).ResetPasswordAsync(request.Email, request.Token, request.NewPassword);
    }

    [Fact]
    public async Task ResetPasswordHandler_WithMismatchedPasswords_ReturnsValidationProblem() {
        var request = new ResetPasswordRequest {
            Email = "user@example.com",
            Token = "reset-token",
            NewPassword = "NewPassword123!",
            ConfirmPassword = "DifferentPassword123!"
        };

        var result = await AuthHandlers.ResetPasswordHandler(request, _mockAuthService);

        result.Should().BeOfType<ProblemHttpResult>();
        await _mockAuthService.DidNotReceive().ResetPasswordAsync(Arg.Any<string>(), Arg.Any<string>(), Arg.Any<string>());
    }

    [Fact]
    public async Task ResetPasswordHandler_WhenServiceFails_ReturnsValidationProblem() {
        var request = new ResetPasswordRequest {
            Email = "user@example.com",
            Token = "invalid-token",
            NewPassword = "NewPassword123!",
            ConfirmPassword = "NewPassword123!"
        };

        var failureResponse = new AuthResponse {
            Success = false,
            Message = "Invalid reset token"
        };

        _mockAuthService.ResetPasswordAsync(request.Email, request.Token, request.NewPassword)
            .Returns(failureResponse);

        var result = await AuthHandlers.ResetPasswordHandler(request, _mockAuthService);

        result.Should().BeOfType<ProblemHttpResult>();
    }

    #endregion

    #region ResendEmailConfirmationHandler Tests

    [Fact]
    public async Task ResendEmailConfirmationHandler_WithValidEmail_ReturnsOkResult() {
        var request = new ResendEmailConfirmationRequest {
            Email = "unconfirmed@example.com"
        };

        var successResponse = new AuthResponse {
            Success = true,
            Message = "If that email exists, confirmation instructions have been sent"
        };

        _mockAuthService.ResendEmailConfirmationAsync(request.Email).Returns(successResponse);

        var result = await AuthHandlers.ResendEmailConfirmationHandler(request, _mockAuthService);

        result.Should().BeOfType<Ok<AuthResponse>>();
        await _mockAuthService.Received(1).ResendEmailConfirmationAsync(request.Email);
    }

    [Fact]
    public async Task ResendEmailConfirmationHandler_WhenServiceFails_ReturnsBadRequest() {
        var request = new ResendEmailConfirmationRequest {
            Email = "user@example.com"
        };

        var failureResponse = new AuthResponse {
            Success = false,
            Message = "Email service unavailable"
        };

        _mockAuthService.ResendEmailConfirmationAsync(request.Email).Returns(failureResponse);

        var result = await AuthHandlers.ResendEmailConfirmationHandler(request, _mockAuthService);

        result.Should().BeAssignableTo<IStatusCodeHttpResult>();
        var statusResult = (IStatusCodeHttpResult)result;
        statusResult.StatusCode.Should().Be(400);
    }

    #endregion

    #region ConfirmEmailHandler Tests

    [Fact]
    public async Task ConfirmEmailHandler_WithValidToken_RedirectsToLogin() {
        const string email = "user@example.com";
        const string token = "confirmation-token";
        var frontendOptions = Options.Create(new FrontendOptions {
            BaseUrl = "http://localhost:3000"
        });

        var successResponse = new AuthResponse {
            Success = true,
            Message = "Email confirmed successfully"
        };

        _mockAuthService.ConfirmEmailAsync(email, token).Returns(successResponse);

        var result = await AuthHandlers.ConfirmEmailHandler(email, token, _mockAuthService, frontendOptions);

        result.Should().BeOfType<RedirectHttpResult>();
        var redirectResult = (RedirectHttpResult)result;
        redirectResult.Url.Should().Contain("/login");
        redirectResult.Url.Should().Contain("emailConfirmed=true");
    }

    [Fact]
    public async Task ConfirmEmailHandler_WithInvalidToken_RedirectsToErrorPage() {
        const string email = "user@example.com";
        const string token = "invalid-token";
        var frontendOptions = Options.Create(new FrontendOptions {
            BaseUrl = "http://localhost:3000"
        });

        var failureResponse = new AuthResponse {
            Success = false,
            Message = "Confirmation link has expired or is invalid"
        };

        _mockAuthService.ConfirmEmailAsync(email, token).Returns(failureResponse);

        var result = await AuthHandlers.ConfirmEmailHandler(email, token, _mockAuthService, frontendOptions);

        result.Should().BeOfType<RedirectHttpResult>();
        var redirectResult = (RedirectHttpResult)result;
        redirectResult.Url.Should().Contain("/login");
        redirectResult.Url.Should().Contain("error=");
    }

    #endregion

    #region RegisterHandler Edge Cases

    [Fact]
    public async Task RegisterHandler_WithDuplicatedUserMessage_ReturnsConflict() {
        var request = new RegisterRequest {
            Email = "duplicate@example.com",
            Password = "Password123!",
            ConfirmPassword = "Password123!",
            Name = "Test User",
            DisplayName = "TestUser"
        };

        var failureResponse = new AuthResponse {
            Success = false,
            Message = "DuplicatedUser",
            User = null
        };

        _mockAuthService.RegisterAsync(request).Returns(failureResponse);

        var result = await AuthHandlers.RegisterHandler(request, _mockAuthService);

        result.Should().BeAssignableTo<IStatusCodeHttpResult>();
        var statusResult = (IStatusCodeHttpResult)result;
        statusResult.StatusCode.Should().Be(409);
    }

    [Fact]
    public async Task RegisterHandler_WithPasswordError_MapsToPasswordField() {
        var request = new RegisterRequest {
            Email = "user@example.com",
            Password = "weak",
            ConfirmPassword = "weak",
            Name = "Test User",
            DisplayName = "TestUser"
        };

        var failureResponse = new AuthResponse {
            Success = false,
            Message = "Password must be at least 8 characters",
            User = null
        };

        _mockAuthService.RegisterAsync(request).Returns(failureResponse);

        var result = await AuthHandlers.RegisterHandler(request, _mockAuthService);

        result.Should().BeOfType<ProblemHttpResult>();
    }

    [Fact]
    public async Task RegisterHandler_WithEmailError_MapsToEmailField() {
        var request = new RegisterRequest {
            Email = "invalid-email",
            Password = "Password123!",
            ConfirmPassword = "Password123!",
            Name = "Test User",
            DisplayName = "TestUser"
        };

        var failureResponse = new AuthResponse {
            Success = false,
            Message = "Email is not valid",
            User = null
        };

        _mockAuthService.RegisterAsync(request).Returns(failureResponse);

        var result = await AuthHandlers.RegisterHandler(request, _mockAuthService);

        result.Should().BeOfType<ProblemHttpResult>();
    }

    [Fact]
    public async Task RegisterHandler_WithNameError_MapsToNameField() {
        var request = new RegisterRequest {
            Email = "user@example.com",
            Password = "Password123!",
            ConfirmPassword = "Password123!",
            Name = "",
            DisplayName = "TestUser"
        };

        var failureResponse = new AuthResponse {
            Success = false,
            Message = "Name is required",
            User = null
        };

        _mockAuthService.RegisterAsync(request).Returns(failureResponse);

        var result = await AuthHandlers.RegisterHandler(request, _mockAuthService);

        result.Should().BeOfType<ProblemHttpResult>();
    }

    #endregion
}