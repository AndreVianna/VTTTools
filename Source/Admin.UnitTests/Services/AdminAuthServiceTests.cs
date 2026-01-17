namespace VttTools.Admin.Services;

public class AdminAuthServiceTests {
    private readonly IUserStorage _mockUserStorage;
    private readonly ISignInService _mockSignInService;
    private readonly IJwtTokenService _mockJwtTokenService;
    private readonly ILogger<AdminAuthService> _mockLogger;
    private readonly AdminAuthService _sut;

    public AdminAuthServiceTests() {
        _mockUserStorage = Substitute.For<IUserStorage>();
        _mockSignInService = Substitute.For<ISignInService>();
        _mockJwtTokenService = Substitute.For<IJwtTokenService>();
        _mockLogger = Substitute.For<ILogger<AdminAuthService>>();
        _sut = new(_mockUserStorage, _mockSignInService, _mockJwtTokenService, _mockLogger);
    }

    #region LoginAsync Tests

    [Fact]
    public async Task LoginAsync_WithNonExistentUser_ReturnsFailure() {
        var request = new AdminLoginRequest {
            Email = "nonexistent@example.com",
            Password = "Password123!",
            TwoFactorCode = "123456"
        };

        _mockUserStorage.FindByEmailAsync(request.Email, Arg.Any<CancellationToken>())
            .Returns((User?)null);

        var result = await _sut.LoginAsync(request, TestContext.Current.CancellationToken);

        result.Success.Should().BeFalse();
        result.User.Should().BeNull();
        await _mockUserStorage.Received(1).FindByEmailAsync(request.Email, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task LoginAsync_WithUnconfirmedEmail_ReturnsFailure() {
        var user = CreateTestUser("test@example.com", "Test User") with { EmailConfirmed = false };

        var request = new AdminLoginRequest {
            Email = user.Email,
            Password = "Password123!",
            TwoFactorCode = "123456"
        };

        _mockUserStorage.FindByEmailAsync(request.Email, Arg.Any<CancellationToken>())
            .Returns(user);

        var result = await _sut.LoginAsync(request, TestContext.Current.CancellationToken);

        result.Success.Should().BeFalse();
        result.User.Should().BeNull();
        await _mockUserStorage.Received(1).FindByEmailAsync(request.Email, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task LoginAsync_WithLockedAccount_ReturnsFailure() {
        var user = CreateTestUser("test@example.com", "Test User") with {
            LockoutEnabled = true,
            LockoutEnd = DateTimeOffset.UtcNow.AddMinutes(5)
        };

        var request = new AdminLoginRequest {
            Email = user.Email,
            Password = "Password123!",
            TwoFactorCode = "123456"
        };

        _mockUserStorage.FindByEmailAsync(request.Email, Arg.Any<CancellationToken>())
            .Returns(user);

        var result = await _sut.LoginAsync(request, TestContext.Current.CancellationToken);

        result.Success.Should().BeFalse();
        result.User.Should().BeNull();
    }

    [Fact]
    public async Task LoginAsync_WithNonAdminUser_ReturnsFailure() {
        var user = CreateTestUser("test@example.com", "Test User") with {
            Roles = ["User"]
        };

        var request = new AdminLoginRequest {
            Email = user.Email,
            Password = "Password123!",
            TwoFactorCode = "123456"
        };

        _mockUserStorage.FindByEmailAsync(request.Email, Arg.Any<CancellationToken>())
            .Returns(user);

        var result = await _sut.LoginAsync(request, TestContext.Current.CancellationToken);

        result.Success.Should().BeFalse();
        result.User.Should().BeNull();
    }

    [Fact]
    public async Task LoginAsync_WithInvalidPassword_ReturnsFailure() {
        var user = CreateTestUser("test@example.com", "Test User") with {
            Roles = ["Administrator"]
        };

        var request = new AdminLoginRequest {
            Email = user.Email,
            Password = "WrongPassword",
            TwoFactorCode = "123456"
        };

        _mockUserStorage.FindByEmailAsync(request.Email, Arg.Any<CancellationToken>())
            .Returns(user);
        _mockUserStorage.CheckPasswordAsync(user.Id, request.Password, Arg.Any<CancellationToken>())
            .Returns(false);

        var result = await _sut.LoginAsync(request, TestContext.Current.CancellationToken);

        result.Success.Should().BeFalse();
        result.User.Should().BeNull();
        await _mockUserStorage.Received(1).CheckPasswordAsync(user.Id, request.Password, Arg.Any<CancellationToken>());
        await _mockUserStorage.Received(1).RecordAccessFailedAsync(user.Id, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task LoginAsync_WithValidCredentials_ReturnsSuccess() {
        var user = CreateTestUser("test@example.com", "Test User") with {
            Roles = ["Administrator"]
        };

        var request = new AdminLoginRequest {
            Email = user.Email,
            Password = "Password123!"
        };

        _mockUserStorage.FindByEmailAsync(request.Email, Arg.Any<CancellationToken>())
            .Returns(user);
        _mockUserStorage.CheckPasswordAsync(user.Id, request.Password, Arg.Any<CancellationToken>())
            .Returns(true);

        var result = await _sut.LoginAsync(request, TestContext.Current.CancellationToken);

        result.Success.Should().BeTrue();
        result.User.Should().NotBeNull();
        await _mockUserStorage.Received(1).CheckPasswordAsync(user.Id, request.Password, Arg.Any<CancellationToken>());
        await _mockUserStorage.Received(1).ResetAccessFailedCountAsync(user.Id, Arg.Any<CancellationToken>());
        await _mockSignInService.Received(1).SignInAsync(user.Id, false, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task LoginAsync_WithValidCredentialsAndAdmin_ReturnsCorrectUserInfo() {
        var user = CreateTestUser("admin@example.com", "Admin User") with {
            Roles = ["Administrator"]
        };

        var request = new AdminLoginRequest {
            Email = user.Email,
            Password = "Password123!",
            TwoFactorCode = "123456"
        };

        _mockUserStorage.FindByEmailAsync(request.Email, Arg.Any<CancellationToken>())
            .Returns(user);
        _mockUserStorage.CheckPasswordAsync(user.Id, request.Password, Arg.Any<CancellationToken>())
            .Returns(true);

        var result = await _sut.LoginAsync(request, TestContext.Current.CancellationToken);

        result.Success.Should().BeTrue();
        result.User.Should().NotBeNull();
        result.User!.Id.Should().Be(user.Id);
        result.User.Email.Should().Be(user.Email);
        result.User.Name.Should().Be(user.Name);
        result.User.DisplayName.Should().Be(user.DisplayName);

        await _mockUserStorage.Received(1).ResetAccessFailedCountAsync(user.Id, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task LoginAsync_WhenExceptionThrown_ReturnsFailure() {
        var request = new AdminLoginRequest {
            Email = "test@example.com",
            Password = "Password123!",
            TwoFactorCode = "123456"
        };

        _mockUserStorage.FindByEmailAsync(request.Email, Arg.Any<CancellationToken>())
            .ThrowsAsync(new InvalidOperationException("Database error"));

        var result = await _sut.LoginAsync(request, TestContext.Current.CancellationToken);

        result.Success.Should().BeFalse();
        result.User.Should().BeNull();
    }

    #endregion

    #region LogoutAsync Tests

    [Fact]
    public async Task LogoutAsync_CallsSignOut_ReturnsSuccess() {
        var result = await _sut.LogoutAsync(TestContext.Current.CancellationToken);

        result.Success.Should().BeTrue();
        await _mockSignInService.Received(1).SignOutAsync(Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task LogoutAsync_WhenExceptionThrown_ReturnsFailure() {
        _mockSignInService.SignOutAsync(Arg.Any<CancellationToken>())
            .ThrowsAsync(new InvalidOperationException("Sign out error"));

        var result = await _sut.LogoutAsync(TestContext.Current.CancellationToken);

        result.Success.Should().BeFalse();
    }

    #endregion

    #region GetCurrentUserAsync Tests

    [Fact]
    public async Task GetCurrentUserAsync_WithValidAdminUser_ReturnsUserInfo() {
        var user = CreateTestUser("admin@example.com", "Admin User") with {
            Roles = ["Administrator"]
        };

        _mockUserStorage.FindByIdAsync(user.Id, Arg.Any<CancellationToken>())
            .Returns(user);

        var result = await _sut.GetCurrentUserAsync(user.Id, TestContext.Current.CancellationToken);

        result.Should().NotBeNull();
        result!.Id.Should().Be(user.Id);
        result.Email.Should().Be(user.Email);
        result.Name.Should().Be(user.Name);
        result.DisplayName.Should().Be(user.DisplayName);

        await _mockUserStorage.Received(1).FindByIdAsync(user.Id, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task GetCurrentUserAsync_WithNonExistentUser_ReturnsNull() {
        var userId = Guid.CreateVersion7();

        _mockUserStorage.FindByIdAsync(userId, Arg.Any<CancellationToken>())
            .Returns((User?)null);

        var result = await _sut.GetCurrentUserAsync(userId, TestContext.Current.CancellationToken);

        result.Should().BeNull();
        await _mockUserStorage.Received(1).FindByIdAsync(userId, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task GetCurrentUserAsync_WithNonAdminUser_ReturnsNull() {
        var user = CreateTestUser("user@example.com", "Regular User") with {
            Roles = ["User"]
        };

        _mockUserStorage.FindByIdAsync(user.Id, Arg.Any<CancellationToken>())
            .Returns(user);

        var result = await _sut.GetCurrentUserAsync(user.Id, TestContext.Current.CancellationToken);

        result.Should().BeNull();
    }

    [Fact]
    public async Task GetCurrentUserAsync_WhenExceptionThrown_ReturnsNull() {
        var userId = Guid.CreateVersion7();

        _mockUserStorage.FindByIdAsync(userId, Arg.Any<CancellationToken>())
            .ThrowsAsync(new InvalidOperationException("Database error"));

        var result = await _sut.GetCurrentUserAsync(userId, TestContext.Current.CancellationToken);

        result.Should().BeNull();
    }

    #endregion

    #region GetSessionStatusAsync Tests

    [Fact]
    public async Task GetSessionStatusAsync_ReturnsValidSession() {
        var result = await _sut.GetSessionStatusAsync(TestContext.Current.CancellationToken);

        result.IsValid.Should().BeTrue();
        result.ExpiresAt.Should().NotBeNull();
        result.ExpiresAt.Should().BeAfter(DateTime.UtcNow);
    }

    #endregion

    #region Helper Methods

    private static User CreateTestUser(string email, string name)
        => new() {
            Id = Guid.CreateVersion7(),
            Email = email,
            Name = name,
            DisplayName = name,
            EmailConfirmed = true,
            TwoFactorEnabled = false,
            LockoutEnabled = false,
            Roles = []
        };

    #endregion
}
