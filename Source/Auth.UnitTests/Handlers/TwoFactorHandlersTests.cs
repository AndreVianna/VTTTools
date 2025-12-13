namespace VttTools.Auth.UnitTests.Handlers;

public class TwoFactorHandlersTests {
    private readonly ITwoFactorService _mockTwoFactorService;
    private readonly HttpContext _mockHttpContext;

    public TwoFactorHandlersTests() {
        _mockTwoFactorService = Substitute.For<ITwoFactorService>();
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

    #region InitiateSetupHandler Tests

    [Fact]
    public async Task InitiateSetupHandler_WithAuthenticatedUser_ReturnsOkResult() {
        var userId = Guid.CreateVersion7();
        SetupAuthenticatedUser(userId);

        var expectedResponse = new TwoFactorSetupResponse {
            Success = true,
            SharedKey = "ABCD1234EFGH5678",
            AuthenticatorUri = "otpauth://totp/VTTTools:user@example.com?secret=ABCD1234EFGH5678&issuer=VTTTools"
        };

        _mockTwoFactorService.InitiateSetupAsync(userId, Arg.Any<CancellationToken>())
            .Returns(expectedResponse);

        var result = await TwoFactorHandlers.InitiateSetupHandler(_mockHttpContext, _mockTwoFactorService, TestContext.Current.CancellationToken);

        result.Should().BeOfType<Ok<TwoFactorSetupResponse>>();
        var okResult = (Ok<TwoFactorSetupResponse>)result;
        okResult.Value.Should().BeEquivalentTo(expectedResponse);
        okResult.Value!.SharedKey.Should().NotBeNullOrEmpty();
        okResult.Value.AuthenticatorUri.Should().StartWith("otpauth://");
        await _mockTwoFactorService.Received(1).InitiateSetupAsync(userId, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task InitiateSetupHandler_WithUnauthenticatedUser_ReturnsUnauthorized() {
        SetupUnauthenticatedUser();

        var act = async () => await TwoFactorHandlers.InitiateSetupHandler(_mockHttpContext, _mockTwoFactorService, TestContext.Current.CancellationToken);

        await act.Should().ThrowAsync<UnauthorizedAccessException>()

            .WithMessage("User ID claim is missing or invalid.");
        await _mockTwoFactorService.DidNotReceive().InitiateSetupAsync(
            Arg.Any<Guid>(),
            Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task InitiateSetupHandler_WhenServiceFails_ReturnsValidationProblem() {
        var userId = Guid.CreateVersion7();
        SetupAuthenticatedUser(userId);

        var failureResponse = new TwoFactorSetupResponse {
            Success = false,
            Message = "Two-factor is already enabled"
        };

        _mockTwoFactorService.InitiateSetupAsync(userId, Arg.Any<CancellationToken>())
            .Returns(failureResponse);

        var result = await TwoFactorHandlers.InitiateSetupHandler(_mockHttpContext, _mockTwoFactorService, TestContext.Current.CancellationToken);

        result.Should().BeOfType<ProblemHttpResult>();
    }

    #endregion

    #region VerifySetupHandler Tests

    [Fact]
    public async Task VerifySetupHandler_WithValidCode_ReturnsOkResult() {
        var userId = Guid.CreateVersion7();
        SetupAuthenticatedUser(userId);

        var request = new VerifySetupRequest {
            Code = "123456"
        };

        var successResponse = new TwoFactorVerifyResponse {
            Success = true,
            RecoveryCodes = ["ABC123", "DEF456", "GHI789"]
        };

        _mockTwoFactorService.VerifySetupAsync(userId, request, Arg.Any<CancellationToken>())
            .Returns(successResponse);

        var result = await TwoFactorHandlers.VerifySetupHandler(_mockHttpContext, request, _mockTwoFactorService, TestContext.Current.CancellationToken);

        result.Should().BeOfType<Ok<TwoFactorVerifyResponse>>();
        var okResult = (Ok<TwoFactorVerifyResponse>)result;
        okResult.Value.Should().BeEquivalentTo(successResponse);
        okResult.Value!.RecoveryCodes.Should().HaveCount(3);
        await _mockTwoFactorService.Received(1).VerifySetupAsync(
            userId,
            request,
            Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task VerifySetupHandler_WithInvalidCode_ReturnsValidationProblem() {
        var userId = Guid.CreateVersion7();
        SetupAuthenticatedUser(userId);

        var request = new VerifySetupRequest {
            Code = "999999"
        };

        var failureResponse = new TwoFactorVerifyResponse {
            Success = false,
            Message = "Invalid verification code"
        };

        _mockTwoFactorService.VerifySetupAsync(userId, request, Arg.Any<CancellationToken>())
            .Returns(failureResponse);

        var result = await TwoFactorHandlers.VerifySetupHandler(_mockHttpContext, request, _mockTwoFactorService, TestContext.Current.CancellationToken);

        result.Should().BeOfType<ProblemHttpResult>();
    }

    [Fact]
    public async Task VerifySetupHandler_WithUnauthenticatedUser_ReturnsUnauthorized() {
        SetupUnauthenticatedUser();

        var request = new VerifySetupRequest {
            Code = "123456"
        };

        var act = async () => await TwoFactorHandlers.VerifySetupHandler(_mockHttpContext, request, _mockTwoFactorService, TestContext.Current.CancellationToken);

        await act.Should().ThrowAsync<UnauthorizedAccessException>()

            .WithMessage("User ID claim is missing or invalid.");
        await _mockTwoFactorService.DidNotReceive().VerifySetupAsync(
            Arg.Any<Guid>(),
            Arg.Any<VerifySetupRequest>(),
            Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task VerifySetupHandler_WithEmptyCode_ReturnsValidationProblem() {
        var userId = Guid.CreateVersion7();
        SetupAuthenticatedUser(userId);

        var request = new VerifySetupRequest {
            Code = ""
        };

        var failureResponse = new TwoFactorVerifyResponse {
            Success = false,
            Message = "Verification code is required"
        };

        _mockTwoFactorService.VerifySetupAsync(userId, request, Arg.Any<CancellationToken>())
            .Returns(failureResponse);

        var result = await TwoFactorHandlers.VerifySetupHandler(_mockHttpContext, request, _mockTwoFactorService, TestContext.Current.CancellationToken);

        result.Should().BeOfType<ProblemHttpResult>();
    }

    #endregion

    #region DisableTwoFactorHandler Tests

    [Fact]
    public async Task DisableTwoFactorHandler_WithValidPassword_ReturnsOkResult() {
        var userId = Guid.CreateVersion7();
        SetupAuthenticatedUser(userId);

        var request = new DisableTwoFactorRequest {
            Password = "ValidPassword123!"
        };

        var successResponse = new TwoFactorDisableResponse {
            Success = true,
            Message = "Two-factor authentication disabled successfully"
        };

        _mockTwoFactorService.DisableTwoFactorAsync(userId, request, Arg.Any<CancellationToken>())
            .Returns(successResponse);

        var result = await TwoFactorHandlers.DisableTwoFactorHandler(_mockHttpContext, request, _mockTwoFactorService, TestContext.Current.CancellationToken);

        result.Should().BeOfType<Ok<TwoFactorDisableResponse>>();
        var okResult = (Ok<TwoFactorDisableResponse>)result;
        okResult.Value.Should().BeEquivalentTo(successResponse);
        await _mockTwoFactorService.Received(1).DisableTwoFactorAsync(
            userId,
            request,
            Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task DisableTwoFactorHandler_WithInvalidPassword_ReturnsValidationProblem() {
        var userId = Guid.CreateVersion7();
        SetupAuthenticatedUser(userId);

        var request = new DisableTwoFactorRequest {
            Password = "WrongPassword"
        };

        var failureResponse = new TwoFactorDisableResponse {
            Success = false,
            Message = "Invalid password"
        };

        _mockTwoFactorService.DisableTwoFactorAsync(userId, request, Arg.Any<CancellationToken>())
            .Returns(failureResponse);

        var result = await TwoFactorHandlers.DisableTwoFactorHandler(_mockHttpContext, request, _mockTwoFactorService, TestContext.Current.CancellationToken);

        result.Should().BeOfType<ProblemHttpResult>();
    }

    [Fact]
    public async Task DisableTwoFactorHandler_WithUnauthenticatedUser_ReturnsUnauthorized() {
        SetupUnauthenticatedUser();

        var request = new DisableTwoFactorRequest {
            Password = "ValidPassword123!"
        };

        var act = async () => await TwoFactorHandlers.DisableTwoFactorHandler(_mockHttpContext, request, _mockTwoFactorService, TestContext.Current.CancellationToken);

        await act.Should().ThrowAsync<UnauthorizedAccessException>()

            .WithMessage("User ID claim is missing or invalid.");
        await _mockTwoFactorService.DidNotReceive().DisableTwoFactorAsync(
            Arg.Any<Guid>(),
            Arg.Any<DisableTwoFactorRequest>(),
            Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task DisableTwoFactorHandler_WhenTwoFactorNotEnabled_ReturnsValidationProblem() {
        var userId = Guid.CreateVersion7();
        SetupAuthenticatedUser(userId);

        var request = new DisableTwoFactorRequest {
            Password = "ValidPassword123!"
        };

        var failureResponse = new TwoFactorDisableResponse {
            Success = false,
            Message = "Two-factor authentication is not enabled"
        };

        _mockTwoFactorService.DisableTwoFactorAsync(userId, request, Arg.Any<CancellationToken>())
            .Returns(failureResponse);

        var result = await TwoFactorHandlers.DisableTwoFactorHandler(_mockHttpContext, request, _mockTwoFactorService, TestContext.Current.CancellationToken);

        result.Should().BeOfType<ProblemHttpResult>();
    }

    #endregion
}
