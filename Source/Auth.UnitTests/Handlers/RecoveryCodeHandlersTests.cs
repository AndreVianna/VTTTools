namespace VttTools.Auth.Handlers;

public class RecoveryCodeHandlersTests {
    private readonly IRecoveryCodeService _mockRecoveryCodeService = Substitute.For<IRecoveryCodeService>();
    private readonly HttpContext _mockHttpContext = Substitute.For<HttpContext>();

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

    #region GenerateNewCodesHandler Tests

    [Fact]
    public async Task GenerateNewCodesHandler_WithValidPassword_ReturnsOkResult() {
        var userId = Guid.CreateVersion7();
        SetupAuthenticatedUser(userId);

        var request = new GenerateRecoveryCodesRequest {
            Password = "ValidPassword123!"
        };

        var successResponse = new GenerateRecoveryCodesResponse {
            Success = true,
            RecoveryCodes = ["ABC123", "DEF456", "GHI789"]
        };

        _mockRecoveryCodeService.GenerateNewCodesAsync(userId, request, Arg.Any<CancellationToken>())
            .Returns(successResponse);

        var result = await RecoveryCodeHandlers.GenerateNewCodesHandler(_mockHttpContext, request, _mockRecoveryCodeService, TestContext.Current.CancellationToken);

        result.Should().BeOfType<Ok<GenerateRecoveryCodesResponse>>();
        var okResult = (Ok<GenerateRecoveryCodesResponse>)result;
        okResult.Value.Should().BeEquivalentTo(successResponse);
        okResult.Value!.RecoveryCodes.Should().HaveCount(3);
        await _mockRecoveryCodeService.Received(1).GenerateNewCodesAsync(
            userId,
            request,
            Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task GenerateNewCodesHandler_WithInvalidPassword_ReturnsValidationProblem() {
        var userId = Guid.CreateVersion7();
        SetupAuthenticatedUser(userId);

        var request = new GenerateRecoveryCodesRequest {
            Password = "WrongPassword"
        };

        var failureResponse = new GenerateRecoveryCodesResponse {
            Success = false,
            Message = "Invalid password"
        };

        _mockRecoveryCodeService.GenerateNewCodesAsync(userId, request, Arg.Any<CancellationToken>())
            .Returns(failureResponse);

        var result = await RecoveryCodeHandlers.GenerateNewCodesHandler(_mockHttpContext, request, _mockRecoveryCodeService, TestContext.Current.CancellationToken);

        result.Should().BeOfType<ProblemHttpResult>();
    }

    [Fact]
    public async Task GenerateNewCodesHandler_WithUnauthenticatedUser_ReturnsUnauthorized() {
        SetupUnauthenticatedUser();

        var request = new GenerateRecoveryCodesRequest {
            Password = "ValidPassword123!"
        };

        var act = () => RecoveryCodeHandlers.GenerateNewCodesHandler(_mockHttpContext, request, _mockRecoveryCodeService, TestContext.Current.CancellationToken);

        await act.Should().ThrowAsync<UnauthorizedAccessException>()

            .WithMessage("User ID claim is missing or invalid.");
        await _mockRecoveryCodeService.DidNotReceive().GenerateNewCodesAsync(
            Arg.Any<Guid>(),
            Arg.Any<GenerateRecoveryCodesRequest>(),
            Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task GenerateNewCodesHandler_WhenServiceFails_ReturnsValidationProblem() {
        var userId = Guid.CreateVersion7();
        SetupAuthenticatedUser(userId);

        var request = new GenerateRecoveryCodesRequest {
            Password = "ValidPassword123!"
        };

        var failureResponse = new GenerateRecoveryCodesResponse {
            Success = false,
            Message = "Failed to generate recovery codes"
        };

        _mockRecoveryCodeService.GenerateNewCodesAsync(userId, request, Arg.Any<CancellationToken>())
            .Returns(failureResponse);

        var result = await RecoveryCodeHandlers.GenerateNewCodesHandler(_mockHttpContext, request, _mockRecoveryCodeService, TestContext.Current.CancellationToken);

        result.Should().BeOfType<ProblemHttpResult>();
    }

    #endregion

    #region GetStatusHandler Tests

    [Fact]
    public async Task GetStatusHandler_WithAuthenticatedUser_ReturnsOkResult() {
        var userId = Guid.CreateVersion7();
        SetupAuthenticatedUser(userId);

        var successResponse = new RecoveryCodesStatusResponse {
            Success = true,
            RemainingCount = 5
        };

        _mockRecoveryCodeService.GetStatusAsync(userId, Arg.Any<CancellationToken>())
            .Returns(successResponse);

        var result = await RecoveryCodeHandlers.GetStatusHandler(_mockHttpContext, _mockRecoveryCodeService, TestContext.Current.CancellationToken);

        result.Should().BeOfType<Ok<RecoveryCodesStatusResponse>>();
        var okResult = (Ok<RecoveryCodesStatusResponse>)result;
        okResult.Value.Should().BeEquivalentTo(successResponse);
        okResult.Value.RemainingCount.Should().Be(5);
        await _mockRecoveryCodeService.Received(1).GetStatusAsync(userId, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task GetStatusHandler_WithUnauthenticatedUser_ReturnsUnauthorized() {
        SetupUnauthenticatedUser();

        var act = () => RecoveryCodeHandlers.GetStatusHandler(_mockHttpContext, _mockRecoveryCodeService, TestContext.Current.CancellationToken);

        await act.Should().ThrowAsync<UnauthorizedAccessException>()

            .WithMessage("User ID claim is missing or invalid.");
        await _mockRecoveryCodeService.DidNotReceive().GetStatusAsync(
            Arg.Any<Guid>(),
            Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task GetStatusHandler_WhenServiceFails_ReturnsValidationProblem() {
        var userId = Guid.CreateVersion7();
        SetupAuthenticatedUser(userId);

        var failureResponse = new RecoveryCodesStatusResponse {
            Success = false,
            Message = "Failed to retrieve status"
        };

        _mockRecoveryCodeService.GetStatusAsync(userId, Arg.Any<CancellationToken>())
            .Returns(failureResponse);

        var result = await RecoveryCodeHandlers.GetStatusHandler(_mockHttpContext, _mockRecoveryCodeService, TestContext.Current.CancellationToken);

        result.Should().BeOfType<ProblemHttpResult>();
    }

    [Fact]
    public async Task GetStatusHandler_WhenNoRecoveryCodesExist_ReturnsZeroCount() {
        var userId = Guid.CreateVersion7();
        SetupAuthenticatedUser(userId);

        var successResponse = new RecoveryCodesStatusResponse {
            Success = true,
            RemainingCount = 0
        };

        _mockRecoveryCodeService.GetStatusAsync(userId, Arg.Any<CancellationToken>())
            .Returns(successResponse);

        var result = await RecoveryCodeHandlers.GetStatusHandler(_mockHttpContext, _mockRecoveryCodeService, TestContext.Current.CancellationToken);

        result.Should().BeOfType<Ok<RecoveryCodesStatusResponse>>();
        var okResult = (Ok<RecoveryCodesStatusResponse>)result;
        okResult?.Value?.RemainingCount.Should().Be(0);
    }

    #endregion
}