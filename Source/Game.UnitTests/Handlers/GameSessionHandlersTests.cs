
namespace VttTools.Game.Handlers;

public class GameSessionHandlersTests {
    private readonly IGameSessionService _sessionService = Substitute.For<IGameSessionService>();
    private readonly HttpContext _httpContext = Substitute.For<HttpContext>();
    private readonly ClaimsPrincipal _user = Substitute.For<ClaimsPrincipal>();
    private static readonly Guid _userId = Guid.CreateVersion7();
    private static readonly Guid _sessionId = Guid.CreateVersion7();
    private static readonly Guid _encounterId = Guid.CreateVersion7();

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
            EncounterId = _encounterId,
        };

        var expectedGameSession = new GameSession {
            Id = _sessionId,
            Title = "Test GameSession",
            EncounterId = _encounterId,
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
            EncounterId = _encounterId,
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
    public async Task ActivateEncounterHandler_ReturnsCorrectStatusCode() {
        // Arrange
        _sessionService.SetActiveEncounterAsync(_userId, _sessionId, _encounterId, Arg.Any<CancellationToken>())
            .Returns(Result.Success());

        // Act
        var result = await GameSessionHandlers.ActivateEncounterHandler(_httpContext, _sessionId, _encounterId, _sessionService);

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

    [Fact]
    public async Task UpdateGameSessionHandler_WithSessionNotFound_ReturnsNotFound() {
        // Arrange
        var request = new UpdateGameSessionRequest { Title = "Updated Title" };
        _sessionService.UpdateGameSessionAsync(_userId, _sessionId, Arg.Any<UpdateGameSessionData>(), Arg.Any<CancellationToken>())
            .Returns(Result.Failure("Session not found"));

        // Act
        var result = await GameSessionHandlers.UpdateGameSessionHandler(_httpContext, _sessionId, request, _sessionService);

        // Assert
        result.Should().BeOfType<NotFound>();
    }

    [Fact]
    public async Task UpdateGameSessionHandler_WithNotAuthorized_ReturnsForbid() {
        // Arrange
        var request = new UpdateGameSessionRequest { Title = "Updated Title" };
        _sessionService.UpdateGameSessionAsync(_userId, _sessionId, Arg.Any<UpdateGameSessionData>(), Arg.Any<CancellationToken>())
            .Returns(Result.Failure("Not authorized"));

        // Act
        var result = await GameSessionHandlers.UpdateGameSessionHandler(_httpContext, _sessionId, request, _sessionService);

        // Assert
        result.Should().BeOfType<ForbidHttpResult>();
    }

    [Fact]
    public async Task DeleteGameSessionHandler_WithSessionNotFound_ReturnsNotFound() {
        // Arrange
        _sessionService.DeleteGameSessionAsync(_userId, _sessionId, Arg.Any<CancellationToken>())
            .Returns(Result.Failure("Session not found"));

        // Act
        var result = await GameSessionHandlers.DeleteGameSessionHandler(_httpContext, _sessionId, _sessionService);

        // Assert
        result.Should().BeOfType<NotFound>();
    }

    [Fact]
    public async Task DeleteGameSessionHandler_WithNotAuthorized_ReturnsForbid() {
        // Arrange
        _sessionService.DeleteGameSessionAsync(_userId, _sessionId, Arg.Any<CancellationToken>())
            .Returns(Result.Failure("Not authorized"));

        // Act
        var result = await GameSessionHandlers.DeleteGameSessionHandler(_httpContext, _sessionId, _sessionService);

        // Assert
        result.Should().BeOfType<ForbidHttpResult>();
    }

    [Fact]
    public async Task JoinGameSessionHandler_WithSessionNotFound_ReturnsNotFound() {
        // Arrange
        var request = new JoinGameSessionRequest { JoinAs = PlayerType.Player };
        _sessionService.JoinGameSessionAsync(_userId, _sessionId, PlayerType.Player, Arg.Any<CancellationToken>())
            .Returns(Result.Failure("Session not found"));

        // Act
        var result = await GameSessionHandlers.JoinGameSessionHandler(_httpContext, _sessionId, request, _sessionService);

        // Assert
        result.Should().BeOfType<NotFound>();
    }

    [Fact]
    public async Task LeaveGameSessionHandler_WithSessionNotFound_ReturnsNotFound() {
        // Arrange
        _sessionService.LeaveGameSessionAsync(_userId, _sessionId, Arg.Any<CancellationToken>())
            .Returns(Result.Failure("Session not found"));

        // Act
        var result = await GameSessionHandlers.LeaveGameSessionHandler(_httpContext, _sessionId, _sessionService);

        // Assert
        result.Should().BeOfType<NotFound>();
    }

    [Fact]
    public async Task ActivateEncounterHandler_WithSessionNotFound_ReturnsNotFound() {
        // Arrange
        _sessionService.SetActiveEncounterAsync(_userId, _sessionId, _encounterId, Arg.Any<CancellationToken>())
            .Returns(Result.Failure("Session not found"));

        // Act
        var result = await GameSessionHandlers.ActivateEncounterHandler(_httpContext, _sessionId, _encounterId, _sessionService);

        // Assert
        result.Should().BeOfType<NotFound>();
    }

    [Fact]
    public async Task ActivateEncounterHandler_WithNotAuthorized_ReturnsForbid() {
        // Arrange
        _sessionService.SetActiveEncounterAsync(_userId, _sessionId, _encounterId, Arg.Any<CancellationToken>())
            .Returns(Result.Failure("Not authorized"));

        // Act
        var result = await GameSessionHandlers.ActivateEncounterHandler(_httpContext, _sessionId, _encounterId, _sessionService);

        // Assert
        result.Should().BeOfType<ForbidHttpResult>();
    }

    [Fact]
    public async Task StartGameSessionHandler_WithSessionNotFound_ReturnsNotFound() {
        // Arrange
        _sessionService.StartGameSessionAsync(_userId, _sessionId, Arg.Any<CancellationToken>())
            .Returns(Result.Failure("Session not found"));

        // Act
        var result = await GameSessionHandlers.StartGameSessionHandler(_httpContext, _sessionId, _sessionService);

        // Assert
        result.Should().BeOfType<NotFound>();
    }

    [Fact]
    public async Task StartGameSessionHandler_WithNotAuthorized_ReturnsForbid() {
        // Arrange
        _sessionService.StartGameSessionAsync(_userId, _sessionId, Arg.Any<CancellationToken>())
            .Returns(Result.Failure("Not authorized"));

        // Act
        var result = await GameSessionHandlers.StartGameSessionHandler(_httpContext, _sessionId, _sessionService);

        // Assert
        result.Should().BeOfType<ForbidHttpResult>();
    }

    [Fact]
    public async Task StopGameSessionHandler_WithSessionNotFound_ReturnsNotFound() {
        // Arrange
        _sessionService.StopGameSessionAsync(_userId, _sessionId, Arg.Any<CancellationToken>())
            .Returns(Result.Failure("Session not found"));

        // Act
        var result = await GameSessionHandlers.StopGameSessionHandler(_httpContext, _sessionId, _sessionService);

        // Assert
        result.Should().BeOfType<NotFound>();
    }

    [Fact]
    public async Task StopGameSessionHandler_WithNotAuthorized_ReturnsForbid() {
        // Arrange
        _sessionService.StopGameSessionAsync(_userId, _sessionId, Arg.Any<CancellationToken>())
            .Returns(Result.Failure("Not authorized"));

        // Act
        var result = await GameSessionHandlers.StopGameSessionHandler(_httpContext, _sessionId, _sessionService);

        // Assert
        result.Should().BeOfType<ForbidHttpResult>();
    }

    [Fact]
    public async Task CreateGameSessionHandler_WithMultipleValidationErrors_ReturnsValidationProblem() {
        // Arrange
        var request = new CreateGameSessionRequest {
            Title = "",
            EncounterId = _encounterId,
        };

        _sessionService.CreateGameSessionAsync(_userId, Arg.Any<CreateGameSessionData>(), Arg.Any<CancellationToken>())
            .Returns(Result.Failure([
                new Error("Title: Cannot be empty"),
                new Error("Title: Must be at least 3 characters")
            ]));

        // Act
        var result = await GameSessionHandlers.CreateGameSessionHandler(_httpContext, request, _sessionService);

        // Assert
        result.Should().BeOfType<ProblemHttpResult>();
    }

    [Fact]
    public async Task GetGameSessionsHandler_WithEmptyResult_ReturnsOkWithEmptyArray() {
        // Arrange
        _sessionService.GetGameSessionsAsync(_userId, Arg.Any<CancellationToken>())
            .Returns([]);

        // Act
        var result = await GameSessionHandlers.GetGameSessionsHandler(_httpContext, _sessionService);

        // Assert
        var response = result.Should().BeOfType<Ok<GameSession[]>>().Subject;
        response.Value.Should().BeEmpty();
    }

    [Fact]
    public async Task UpdateGameSessionHandler_WithValidationError_ReturnsValidationProblem() {
        // Arrange
        var request = new UpdateGameSessionRequest { Title = "" };
        _sessionService.UpdateGameSessionAsync(_userId, _sessionId, Arg.Any<UpdateGameSessionData>(), Arg.Any<CancellationToken>())
            .Returns(Result.Failure(new Error("Title", "Cannot be empty")));

        // Act
        var result = await GameSessionHandlers.UpdateGameSessionHandler(_httpContext, _sessionId, request, _sessionService);

        // Assert
        result.Should().BeOfType<ProblemHttpResult>();
    }

    [Fact]
    public async Task DeleteGameSessionHandler_WithValidationError_ReturnsValidationProblem() {
        // Arrange
        _sessionService.DeleteGameSessionAsync(_userId, _sessionId, Arg.Any<CancellationToken>())
            .Returns(Result.Failure(new Error("General", "Invalid operation")));

        // Act
        var result = await GameSessionHandlers.DeleteGameSessionHandler(_httpContext, _sessionId, _sessionService);

        // Assert
        result.Should().BeOfType<ProblemHttpResult>();
    }

    [Fact]
    public async Task LeaveGameSessionHandler_WithValidationError_ReturnsValidationProblem() {
        // Arrange
        _sessionService.LeaveGameSessionAsync(_userId, _sessionId, Arg.Any<CancellationToken>())
            .Returns(Result.Failure(new Error("General", "Invalid operation")));

        // Act
        var result = await GameSessionHandlers.LeaveGameSessionHandler(_httpContext, _sessionId, _sessionService);

        // Assert
        result.Should().BeOfType<ProblemHttpResult>();
    }

    [Fact]
    public async Task ActivateEncounterHandler_WithValidationError_ReturnsValidationProblem() {
        // Arrange
        _sessionService.SetActiveEncounterAsync(_userId, _sessionId, _encounterId, Arg.Any<CancellationToken>())
            .Returns(Result.Failure(new Error("Encounter", "Invalid encounter")));

        // Act
        var result = await GameSessionHandlers.ActivateEncounterHandler(_httpContext, _sessionId, _encounterId, _sessionService);

        // Assert
        result.Should().BeOfType<ProblemHttpResult>();
    }

    [Fact]
    public async Task StartGameSessionHandler_WithValidationError_ReturnsValidationProblem() {
        // Arrange
        _sessionService.StartGameSessionAsync(_userId, _sessionId, Arg.Any<CancellationToken>())
            .Returns(Result.Failure(new Error("Status", "Invalid status transition")));

        // Act
        var result = await GameSessionHandlers.StartGameSessionHandler(_httpContext, _sessionId, _sessionService);

        // Assert
        result.Should().BeOfType<ProblemHttpResult>();
    }

    [Fact]
    public async Task StopGameSessionHandler_WithValidationError_ReturnsValidationProblem() {
        // Arrange
        _sessionService.StopGameSessionAsync(_userId, _sessionId, Arg.Any<CancellationToken>())
            .Returns(Result.Failure(new Error("Status", "Invalid status transition")));

        // Act
        var result = await GameSessionHandlers.StopGameSessionHandler(_httpContext, _sessionId, _sessionService);

        // Assert
        result.Should().BeOfType<ProblemHttpResult>();
    }

    [Fact]
    public async Task JoinGameSessionHandler_AsGameMaster_ReturnsNoContent() {
        // Arrange
        var request = new JoinGameSessionRequest { JoinAs = PlayerType.Master };
        _sessionService.JoinGameSessionAsync(_userId, _sessionId, PlayerType.Master, Arg.Any<CancellationToken>())
            .Returns(Result.Success());

        // Act
        var result = await GameSessionHandlers.JoinGameSessionHandler(_httpContext, _sessionId, request, _sessionService);

        // Assert
        result.Should().BeOfType<NoContent>();
    }

    [Fact]
    public async Task CreateGameSessionHandler_WithEmptyEncounterId_ReturnsCreated() {
        // Arrange
        var request = new CreateGameSessionRequest {
            Title = "Test Session",
            EncounterId = Guid.Empty,
        };

        var expectedSession = new GameSession {
            Id = _sessionId,
            Title = "Test Session",
            EncounterId = Guid.Empty,
            OwnerId = _userId,
        };

        _sessionService.CreateGameSessionAsync(_userId, Arg.Any<CreateGameSessionData>(), Arg.Any<CancellationToken>())
            .Returns(Result.Success(expectedSession));

        // Act
        var result = await GameSessionHandlers.CreateGameSessionHandler(_httpContext, request, _sessionService);

        // Assert
        var response = result.Should().BeOfType<Created<GameSession>>().Subject;
        response.Value!.EncounterId.Should().Be(Guid.Empty);
    }

    [Fact]
    public async Task UpdateGameSessionHandler_WithEmptyRequest_ReturnsNoContent() {
        // Arrange
        var request = new UpdateGameSessionRequest();
        var expectedSession = new GameSession { Id = _sessionId, Title = "Unchanged", OwnerId = _userId };
        _sessionService.UpdateGameSessionAsync(_userId, _sessionId, Arg.Any<UpdateGameSessionData>(), Arg.Any<CancellationToken>())
            .Returns(Result.Success(expectedSession));

        // Act
        var result = await GameSessionHandlers.UpdateGameSessionHandler(_httpContext, _sessionId, request, _sessionService);

        // Assert
        result.Should().BeOfType<NoContent>();
    }
}