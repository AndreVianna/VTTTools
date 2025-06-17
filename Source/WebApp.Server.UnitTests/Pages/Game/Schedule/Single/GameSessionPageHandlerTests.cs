namespace VttTools.WebApp.Pages.Game.Schedule.Single;

public class GameSessionPageHandlerTests
    : ComponentTestContext {
    private readonly GameSessionPage _page = Substitute.For<GameSessionPage>();
    private readonly Guid _sessionId = Guid.NewGuid();
    private readonly IGameSessionsHttpClient _client = Substitute.For<IGameSessionsHttpClient>();

    public GameSessionPageHandlerTests() {
        _page.HttpContext.Returns(HttpContext);
        _page.NavigationManager.Returns(NavigationManager);
        _page.Logger.Returns(NullLogger.Instance);
    }

    [Fact]
    public async Task TryConfigureAsync_WithValidGameSessionId_ReturnsTrue() {
        // Arrange
        var handler = await CreateHandler();

        // Act
        await handler.LoadSessionAsync(_client, _sessionId);

        // Assert
        _page.State.GameSession.Should().NotBeNull();
        _page.State.CanEdit.Should().BeTrue();
        _page.State.CanStart.Should().BeTrue();
    }

    [Fact]
    public async Task TryConfigureAsync_WithInvalidGameSessionId_ReturnsFalse() {
        // Arrange
        var handler = await CreateHandler();
        _client.GetGameSessionByIdAsync(_sessionId).Returns((GameSessionDetails?)null);

        // Act
        await handler.LoadSessionAsync(_client, _sessionId);
    }

    [Fact]
    public async Task OpenEditGameSessionDialog_ClearErrorsResetsInputAndShowsDialog() {
        // Arrange
        var handler = await CreateHandler();

        // Arrange
        var expectedInput = new GameSessionPageInput {
            Title = "Test GameSession",
        };

        // Act
        handler.OpenEditGameSessionDialog();

        // Assert
        _page.State.Input.Should().BeEquivalentTo(expectedInput);
        _page.State.ShowEditDialog.Should().BeTrue();
    }

    [Fact]
    public async Task CloseEditGameSessionDialog_HidesDialog() {
        // Arrange
        var handler = await CreateHandler();
        _page.State.ShowEditDialog = true;

        // Act
        handler.CloseEditGameSessionDialog();

        // Assert
        _page.State.ShowEditDialog.Should().BeFalse();
    }

    [Fact]
    public async Task UpdateGameSession_WithValidInput_UpdatesGameSessionAndClosesDialog() {
        // Arrange
        var handler = await CreateHandler();
        _page.State.ShowEditDialog = true;
        _page.State.Input = new() {
            Title = "Updated GameSession Name",
        };
        var updatedGameSession = new GameSessionDetails {
            Id = _page.State.GameSession.Id,
            Title = _page.State.Input.Title,
            OwnerId = _page.State.GameSession.OwnerId,
            Players = _page.State.GameSession.Players,
        };

        _client.UpdateGameSessionAsync(_sessionId, Arg.Any<UpdateGameSessionRequest>()).Returns(Result.Success());

        // Act
        await handler.UpdateGameSession();

        // Assert
        _page.State.ShowEditDialog.Should().BeFalse();
        await _client.Received(1).UpdateGameSessionAsync(_sessionId, Arg.Is<UpdateGameSessionRequest>(r => r.Title == "Updated GameSession Name"));
    }

    [Fact]
    public async Task UpdateGameSession_WithValidationError_SetsErrorsAndDoesNotUpdate() {
        // Arrange
        var handler = await CreateHandler();
        _page.State.ShowEditDialog = true;
        _client.UpdateGameSessionAsync(_sessionId, Arg.Any<UpdateGameSessionRequest>()).Returns(Result.Failure("Some error."));

        // Act
        await handler.UpdateGameSession();

        // Assert
        _page.State.ShowEditDialog.Should().BeTrue();
        _page.State.Input.Errors.Should().NotBeEmpty();
        _page.State.Input.Errors[0].Message.Should().Be("Some error.");
    }

    [Fact]
    public async Task TryStartGameSession_CallsApiAndReturnsResult() {
        // Arrange
        var handler = await CreateHandler();
        _client.StartGameSessionAsync(_sessionId).Returns(true);

        // Act
        var result = await handler.TryStartGameSession();

        // Assert
        result.Should().BeTrue();
    }

    [Fact]
    public async Task TryStartGameSession_ReturnsFalse_OnError() {
        // Arrange
        var handler = await CreateHandler();
        _client.StartGameSessionAsync(_sessionId).Returns(false);

        // Act
        var result = await handler.TryStartGameSession();

        // Assert
        result.Should().BeFalse();
    }

    private async Task<GameSessionPageHandler> CreateHandler(bool isAuthorized = true, bool isConfigured = true) {
        if (isAuthorized)
            EnsureAuthenticated();
        var userId = CurrentUser?.Id ?? Guid.NewGuid();
        var player = new Participant { UserId = userId, Type = PlayerType.Master };
        var session = new GameSessionDetails {
            Id = _sessionId,
            Title = "Test GameSession",
            OwnerId = userId,
            Players = [player],
        };
        _client.GetGameSessionByIdAsync(_sessionId).Returns(session);
        var user = new LoggedUser(userId, CurrentUser?.DisplayName ?? "Test User", CurrentUser?.IsAdministrator ?? false);
        _page.User.Returns(user);
        var handler = new GameSessionPageHandler(_page);
        if (isConfigured)
            await handler.LoadSessionAsync(_client, _sessionId);
        return handler;
    }
}