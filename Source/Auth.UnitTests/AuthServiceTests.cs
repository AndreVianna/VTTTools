namespace VttTools.Auth.UnitTests;

/// <summary>
/// Unit tests for AuthService business logic with mocked dependencies.
/// Tests individual methods in isolation without external dependencies.
/// </summary>
public class AuthServiceTests {
    private readonly UserManager<User> _mockUserManager;
    private readonly SignInManager<User> _mockSignInManager;
    private readonly IEmailService _mockEmailService;
    private readonly IJwtTokenService _mockJwtTokenService;
    private readonly ILogger<AuthService> _mockLogger;
    private readonly AuthService _authService;

    public AuthServiceTests() {
        // Mock UserManager<User>
        var userStore = Substitute.For<IUserStore<User>>();
        _mockUserManager = Substitute.For<UserManager<User>>(
            userStore, null, null, null, null, null, null, null, null);

        // Mock SignInManager<User>
        var contextAccessor = Substitute.For<IHttpContextAccessor>();
        var userPrincipalFactory = Substitute.For<IUserClaimsPrincipalFactory<User>>();
        _mockSignInManager = Substitute.For<SignInManager<User>>(
            _mockUserManager, contextAccessor, userPrincipalFactory, null, null, null, null);

        // Mock EmailService
        _mockEmailService = Substitute.For<IEmailService>();

        // Mock JwtTokenService
        _mockJwtTokenService = Substitute.For<IJwtTokenService>();

        // Mock Logger
        _mockLogger = Substitute.For<ILogger<AuthService>>();

        // Create AuthService with mocked dependencies
        _authService = new AuthService(_mockUserManager, _mockSignInManager, _mockEmailService, _mockJwtTokenService, _mockLogger);
    }

    #region LoginAsync Tests

    [Fact]
    public async Task LoginAsync_ValidCredentials_ReturnsSuccessResponse() {
        // Arrange
        var request = new LoginRequest {
            Email = "test@example.com",
            Password = "ValidPassword123!",
            RememberMe = false
        };

        var user = CreateTestUser("test@example.com", "Test User");
        var roles = new List<string> { "User" };
        const string expectedToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test.token";

        _mockUserManager.FindByEmailAsync(request.Email).Returns(user);
        _mockSignInManager.PasswordSignInAsync(user, request.Password, request.RememberMe, true)
            .Returns(SignInResult.Success);
        _mockUserManager.GetRolesAsync(user).Returns(roles);
        _mockJwtTokenService.GenerateToken(user, roles, request.RememberMe).Returns(expectedToken);

        // Act
        var result = await _authService.LoginAsync(request);

        // Assert
        Assert.True(result.Success);
        Assert.Equal("Success", result.Message);
        Assert.NotNull(result.User);
        Assert.Equal(request.Email, result.User.Email);
        Assert.Equal("Test User", result.User.Name);
        Assert.False(result.User.IsAdministrator);
        Assert.Equal(expectedToken, result.Token);

        // Verify method calls
        await _mockUserManager.Received(1).FindByEmailAsync(request.Email);
        await _mockSignInManager.Received(1).PasswordSignInAsync(user, request.Password, request.RememberMe, true);
        await _mockUserManager.Received(1).GetRolesAsync(user);
        _mockJwtTokenService.Received(1).GenerateToken(user, roles, request.RememberMe);
    }

    [Fact]
    public async Task LoginAsync_NonExistentUser_ReturnsFailureResponse() {
        // Arrange
        var request = new LoginRequest {
            Email = "nonexistent@example.com",
            Password = "SomePassword123!",
            RememberMe = false
        };

        _mockUserManager.FindByEmailAsync(request.Email).Returns((User?)null);

        // Act
        var result = await _authService.LoginAsync(request);

        // Assert
        Assert.False(result.Success);
        Assert.Equal("FailedLogin", result.Message);
        Assert.Null(result.User);

        // Verify only FindByEmailAsync was called
        await _mockUserManager.Received(1).FindByEmailAsync(request.Email);
        await _mockSignInManager.DidNotReceive().PasswordSignInAsync(Arg.Any<User>(), Arg.Any<string>(), Arg.Any<bool>(), Arg.Any<bool>());
    }

