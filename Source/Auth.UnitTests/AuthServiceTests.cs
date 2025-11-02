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
        var expectedToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test.token";

        _mockUserManager.FindByEmailAsync(request.Email).Returns(user);
        _mockSignInManager.PasswordSignInAsync(user, request.Password, request.RememberMe, true)
            .Returns(Microsoft.AspNetCore.Identity.SignInResult.Success);
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
            .Returns(Microsoft.AspNetCore.Identity.SignInResult.Failed);

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
            .Returns(Microsoft.AspNetCore.Identity.SignInResult.LockedOut);

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
            .Returns(Microsoft.AspNetCore.Identity.SignInResult.Success);
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
        var expectedToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test.token";

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
            Name = "No Resource User",
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