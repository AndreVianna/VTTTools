namespace VttTools.WebApp.Pages.Library.Scenes;

public class ScenesPageHandlerTests
    : ComponentTestContext {
    private readonly ScenesPage _page = Substitute.For<ScenesPage>();
    private readonly ILibraryClient _client = Substitute.For<ILibraryClient>();
    private readonly Guid _adventureId = Guid.NewGuid();

    public ScenesPageHandlerTests() {
        var scenes = new[] {
            new Scene { AdventureId = _adventureId, Name = "Scene 1", Description = "Scene 1 Description", IsListed = true, IsPublic = true },
            new Scene { AdventureId = _adventureId, Name = "Scene 2", Description = "Scene 2 Description", IsListed = true, IsPublic = true },
        };
        _client.GetScenesAsync(_adventureId).Returns(scenes);
        _page.HttpContext.Returns(HttpContext);
        _page.NavigationManager.Returns(NavigationManager);
        _page.Logger.Returns(NullLogger.Instance);
    }

    [Fact]
    public async Task InitializeAsync_LoadsScenes_And_ReturnsHandler() {
        // Arrange & Act
        var handler = await CreateHandler();

        // Assert
        handler.Should().NotBeNull();
        _page.State.AdventureId.Should().Be(_adventureId);
        _page.State.Scenes.Should().NotBeEmpty();
    }

    [Fact]
    public async Task CreateSceneAsync_WithValidInput_CreatesSceneAndResetsInput() {
        // Arrange
        var handler = await CreateHandler();
        _page.State.CreateInput = new() {
            Name = "New Scene",
            Description = "New Scene Description",
        };
        var newScene = new Scene {
            Name = "New Scene",
            Description = "New Scene Description",
        };

        _client.CreateSceneAsync(Arg.Any<Guid>(), Arg.Any<AddNewSceneRequest>()).Returns(newScene);

        // Act
        await handler.SaveCreatedScene();

        // Assert
        _page.State.Scenes.Should().HaveCount(3);
    }

    [Fact]
    public async Task CreateSceneAsync_WithInvalidInput_ReturnsErrors() {
        // Arrange
        var handler = await CreateHandler();
        _page.State.CreateInput = new() {
            Name = "New Scene",
            Description = "New Scene Description",
        };

        _client.CreateSceneAsync(Arg.Any<Guid>(), Arg.Any<AddNewSceneRequest>()).Returns(Result.Failure("Some error"));

        // Act
        await handler.SaveCreatedScene();

        // Assert
        _page.State.Scenes.Should().HaveCount(2);
        _page.State.Errors.Should().NotBeEmpty();
        _page.State.Errors[0].Message.Should().Be("Some error");
    }

    [Fact]
    public async Task DeleteSceneAsync_RemovesSceneAndReloadsScenes() {
        // Arrange
        var handler = await CreateHandler();
        var sceneId = _page.State.Scenes[1].Id;
        _client.RemoveSceneAsync(Arg.Any<Guid>(), Arg.Any<Guid>()).Returns(true);

        // Act
        await handler.DeleteScene(sceneId);

        // Assert
        _page.State.Scenes.Should().HaveCount(1);
    }

    [Fact]
    public async Task CloneSceneAsync_ClonesSceneAndReloadsScenes() {
        // Arrange
        var handler = await CreateHandler();
        var adventureId = Guid.NewGuid();
        var sceneId = Guid.NewGuid();
        var originalScene = new Scene { Id = sceneId, Name = "Scene 1" };
        _page.State.Scenes = [originalScene];
        var clonedScene = new Scene { Id = Guid.NewGuid(), Name = "Scene 1 (Copy)" };
        var scenesAfterClone = new[] {
            originalScene,
            clonedScene,
        };

        _client.CloneSceneAsync(Arg.Any<Guid>(), Arg.Any<AddClonedSceneRequest>()).Returns(clonedScene);

        // Act
        await handler.CloneScene(adventureId);

        // Assert
        _page.State.Scenes.Should().BeEquivalentTo(scenesAfterClone);
    }

    [Fact]
    public async Task StartEdit_SetsEditingStateAndPopulatesInput() {
        // Arrange
        var handler = await CreateHandler();
        var scene = new Scene {
            Name = "Scene to Edit",
            Description = "Scene Description",
        };

        // Act
        handler.StartSceneEditing(scene);

        // Assert
        _page.State.IsEditing.Should().BeTrue();
        _page.State.EditInput.Id.Should().Be(scene.Id);
        _page.State.EditInput.Name.Should().Be(scene.Name);
        _page.State.EditInput.Description.Should().Be(scene.Description);
    }

    [Fact]
    public async Task CancelEdit_ResetIsEditingFlag() {
        // Arrange
        var handler = await CreateHandler();
        _page.State.IsEditing = true;
        _page.State.EditInput = new() {
            Id = Guid.NewGuid(),
            Name = "Updated Scene",
            Description = "Updated Scene Description",
        };

        // Act
        handler.EndSceneEditing();

        // Assert
        _page.State.IsEditing.Should().BeFalse();
    }

    [Fact]
    public async Task SaveEditAsync_WithValidInput_UpdatesSceneAndReloadsScenes() {
        // Arrange
        var handler = await CreateHandler();
        _page.State.IsEditing = true;
        var sceneId = Guid.NewGuid();
        var sceneBeforeEdit = new Scene {
            Id = sceneId,
            Name = "Scene 1",
            Description = "Scene 1 Description",
        };
        var scenesBeforeEdit = new List<Scene> { sceneBeforeEdit };
        _page.State.EditInput = new() {
            Id = sceneId,
            Name = "Updated Scene",
            Description = "Updated Scene Description",
        };
        _page.State.Scenes = scenesBeforeEdit;
        var scenesAfterEdit = new[] {
            new Scene {
                Id = sceneId,
                Name = "Updated Scene",
                Description = "Updated Scene Description",
            },
        };

        _client.UpdateSceneAsync(Arg.Any<Guid>(), Arg.Any<UpdateSceneRequest>())
            .Returns(Result.Success());

        // Act
        await handler.SaveEditedScene();

        // Assert
        _page.State.IsEditing.Should().BeFalse();
        _page.State.Scenes.Should().BeEquivalentTo(scenesAfterEdit);
    }

    [Fact]
    public async Task SaveEditAsync_WithInvalidInput_ReturnsErrors() {
        // Arrange
        var handler = await CreateHandler();
        _page.State.IsEditing = true;
        var sceneId = Guid.NewGuid();
        var sceneBeforeEdit = new Scene {
            Id = sceneId,
            Name = "Scene 1",
            Description = "Scene 1 Description",
        };
        var scenesBeforeEdit = new List<Scene> { sceneBeforeEdit };
        _page.State.EditInput = new() {
            Id = sceneId,
            Name = "Updated Scene",
            Description = "Updated Scene Description",
        };
        _page.State.Scenes = scenesBeforeEdit;

        _client.UpdateSceneAsync(Arg.Any<Guid>(), Arg.Any<UpdateSceneRequest>())
            .Returns(Result.Failure("Some errors."));

        // Act
        await handler.SaveEditedScene();

        // Assert
        _page.State.IsEditing.Should().BeTrue();
        _page.State.Errors.Should().NotBeEmpty();
        _page.State.Errors[0].Message.Should().Be("Some errors.");
        _page.State.Scenes.Should().BeEquivalentTo(scenesBeforeEdit);
    }

    private async Task<ScenesPageHandler> CreateHandler(bool isAuthorized = true, bool isConfigured = true) {
        if (isAuthorized) EnsureAuthenticated();
        var handler = new ScenesPageHandler(_page);
        if (isConfigured) await handler.LoadScenesAsync(_adventureId, _client);
        return handler;
    }
}