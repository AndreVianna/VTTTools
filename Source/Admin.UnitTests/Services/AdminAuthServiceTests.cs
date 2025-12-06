namespace VttTools.Admin.UnitTests.Services;

public class AdminAuthServiceTests {
    private readonly UserManager<User> _mockUserManager;
    private readonly SignInManager<User> _mockSignInManager;
    private readonly IJwtTokenService _mockJwtTokenService;
    private readonly ILogger<AdminAuthService> _mockLogger;
    private readonly AdminAuthService _sut;

    public AdminAuthServiceTests() {
        _mockUserManager = CreateUserManagerMock();
        _mockSignInManager = CreateSignInManagerMock(_mockUserManager);
        _mockJwtTokenService = Substitute.For<IJwtTokenService>();
        _mockLogger = Substitute.For<ILogger<AdminAuthService>>();
        _sut = new AdminAuthService(_mockUserManager, _mockSignInManager, _mockJwtTokenService, _mockLogger);
    }

    #region LoginAsync Tests

    [Fact]
    public async Task LoginAsync_WithNonExistentUser_ReturnsFailure() {
        var request = new AdminLoginRequest {
            Email = "nonexistent@example.com",
            Password = "Password123!",
            TwoFactorCode = "123456"
        };

        _mockUserManager.FindByEmailAsync(request.Email).Returns((User?)null);

        var result = await _sut.LoginAsync(request, TestContext.Current.CancellationToken);

        Assert.False(result.Success);
        Assert.Null(result.User);
        await _mockUserManager.Received(1).FindByEmailAsync(request.Email);
    }

    [Fact]
    public async Task LoginAsync_WithUnconfirmedEmail_ReturnsFailure() {
        var user = CreateTestUser("test@example.com", "Test User");
        user.EmailConfirmed = false;

        var request = new AdminLoginRequest {
            Email = user.Email,
            Password = "Password123!",
            TwoFactorCode = "123456"
        };

        _mockUserManager.FindByEmailAsync(request.Email).Returns(user);

        var result = await _sut.LoginAsync(request, TestContext.Current.CancellationToken);

        Assert.False(result.Success);
        Assert.Null(result.User);
        await _mockUserManager.Received(1).FindByEmailAsync(request.Email);
    }

    [Fact]
    public async Task LoginAsync_WithLockedAccount_ReturnsFailure() {
        var user = CreateTestUser("test@example.com", "Test User");
        user.LockoutEnd = DateTimeOffset.UtcNow.AddMinutes(5);

        var request = new AdminLoginRequest {
            Email = user.Email,
            Password = "Password123!",
            TwoFactorCode = "123456"
        };

        _mockUserManager.FindByEmailAsync(request.Email).Returns(user);
        _mockUserManager.IsLockedOutAsync(user).Returns(true);

        var result = await _sut.LoginAsync(request, TestContext.Current.CancellationToken);

        Assert.False(result.Success);
        Assert.Null(result.User);
        await _mockUserManager.Received(1).IsLockedOutAsync(user);
    }

    [Fact]
    public async Task LoginAsync_WithNonAdminUser_ReturnsFailure() {
        var user = CreateTestUser("test@example.com", "Test User");

        var request = new AdminLoginRequest {
            Email = user.Email,
            Password = "Password123!",
            TwoFactorCode = "123456"
        };

        _mockUserManager.FindByEmailAsync(request.Email).Returns(user);
        _mockUserManager.IsLockedOutAsync(user).Returns(false);
        _mockUserManager.GetRolesAsync(user).Returns(["User"]);

        var result = await _sut.LoginAsync(request, TestContext.Current.CancellationToken);

        Assert.False(result.Success);
        Assert.Null(result.User);
        await _mockUserManager.Received(1).GetRolesAsync(user);
    }

    [Fact]
    public async Task LoginAsync_WithTwoFactorDisabled_ReturnsFailure() {
        var user = CreateTestUser("test@example.com", "Test User");
        user.TwoFactorEnabled = false;

        var request = new AdminLoginRequest {
            Email = user.Email,
            Password = "Password123!",
            TwoFactorCode = "123456"
        };

        _mockUserManager.FindByEmailAsync(request.Email).Returns(user);
        _mockUserManager.IsLockedOutAsync(user).Returns(false);
        _mockUserManager.GetRolesAsync(user).Returns(["Administrator"]);

        var result = await _sut.LoginAsync(request, TestContext.Current.CancellationToken);

        Assert.False(result.Success);
        Assert.Null(result.User);
    }

