namespace VttTools.WebApp.Pages.Game.Schedule;

public class GameSessionsPageHandlerTests
    : ComponentTestContext {
    private readonly GameSessionsPage _page = Substitute.For<GameSessionsPage>();
    private readonly IGameClient _gameClient = Substitute.For<IGameClient>();
    private readonly ILibraryClient _libraryClient = Substitute.For<ILibraryClient>();

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
    public async Task OpenCreateGameSessionDialog_LoadsAdventuresAndResetState() {
        // Arrange
        var handler = await CreateInitializedHandler();
        var adventures = new[] {
            new AdventureListItem { Name = "Adventure 1" },
        };
        _libraryClient.GetAdventuresAsync().Returns(adventures);

        // Act
        await handler.StartGameSessionCreating();

        // Assert
        _page.State.IsCreating.Should().BeTrue();
        _page.State.Input.Subject.Should().BeEmpty();
        _page.State.Input.AdventureId.Should().Be(adventures[0].Id);
        _page.State.Input.Scenes.Should().BeEmpty();
        _page.State.Input.SceneId.Should().BeEmpty();
        _page.State.Input.Adventures.Should().BeEquivalentTo(adventures);
        _page.State.Input.Errors.Should().BeEmpty();
    }

    [Fact]
    public async Task CloseCreateGameSessionDialog_SetShowCreateDialogToFalse() {
        // Arrange
        var handler = await CreateInitializedHandler();
        _page.State.IsCreating = true;

        // Act
        handler.EndGameSessionCreating();

        // Assert
        _page.State.IsCreating.Should().BeFalse();
    }

    [Fact]
    public async Task CreateGameSession_WithValidData_CreatesGameSessionAndClosesDialog() {
        // Arrange
        var handler = await CreateInitializedHandler();
        var sceneId = Guid.NewGuid();
        _page.State.IsCreating = true;
        _page.State.Input.Subject = "New GameSession";
        _page.State.Input.SceneId = sceneId;

        // Setup response
        var expectedGameSession = new GameSession { Id = Guid.NewGuid(), Title = "New GameSession" };
        _gameClient.CreateGameSessionAsync(Arg.Any<CreateGameSessionRequest>()).Returns(expectedGameSession);

        // Act
        await handler.SaveCreatedGameSession();

        // Assert
        _page.State.IsCreating.Should().BeFalse();
        _page.State.GameSessions.Should().Contain(expectedGameSession);
    }

    [Fact]
    public async Task CreateGameSession_WithValidationError_SetsErrorAndDoesNotCreate() {
        // Arrange
        var handler = await CreateInitializedHandler();
        var sceneId = Guid.NewGuid();
        _page.State.IsCreating = true;
        _page.State.Input.Subject = string.Empty;
        _page.State.Input.SceneId = sceneId;
        _gameClient.CreateGameSessionAsync(Arg.Any<CreateGameSessionRequest>()).Returns(Result.Failure("Some error."));

        // Act
        await handler.SaveCreatedGameSession();

        // Assert
        _page.State.IsCreating.Should().BeTrue();
        _page.State.Input.Errors.Should().NotBeEmpty();
        _page.State.Input.Errors[0].Message.Should().Be("Some error.");
    }

    [Fact]
    public async Task TryJoinGameSession_CallsApiAndReturnsResult() {
        // Arrange
        var handler = await CreateInitializedHandler();
        var sessionId = Guid.NewGuid();
        _gameClient.JoinGameSessionAsync(sessionId).Returns(true);

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
        _gameClient.JoinGameSessionAsync(sessionId).Returns(false);

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
        var session = new GameSession { Id = sessionId, Title = "Session to Delete" };

        _page.State.GameSessions = [session];

        // Act
        await handler.DeleteGameSession(sessionId);

        // Assert
        _page.State.GameSessions.Should().NotContain(session);
    }

    [Fact]
    public async Task ReloadAdventureScenes_WithValidAdventureId_LoadsScenes() {
        // Arrange
        var handler = await CreateInitializedHandler();
        var adventureId = Guid.NewGuid();
        var scenes = new[] {
            new Scene { Name = "Scene 1" },
            new Scene { Name = "Scene 2" },
        };
        _libraryClient.GetScenesAsync(adventureId).Returns(scenes);

        // Act
        await handler.LoadScenes(adventureId);

        // Assert
        _page.State.Input.Scenes.Should().BeEquivalentTo(scenes);
        _page.State.Input.SceneId.Should().Be(scenes[0].Id);
    }

    [Fact]
    public async Task ReloadAdventureScenes_WithInvalidAdventureId_ClearSelectedId() {
        // Arrange
        var handler = await CreateInitializedHandler();
        _page.State.Input.AdventureId = Guid.NewGuid();

        // Act
        await handler.LoadScenes(Guid.Empty);

        // Assert
        _page.State.Input.Scenes.Should().BeEmpty();
        _page.State.Input.SceneId.Should().BeEmpty();
    }

    private async Task<GameSessionsPageHandler> CreateInitializedHandler(bool isAuthorized = true, bool isConfigured = true) {
        var sessions = new[] {
            new GameSession { Title = "Session 1" },
            new GameSession { Title = "Session 2" },
        };
        if (isAuthorized) EnsureAuthenticated();
        var handler = new GameSessionsPageHandler(_page);
        _gameClient.GetGameSessionsAsync().Returns(sessions);
        if (isConfigured) await handler.LoadGameSessionAsync(_gameClient, _libraryClient);
        return handler;
    }
}