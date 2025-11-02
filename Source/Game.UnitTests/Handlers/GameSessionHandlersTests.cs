
namespace VttTools.Game.Handlers;

public class GameSessionHandlersTests {
    private readonly IGameSessionService _sessionService = Substitute.For<IGameSessionService>();
    private readonly HttpContext _httpContext = Substitute.For<HttpContext>();
    private readonly ClaimsPrincipal _user = Substitute.For<ClaimsPrincipal>();
    private static readonly Guid _userId = Guid.CreateVersion7();
    private static readonly Guid _sessionId = Guid.CreateVersion7();
    private static readonly Guid _sceneId = Guid.CreateVersion7();

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

        _sessionService.CreateGameSessionAsync(_userId, Arg.Any<CreateGameSessionData>(), Arg.Any<CancellationToken>())
            .Returns(Result.Success(expectedGameSession));

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

        _sessionService.CreateGameSessionAsync(_userId, Arg.Any<CreateGameSessionData>(), Arg.Any<CancellationToken>())
            .Returns(Result.Failure("Title: Cannot be empty"));

        // Act
        var result = await GameSessionHandlers.CreateGameSessionHandler(_httpContext, request, _sessionService);

        // Assert
        result.Should().BeOfType<ProblemHttpResult>();
    }

    [Fact]
    public async Task GetGameSessionsHandler_ReturnsOkResult() {
        // Arrange
        var sessions = new[] {
            new GameSession { Id = Guid.CreateVersion7(), Title = "Session 1", OwnerId = _userId },
            new GameSession { Id = Guid.CreateVersion7(), Title = "Session 2", OwnerId = _userId },
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
        _sessionService.UpdateGameSessionAsync(_userId, _sessionId, Arg.Any<UpdateGameSessionData>(), Arg.Any<CancellationToken>())
            .Returns(Result.Success(expectedGameSession));

        // Act
        var result = await GameSessionHandlers.UpdateGameSessionHandler(_httpContext, _sessionId, request, _sessionService);

        // Assert
        result.Should().BeOfType<NoContent>();
    }

    [Fact]
    public async Task UpdateGameSessionHandler_WithInvalidRequest_ReturnsValidationProblem() {
        // Arrange
        var request = new UpdateGameSessionRequest { Title = "" };

        _sessionService.UpdateGameSessionAsync(
            _userId,
            _sessionId,
            Arg.Any<UpdateGameSessionData>(),
            Arg.Any<CancellationToken>())
            .Returns(Result.Failure("Title: Cannot be empty"));

        // Act
        var result = await GameSessionHandlers.UpdateGameSessionHandler(_httpContext, _sessionId, request, _sessionService);

        // Assert
        result.Should().BeOfType<ProblemHttpResult>();
    }

    [Fact]
    public async Task DeleteGameSessionHandler_ReturnsCorrectStatusCode() {
        // Arrange
        _sessionService.DeleteGameSessionAsync(_userId, _sessionId, Arg.Any<CancellationToken>())
            .Returns(Result.Success());

        // Act
        var result = await GameSessionHandlers.DeleteGameSessionHandler(_httpContext, _sessionId, _sessionService);

        // Assert
        result.Should().BeOfType<NoContent>();
    }

    [Fact]
    public async Task JoinGameSessionHandler_ReturnsCorrectStatusCode() {
        // Arrange
        var request = new JoinGameSessionRequest { JoinAs = PlayerType.Player };
        _sessionService.JoinGameSessionAsync(_userId, _sessionId, PlayerType.Player, Arg.Any<CancellationToken>())
            .Returns(Result.Success());

        // Act
        var result = await GameSessionHandlers.JoinGameSessionHandler(_httpContext, _sessionId, request, _sessionService);

        // Assert
        result.Should().BeOfType<NoContent>();
    }

    [Fact]
    public async Task JoinGameSessionHandler_WithInvalidRequest_ReturnsBadRequestResult() {
        // Arrange
        var request = new JoinGameSessionRequest { JoinAs = PlayerType.Player };
        _sessionService.JoinGameSessionAsync(_userId, _sessionId, PlayerType.Player, Arg.Any<CancellationToken>())
            .Returns(Result.Failure(new Error("Some error.")));

        // Act
        var result = await GameSessionHandlers.JoinGameSessionHandler(_httpContext, _sessionId, request, _sessionService);

        // Assert
        result.Should().BeOfType<ProblemHttpResult>();
    }

    [Fact]
    public async Task LeaveGameSessionHandler_ReturnsCorrectStatusCode() {
        // Arrange
        _sessionService.LeaveGameSessionAsync(_userId, _sessionId, Arg.Any<CancellationToken>())
            .Returns(Result.Success());

        // Act
        var result = await GameSessionHandlers.LeaveGameSessionHandler(_httpContext, _sessionId, _sessionService);

        // Assert
        result.Should().BeOfType<NoContent>();
    }

    [Fact]
    public async Task ActivateSceneHandler_ReturnsCorrectStatusCode() {
        // Arrange
        _sessionService.SetActiveSceneAsync(_userId, _sessionId, _sceneId, Arg.Any<CancellationToken>())
            .Returns(Result.Success());

        // Act
        var result = await GameSessionHandlers.ActivateSceneHandler(_httpContext, _sessionId, _sceneId, _sessionService);

        // Assert
        result.Should().BeOfType<NoContent>();
    }

    [Fact]
    public async Task StartGameSessionHandler_ReturnsCorrectStatusCode() {
        // Arrange
        _sessionService.StartGameSessionAsync(_userId, _sessionId, Arg.Any<CancellationToken>())
            .Returns(Result.Success());

        // Act
        var result = await GameSessionHandlers.StartGameSessionHandler(_httpContext, _sessionId, _sessionService);

        // Assert
        result.Should().BeOfType<NoContent>();
    }

    [Fact]
    public async Task StopGameSessionHandler_ReturnsCorrectStatusCode() {
        // Arrange
        _sessionService.StopGameSessionAsync(_userId, _sessionId, Arg.Any<CancellationToken>())
            .Returns(Result.Success());

        // Act
        var result = await GameSessionHandlers.StopGameSessionHandler(_httpContext, _sessionId, _sessionService);

        // Assert
        result.Should().BeOfType<NoContent>();
    }
}