    [Fact]
    public async Task LoginAsync_InvalidPassword_ReturnsFailureResponse() {
        // Arrange
        var request = new LoginRequest {
            Email = "test@example.com",
            Password = "WrongPassword",
            RememberMe = false
        };

        var user = CreateTestUser("test@example.com", "Test User");

        _mockUserManager.FindByEmailAsync(request.Email).Returns(user);
        _mockSignInManager.PasswordSignInAsync(user, request.Password, request.RememberMe, true)
            .Returns(SignInResult.Failed);

        // Act
        var result = await _authService.LoginAsync(request);

        // Assert
        Assert.False(result.Success);
        Assert.Equal("FailedLogin", result.Message);
        Assert.Null(result.User);

        await _mockUserManager.Received(1).FindByEmailAsync(request.Email);
        await _mockSignInManager.Received(1).PasswordSignInAsync(user, request.Password, request.RememberMe, true);
    }

    [Fact]
    public async Task LoginAsync_LockedOutUser_ReturnsLockedOutResponse() {
        // Arrange
        var request = new LoginRequest {
            Email = "locked@example.com",
            Password = "ValidPassword123!",
            RememberMe = false
        };

        var user = CreateTestUser("locked@example.com", "Locked User");

        _mockUserManager.FindByEmailAsync(request.Email).Returns(user);
        _mockSignInManager.PasswordSignInAsync(user, request.Password, request.RememberMe, true)
            .Returns(SignInResult.LockedOut);

        // Act
        var result = await _authService.LoginAsync(request);

        // Assert
        Assert.False(result.Success);
        Assert.Equal("LockedAccount", result.Message);
        Assert.Null(result.User);
    }

    [Fact]
    public async Task LoginAsync_AdministratorRole_SetsIsAdministratorTrue() {
        // Arrange
        var request = new LoginRequest {
            Email = "admin@example.com",
            Password = "AdminPassword123!",
            RememberMe = false
        };

        var user = CreateTestUser("admin@example.com", "Admin User");
        var roles = new List<string> { "Administrator", "User" };

        _mockUserManager.FindByEmailAsync(request.Email).Returns(user);
        _mockSignInManager.PasswordSignInAsync(user, request.Password, request.RememberMe, true)
            .Returns(SignInResult.Success);
        _mockUserManager.GetRolesAsync(user).Returns(roles);

        // Act
        var result = await _authService.LoginAsync(request);

        // Assert
        Assert.True(result.Success);
        Assert.NotNull(result.User);
        Assert.True(result.User.IsAdministrator);
    }

    [Fact]
    public async Task LoginAsync_ExceptionThrown_ReturnsErrorResponse() {
        // Arrange
        var request = new LoginRequest {
            Email = "error@example.com",
            Password = "Password123!",
            RememberMe = false
        };

        _mockUserManager.FindByEmailAsync(request.Email).ThrowsAsync(new InvalidOperationException("Database error"));

        // Act
        var result = await _authService.LoginAsync(request);

        // Assert
        Assert.False(result.Success);
        Assert.Equal("InternalServerError", result.Message);
        Assert.Null(result.User);
    }

    #endregion

    #region RegisterAsync Tests

