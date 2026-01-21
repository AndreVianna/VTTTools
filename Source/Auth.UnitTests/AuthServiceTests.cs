using SignInResult = VttTools.Identity.Model.SignInResult;

namespace VttTools.Auth;

public class AuthServiceTests {
    private readonly IUserStorage _mockUserStorage;
    private readonly ISignInService _mockSignInService;
    private readonly IEmailService _mockEmailService;
    private readonly IJwtTokenService _mockJwtTokenService;
    private readonly ILogger<AuthService> _mockLogger;
    private readonly AuthService _authService;

    public AuthServiceTests() {
        _mockUserStorage = Substitute.For<IUserStorage>();
        _mockSignInService = Substitute.For<ISignInService>();
        _mockEmailService = Substitute.For<IEmailService>();
        _mockJwtTokenService = Substitute.For<IJwtTokenService>();
        _mockLogger = Substitute.For<ILogger<AuthService>>();

        _authService = new AuthService(
            _mockUserStorage,
            _mockSignInService,
            _mockEmailService,
            _mockJwtTokenService,
            _mockLogger);
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
        const string expectedToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test.token";

        _mockUserStorage.ValidateCredentialsAsync(request.Email, request.Password, true, Arg.Any<CancellationToken>())
            .Returns(new SignInResult { Succeeded = true, User = user });
        _mockJwtTokenService.GenerateToken(Arg.Any<User>(), Arg.Any<IReadOnlyList<string>>(), Arg.Any<bool>())
            .Returns(expectedToken);

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
        await _mockUserStorage.Received(1).ValidateCredentialsAsync(request.Email, request.Password, true, Arg.Any<CancellationToken>());
        _mockJwtTokenService.Received(1).GenerateToken(Arg.Any<User>(), Arg.Any<IReadOnlyList<string>>(), Arg.Any<bool>());
    }