    [Fact]
    public async Task LoginAsync_WithInvalidPassword_ReturnsFailure() {
        var user = CreateTestUser("test@example.com", "Test User");
        user.TwoFactorEnabled = true;

        var request = new AdminLoginRequest {
            Email = user.Email,
            Password = "WrongPassword",
            TwoFactorCode = "123456"
        };

        _mockUserManager.FindByEmailAsync(request.Email).Returns(user);
        _mockUserManager.IsLockedOutAsync(user).Returns(false);
        _mockUserManager.GetRolesAsync(user).Returns(["Administrator"]);
        _mockUserManager.CheckPasswordAsync(user, request.Password).Returns(false);

        var result = await _sut.LoginAsync(request, TestContext.Current.CancellationToken);

        Assert.False(result.Success);
        Assert.Null(result.User);
        await _mockUserManager.Received(1).CheckPasswordAsync(user, request.Password);
        await _mockUserManager.Received(1).AccessFailedAsync(user);
    }

    [Fact]
    public async Task LoginAsync_WithoutTwoFactorCode_SucceedsWhenTwoFactorDisabled() {
        var user = CreateTestUser("test@example.com", "Test User");
        user.TwoFactorEnabled = true;

        var request = new AdminLoginRequest {
            Email = user.Email,
            Password = "Password123!"
        };

        _mockUserManager.FindByEmailAsync(request.Email).Returns(user);
        _mockUserManager.IsLockedOutAsync(user).Returns(false);
        _mockUserManager.GetRolesAsync(user).Returns(["Administrator"]);
        _mockUserManager.CheckPasswordAsync(user, request.Password).Returns(true);

        var result = await _sut.LoginAsync(request, TestContext.Current.CancellationToken);

        Assert.True(result.Success);
        Assert.False(result.RequiresTwoFactor);
        Assert.NotNull(result.User);
        await _mockUserManager.Received(1).CheckPasswordAsync(user, request.Password);
        await _mockUserManager.Received(1).ResetAccessFailedCountAsync(user);
    }

    [Fact]
    public async Task LoginAsync_WithInvalidTwoFactorCode_SucceedsWhenTwoFactorDisabled() {
        var user = CreateTestUser("test@example.com", "Test User");
        user.TwoFactorEnabled = true;

        var request = new AdminLoginRequest {
            Email = user.Email,
            Password = "Password123!",
            TwoFactorCode = "000000"
        };

        _mockUserManager.FindByEmailAsync(request.Email).Returns(user);
        _mockUserManager.IsLockedOutAsync(user).Returns(false);
        _mockUserManager.GetRolesAsync(user).Returns(["Administrator"]);
        _mockUserManager.CheckPasswordAsync(user, request.Password).Returns(true);

        var signInResult = SignInResult.Failed;
        _mockSignInManager.TwoFactorAuthenticatorSignInAsync(
            request.TwoFactorCode,
            false,
            false)
            .Returns(signInResult);

        var result = await _sut.LoginAsync(request, TestContext.Current.CancellationToken);

        Assert.True(result.Success);
        Assert.NotNull(result.User);
        await _mockUserManager.Received(1).CheckPasswordAsync(user, request.Password);
        await _mockUserManager.Received(1).ResetAccessFailedCountAsync(user);
    }

    [Fact]
    public async Task LoginAsync_WithValidCredentialsAndTwoFactor_ReturnsSuccess() {
        var user = CreateTestUser("admin@example.com", "Admin User");
        user.TwoFactorEnabled = true;

        var request = new AdminLoginRequest {
            Email = user.Email,
            Password = "Password123!",
            TwoFactorCode = "123456"
        };

        _mockUserManager.FindByEmailAsync(request.Email).Returns(user);
        _mockUserManager.IsLockedOutAsync(user).Returns(false);
        _mockUserManager.GetRolesAsync(user).Returns(["Administrator"]);
        _mockUserManager.CheckPasswordAsync(user, request.Password).Returns(true);

        var signInResult = SignInResult.Success;
        _mockSignInManager.TwoFactorAuthenticatorSignInAsync(
            request.TwoFactorCode,
            false,
            false)
            .Returns(signInResult);

        var result = await _sut.LoginAsync(request, TestContext.Current.CancellationToken);

        Assert.True(result.Success);
        Assert.NotNull(result.User);
        Assert.Equal(user.Id, result.User.Id);
        Assert.Equal(user.Email, result.User.Email);
        Assert.Equal(user.Name, result.User.Name);
        Assert.Equal(user.DisplayName, result.User.DisplayName);

        await _mockUserManager.Received(1).ResetAccessFailedCountAsync(user);
    }

    [Fact]
    public async Task LoginAsync_WhenExceptionThrown_ReturnsFailure() {
        var request = new AdminLoginRequest {
            Email = "test@example.com",
            Password = "Password123!",
            TwoFactorCode = "123456"
        };

        _mockUserManager.FindByEmailAsync(request.Email)
            .ThrowsAsync(new InvalidOperationException("Database error"));

        var result = await _sut.LoginAsync(request, TestContext.Current.CancellationToken);

        Assert.False(result.Success);
        Assert.Null(result.User);
    }

    #endregion

    #region LogoutAsync Tests