    [Fact]
    public async Task RegisterAsync_ValidRequest_ReturnsSuccessResponse() {
        // Arrange
        var request = new RegisterRequest {
            Email = "newuser@example.com",
            Password = "NewPassword123!",
            ConfirmPassword = "NewPassword123!",
            Name = "New User",
            DisplayName = "NewUser"
        };

        var roles = new List<string> { "User" };
        const string expectedToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test.token";

        _mockUserManager.FindByEmailAsync(request.Email).Returns((User?)null);
        _mockUserManager.CreateAsync(Arg.Any<User>(), request.Password).Returns(IdentityResult.Success);
        _mockSignInManager.SignInAsync(Arg.Any<User>(), false).Returns(Task.CompletedTask);
        _mockUserManager.GetRolesAsync(Arg.Any<User>()).Returns(roles);
        _mockJwtTokenService.GenerateToken(Arg.Any<User>(), roles, false).Returns(expectedToken);

        // Act
        var result = await _authService.RegisterAsync(request);

        // Assert
        Assert.True(result.Success);
        Assert.Equal("RegistrationSuccess", result.Message);
        Assert.NotNull(result.User);
        Assert.Equal(request.Email, result.User.Email);
        Assert.Equal(request.Name, result.User.Name);
        Assert.Equal(request.DisplayName, result.User.DisplayName);
        Assert.Equal(expectedToken, result.Token);

        // Verify method calls
        await _mockUserManager.Received(1).FindByEmailAsync(request.Email);
        await _mockUserManager.Received(1).CreateAsync(Arg.Is<User>(u =>
            u.Email == request.Email &&
            u.Name == request.Name &&
            u.DisplayName == request.DisplayName), request.Password);
        await _mockSignInManager.Received(1).SignInAsync(Arg.Any<User>(), false);
        await _mockUserManager.Received(1).GetRolesAsync(Arg.Any<User>());
        _mockJwtTokenService.Received(1).GenerateToken(Arg.Any<User>(), roles, false);
    }

    [Fact]
    public async Task RegisterAsync_ExistingUser_ReturnsFailureResponse() {
        // Arrange
        var request = new RegisterRequest {
            Email = "existing@example.com",
            Password = "Password123!",
            ConfirmPassword = "Password123!",
            Name = "Existing User",
            DisplayName = "ExistingUser"
        };

        var existingUser = CreateTestUser("existing@example.com", "Existing User");
        _mockUserManager.FindByEmailAsync(request.Email).Returns(existingUser);

        // Act
        var result = await _authService.RegisterAsync(request);

        // Assert
        Assert.False(result.Success);
        Assert.Equal("DuplicatedUser", result.Message);
        Assert.Null(result.User);

        // Verify AddAsync was not called
        await _mockUserManager.DidNotReceive().CreateAsync(Arg.Any<User>(), Arg.Any<string>());
    }

    [Fact]
    public async Task RegisterAsync_UserCreationFailed_ReturnsFailureResponse() {
        // Arrange
        var request = new RegisterRequest {
            Email = "fail@example.com",
            Password = "WeakPassword",
            ConfirmPassword = "WeakPassword",
            Name = "Fail User",
            DisplayName = "FailUser"
        };

        var identityErrors = new List<IdentityError> {
            new() { Description = "Password too weak" },
            new() { Description = "Password must contain uppercase letter" }
        };
        var failedResult = IdentityResult.Failed([.. identityErrors]);

        _mockUserManager.FindByEmailAsync(request.Email).Returns((User?)null);
        _mockUserManager.CreateAsync(Arg.Any<User>(), request.Password).Returns(failedResult);

        // Act
        var result = await _authService.RegisterAsync(request);

        // Assert
        Assert.False(result.Success);
        // Auth service returns errors directly, not prefixed
        Assert.Contains("Password too weak", result.Message);
        Assert.Contains("Password must contain uppercase letter", result.Message);
        Assert.Null(result.User);
    }

    [Fact]
    public async Task RegisterAsync_NullDisplayName_UsesNameAsDisplayName() {
        // Arrange
        var request = new RegisterRequest {
            Email = "nodisplay@example.com",
            Password = "Password123!",
            ConfirmPassword = "Password123!",
            Name = "No Token User",
            DisplayName = null
        };

        _mockUserManager.FindByEmailAsync(request.Email).Returns((User?)null);
        _mockUserManager.CreateAsync(Arg.Any<User>(), request.Password).Returns(IdentityResult.Success);

        // Act
        var result = await _authService.RegisterAsync(request);

        // Assert
        Assert.True(result.Success);
        Assert.NotNull(result.User);
        Assert.Equal("No", result.User.DisplayName); // DisplayName uses first word of Name
    }