    [Fact]
    public async Task LoginAsync_NonExistentUser_ReturnsFailureResponse() {
        // Arrange
        var request = new LoginRequest {
            Email = "nonexistent@example.com",
            Password = "SomePassword123!",
            RememberMe = false
        };

        _mockUserStorage.ValidateCredentialsAsync(request.Email, request.Password, true, Arg.Any<CancellationToken>())
            .Returns(new SignInResult { Succeeded = false });

        // Act
        var result = await _authService.LoginAsync(request);

        // Assert
        Assert.False(result.Success);
        Assert.Equal("FailedLogin", result.Message);
        Assert.Null(result.User);

        await _mockUserStorage.Received(1).ValidateCredentialsAsync(request.Email, request.Password, true, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task LoginAsync_InvalidPassword_ReturnsFailureResponse() {
        // Arrange
        var request = new LoginRequest {
            Email = "test@example.com",
            Password = "WrongPassword",
            RememberMe = false
        };

        _mockUserStorage.ValidateCredentialsAsync(request.Email, request.Password, true, Arg.Any<CancellationToken>())
            .Returns(new SignInResult { Succeeded = false });

        // Act
        var result = await _authService.LoginAsync(request);

        // Assert
        Assert.False(result.Success);
        Assert.Equal("FailedLogin", result.Message);
        Assert.Null(result.User);

        await _mockUserStorage.Received(1).ValidateCredentialsAsync(request.Email, request.Password, true, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task LoginAsync_LockedOutUser_ReturnsLockedOutResponse() {
        // Arrange
        var request = new LoginRequest {
            Email = "locked@example.com",
            Password = "ValidPassword123!",
            RememberMe = false
        };

        _mockUserStorage.ValidateCredentialsAsync(request.Email, request.Password, true, Arg.Any<CancellationToken>())
            .Returns(new SignInResult { Succeeded = false, IsLockedOut = true });

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

        var user = CreateTestUser("admin@example.com", "Admin User", ["Administrator", "User"]);

        _mockUserStorage.ValidateCredentialsAsync(request.Email, request.Password, true, Arg.Any<CancellationToken>())
            .Returns(new SignInResult { Succeeded = true, User = user });

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

        _mockUserStorage.ValidateCredentialsAsync(request.Email, request.Password, true, Arg.Any<CancellationToken>())
            .ThrowsAsync(new InvalidOperationException("Database error"));

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

        var createdUser = CreateTestUser(request.Email, request.Name) with { DisplayName = request.DisplayName ?? request.Name };
        const string expectedToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test.token";

        _mockUserStorage.FindByEmailAsync(request.Email, Arg.Any<CancellationToken>()).Returns((User?)null);
        _mockUserStorage.CreateAsync(Arg.Any<User>(), request.Password, Arg.Any<CancellationToken>())
            .Returns(Result.Success(createdUser));
        _mockSignInService.SignInAsync(Arg.Any<Guid>(), false, Arg.Any<CancellationToken>()).Returns(Task.CompletedTask);
        _mockJwtTokenService.GenerateToken(Arg.Any<User>(), Arg.Any<IReadOnlyList<string>>(), Arg.Any<bool>())
            .Returns(expectedToken);

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
        await _mockUserStorage.Received(1).FindByEmailAsync(request.Email, Arg.Any<CancellationToken>());
        await _mockUserStorage.Received(1).CreateAsync(Arg.Any<User>(), request.Password, Arg.Any<CancellationToken>());
        await _mockSignInService.Received(1).SignInAsync(Arg.Any<Guid>(), false, Arg.Any<CancellationToken>());
        _mockJwtTokenService.Received(1).GenerateToken(Arg.Any<User>(), Arg.Any<IReadOnlyList<string>>(), Arg.Any<bool>());
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
        _mockUserStorage.FindByEmailAsync(request.Email, Arg.Any<CancellationToken>()).Returns(existingUser);

        // Act
        var result = await _authService.RegisterAsync(request);

        // Assert
        Assert.False(result.Success);
        Assert.Equal("DuplicatedUser", result.Message);
        Assert.Null(result.User);

        // Verify CreateAsync was not called
        await _mockUserStorage.DidNotReceive().CreateAsync(Arg.Any<User>(), Arg.Any<string>(), Arg.Any<CancellationToken>());
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

        _mockUserStorage.FindByEmailAsync(request.Email, Arg.Any<CancellationToken>()).Returns((User?)null);
        _mockUserStorage.CreateAsync(Arg.Any<User>(), request.Password, Arg.Any<CancellationToken>())
            .Returns(Result.Failure<User>(null!, new Error("Password too weak"), new Error("Password must contain uppercase letter")));

        // Act
        var result = await _authService.RegisterAsync(request);

        // Assert
        Assert.False(result.Success);
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

        var createdUser = new User {
            Id = Guid.CreateVersion7(),
            Email = request.Email,
            Name = request.Name,
            DisplayName = "No",
            EmailConfirmed = true,
            Roles = []
        };

        _mockUserStorage.FindByEmailAsync(request.Email, Arg.Any<CancellationToken>()).Returns((User?)null);
        _mockUserStorage.CreateAsync(Arg.Any<User>(), request.Password, Arg.Any<CancellationToken>())
            .Returns(Result.Success(createdUser));

        // Act
        var result = await _authService.RegisterAsync(request);

        // Assert
        Assert.True(result.Success);
        Assert.NotNull(result.User);
        Assert.Equal("No", result.User.DisplayName);
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

        _mockUserStorage.FindByEmailAsync(request.Email, Arg.Any<CancellationToken>())
            .ThrowsAsync(new InvalidOperationException("Database error"));

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
        _mockSignInService.SignOutAsync(Arg.Any<CancellationToken>()).Returns(Task.CompletedTask);

        // Act
        var result = await _authService.LogoutAsync();

        // Assert
        Assert.True(result.Success);
        Assert.Equal("LogoutSuccess", result.Message);
        Assert.Null(result.User);

        await _mockSignInService.Received(1).SignOutAsync(Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task LogoutAsync_ExceptionThrown_ReturnsErrorResponse() {
        // Arrange
        _mockSignInService.SignOutAsync(Arg.Any<CancellationToken>())
            .ThrowsAsync(new InvalidOperationException("Logout error"));

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
        user = user with { Id = userId };

        _mockUserStorage.FindByIdAsync(userId, Arg.Any<CancellationToken>()).Returns(user);

        // Act
        var result = await _authService.GetCurrentUserAsync(userId);

        // Assert
        Assert.True(result.Success);
        Assert.NotNull(result.User);
        Assert.Equal(userId, result.User.Id);
        Assert.Equal("current@example.com", result.User.Email);
        Assert.Equal("Current User", result.User.Name);
        Assert.False(result.User.IsAdministrator);

        await _mockUserStorage.Received(1).FindByIdAsync(userId, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task GetCurrentUserAsync_NonExistentUser_ReturnsFailureResponse() {
        // Arrange
        var userId = Guid.CreateVersion7();
        _mockUserStorage.FindByIdAsync(userId, Arg.Any<CancellationToken>()).Returns((User?)null);

        // Act
        var result = await _authService.GetCurrentUserAsync(userId);

        // Assert
        Assert.False(result.Success);
        Assert.Equal("NotFound", result.Message);
        Assert.Null(result.User);

        await _mockUserStorage.Received(1).FindByIdAsync(userId, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task GetCurrentUserAsync_AdministratorUser_SetsIsAdministratorTrue() {
        // Arrange
        var userId = Guid.CreateVersion7();
        var user = CreateTestUser("admin@example.com", "Admin User", ["Administrator"]);
        user = user with { Id = userId };

        _mockUserStorage.FindByIdAsync(userId, Arg.Any<CancellationToken>()).Returns(user);

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
        _mockUserStorage.FindByIdAsync(userId, Arg.Any<CancellationToken>())
            .ThrowsAsync(new InvalidOperationException("Database error"));

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

        _mockUserStorage.FindByEmailAsync(email, Arg.Any<CancellationToken>()).Returns(user);
        _mockUserStorage.GeneratePasswordResetTokenAsync(user.Id, Arg.Any<CancellationToken>()).Returns(resetToken);
        _mockEmailService.SendPasswordResetEmailAsync(email, Arg.Any<string>()).Returns(Task.CompletedTask);

        var result = await _authService.ForgotPasswordAsync(email);

        result.Success.Should().BeTrue();
        result.Message.Should().Contain("reset instructions have been sent");
        await _mockUserStorage.Received(1).FindByEmailAsync(email, Arg.Any<CancellationToken>());
        await _mockUserStorage.Received(1).GeneratePasswordResetTokenAsync(user.Id, Arg.Any<CancellationToken>());
        await _mockEmailService.Received(1).SendPasswordResetEmailAsync(email, Arg.Any<string>());
    }

    [Fact]
    public async Task ForgotPasswordAsync_WithNonExistentUser_ReturnsSuccessWithoutSendingEmail() {
        const string email = "nonexistent@example.com";

        _mockUserStorage.FindByEmailAsync(email, Arg.Any<CancellationToken>()).Returns((User?)null);

        var result = await _authService.ForgotPasswordAsync(email);

        result.Success.Should().BeTrue();
        result.Message.Should().Contain("reset instructions have been sent");
        await _mockUserStorage.Received(1).FindByEmailAsync(email, Arg.Any<CancellationToken>());
        await _mockUserStorage.DidNotReceive().GeneratePasswordResetTokenAsync(Arg.Any<Guid>(), Arg.Any<CancellationToken>());
        await _mockEmailService.DidNotReceive().SendPasswordResetEmailAsync(Arg.Any<string>(), Arg.Any<string>());
    }

    [Fact]
    public async Task ForgotPasswordAsync_WhenExceptionThrown_ReturnsInternalServerError() {
        const string email = "error@example.com";

        _mockUserStorage.FindByEmailAsync(email, Arg.Any<CancellationToken>())
            .ThrowsAsync(new InvalidOperationException("Database error"));

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

        _mockUserStorage.FindByEmailAsync(email, Arg.Any<CancellationToken>()).Returns(user);
        _mockUserStorage.VerifyPasswordResetTokenAsync(user.Id, token, Arg.Any<CancellationToken>()).Returns(true);

        var result = await _authService.ValidateResetTokenAsync(email, token);

        result.Success.Should().BeTrue();
        await _mockUserStorage.Received(1).FindByEmailAsync(email, Arg.Any<CancellationToken>());
        await _mockUserStorage.Received(1).VerifyPasswordResetTokenAsync(user.Id, token, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task ValidateResetTokenAsync_WithInvalidToken_ReturnsFailure() {
        const string email = "user@example.com";
        const string token = "invalid-token";
        var user = CreateTestUser(email, "Test User");

        _mockUserStorage.FindByEmailAsync(email, Arg.Any<CancellationToken>()).Returns(user);
        _mockUserStorage.VerifyPasswordResetTokenAsync(user.Id, token, Arg.Any<CancellationToken>()).Returns(false);

        var result = await _authService.ValidateResetTokenAsync(email, token);

        result.Success.Should().BeFalse();
        result.Message.Should().Contain("expired or is invalid");
    }

    [Fact]
    public async Task ValidateResetTokenAsync_WithNonExistentUser_ReturnsFailure() {
        const string email = "nonexistent@example.com";
        const string token = "some-token";

        _mockUserStorage.FindByEmailAsync(email, Arg.Any<CancellationToken>()).Returns((User?)null);

        var result = await _authService.ValidateResetTokenAsync(email, token);

        result.Success.Should().BeFalse();
        result.Message.Should().Be("Invalid reset link");
        await _mockUserStorage.DidNotReceive().VerifyPasswordResetTokenAsync(Arg.Any<Guid>(), Arg.Any<string>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task ValidateResetTokenAsync_WhenExceptionThrown_ReturnsInternalServerError() {
        const string email = "error@example.com";
        const string token = "some-token";

        _mockUserStorage.FindByEmailAsync(email, Arg.Any<CancellationToken>())
            .ThrowsAsync(new InvalidOperationException("Database error"));

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

        _mockUserStorage.FindByEmailAsync(email, Arg.Any<CancellationToken>()).Returns(user);
        _mockUserStorage.ResetPasswordWithTokenAsync(user.Id, token, newPassword, Arg.Any<CancellationToken>())
            .Returns(Result.Success());

        var result = await _authService.ResetPasswordAsync(email, token, newPassword);

        result.Success.Should().BeTrue();
        result.Message.Should().Be("Password updated successfully");
        await _mockUserStorage.Received(1).FindByEmailAsync(email, Arg.Any<CancellationToken>());
        await _mockUserStorage.Received(1).ResetPasswordWithTokenAsync(user.Id, token, newPassword, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task ResetPasswordAsync_WithInvalidToken_ReturnsFailure() {
        const string email = "user@example.com";
        const string token = "invalid-token";
        const string newPassword = "NewPassword123!";
        var user = CreateTestUser(email, "Test User");

        _mockUserStorage.FindByEmailAsync(email, Arg.Any<CancellationToken>()).Returns(user);
        _mockUserStorage.ResetPasswordWithTokenAsync(user.Id, token, newPassword, Arg.Any<CancellationToken>())
            .Returns(Result.Failure(new Error("Invalid token")));

        var result = await _authService.ResetPasswordAsync(email, token, newPassword);

        result.Success.Should().BeFalse();
        result.Message.Should().Contain("Invalid token");
    }

    [Fact]
    public async Task ResetPasswordAsync_WithNonExistentUser_ReturnsFailure() {
        const string email = "nonexistent@example.com";
        const string token = "some-token";
        const string newPassword = "NewPassword123!";

        _mockUserStorage.FindByEmailAsync(email, Arg.Any<CancellationToken>()).Returns((User?)null);

        var result = await _authService.ResetPasswordAsync(email, token, newPassword);

        result.Success.Should().BeFalse();
        result.Message.Should().Be("Invalid reset link");
        await _mockUserStorage.DidNotReceive().ResetPasswordWithTokenAsync(Arg.Any<Guid>(), Arg.Any<string>(), Arg.Any<string>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task ResetPasswordAsync_WhenExceptionThrown_ReturnsInternalServerError() {
        const string email = "error@example.com";
        const string token = "some-token";
        const string newPassword = "NewPassword123!";

        _mockUserStorage.FindByEmailAsync(email, Arg.Any<CancellationToken>())
            .ThrowsAsync(new InvalidOperationException("Database error"));

        var result = await _authService.ResetPasswordAsync(email, token, newPassword);

        result.Success.Should().BeFalse();
        result.Message.Should().Be("InternalServerError");
    }

    #endregion

    #region ResendEmailConfirmationAsync Tests

    [Fact]
    public async Task ResendEmailConfirmationAsync_WithUnconfirmedUser_SendsEmailAndReturnsSuccess() {
        const string email = "unconfirmed@example.com";
        var user = CreateTestUser(email, "Test User") with { EmailConfirmed = false };
        const string confirmToken = "confirm-token-123";

        _mockUserStorage.FindByEmailAsync(email, Arg.Any<CancellationToken>()).Returns(user);
        _mockUserStorage.GenerateEmailConfirmationTokenAsync(user.Id, Arg.Any<CancellationToken>()).Returns(confirmToken);
        _mockEmailService.SendEmailConfirmationAsync(email, Arg.Any<string>()).Returns(Task.CompletedTask);

        var result = await _authService.ResendEmailConfirmationAsync(email);

        result.Success.Should().BeTrue();
        result.Message.Should().Contain("confirmation instructions have been sent");
        await _mockUserStorage.Received(1).FindByEmailAsync(email, Arg.Any<CancellationToken>());
        await _mockUserStorage.Received(1).GenerateEmailConfirmationTokenAsync(user.Id, Arg.Any<CancellationToken>());
        await _mockEmailService.Received(1).SendEmailConfirmationAsync(email, Arg.Any<string>());
    }

    [Fact]
    public async Task ResendEmailConfirmationAsync_WithAlreadyConfirmedUser_ReturnsSuccessWithoutSendingEmail() {
        const string email = "confirmed@example.com";
        var user = CreateTestUser(email, "Test User");

        _mockUserStorage.FindByEmailAsync(email, Arg.Any<CancellationToken>()).Returns(user);

        var result = await _authService.ResendEmailConfirmationAsync(email);

        result.Success.Should().BeTrue();
        result.Message.Should().Contain("already confirmed");
        await _mockUserStorage.DidNotReceive().GenerateEmailConfirmationTokenAsync(Arg.Any<Guid>(), Arg.Any<CancellationToken>());
        await _mockEmailService.DidNotReceive().SendEmailConfirmationAsync(Arg.Any<string>(), Arg.Any<string>());
    }

    [Fact]
    public async Task ResendEmailConfirmationAsync_WithNonExistentUser_ReturnsSuccessWithoutSendingEmail() {
        const string email = "nonexistent@example.com";

        _mockUserStorage.FindByEmailAsync(email, Arg.Any<CancellationToken>()).Returns((User?)null);

        var result = await _authService.ResendEmailConfirmationAsync(email);

        result.Success.Should().BeTrue();
        result.Message.Should().Contain("confirmation instructions have been sent");
        await _mockUserStorage.DidNotReceive().GenerateEmailConfirmationTokenAsync(Arg.Any<Guid>(), Arg.Any<CancellationToken>());
        await _mockEmailService.DidNotReceive().SendEmailConfirmationAsync(Arg.Any<string>(), Arg.Any<string>());
    }

    [Fact]
    public async Task ResendEmailConfirmationAsync_WhenExceptionThrown_ReturnsInternalServerError() {
        const string email = "error@example.com";

        _mockUserStorage.FindByEmailAsync(email, Arg.Any<CancellationToken>())
            .ThrowsAsync(new InvalidOperationException("Database error"));

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
        var user = CreateTestUser(email, "Test User") with { EmailConfirmed = false };

        _mockUserStorage.FindByEmailAsync(email, Arg.Any<CancellationToken>()).Returns(user);
        _mockUserStorage.ConfirmEmailWithTokenAsync(user.Id, token, Arg.Any<CancellationToken>())
            .Returns(Result.Success());

        var result = await _authService.ConfirmEmailAsync(email, token);

        result.Success.Should().BeTrue();
        result.Message.Should().Be("Email confirmed successfully");
        await _mockUserStorage.Received(1).FindByEmailAsync(email, Arg.Any<CancellationToken>());
        await _mockUserStorage.Received(1).ConfirmEmailWithTokenAsync(user.Id, token, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task ConfirmEmailAsync_WithAlreadyConfirmedEmail_ReturnsSuccessWithoutConfirming() {
        const string email = "confirmed@example.com";
        const string token = "some-token";
        var user = CreateTestUser(email, "Test User");

        _mockUserStorage.FindByEmailAsync(email, Arg.Any<CancellationToken>()).Returns(user);

        var result = await _authService.ConfirmEmailAsync(email, token);

        result.Success.Should().BeTrue();
        result.Message.Should().Contain("already confirmed");
        await _mockUserStorage.DidNotReceive().ConfirmEmailWithTokenAsync(Arg.Any<Guid>(), Arg.Any<string>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task ConfirmEmailAsync_WithInvalidToken_ReturnsFailure() {
        const string email = "user@example.com";
        const string token = "invalid-token";
        var user = CreateTestUser(email, "Test User") with { EmailConfirmed = false };

        _mockUserStorage.FindByEmailAsync(email, Arg.Any<CancellationToken>()).Returns(user);
        _mockUserStorage.ConfirmEmailWithTokenAsync(user.Id, token, Arg.Any<CancellationToken>())
            .Returns(Result.Failure(new Error("Invalid token")));

        var result = await _authService.ConfirmEmailAsync(email, token);

        result.Success.Should().BeFalse();
        result.Message.Should().Contain("expired or is invalid");
    }

    [Fact]
    public async Task ConfirmEmailAsync_WithNonExistentUser_ReturnsFailure() {
        const string email = "nonexistent@example.com";
        const string token = "some-token";

        _mockUserStorage.FindByEmailAsync(email, Arg.Any<CancellationToken>()).Returns((User?)null);

        var result = await _authService.ConfirmEmailAsync(email, token);

        result.Success.Should().BeFalse();
        result.Message.Should().Be("Invalid confirmation link");
        await _mockUserStorage.DidNotReceive().ConfirmEmailWithTokenAsync(Arg.Any<Guid>(), Arg.Any<string>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task ConfirmEmailAsync_WhenExceptionThrown_ReturnsInternalServerError() {
        const string email = "error@example.com";
        const string token = "some-token";

        _mockUserStorage.FindByEmailAsync(email, Arg.Any<CancellationToken>())
            .ThrowsAsync(new InvalidOperationException("Database error"));

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

        _mockUserStorage.ValidateCredentialsAsync(request.Email, request.Password, true, Arg.Any<CancellationToken>())
            .Returns(new SignInResult { Succeeded = false, IsNotAllowed = true });

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

        _mockUserStorage.ValidateCredentialsAsync(request.Email, request.Password, true, Arg.Any<CancellationToken>())
            .Returns(new SignInResult { Succeeded = false, RequiresTwoFactor = true });

        var result = await _authService.LoginAsync(request);

        result.Success.Should().BeFalse();
        result.Message.Should().Be("RequiresTwoFactor");
        result.User.Should().BeNull();
    }

    #endregion

    #region Helper Methods

    private static User CreateTestUser(string email, string name, IReadOnlyList<string>? roles = null)
        => new() {
            Id = Guid.CreateVersion7(),
            Email = email,
            Name = name,
            DisplayName = name,
            EmailConfirmed = true,
            Roles = roles ?? []
        };

    #endregion
}