namespace VttTools.WebApp.Pages.Library;

public class ScenesPageHandlerTests
    : WebAppTestContext {
    private readonly Guid _adventureId = Guid.NewGuid();
    private readonly IGameService _service = Substitute.For<IGameService>();

    public ScenesPageHandlerTests() {
        var scenes = new[] {
            new Scene { Name = "Scene 1", Visibility = Visibility.Public },
            new Scene { Name = "Scene 2", Visibility = Visibility.Private },
        };
        _service.GetScenesAsync(_adventureId).Returns(scenes);
    }

    [Fact]
    public async Task InitializeAsync_LoadsScenes_And_ReturnsHandler() {
        // Arrange & Act
        var handler = await CreateHandler();

        // Assert
        handler.Should().NotBeNull();
        handler.State.AdventureId.Should().Be(_adventureId);
        handler.State.Scenes.Should().NotBeEmpty();
    }

    [Fact]
    public async Task CreateSceneAsync_WithValidInput_CreatesSceneAndResetsInput() {
        // Arrange
        var handler = await CreateHandler();
        handler.State.CreateInput = new() {
            Name = "New Scene",
            Visibility = Visibility.Private,
        };
        var newScene = new Scene {
            Name = "New Scene",
            Visibility = Visibility.Private,
        };

        _service.CreateSceneAsync(Arg.Any<Guid>(), Arg.Any<CreateSceneRequest>()).Returns(newScene);

        // Act
        await handler.SaveCreatedScene();

        // Assert
        handler.State.Scenes.Should().HaveCount(3);
    }

    [Fact]
    public async Task CreateSceneAsync_WithInvalidInput_ReturnsErrors() {
        // Arrange
        var handler = await CreateHandler();
        handler.State.CreateInput = new() {
            Name = "New Scene",
            Visibility = Visibility.Private,
        };

        _service.CreateSceneAsync(Arg.Any<Guid>(), Arg.Any<CreateSceneRequest>()).Returns(Result.Failure("Some error"));

        // Act
        await handler.SaveCreatedScene();

        // Assert
        handler.State.Scenes.Should().HaveCount(2);
        handler.State.CreateInput.Errors.Should().NotBeEmpty();
        handler.State.CreateInput.Errors[0].Message.Should().Be("Some error");
    }

    [Fact]
    public async Task DeleteSceneAsync_RemovesSceneAndReloadsScenes() {
        // Arrange
        var handler = await CreateHandler();
        var sceneId = handler.State.Scenes[1].Id;
        _service.RemoveSceneAsync(Arg.Any<Guid>(), Arg.Any<Guid>()).Returns(true);

        // Act
        await handler.DeleteScene(sceneId);

        // Assert
        handler.State.Scenes.Should().HaveCount(1);
    }

    [Fact]
    public async Task CloneSceneAsync_ClonesSceneAndReloadsScenes() {
        // Arrange
        var handler = await CreateHandler();
        var adventureId = Guid.NewGuid();
        var sceneId = Guid.NewGuid();
        var originalScene = new Scene { Id = sceneId, Name = "Scene 1" };
        handler.State.Scenes = [originalScene];
        var clonedScene = new Scene { Id = Guid.NewGuid(), Name = "Scene 1 (Copy)" };
        var scenesAfterClone = new[] {
            originalScene,
            clonedScene,
        };

        _service.CloneSceneAsync(Arg.Any<Guid>(), Arg.Any<AddClonedSceneRequest>()).Returns(clonedScene);

        // Act
        await handler.CloneScene(adventureId);

        // Assert
        handler.State.Scenes.Should().BeEquivalentTo(scenesAfterClone);
    }

    [Fact]
    public async Task StartEdit_SetsEditingStateAndPopulatesInput() {
        // Arrange
        var handler = await CreateHandler();
        var scene = new Scene {
            Name = "Scene to Edit",
            Visibility = Visibility.Public,
        };

        // Act
        handler.StartSceneEditing(scene);

        // Assert
        handler.State.IsEditing.Should().BeTrue();
        handler.State.EditInput.Id.Should().Be(scene.Id);
        handler.State.EditInput.Name.Should().Be(scene.Name);
        handler.State.EditInput.Visibility.Should().Be(scene.Visibility);
    }

    [Fact]
    public async Task CancelEdit_ResetIsEditingFlag() {
        // Arrange
        var handler = await CreateHandler();
        handler.State.IsEditing = true;
        handler.State.EditInput = new() {
            Id = Guid.NewGuid(),
            Name = "Updated Scene",
            Visibility = Visibility.Public,
        };

        // Act
        handler.EndSceneEditing();

        // Assert
        handler.State.IsEditing.Should().BeFalse();
    }

    [Fact]
    public async Task SaveEditAsync_WithValidInput_UpdatesSceneAndReloadsScenes() {
        // Arrange
        var handler = await CreateHandler();
        handler.State.IsEditing = true;
        var sceneId = Guid.NewGuid();
        var sceneBeforeEdit = new Scene {
            Id = sceneId,
            Name = "Scene 1",
            Visibility = Visibility.Hidden,
        };
        var scenesBeforeEdit = new List<Scene> { sceneBeforeEdit };
        handler.State.EditInput = new() {
            Id = sceneId,
            Name = "Updated Scene",
            Visibility = Visibility.Public,
        };
        handler.State.EditInput = new() {
            Id = sceneId,
            Name = "Updated Scene",
            Visibility = Visibility.Public,
        };
        handler.State.Scenes = scenesBeforeEdit;
        var scenesAfterEdit = new[] {
            new Scene { Id = sceneId, Name = "Updated Scene", Visibility = Visibility.Public },
        };

        _service.UpdateSceneAsync(Arg.Any<Guid>(), Arg.Any<UpdateSceneRequest>())
            .Returns(Result.Success());

        // Act
        await handler.SaveEditedScene();

        // Assert
        handler.State.IsEditing.Should().BeFalse();
        handler.State.Scenes.Should().BeEquivalentTo(scenesAfterEdit);
    }

    [Fact]
    public async Task SaveEditAsync_WithInvalidInput_ReturnsErrors() {
        // Arrange
        var handler = await CreateHandler();
        handler.State.IsEditing = true;
        var sceneId = Guid.NewGuid();
        var sceneBeforeEdit = new Scene {
            Id = sceneId,
            Name = "Scene 1",
            Visibility = Visibility.Hidden,
        };
        var scenesBeforeEdit = new List<Scene> { sceneBeforeEdit };
        handler.State.EditInput = new() {
            Id = sceneId,
            Name = "Updated Scene",
            Visibility = Visibility.Public,
        };
        handler.State.Scenes = scenesBeforeEdit;

        _service.UpdateSceneAsync(Arg.Any<Guid>(), Arg.Any<UpdateSceneRequest>())
            .Returns(Result.Failure("Some errors."));

        // Act
        await handler.SaveEditedScene();

        // Assert
        handler.State.IsEditing.Should().BeTrue();
        handler.State.EditInput.Errors.Should().NotBeEmpty();
        handler.State.EditInput.Errors[0].Message.Should().Be("Some errors.");
        handler.State.Scenes.Should().BeEquivalentTo(scenesBeforeEdit);
    }

    private async Task<ScenesPageHandler> CreateHandler(bool isAuthorized = true, bool isConfigured = true) {
        if (isAuthorized)
            EnsureAuthenticated();
        var handler = new ScenesPageHandler(HttpContext, NavigationManager, CurrentUser!, NullLoggerFactory.Instance);
        if (isConfigured)
            await handler.ConfigureAsync(_adventureId, _service);
        return handler;
    }
}