    [Fact]
    public async Task RegisterAsync_ExceptionThrown_ReturnsErrorResponse() {
        // Arrange
        var request = new RegisterRequest {
            Email = "error@example.com",
            Password = "Password123!",
            ConfirmPassword = "Password123!",
            Name = "Error User",
            DisplayName = "ErrorUser"
        };

        _mockUserManager.FindByEmailAsync(request.Email).ThrowsAsync(new InvalidOperationException("Database error"));

        // Act
        var result = await _authService.RegisterAsync(request);

        // Assert
        Assert.False(result.Success);
        Assert.Equal("InternalServerError", result.Message);
        Assert.Null(result.User);
    }

    #endregion

    #region LogoutAsync Tests

    [Fact]
    public async Task LogoutAsync_Success_ReturnsSuccessResponse() {
        // Arrange
        _mockSignInManager.SignOutAsync().Returns(Task.CompletedTask);

        // Act
        var result = await _authService.LogoutAsync();

        // Assert
        Assert.True(result.Success);
        Assert.Equal("LogoutSuccess", result.Message);
        Assert.Null(result.User);

        await _mockSignInManager.Received(1).SignOutAsync();
    }

    [Fact]
    public async Task LogoutAsync_ExceptionThrown_ReturnsErrorResponse() {
        // Arrange
        _mockSignInManager.SignOutAsync().ThrowsAsync(new InvalidOperationException("Logout error"));

        // Act
        var result = await _authService.LogoutAsync();

        // Assert
        Assert.False(result.Success);
        Assert.Equal("InternalServerError", result.Message);
        Assert.Null(result.User);
    }

    #endregion

    #region GetCurrentUserAsync Tests

    [Fact]
    public async Task GetCurrentUserAsync_ValidUserId_ReturnsUserInfo() {
        // Arrange
        var userId = Guid.CreateVersion7();
        var user = CreateTestUser("current@example.com", "Current User");
        user.Id = userId;
        var roles = new List<string> { "User" };

        _mockUserManager.FindByIdAsync(userId.ToString()).Returns(user);
        _mockUserManager.GetRolesAsync(user).Returns(roles);

        // Act
        var result = await _authService.GetCurrentUserAsync(userId);

        // Assert
        Assert.True(result.Success);
        Assert.NotNull(result.User);
        Assert.Equal(userId, result.User.Id);
        Assert.Equal("current@example.com", result.User.Email);
        Assert.Equal("Current User", result.User.Name);
        Assert.False(result.User.IsAdministrator);

        await _mockUserManager.Received(1).FindByIdAsync(userId.ToString());
        await _mockUserManager.Received(1).GetRolesAsync(user);
    }

    [Fact]
    public async Task GetCurrentUserAsync_NonExistentUser_ReturnsFailureResponse() {
        // Arrange
        var userId = Guid.CreateVersion7();
        _mockUserManager.FindByIdAsync(userId.ToString()).Returns((User?)null);

        // Act
        var result = await _authService.GetCurrentUserAsync(userId);

        // Assert
        Assert.False(result.Success);
        Assert.Equal("NotFound", result.Message);
        Assert.Null(result.User);

        await _mockUserManager.Received(1).FindByIdAsync(userId.ToString());
    }

    [Fact]
    public async Task GetCurrentUserAsync_AdministratorUser_SetsIsAdministratorTrue() {
        // Arrange
        var userId = Guid.CreateVersion7();
        var user = CreateTestUser("admin@example.com", "Admin User");
        user.Id = userId;
        var roles = new List<string> { "Administrator" };

        _mockUserManager.FindByIdAsync(userId.ToString()).Returns(user);
        _mockUserManager.GetRolesAsync(user).Returns(roles);

        // Act
        var result = await _authService.GetCurrentUserAsync(userId);

        // Assert
        Assert.True(result.Success);
        Assert.NotNull(result.User);
        Assert.True(result.User.IsAdministrator);
    }