    [Fact]
    public async Task LogoutAsync_CallsSignOut_ReturnsSuccess() {
        var result = await _sut.LogoutAsync(TestContext.Current.CancellationToken);

        Assert.True(result.Success);
        await _mockSignInManager.Received(1).SignOutAsync();
    }

    [Fact]
    public async Task LogoutAsync_WhenExceptionThrown_ReturnsFailure() {
        _mockSignInManager.SignOutAsync()
            .ThrowsAsync(new InvalidOperationException("Sign out error"));

        var result = await _sut.LogoutAsync(TestContext.Current.CancellationToken);

        Assert.False(result.Success);
    }

    #endregion

    #region GetCurrentUserAsync Tests

    [Fact]
    public async Task GetCurrentUserAsync_WithValidAdminUser_ReturnsUserInfo() {
        var user = CreateTestUser("admin@example.com", "Admin User");

        _mockUserManager.FindByIdAsync(user.Id.ToString()).Returns(user);
        _mockUserManager.GetRolesAsync(user).Returns(["Administrator"]);

        var result = await _sut.GetCurrentUserAsync(user.Id, TestContext.Current.CancellationToken);

        Assert.NotNull(result);
        Assert.Equal(user.Id, result.Id);
        Assert.Equal(user.Email, result.Email);
        Assert.Equal(user.Name, result.Name);
        Assert.Equal(user.DisplayName, result.DisplayName);

        await _mockUserManager.Received(1).FindByIdAsync(user.Id.ToString());
        await _mockUserManager.Received(1).GetRolesAsync(user);
    }

    [Fact]
    public async Task GetCurrentUserAsync_WithNonExistentUser_ReturnsNull() {
        var userId = Guid.CreateVersion7();

        _mockUserManager.FindByIdAsync(userId.ToString()).Returns((User?)null);

        var result = await _sut.GetCurrentUserAsync(userId, TestContext.Current.CancellationToken);

        Assert.Null(result);
        await _mockUserManager.Received(1).FindByIdAsync(userId.ToString());
    }

    [Fact]
    public async Task GetCurrentUserAsync_WithNonAdminUser_ReturnsNull() {
        var user = CreateTestUser("user@example.com", "Regular User");

        _mockUserManager.FindByIdAsync(user.Id.ToString()).Returns(user);
        _mockUserManager.GetRolesAsync(user).Returns(["User"]);

        var result = await _sut.GetCurrentUserAsync(user.Id, TestContext.Current.CancellationToken);

        Assert.Null(result);
        await _mockUserManager.Received(1).GetRolesAsync(user);
    }

    [Fact]
    public async Task GetCurrentUserAsync_WhenExceptionThrown_ReturnsNull() {
        var userId = Guid.CreateVersion7();

        _mockUserManager.FindByIdAsync(userId.ToString())
            .ThrowsAsync(new InvalidOperationException("Database error"));

        var result = await _sut.GetCurrentUserAsync(userId, TestContext.Current.CancellationToken);

        Assert.Null(result);
    }

    #endregion

    #region GetSessionStatusAsync Tests

    [Fact]
    public async Task GetSessionStatusAsync_ReturnsValidSession() {
        var result = await _sut.GetSessionStatusAsync(TestContext.Current.CancellationToken);

        Assert.True(result.IsValid);
        Assert.NotNull(result.ExpiresAt);
        Assert.True(result.ExpiresAt > DateTime.UtcNow);
    }

    #endregion

    #region Helper Methods

    private static UserManager<User> CreateUserManagerMock() {
        var userStore = Substitute.For<IUserStore<User>>();
        return Substitute.For<UserManager<User>>(
            userStore, null, null, null, null, null, null, null, null);
    }

    private static SignInManager<User> CreateSignInManagerMock(UserManager<User> userManager) {
        var contextAccessor = Substitute.For<Microsoft.AspNetCore.Http.IHttpContextAccessor>();
        var claimsFactory = Substitute.For<IUserClaimsPrincipalFactory<User>>();
        var options = Substitute.For<Microsoft.Extensions.Options.IOptions<IdentityOptions>>();
        var logger = Substitute.For<ILogger<SignInManager<User>>>();
        var schemes = Substitute.For<Microsoft.AspNetCore.Authentication.IAuthenticationSchemeProvider>();
        var confirmation = Substitute.For<IUserConfirmation<User>>();

        return Substitute.For<SignInManager<User>>(
            userManager,
            contextAccessor,
            claimsFactory,
            options,
            logger,
            schemes,
            confirmation);
    }

    private static User CreateTestUser(string email, string name)
        => new() {
            Id = Guid.CreateVersion7(),
            UserName = email,
            Email = email,
            Name = name,
            DisplayName = name,
            EmailConfirmed = true,
            PasswordHash = "default_hashed_password",
            TwoFactorEnabled = false
        };

    #endregion
}