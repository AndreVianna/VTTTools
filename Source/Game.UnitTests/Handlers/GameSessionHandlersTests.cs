namespace VttTools.Game.Handlers;

public class GameSessionHandlersTests {
    private readonly IGameSessionService _sessionService = Substitute.For<IGameSessionService>();
    private readonly HttpContext _httpContext = Substitute.For<HttpContext>();
    private readonly ClaimsPrincipal _user = Substitute.For<ClaimsPrincipal>();
    private static readonly Guid _userId = Guid.NewGuid();
    private static readonly Guid _sessionId = Guid.NewGuid();
    private static readonly Guid _sceneId = Guid.NewGuid();

    public GameSessionHandlersTests() {
        // Setup user claims
        var claim = new Claim(ClaimTypes.NameIdentifier, _userId.ToString());
        var claims = new List<Claim> { claim };
        _user.Claims.Returns(claims);
        _user.FindFirst(ClaimTypes.NameIdentifier).Returns(claim);
        _httpContext.User.Returns(_user);
    }

    [Fact]
    public async Task CreateGameSessionHandler_WithValidRequest_ReturnsCreatedResult() {
        // Arrange
        var request = new CreateGameSessionRequest {
            Title = "Test GameSession",
            SceneId = _sceneId,
        };

        var expectedGameSession = new GameSession {
            Id = _sessionId,
            Title = "Test GameSession",
            SceneId = _sceneId,
            OwnerId = _userId,
        };

        var createdResult = TypedResult.As(HttpStatusCode.Created, expectedGameSession);
        _sessionService.CreateGameSessionAsync(_userId, Arg.Any<CreateGameSessionData>(), Arg.Any<CancellationToken>())
            .Returns(createdResult);

        // Act
        var result = await GameSessionHandlers.CreateGameSessionHandler(_httpContext, request, _sessionService);

        // Assert
        var response = result.Should().BeOfType<Created<GameSession>>().Subject;
        response.Location.Should().Be($"/api/sessions/{expectedGameSession.Id}");
        response.Value.Should().Be(expectedGameSession);
    }

    [Fact]
    public async Task CreateGameSessionHandler_WithInvalidRequest_ReturnsValidationProblem() {
        // Arrange
        var request = new CreateGameSessionRequest {
            Title = "",
            SceneId = _sceneId,
        };
        var errors = new[] { new Error("Title", "Cannot be empty") };
        var badRequestResult = TypedResult.As(HttpStatusCode.BadRequest, [.. errors]).WithNo<GameSession>();

        _sessionService.CreateGameSessionAsync(_userId, Arg.Any<CreateGameSessionData>(), Arg.Any<CancellationToken>())
            .Returns(badRequestResult);

        // Act
        var result = await GameSessionHandlers.CreateGameSessionHandler(_httpContext, request, _sessionService);

        // Assert
        result.Should().BeOfType<ProblemHttpResult>();
    }

    [Fact]
    public async Task GetGameSessionsHandler_ReturnsOkResult() {
        // Arrange
        var sessions = new[] {
            new GameSession { Id = Guid.NewGuid(), Title = "Session 1", OwnerId = _userId },
            new GameSession { Id = Guid.NewGuid(), Title = "Session 2", OwnerId = _userId },
        };
        _sessionService.GetGameSessionsAsync(_userId, Arg.Any<CancellationToken>())
            .Returns(sessions);

        // Act
        var result = await GameSessionHandlers.GetGameSessionsHandler(_httpContext, _sessionService);

        // Assert
        var response = result.Should().BeOfType<Ok<GameSession[]>>().Subject;
        response.Value.Should().BeEquivalentTo(sessions);
    }

    [Fact]
    public async Task GetGameSessionByIdHandler_WithExistingId_ReturnsOkResult() {
        // Arrange
        var session = new GameSession { Id = _sessionId, Title = "Test GameSession", OwnerId = _userId };
        _sessionService.GetGameSessionByIdAsync(_userId, _sessionId, Arg.Any<CancellationToken>())
            .Returns(session);

        // Act
        var result = await GameSessionHandlers.GetGameSessionByIdHandler(_httpContext, _sessionId, _sessionService);

        // Assert
        var response = result.Should().BeOfType<Ok<GameSession>>().Subject;
        response.Value.Should().Be(session);
    }

    [Fact]
    public async Task GetGameSessionByIdHandler_WithNonExistingId_ReturnsNotFound() {
        // Arrange
        _sessionService.GetGameSessionByIdAsync(_userId, _sessionId, Arg.Any<CancellationToken>())
            .Returns((GameSession?)null);

        // Act
        var result = await GameSessionHandlers.GetGameSessionByIdHandler(_httpContext, _sessionId, _sessionService);

        // Assert
        result.Should().BeOfType<NotFound>();
    }

    [Fact]
    public async Task UpdateGameSessionHandler_WithValidRequest_ReturnsOkResult() {
        // Arrange
        var request = new UpdateGameSessionRequest { Title = "Updated GameSession" };
        var expectedGameSession = new GameSession { Id = _sessionId, Title = "Updated GameSession", OwnerId = _userId };
        var okResult = TypedResult.As(HttpStatusCode.OK, expectedGameSession);
        _sessionService.UpdateGameSessionAsync(_userId, _sessionId, Arg.Any<UpdateGameSessionData>(), Arg.Any<CancellationToken>())
            .Returns(okResult);

        // Act
        var result = await GameSessionHandlers.UpdateGameSessionHandler(_httpContext, _sessionId, request, _sessionService);

        // Assert
        var response = result.Should().BeOfType<Ok<GameSession>>().Subject;
        response.Value.Should().Be(expectedGameSession);
    }