    [Fact]
    public async Task GetCurrentUserAsync_ExceptionThrown_ReturnsErrorResponse() {
        // Arrange
        var userId = Guid.CreateVersion7();
        _mockUserManager.FindByIdAsync(userId.ToString()).ThrowsAsync(new InvalidOperationException("Database error"));

        // Act
        var result = await _authService.GetCurrentUserAsync(userId);

        // Assert
        Assert.False(result.Success);
        Assert.Equal("InternalServerError", result.Message);
        Assert.Null(result.User);
    }

    #endregion

    #region ForgotPasswordAsync Tests

    [Fact]
    public async Task ForgotPasswordAsync_WithExistingUser_SendsEmailAndReturnsSuccess() {
        const string email = "user@example.com";
        var user = CreateTestUser(email, "Test User");
        const string resetToken = "reset-token-123";

        _mockUserManager.FindByEmailAsync(email).Returns(user);
        _mockUserManager.GeneratePasswordResetTokenAsync(user).Returns(resetToken);
        _mockEmailService.SendPasswordResetEmailAsync(email, Arg.Any<string>()).Returns(Task.CompletedTask);

        var result = await _authService.ForgotPasswordAsync(email);

        result.Success.Should().BeTrue();
        result.Message.Should().Contain("reset instructions have been sent");
        await _mockUserManager.Received(1).FindByEmailAsync(email);
        await _mockUserManager.Received(1).GeneratePasswordResetTokenAsync(user);
        await _mockEmailService.Received(1).SendPasswordResetEmailAsync(email, Arg.Any<string>());
    }

    [Fact]
    public async Task ForgotPasswordAsync_WithNonExistentUser_ReturnsSuccessWithoutSendingEmail() {
        const string email = "nonexistent@example.com";

        _mockUserManager.FindByEmailAsync(email).Returns((User?)null);

        var result = await _authService.ForgotPasswordAsync(email);

        result.Success.Should().BeTrue();
        result.Message.Should().Contain("reset instructions have been sent");
        await _mockUserManager.Received(1).FindByEmailAsync(email);
        await _mockUserManager.DidNotReceive().GeneratePasswordResetTokenAsync(Arg.Any<User>());
        await _mockEmailService.DidNotReceive().SendPasswordResetEmailAsync(Arg.Any<string>(), Arg.Any<string>());
    }

    [Fact]
    public async Task ForgotPasswordAsync_WhenExceptionThrown_ReturnsInternalServerError() {
        const string email = "error@example.com";

        _mockUserManager.FindByEmailAsync(email).ThrowsAsync(new InvalidOperationException("Database error"));

        var result = await _authService.ForgotPasswordAsync(email);

        result.Success.Should().BeFalse();
        result.Message.Should().Be("InternalServerError");
    }

    #endregion

    #region ValidateResetTokenAsync Tests

    [Fact]
    public async Task ValidateResetTokenAsync_WithValidToken_ReturnsSuccess() {
        const string email = "user@example.com";
        const string token = "valid-token";
        var user = CreateTestUser(email, "Test User");

        _mockUserManager.FindByEmailAsync(email).Returns(user);
        _mockUserManager.VerifyUserTokenAsync(
            user,
            Arg.Any<string>(),
            "ResetPassword",
            token).Returns(true);

        var result = await _authService.ValidateResetTokenAsync(email, token);

        result.Success.Should().BeTrue();
        await _mockUserManager.Received(1).FindByEmailAsync(email);
        await _mockUserManager.Received(1).VerifyUserTokenAsync(user, Arg.Any<string>(), "ResetPassword", token);
    }

    [Fact]
    public async Task ValidateResetTokenAsync_WithInvalidToken_ReturnsFailure() {
        const string email = "user@example.com";
        const string token = "invalid-token";
        var user = CreateTestUser(email, "Test User");

        _mockUserManager.FindByEmailAsync(email).Returns(user);
        _mockUserManager.VerifyUserTokenAsync(
            user,
            Arg.Any<string>(),
            "ResetPassword",
            token).Returns(false);

        var result = await _authService.ValidateResetTokenAsync(email, token);

        result.Success.Should().BeFalse();
        result.Message.Should().Contain("expired or is invalid");
    }

