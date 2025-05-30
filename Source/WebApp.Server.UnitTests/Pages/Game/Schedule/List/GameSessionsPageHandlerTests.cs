namespace VttTools.WebApp.Pages.Game.Schedule.List;

public class GameSessionsPageHandlerTests
    : ComponentTestContext {
    private readonly GameSessionsPage _page = Substitute.For<GameSessionsPage>();
    private readonly IGameSessionsHttpClient _gameSessions = Substitute.For<IGameSessionsHttpClient>();

    public GameSessionsPageHandlerTests() {
        _page.HttpContext.Returns(HttpContext);
        _page.NavigationManager.Returns(NavigationManager);
        _page.Logger.Returns(NullLogger.Instance);
    }

    [Fact]
    public async Task InitializeAsync_LoadsGameSessions() {
        // Arrange & Act
        var handler = await CreateInitializedHandler();

        // Assert
        handler.Should().NotBeNull();
        _page.State.GameSessions.Should().NotBeEmpty();
    }

    [Fact]
    public async Task TryJoinGameSession_CallsApiAndReturnsResult() {
        // Arrange
        var handler = await CreateInitializedHandler();
        var sessionId = Guid.NewGuid();
        _gameSessions.JoinGameSessionAsync(sessionId).Returns(true);

        // Act
        var result = await handler.TryJoinGameSession(sessionId);

        // Assert
        result.Should().BeTrue();
    }

    [Fact]
    public async Task TryJoinGameSession_ReturnsFalse_OnApiError() {
        // Arrange
        var handler = await CreateInitializedHandler();
        var sessionId = Guid.NewGuid();
        _gameSessions.JoinGameSessionAsync(sessionId).Returns(false);

        // Act
        var result = await handler.TryJoinGameSession(sessionId);

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public async Task DeleteGameSession_RemovesGameSessionAndReloadsState() {
        // Arrange
        var handler = await CreateInitializedHandler();
        var sessionId = Guid.NewGuid();
        var session = new GameSessionListItem { Id = sessionId, Title = "Session to Delete" };

        _page.State.GameSessions = [session];

        // Act
        await handler.DeleteGameSession(sessionId);

        // Assert
        _page.State.GameSessions.Should().NotContain(session);
    }

    private async Task<GameSessionsPageHandler> CreateInitializedHandler(bool isAuthorized = true, bool isConfigured = true) {
        var sessions = new GameSessionListItem[] {
            new() { Title = "Session 1" },
            new() { Title = "Session 2" },
        };
        if (isAuthorized) EnsureAuthenticated();
        var handler = new GameSessionsPageHandler(_page);
        _gameSessions.GetGameSessionsAsync().Returns(sessions);
        if (isConfigured) await handler.LoadGameSessionAsync(_gameSessions);
        return handler;
    }
}