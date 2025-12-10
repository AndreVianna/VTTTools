namespace VttTools.Auth.UnitTests.Handlers;

public class SecurityHandlersTests {
    private readonly ISecurityService _mockSecurityService;
    private readonly HttpContext _mockHttpContext;

    public SecurityHandlersTests() {
        _mockSecurityService = Substitute.For<ISecurityService>();
        _mockHttpContext = Substitute.For<HttpContext>();
    }

    private void SetupAuthenticatedUser(Guid userId) {
        var claims = new List<Claim> {
            new(ClaimTypes.NameIdentifier, userId.ToString())
        };
        var identity = new ClaimsIdentity(claims, "Test");
        var claimsPrincipal = new ClaimsPrincipal(identity);
        _mockHttpContext.User.Returns(claimsPrincipal);
    }

    private void SetupUnauthenticatedUser() {
        var identity = new ClaimsIdentity();
        var claimsPrincipal = new ClaimsPrincipal(identity);
        _mockHttpContext.User.Returns(claimsPrincipal);
    }

    #region GetSecuritySettingsHandler Tests

    [Fact]
    public async Task GetSecuritySettingsHandler_WithAuthenticatedUser_ReturnsOkResult() {
        var userId = Guid.CreateVersion7();
        SetupAuthenticatedUser(userId);

        var expectedSettings = new SecuritySettingsResponse {
            Success = true,
            TwoFactorEnabled = true,
            RecoveryCodesRemaining = 5,
        };

        _mockSecurityService.GetSecuritySettingsAsync(userId, Arg.Any<CancellationToken>())
            .Returns(expectedSettings);

        var result = await SecurityHandlers.GetSecuritySettingsHandler(_mockHttpContext, _mockSecurityService, TestContext.Current.CancellationToken);

        result.Should().BeOfType<Ok<SecuritySettingsResponse>>();
        var okResult = (Ok<SecuritySettingsResponse>)result;
        okResult.Value.Should().BeEquivalentTo(expectedSettings);
        okResult.Value!.TwoFactorEnabled.Should().BeTrue();
        okResult.Value.RecoveryCodesRemaining.Should().Be(5);
        await _mockSecurityService.Received(1).GetSecuritySettingsAsync(userId, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task GetSecuritySettingsHandler_WithUnauthenticatedUser_ReturnsUnauthorized() {
        SetupUnauthenticatedUser();

        var result = await SecurityHandlers.GetSecuritySettingsHandler(_mockHttpContext, _mockSecurityService, TestContext.Current.CancellationToken);

        result.Should().BeOfType<UnauthorizedHttpResult>();
        await _mockSecurityService.DidNotReceive().GetSecuritySettingsAsync(
            Arg.Any<Guid>(),
            Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task GetSecuritySettingsHandler_WhenServiceFails_ReturnsValidationProblem() {
        var userId = Guid.CreateVersion7();
        SetupAuthenticatedUser(userId);

        var failureResponse = new SecuritySettingsResponse {
            Success = false,
            Message = "Failed to retrieve security settings"
        };

        _mockSecurityService.GetSecuritySettingsAsync(userId, Arg.Any<CancellationToken>())
            .Returns(failureResponse);

        var result = await SecurityHandlers.GetSecuritySettingsHandler(_mockHttpContext, _mockSecurityService, TestContext.Current.CancellationToken);

        result.Should().BeOfType<ProblemHttpResult>();
    }

    [Fact]
    public async Task GetSecuritySettingsHandler_WithTwoFactorDisabled_ReturnsCorrectStatus() {
        var userId = Guid.CreateVersion7();
        SetupAuthenticatedUser(userId);

        var expectedSettings = new SecuritySettingsResponse {
            Success = true,
            TwoFactorEnabled = false,
            RecoveryCodesRemaining = 0,
        };

        _mockSecurityService.GetSecuritySettingsAsync(userId, Arg.Any<CancellationToken>())
            .Returns(expectedSettings);

        var result = await SecurityHandlers.GetSecuritySettingsHandler(_mockHttpContext, _mockSecurityService, TestContext.Current.CancellationToken);

        result.Should().BeOfType<Ok<SecuritySettingsResponse>>();
        var okResult = (Ok<SecuritySettingsResponse>)result;
        okResult.Value!.TwoFactorEnabled.Should().BeFalse();
        okResult.Value.RecoveryCodesRemaining.Should().Be(0);
    }

    #endregion
}