    [Fact]
    public async Task ValidateResetTokenAsync_WithNonExistentUser_ReturnsFailure() {
        const string email = "nonexistent@example.com";
        const string token = "some-token";

        _mockUserManager.FindByEmailAsync(email).Returns((User?)null);

        var result = await _authService.ValidateResetTokenAsync(email, token);

        result.Success.Should().BeFalse();
        result.Message.Should().Be("Invalid reset link");
        await _mockUserManager.DidNotReceive().VerifyUserTokenAsync(Arg.Any<User>(), Arg.Any<string>(), Arg.Any<string>(), Arg.Any<string>());
    }

    [Fact]
    public async Task ValidateResetTokenAsync_WhenExceptionThrown_ReturnsInternalServerError() {
        const string email = "error@example.com";
        const string token = "some-token";

        _mockUserManager.FindByEmailAsync(email).ThrowsAsync(new InvalidOperationException("Database error"));

        var result = await _authService.ValidateResetTokenAsync(email, token);

        result.Success.Should().BeFalse();
        result.Message.Should().Be("InternalServerError");
    }

    #endregion

    #region ResetPasswordAsync Tests

    [Fact]
    public async Task ResetPasswordAsync_WithValidToken_ResetsPasswordAndReturnsSuccess() {
        const string email = "user@example.com";
        const string token = "valid-token";
        const string newPassword = "NewPassword123!";
        var user = CreateTestUser(email, "Test User");

        _mockUserManager.FindByEmailAsync(email).Returns(user);
        _mockUserManager.ResetPasswordAsync(user, token, newPassword).Returns(IdentityResult.Success);

        var result = await _authService.ResetPasswordAsync(email, token, newPassword);

        result.Success.Should().BeTrue();
        result.Message.Should().Be("Password updated successfully");
        await _mockUserManager.Received(1).FindByEmailAsync(email);
        await _mockUserManager.Received(1).ResetPasswordAsync(user, token, newPassword);
    }

    [Fact]
    public async Task ResetPasswordAsync_WithInvalidToken_ReturnsFailure() {
        const string email = "user@example.com";
        const string token = "invalid-token";
        const string newPassword = "NewPassword123!";
        var user = CreateTestUser(email, "Test User");
        var identityErrors = new List<IdentityError> {
            new() { Description = "Invalid token" }
        };

        _mockUserManager.FindByEmailAsync(email).Returns(user);
        _mockUserManager.ResetPasswordAsync(user, token, newPassword)
            .Returns(IdentityResult.Failed([.. identityErrors]));

        var result = await _authService.ResetPasswordAsync(email, token, newPassword);

        result.Success.Should().BeFalse();
        result.Message.Should().Contain("Invalid token");
    }

    [Fact]
    public async Task ResetPasswordAsync_WithNonExistentUser_ReturnsFailure() {
        const string email = "nonexistent@example.com";
        const string token = "some-token";
        const string newPassword = "NewPassword123!";

        _mockUserManager.FindByEmailAsync(email).Returns((User?)null);

        var result = await _authService.ResetPasswordAsync(email, token, newPassword);

        result.Success.Should().BeFalse();
        result.Message.Should().Be("Invalid reset link");
        await _mockUserManager.DidNotReceive().ResetPasswordAsync(Arg.Any<User>(), Arg.Any<string>(), Arg.Any<string>());
    }

    [Fact]
    public async Task ResetPasswordAsync_WhenExceptionThrown_ReturnsInternalServerError() {
        const string email = "error@example.com";
        const string token = "some-token";
        const string newPassword = "NewPassword123!";

        _mockUserManager.FindByEmailAsync(email).ThrowsAsync(new InvalidOperationException("Database error"));

        var result = await _authService.ResetPasswordAsync(email, token, newPassword);

        result.Success.Should().BeFalse();
        result.Message.Should().Be("InternalServerError");
    }

    #endregion

    #region ResendEmailConfirmationAsync Tests