    [Fact]
    public async Task UpdateGameSessionHandler_WithInvalidRequest_ReturnsValidationProblem() {
        // Arrange
        var request = new UpdateGameSessionRequest { Title = "" };
        var errors = new[] { new Error("Title", "Cannot be empty") };
        var badRequestResult = TypedResult.As(HttpStatusCode.BadRequest, [.. errors]).WithNo<GameSession>();

        _sessionService.UpdateGameSessionAsync(
            _userId,
            _sessionId,
            Arg.Any<UpdateGameSessionData>(),
            Arg.Any<CancellationToken>())
            .Returns(badRequestResult);

        // Act
        var result = await GameSessionHandlers.UpdateGameSessionHandler(_httpContext, _sessionId, request, _sessionService);

        // Assert
        result.Should().BeOfType<ProblemHttpResult>();
    }

    [Fact]
    public async Task DeleteGameSessionHandler_ReturnsCorrectStatusCode() {
        // Arrange
        var noContentResult = TypedResult.As(HttpStatusCode.NoContent);
        _sessionService.DeleteGameSessionAsync(_userId, _sessionId, Arg.Any<CancellationToken>())
            .Returns(noContentResult);

        // Act
        var result = await GameSessionHandlers.DeleteGameSessionHandler(_httpContext, _sessionId, _sessionService);

        // Assert
        var response = result.Should().BeOfType<StatusCodeHttpResult>().Subject;
        response.StatusCode.Should().Be(204);
    }

    [Fact]
    public async Task JoinGameSessionHandler_ReturnsCorrectStatusCode() {
        // Arrange
        var request = new JoinGameSessionRequest { JoinAs = PlayerType.Player };
        var okResult = TypedResult.As(HttpStatusCode.OK);
        _sessionService.JoinGameSessionAsync(_userId, _sessionId, PlayerType.Player, Arg.Any<CancellationToken>())
            .Returns(okResult);

        // Act
        var result = await GameSessionHandlers.JoinGameSessionHandler(_httpContext, _sessionId, request, _sessionService);

        // Assert
        var response = result.Should().BeOfType<StatusCodeHttpResult>().Subject;
        response.StatusCode.Should().Be(200);
    }

    [Fact]
    public async Task JoinGameSessionHandler_WithInvalidRequest_ReturnsBadRequestResult() {
        // Arrange
        var request = new JoinGameSessionRequest { JoinAs = PlayerType.Player };
        var errorResult = TypedResult.As(HttpStatusCode.BadRequest, new Error("Some error."));
        _sessionService.JoinGameSessionAsync(_userId, _sessionId, PlayerType.Player, Arg.Any<CancellationToken>())
            .Returns(errorResult);

        // Act
        var result = await GameSessionHandlers.JoinGameSessionHandler(_httpContext, _sessionId, request, _sessionService);

        // Assert
        result.Should().BeOfType<ProblemHttpResult>();
    }

    [Fact]
    public async Task LeaveGameSessionHandler_ReturnsCorrectStatusCode() {
        // Arrange
        var okResult = TypedResult.As(HttpStatusCode.OK);
        _sessionService.LeaveGameSessionAsync(_userId, _sessionId, Arg.Any<CancellationToken>())
            .Returns(okResult);

        // Act
        var result = await GameSessionHandlers.LeaveGameSessionHandler(_httpContext, _sessionId, _sessionService);

        // Assert
        var response = result.Should().BeOfType<StatusCodeHttpResult>().Subject;
        response.StatusCode.Should().Be(200);
    }

    [Fact]
    public async Task ActivateSceneHandler_ReturnsCorrectStatusCode() {
        // Arrange
        var okResult = TypedResult.As(HttpStatusCode.OK);
        _sessionService.SetActiveSceneAsync(_userId, _sessionId, _sceneId, Arg.Any<CancellationToken>())
            .Returns(okResult);

        // Act
        var result = await GameSessionHandlers.ActivateSceneHandler(_httpContext, _sessionId, _sceneId, _sessionService);

        // Assert
        var response = result.Should().BeOfType<StatusCodeHttpResult>().Subject;
        response.StatusCode.Should().Be(200);
    }

    [Fact]
    public async Task StartGameSessionHandler_ReturnsCorrectStatusCode() {
        // Arrange
        var okResult = TypedResult.As(HttpStatusCode.OK);
        _sessionService.StartGameSessionAsync(_userId, _sessionId, Arg.Any<CancellationToken>())
            .Returns(okResult);

        // Act
        var result = await GameSessionHandlers.StartGameSessionHandler(_httpContext, _sessionId, _sessionService);

        // Assert
        var response = result.Should().BeOfType<StatusCodeHttpResult>().Subject;
        response.StatusCode.Should().Be(200);
    }

    [Fact]
    public async Task StopGameSessionHandler_ReturnsCorrectStatusCode() {
        // Arrange
        var okResult = TypedResult.As(HttpStatusCode.OK);
        _sessionService.StopGameSessionAsync(_userId, _sessionId, Arg.Any<CancellationToken>())
            .Returns(okResult);

        // Act
        var result = await GameSessionHandlers.StopGameSessionHandler(_httpContext, _sessionId, _sessionService);

        // Assert
        Assert.IsType<StatusCodeHttpResult>(result);
        var response = result.Should().BeOfType<StatusCodeHttpResult>().Subject;
        response.StatusCode.Should().Be(200);
    }
}