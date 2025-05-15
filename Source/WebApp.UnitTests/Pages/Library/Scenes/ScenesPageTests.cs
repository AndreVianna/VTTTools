namespace VttTools.WebApp.Pages.Library.Scenes;

public class ScenesPageTests
    : ComponentTestContext {
    private readonly ILibraryClient _client = Substitute.For<ILibraryClient>();
    private static readonly Guid _adventureId = Guid.NewGuid();
    private readonly Scene[] _defaultScenes = [
        new() {
            Name = "Scene 1.1",
            AdventureId = _adventureId,
            Description = "Description 1",
            IsListed = true,
            IsPublic = true,
        },
        new() {
            Name = "Scene 1.2",
            AdventureId = _adventureId,
            Description = "Description 2",
            IsListed = true,
            IsPublic = true,
        }];

    public ScenesPageTests() {
        Services.AddScoped(_ => _client);
        _client.GetScenesAsync(Arg.Any<Guid>()).Returns(_defaultScenes);
        EnsureAuthenticated();
    }

    [Fact]
    public void BeforeIsReady_RendersLoadingState() {
        // Arrange
        _client.GetScenesAsync(Arg.Any<Guid>()).Returns(Task.Delay(1000, CancellationToken).ContinueWith(_ => _defaultScenes));

        // Act
        var cut = RenderComponent<ScenesPage>(ps => ps.Add(p => p.AdventureId, _adventureId));

        // Assert
        cut.Instance.State.AdventureId.Should().Be(_adventureId);
        cut.Markup.Should().Contain("<h1>Scenes</h1>");
        cut.Markup.Should().Contain("""<span class="visually-hidden">Loading...</span>""");
    }

    [Fact]
    public void WhenIsReady_WithNoScenes_RendersAsEmpty() {
        // Arrange
        _client.GetScenesAsync(Arg.Any<Guid>()).Returns([]);

        // Act
        var cut = RenderComponent<ScenesPage>(ps => ps.Add(p => p.AdventureId, _adventureId));
        cut.WaitForState(() => cut.Instance.IsReady, TimeSpan.FromMilliseconds(500));

        // Assert
        cut.Instance.State.AdventureId.Should().Be(_adventureId);
        cut.Markup.Should().Contain("<h1>Scenes</h1>");
        cut.Markup.Should().NotContain("""<span class="visually-hidden">Loading...</span>""");
        cut.Markup.Should().Contain("You don't have any scenes yet. Create a new one to get started!");
    }

    [Fact]
    public void WhenIsReady_RendersSceneList() {
        // Act
        var cut = RenderComponent<ScenesPage>(ps => ps.Add(p => p.AdventureId, _adventureId));
        cut.WaitForState(() => cut.Instance.IsReady, TimeSpan.FromMilliseconds(500));

        // Assert
        cut.Markup.Should().Contain("<h1>Scenes</h1>");
        cut.Markup.Should().NotContain("""<span class="visually-hidden">Loading...</span>""");
        var rows = cut.FindAll("tbody tr");
        rows.Count.Should().Be(2);
    }

    [Fact]
    public void WhenCreateButtonIsClicked_CreatesSceneMethod() {
        // Arrange
        var cut = RenderComponent<ScenesPage>(ps => ps.Add(p => p.AdventureId, _adventureId));
        cut.WaitForState(() => cut.Instance.IsReady, TimeSpan.FromMilliseconds(500));
        cut.Find("#create-scene-name-input").Change("New Scene");
        var newScene = new Scene {
            Name = "New Scene",
            OwnerId = CurrentUser!.Id,
            Description = "New Scene Description",
        };
        _client.CreateSceneAsync(Arg.Any<Guid>(), Arg.Any<AddNewSceneRequest>()).Returns(newScene);

        // Act
        cut.Find("#create-scene").Click();

        // Assert
        _client.Received(1).CreateSceneAsync(Arg.Any<Guid>(), Arg.Any<AddNewSceneRequest>());
    }

    [Fact]
    public void WhenEditButtonIsClicked_ShowsEditModal() {
        // Arrange
        var sceneId = _defaultScenes[0].Id;
        var cut = RenderComponent<ScenesPage>(ps => ps.Add(p => p.AdventureId, _adventureId));
        cut.WaitForState(() => cut.Instance.IsReady, TimeSpan.FromMilliseconds(500));
        _client.UpdateSceneAsync(Arg.Any<Guid>(), Arg.Any<UpdateSceneRequest>()).Returns(Result.Success());

        // Act
        cut.Find($"#edit-scene-{sceneId}").Click();
        cut.WaitForState(() => cut.Instance.State.IsEditing, TimeSpan.FromMilliseconds(500));

        // Assert
        cut.Find("#edit-scene-dialog").Should().NotBeNull();
        var nameInput = cut.Find("#edit-scene-name-input");
        nameInput.GetAttribute("value").Should().Be("Scene 1.1");
        cut.Instance.State.EditInput.Id.Should().Be(_defaultScenes[0].Id);
    }

    [Fact]
    public void WhenDeleteButtonIsClicked_DeletesScene() {
        // Arrange
        var sceneId = _defaultScenes[0].Id;
        var cut = RenderComponent<ScenesPage>(ps => ps.Add(p => p.AdventureId, _adventureId));
        cut.WaitForState(() => cut.Instance.IsReady, TimeSpan.FromMilliseconds(500));
        _client.RemoveSceneAsync(Arg.Any<Guid>(), Arg.Any<Guid>()).Returns(true);

        // Act
        cut.Find($"#delete-scene-{sceneId}").Click();

        // Assert
        _client.Received(1).RemoveSceneAsync(_adventureId, _defaultScenes[0].Id);
    }

    [Fact]
    public void WhenCloneButtonIsClicked_ClonesScene() {
        // Act
        var sceneId = _defaultScenes[0].Id;
        var cut = RenderComponent<ScenesPage>(ps => ps.Add(p => p.AdventureId, _adventureId));
        cut.WaitForState(() => cut.Instance.IsReady, TimeSpan.FromMilliseconds(500));
        var clonedScene = new Scene {
            Name = _defaultScenes[0].Name,
            OwnerId = CurrentUser!.Id,
            Description = _defaultScenes[0].Description,
        };
        _client.CloneSceneAsync(Arg.Any<Guid>(), Arg.Any<AddClonedSceneRequest>()).Returns(clonedScene);

        // Act
        cut.Find($"#clone-scene-{sceneId}").Click();

        // Assert
        _client.Received(1).CloneSceneAsync(Arg.Any<Guid>(), Arg.Any<AddClonedSceneRequest>());
    }
}