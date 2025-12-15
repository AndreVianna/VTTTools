using VttTools.Admin.Auth.Model;

namespace VttTools.Admin.UnitTests.Handlers;

public sealed class AdminAuthHandlersTests {
    private readonly IAdminAuthService _mockAuthService;

    public AdminAuthHandlersTests() {
        _mockAuthService = Substitute.For<IAdminAuthService>();
    }

    #region LoginHandler Tests

    [Fact]
    public async Task LoginHandler_WithSuccessfulLogin_ReturnsOk() {
        var request = new AdminLoginRequest { Email = "admin@example.com", Password = "password" };
        var response = new AdminLoginResponse { Success = true };

        _mockAuthService.LoginAsync(request, Arg.Any<CancellationToken>()).Returns(response);

        var result = await AdminAuthHandlers.LoginHandler(request, _mockAuthService, TestContext.Current.CancellationToken);

        result.Should().BeOfType<Ok<AdminLoginResponse>>();
        var okResult = (Ok<AdminLoginResponse>)result;
        okResult.Value.Should().Be(response);
    }

    [Fact]
    public async Task LoginHandler_WithTwoFactorRequired_ReturnsOk() {
        var request = new AdminLoginRequest { Email = "admin@example.com", Password = "password" };
        var response = new AdminLoginResponse { Success = false, RequiresTwoFactor = true };

        _mockAuthService.LoginAsync(request, Arg.Any<CancellationToken>()).Returns(response);

        var result = await AdminAuthHandlers.LoginHandler(request, _mockAuthService, TestContext.Current.CancellationToken);

        result.Should().BeOfType<Ok<AdminLoginResponse>>();
    }

    [Fact]
    public async Task LoginHandler_WithFailedLogin_ReturnsUnauthorized() {
        var request = new AdminLoginRequest { Email = "admin@example.com", Password = "wrong" };
        var response = new AdminLoginResponse { Success = false, RequiresTwoFactor = false };

        _mockAuthService.LoginAsync(request, Arg.Any<CancellationToken>()).Returns(response);

        var result = await AdminAuthHandlers.LoginHandler(request, _mockAuthService, TestContext.Current.CancellationToken);

        result.Should().BeOfType<UnauthorizedHttpResult>();
    }

    #endregion

    #region LogoutHandler Tests

    [Fact]
    public async Task LogoutHandler_WithSuccessfulLogout_ReturnsOk() {
        var response = new AdminLoginResponse { Success = true };

        _mockAuthService.LogoutAsync(Arg.Any<CancellationToken>()).Returns(response);

        var result = await AdminAuthHandlers.LogoutHandler(_mockAuthService, TestContext.Current.CancellationToken);

        result.Should().BeOfType<Ok<AdminLoginResponse>>();
    }

    [Fact]
    public async Task LogoutHandler_WithFailedLogout_ReturnsBadRequest() {
        var response = new AdminLoginResponse { Success = false };

        _mockAuthService.LogoutAsync(Arg.Any<CancellationToken>()).Returns(response);

        var result = await AdminAuthHandlers.LogoutHandler(_mockAuthService, TestContext.Current.CancellationToken);

        result.Should().BeAssignableTo<IResult>();
        result.Should().BeAssignableTo<IStatusCodeHttpResult>();
        var statusResult = (IStatusCodeHttpResult)result;
        statusResult.StatusCode.Should().Be(400);
    }

    #endregion

    #region GetCurrentUserHandler Tests

    [Fact]
    public async Task GetCurrentUserHandler_WithValidUser_ReturnsOk() {
        var userId = Guid.CreateVersion7();
        var claims = new List<Claim> {
            new(ClaimTypes.NameIdentifier, userId.ToString())
        };
        var identity = new ClaimsIdentity(claims);
        var user = new ClaimsPrincipal(identity);

        var adminUser = new AdminUserInfo {
            Id = userId,
            Email = "admin@example.com",
            DisplayName = "Admin User"
        };

        _mockAuthService.GetCurrentUserAsync(userId, Arg.Any<CancellationToken>()).Returns(adminUser);

        var result = await AdminAuthHandlers.GetCurrentUserHandler(user, _mockAuthService, TestContext.Current.CancellationToken);

        result.Should().BeOfType<Ok<AdminUserInfo>>();
        var okResult = (Ok<AdminUserInfo>)result;
        okResult.Value.Should().Be(adminUser);
    }

    [Fact]
    public async Task GetCurrentUserHandler_WithMissingUserIdClaim_ReturnsUnauthorized() {
        var claims = new List<Claim>();
        var identity = new ClaimsIdentity(claims);
        var user = new ClaimsPrincipal(identity);

        var result = await AdminAuthHandlers.GetCurrentUserHandler(user, _mockAuthService, TestContext.Current.CancellationToken);

        result.Should().BeOfType<UnauthorizedHttpResult>();
    }

    [Fact]
    public async Task GetCurrentUserHandler_WithInvalidUserIdClaim_ReturnsUnauthorized() {
        var claims = new List<Claim> {
            new(ClaimTypes.NameIdentifier, "invalid-guid")
        };
        var identity = new ClaimsIdentity(claims);
        var user = new ClaimsPrincipal(identity);

        var result = await AdminAuthHandlers.GetCurrentUserHandler(user, _mockAuthService, TestContext.Current.CancellationToken);

        result.Should().BeOfType<UnauthorizedHttpResult>();
    }

    [Fact]
    public async Task GetCurrentUserHandler_WithNonExistentUser_ReturnsUnauthorized() {
        var userId = Guid.CreateVersion7();
        var claims = new List<Claim> {
            new(ClaimTypes.NameIdentifier, userId.ToString())
        };
        var identity = new ClaimsIdentity(claims);
        var user = new ClaimsPrincipal(identity);

        _mockAuthService.GetCurrentUserAsync(userId, Arg.Any<CancellationToken>()).Returns((AdminUserInfo?)null);

        var result = await AdminAuthHandlers.GetCurrentUserHandler(user, _mockAuthService, TestContext.Current.CancellationToken);

        result.Should().BeOfType<UnauthorizedHttpResult>();
    }

    #endregion

    #region GetSessionStatusHandler Tests

    [Fact]
    public async Task GetSessionStatusHandler_ReturnsOk() {
        var response = new AdminSessionResponse { IsValid = true };

        _mockAuthService.GetSessionStatusAsync(Arg.Any<CancellationToken>()).Returns(response);

        var result = await AdminAuthHandlers.GetSessionStatusHandler(_mockAuthService, TestContext.Current.CancellationToken);

        result.Should().BeOfType<Ok<AdminSessionResponse>>();
        var okResult = (Ok<AdminSessionResponse>)result;
        okResult.Value.Should().Be(response);
    }

    #endregion
}
