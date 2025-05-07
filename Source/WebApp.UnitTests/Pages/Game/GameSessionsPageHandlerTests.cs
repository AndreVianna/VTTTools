using VttTools.WebApp.Pages.GameSessions;

namespace VttTools.WebApp.Pages.Game;

public class GameSessionsPageHandlerTests
    : WebAppTestContext {
    private readonly IGameService _service = Substitute.For<IGameService>();

    [Fact]
    public async Task InitializeAsync_LoadsGameSessions() {
        // Arrange & Act
        var handler = await CreateInitializedHandler();

        // Assert
        handler.Should().NotBeNull();
        handler.State.GameSessions.Should().NotBeEmpty();
    }

    [Fact]
    public async Task OpenCreateGameSessionDialog_LoadsAdventuresAndResetState() {
        // Arrange
        var handler = await CreateInitializedHandler();
        var adventures = new[] {
            new Adventure { Name = "Adventure 1" },
        };
        _service.GetAdventuresAsync().Returns(adventures);

        // Act
        await handler.StartGameSessionCreating();

        // Assert
        handler.State.IsCreating.Should().BeTrue();
        handler.State.Input.Subject.Should().BeEmpty();
        handler.State.Input.AdventureId.Should().Be(adventures[0].Id);
        handler.State.Input.Scenes.Should().BeEmpty();
        handler.State.Input.SceneId.Should().BeEmpty();
        handler.State.Input.Adventures.Should().BeEquivalentTo(adventures);
        handler.State.Input.Errors.Should().BeEmpty();
    }

    [Fact]
    public async Task CloseCreateGameSessionDialog_SetShowCreateDialogToFalse() {
        // Arrange
        var handler = await CreateInitializedHandler();
        handler.State.IsCreating = true;

        // Act
        handler.EndGameSessionCreating();

        // Assert
        handler.State.IsCreating.Should().BeFalse();
    }

    [Fact]
    public async Task CreateGameSession_WithValidData_CreatesGameSessionAndClosesDialog() {
        // Arrange
        var handler = await CreateInitializedHandler();
        var sceneId = Guid.NewGuid();
        handler.State.IsCreating = true;
        handler.State.Input.Subject = "New GameSession";
        handler.State.Input.SceneId = sceneId;

        // Setup response
        var expectedGameSession = new GameSession { Id = Guid.NewGuid(), Title = "New GameSession" };
        _service.CreateGameSessionAsync(Arg.Any<CreateGameSessionRequest>()).Returns(expectedGameSession);

        // Act
        await handler.SaveCreatedGameSession();

        // Assert
        handler.State.IsCreating.Should().BeFalse();
        handler.State.GameSessions.Should().Contain(expectedGameSession);
    }

    [Fact]
    public async Task CreateGameSession_WithValidationError_SetsErrorAndDoesNotCreate() {
        // Arrange
        var handler = await CreateInitializedHandler();
        var sceneId = Guid.NewGuid();
        handler.State.IsCreating = true;
        handler.State.Input.Subject = string.Empty;
        handler.State.Input.SceneId = sceneId;
        _service.CreateGameSessionAsync(Arg.Any<CreateGameSessionRequest>()).Returns(Result.Failure("Some error."));

        // Act
        await handler.SaveCreatedGameSession();

        // Assert
        handler.State.IsCreating.Should().BeTrue();
        handler.State.Input.Errors.Should().NotBeEmpty();
        handler.State.Input.Errors[0].Message.Should().Be("Some error.");
    }

    [Fact]
    public async Task TryJoinGameSession_CallsApiAndReturnsResult() {
        // Arrange
        var handler = await CreateInitializedHandler();
        var sessionId = Guid.NewGuid();
        _service.JoinGameSessionAsync(sessionId).Returns(true);

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
        _service.JoinGameSessionAsync(sessionId).Returns(false);

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

        handler.State.GameSessions = [session];

        // Act
        await handler.DeleteGameSession(sessionId);

        // Assert
        handler.State.GameSessions.Should().NotContain(session);
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
        _service.GetScenesAsync(adventureId).Returns(scenes);

        // Act
        await handler.LoadScenes(adventureId);

        // Assert
        handler.State.Input.Scenes.Should().BeEquivalentTo(scenes);
        handler.State.Input.SceneId.Should().Be(scenes[0].Id);
    }

    [Fact]
    public async Task ReloadAdventureScenes_WithInvalidAdventureId_ClearSelectedId() {
        // Arrange
        var handler = await CreateInitializedHandler();
        handler.State.Input.AdventureId = Guid.NewGuid();

        // Act
        await handler.LoadScenes(Guid.Empty);

        // Assert
        handler.State.Input.Scenes.Should().BeEmpty();
        handler.State.Input.SceneId.Should().BeEmpty();
    }

    private async Task<GameSessionsPageHandler> CreateInitializedHandler(bool isAuthorized = true, bool isConfigured = true) {
        var sessions = new[] {
            new GameSession { Title = "Session 1" },
            new GameSession { Title = "Session 2" },
        };
        if (isAuthorized)
            EnsureAuthenticated();
        var handler = new GameSessionsPageHandler(HttpContext, NavigationManager, CurrentUser!, NullLoggerFactory.Instance);
        _service.GetGameSessionsAsync().Returns(sessions);
        if (isConfigured)
            await handler.ConfigureAsync(_service);
        return handler;
    }
}