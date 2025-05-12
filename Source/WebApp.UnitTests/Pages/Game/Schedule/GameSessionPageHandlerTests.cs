namespace VttTools.WebApp.Pages.Game.Schedule;

public class GameSessionPageHandlerTests
    : ComponentTestContext {
    private readonly Guid _sessionId = Guid.NewGuid();
    private readonly IGameClient _client = Substitute.For<IGameClient>();

    [Fact]
    public async Task TryConfigureAsync_WithValidGameSessionId_ReturnsTrue() {
        // Arrange
        var handler = await CreateHandler();

        // Act
        var result = await handler.TryLoadSessionAsync(_client, _sessionId);

        // Assert
        result.Should().BeTrue();
        handler.State.GameSession.Should().NotBeNull();
        handler.State.CanEdit.Should().BeTrue();
        handler.State.CanStart.Should().BeTrue();
    }

    [Fact]
    public async Task TryConfigureAsync_WithInvalidGameSessionId_ReturnsFalse() {
        // Arrange
        var handler = await CreateHandler();
        _client.GetGameSessionByIdAsync(_sessionId).Returns((GameSession?)null);

        // Act
        var result = await handler.TryLoadSessionAsync(_client, _sessionId);

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public async Task OpenEditGameSessionDialog_ClearErrorsResetsInputAndShowsDialog() {
        // Arrange
        var handler = await CreateHandler();

        // Arrange
        var expectedInput = new GameSessionInputModel {
            Title = "Test GameSession",
        };

        // Act
        handler.OpenEditGameSessionDialog();

        // Assert
        handler.State.Input.Should().BeEquivalentTo(expectedInput);
        handler.State.ShowEditDialog.Should().BeTrue();
    }

    [Fact]
    public async Task CloseEditGameSessionDialog_HidesDialog() {
        // Arrange
        var handler = await CreateHandler();
        handler.State.ShowEditDialog = true;

        // Act
        handler.CloseEditGameSessionDialog();

        // Assert
        handler.State.ShowEditDialog.Should().BeFalse();
    }

    [Fact]
    public async Task UpdateGameSession_WithValidInput_UpdatesGameSessionAndClosesDialog() {
        // Arrange
        var handler = await CreateHandler();
        handler.State.ShowEditDialog = true;
        handler.State.Input = new() {
            Title = "Updated GameSession Name",
        };
        var updatedGameSession = new GameSession {
            Id = handler.State.GameSession.Id,
            Title = handler.State.Input.Title,
            OwnerId = handler.State.GameSession.OwnerId,
            Players = handler.State.GameSession.Players,
        };

        _client.UpdateGameSessionAsync(_sessionId, Arg.Any<UpdateGameSessionRequest>()).Returns(updatedGameSession);

        // Act
        await handler.UpdateGameSession();

        // Assert
        handler.State.ShowEditDialog.Should().BeFalse();
        handler.State.GameSession.Should().BeEquivalentTo(updatedGameSession);
    }

    [Fact]
    public async Task UpdateGameSession_WithValidationError_SetsErrorsAndDoesNotUpdate() {
        // Arrange
        var handler = await CreateHandler();
        handler.State.ShowEditDialog = true;
        _client.UpdateGameSessionAsync(_sessionId, Arg.Any<UpdateGameSessionRequest>()).Returns(Result.Failure("Some error."));

        // Act
        await handler.UpdateGameSession();

        // Assert
        handler.State.ShowEditDialog.Should().BeTrue();
        handler.State.Input.Errors.Should().NotBeEmpty();
        handler.State.Input.Errors[0].Message.Should().Be("Some error.");
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
        var player = new Player { UserId = userId, Type = PlayerType.Master };
        var session = new GameSession {
            Id = _sessionId,
            Title = "Test GameSession",
            OwnerId = userId,
            Players = [player],
        };
        _client.GetGameSessionByIdAsync(_sessionId).Returns(session);
        var page = Substitute.For<IAuthenticatedPage>();
        page.UserId.Returns(userId);
        page.HttpContext.Returns(HttpContext);
        page.NavigationManager.Returns(NavigationManager);
        page.Logger.Returns(NullLogger.Instance);
        var handler = new GameSessionPageHandler(page);
        if (isConfigured)
            await handler.TryLoadSessionAsync(_client, _sessionId);
        return handler;
    }
}