    [Fact]
    public async Task ResendEmailConfirmationAsync_WithUnconfirmedUser_SendsEmailAndReturnsSuccess() {
        const string email = "unconfirmed@example.com";
        var user = CreateTestUser(email, "Test User");
        user.EmailConfirmed = false;
        const string confirmToken = "confirm-token-123";

        _mockUserManager.FindByEmailAsync(email).Returns(user);
        _mockUserManager.GenerateEmailConfirmationTokenAsync(user).Returns(confirmToken);
        _mockEmailService.SendEmailConfirmationAsync(email, Arg.Any<string>()).Returns(Task.CompletedTask);

        var result = await _authService.ResendEmailConfirmationAsync(email);

        result.Success.Should().BeTrue();
        result.Message.Should().Contain("confirmation instructions have been sent");
        await _mockUserManager.Received(1).FindByEmailAsync(email);
        await _mockUserManager.Received(1).GenerateEmailConfirmationTokenAsync(user);
        await _mockEmailService.Received(1).SendEmailConfirmationAsync(email, Arg.Any<string>());
    }

    [Fact]
    public async Task ResendEmailConfirmationAsync_WithAlreadyConfirmedUser_ReturnsSuccessWithoutSendingEmail() {
        const string email = "confirmed@example.com";
        var user = CreateTestUser(email, "Test User");
        user.EmailConfirmed = true;

        _mockUserManager.FindByEmailAsync(email).Returns(user);

        var result = await _authService.ResendEmailConfirmationAsync(email);

        result.Success.Should().BeTrue();
        result.Message.Should().Contain("already confirmed");
        await _mockUserManager.DidNotReceive().GenerateEmailConfirmationTokenAsync(Arg.Any<User>());
        await _mockEmailService.DidNotReceive().SendEmailConfirmationAsync(Arg.Any<string>(), Arg.Any<string>());
    }

    [Fact]
    public async Task ResendEmailConfirmationAsync_WithNonExistentUser_ReturnsSuccessWithoutSendingEmail() {
        const string email = "nonexistent@example.com";

        _mockUserManager.FindByEmailAsync(email).Returns((User?)null);

        var result = await _authService.ResendEmailConfirmationAsync(email);

        result.Success.Should().BeTrue();
        result.Message.Should().Contain("confirmation instructions have been sent");
        await _mockUserManager.DidNotReceive().GenerateEmailConfirmationTokenAsync(Arg.Any<User>());
        await _mockEmailService.DidNotReceive().SendEmailConfirmationAsync(Arg.Any<string>(), Arg.Any<string>());
    }

    [Fact]
    public async Task ResendEmailConfirmationAsync_WhenExceptionThrown_ReturnsInternalServerError() {
        const string email = "error@example.com";

        _mockUserManager.FindByEmailAsync(email).ThrowsAsync(new InvalidOperationException("Database error"));

        var result = await _authService.ResendEmailConfirmationAsync(email);

        result.Success.Should().BeFalse();
        result.Message.Should().Be("InternalServerError");
    }

    #endregion

    #region ConfirmEmailAsync Tests

    [Fact]
    public async Task ConfirmEmailAsync_WithValidToken_ConfirmsEmailAndReturnsSuccess() {
        const string email = "user@example.com";
        const string token = "valid-token";
        var user = CreateTestUser(email, "Test User");
        user.EmailConfirmed = false;

        _mockUserManager.FindByEmailAsync(email).Returns(user);
        _mockUserManager.ConfirmEmailAsync(user, token).Returns(IdentityResult.Success);

        var result = await _authService.ConfirmEmailAsync(email, token);

        result.Success.Should().BeTrue();
        result.Message.Should().Be("Email confirmed successfully");
        await _mockUserManager.Received(1).FindByEmailAsync(email);
        await _mockUserManager.Received(1).ConfirmEmailAsync(user, token);
    }

    [Fact]
    public async Task ConfirmEmailAsync_WithAlreadyConfirmedEmail_ReturnsSuccessWithoutConfirming() {
        const string email = "confirmed@example.com";
        const string token = "some-token";
        var user = CreateTestUser(email, "Test User");
        user.EmailConfirmed = true;

        _mockUserManager.FindByEmailAsync(email).Returns(user);

        var result = await _authService.ConfirmEmailAsync(email, token);

        result.Success.Should().BeTrue();
        result.Message.Should().Contain("already confirmed");
        await _mockUserManager.DidNotReceive().ConfirmEmailAsync(Arg.Any<User>(), Arg.Any<string>());
    }

    [Fact]
    public async Task ConfirmEmailAsync_WithInvalidToken_ReturnsFailure() {
        const string email = "user@example.com";
        const string token = "invalid-token";
        var user = CreateTestUser(email, "Test User");
        user.EmailConfirmed = false;
        var identityErrors = new List<IdentityError> {
            new() { Description = "Invalid token" }
        };

        _mockUserManager.FindByEmailAsync(email).Returns(user);
        _mockUserManager.ConfirmEmailAsync(user, token)
            .Returns(IdentityResult.Failed([.. identityErrors]));

        var result = await _authService.ConfirmEmailAsync(email, token);

        result.Success.Should().BeFalse();
        result.Message.Should().Contain("expired or is invalid");
    }

    [Fact]
    public async Task ConfirmEmailAsync_WithNonExistentUser_ReturnsFailure() {
        const string email = "nonexistent@example.com";
        const string token = "some-token";

        _mockUserManager.FindByEmailAsync(email).Returns((User?)null);

        var result = await _authService.ConfirmEmailAsync(email, token);

        result.Success.Should().BeFalse();
        result.Message.Should().Be("Invalid confirmation link");
        await _mockUserManager.DidNotReceive().ConfirmEmailAsync(Arg.Any<User>(), Arg.Any<string>());
    }

    [Fact]
    public async Task ConfirmEmailAsync_WhenExceptionThrown_ReturnsInternalServerError() {
        const string email = "error@example.com";
        const string token = "some-token";

        _mockUserManager.FindByEmailAsync(email).ThrowsAsync(new InvalidOperationException("Database error"));

        var result = await _authService.ConfirmEmailAsync(email, token);

        result.Success.Should().BeFalse();
        result.Message.Should().Be("InternalServerError");
    }

    #endregion

    #region LoginAsync Edge Cases

    [Fact]
    public async Task LoginAsync_WhenNotAllowed_ReturnsNotAllowedResponse() {
        var request = new LoginRequest {
            Email = "unconfirmed@example.com",
            Password = "Password123!",
            RememberMe = false
        };

        var user = CreateTestUser(request.Email, "Unconfirmed User");

        _mockUserManager.FindByEmailAsync(request.Email).Returns(user);
        _mockSignInManager.PasswordSignInAsync(user, request.Password, request.RememberMe, true)
            .Returns(SignInResult.NotAllowed);

        var result = await _authService.LoginAsync(request);

        result.Success.Should().BeFalse();
        result.Message.Should().Be("NotAllowed");
        result.User.Should().BeNull();
    }

    [Fact]
    public async Task LoginAsync_WhenRequiresTwoFactor_ReturnsRequiresTwoFactorResponse() {
        var request = new LoginRequest {
            Email = "2fa@example.com",
            Password = "Password123!",
            RememberMe = false
        };

        var user = CreateTestUser(request.Email, "2FA User");

        _mockUserManager.FindByEmailAsync(request.Email).Returns(user);
        _mockSignInManager.PasswordSignInAsync(user, request.Password, request.RememberMe, true)
            .Returns(SignInResult.TwoFactorRequired);

        var result = await _authService.LoginAsync(request);

        result.Success.Should().BeFalse();
        result.Message.Should().Be("RequiresTwoFactor");
        result.User.Should().BeNull();
    }

    #endregion

    #region Helper Methods

    private static User CreateTestUser(string email, string name)
        => new() {
            Id = Guid.CreateVersion7(),
            UserName = email,
            Email = email,
            Name = name,
            DisplayName = name,
            EmailConfirmed = true,
            IsAdministrator = false
        };

    #endregion
}