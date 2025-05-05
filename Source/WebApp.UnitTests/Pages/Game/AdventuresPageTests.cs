namespace VttTools.WebApp.Pages.Game;

public class AdventuresPageTests
    : WebAppTestContext {
    private readonly IGameService _service = Substitute.For<IGameService>();
    private readonly Adventure[] _defaultAdventures;

    public AdventuresPageTests() {
        UseDefaultUser();
        Services.AddScoped<IGameService>(_ => _service);
        _defaultAdventures = [
        new() {
            Name = "Adventure 1",
            Visibility = Visibility.Public,
            OwnerId = CurrentUser.Id,
        },
        new() {
            Name = "Adventure 2",
            Visibility = Visibility.Private,
            OwnerId = Guid.NewGuid(),
        }];
        _service.GetAdventuresAsync().Returns(_defaultAdventures);
    }

    [Fact]
    public void BeforeIsReady_RendersLoadingState() {
        // Arrange
        _service.GetAdventuresAsync().Returns(Task.Delay(1000, CancellationToken).ContinueWith(_ => _defaultAdventures));

        // Act
        var cut = RenderComponent<AdventuresPage>();

        // Assert
        cut.Markup.Should().Contain("<h1>Adventures</h1>");
        cut.Markup.Should().Contain("""<span class="visually-hidden">Loading...</span>""");
    }

    [Fact]
    public void WhenIsReady_WithNoAdventures_RendersAsEmpty() {
        // Arrange
        _service.GetAdventuresAsync().Returns([]);

        // Act
        var cut = RenderComponent<AdventuresPage>();
        cut.WaitForState(() => cut.Instance.IsReady, TimeSpan.FromMilliseconds(500));

        // Assert
        cut.Markup.Should().Contain("<h1>Adventures</h1>");
        cut.Markup.Should().NotContain("""<span class="visually-hidden">Loading...</span>""");
        cut.Markup.Should().Contain("You don't have any adventures yet. Create a new one to get started!");
    }

    [Fact]
    public void WhenIsReady_RendersAdventureList() {
        // Act
        var cut = RenderComponent<AdventuresPage>();
        cut.WaitForState(() => cut.Instance.IsReady, TimeSpan.FromMilliseconds(500));

        // Assert
        cut.Markup.Should().Contain("<h1>Adventures</h1>");
        cut.Markup.Should().NotContain("""<span class="visually-hidden">Loading...</span>""");
        var rows = cut.FindAll("tbody tr");
        rows.Count.Should().Be(2);
    }

    [Fact]
    public void WhenCreateButtonIsClicked_CreatesAdventureMethod() {
        // Arrange
        var cut = RenderComponent<AdventuresPage>();
        cut.WaitForState(() => cut.Instance.IsReady, TimeSpan.FromMilliseconds(500));
        var nameInput = cut.Find("input[placeholder='Name']");
        nameInput.Change("New Adventure");
        var newAdventure = new Adventure {
            Name = "New Adventure",
            OwnerId = CurrentUser!.Id,
            Visibility = Visibility.Hidden,
        };
        _service.CreateAdventureAsync(Arg.Any<CreateAdventureRequest>()).Returns(newAdventure);

        // Act
        cut.Find("#create-adventure").Click();

        // Assert
        _service.Received(1).CreateAdventureAsync(Arg.Any<CreateAdventureRequest>());
    }

    [Fact]
    public void WhenViewButtonIsClicked_NavigatesToAdventureEpisodes() {
        // Arrange
        var adventureId = _defaultAdventures[0].Id;
        var cut = RenderComponent<AdventuresPage>();
        var navigationSpy = cut.Instance.NavigationManager.Should().BeOfType<FakeNavigationManager>().Subject;
        cut.WaitForState(() => cut.Instance.IsReady, TimeSpan.FromMilliseconds(500));
        _service.DeleteAdventureAsync(Arg.Any<Guid>()).Returns(true);

        // Act
        cut.Find($"#view-adventure-{adventureId}").Click();

        // Assert
        navigationSpy.History.Should().ContainSingle(x => x.Uri == $"/adventures/{adventureId}/episodes");
    }

    [Fact]
    public void WhenEditButtonIsClicked_ShowsEditModal() {
        // Arrange
        var adventureId = _defaultAdventures[0].Id;
        var cut = RenderComponent<AdventuresPage>();
        cut.WaitForState(() => cut.Instance.IsReady, TimeSpan.FromMilliseconds(500));
        _service.UpdateAdventureAsync(Arg.Any<Guid>(), Arg.Any<UpdateAdventureRequest>()).Returns(Result.Success());

        // Act
        cut.Find($"#edit-adventure-{adventureId}").Click();
        cut.WaitForState(() => cut.Instance.State.IsEditing, TimeSpan.FromMilliseconds(500));

        // Assert
        cut.Find("#edit-adventure-dialog").Should().NotBeNull();
        var nameInput = cut.Find("#edit-adventure-name-input");
        nameInput.GetAttribute("value").Should().Be("Adventure 1");
        var visibilitySelect = cut.Find("#edit-adventure-visibility-input");
        visibilitySelect.GetAttribute("value").Should().Be(nameof(Visibility.Public));
        cut.Instance.State.EditInput.Id.Should().Be(_defaultAdventures[0].Id);
    }

    [Fact]
    public void WhenDeleteButtonIsClicked_DeletesAdventure() {
        // Arrange
        var adventureId = _defaultAdventures[0].Id;
        var cut = RenderComponent<AdventuresPage>();
        cut.WaitForState(() => cut.Instance.IsReady, TimeSpan.FromMilliseconds(500));
        _service.DeleteAdventureAsync(Arg.Any<Guid>()).Returns(true);

        // Act
        cut.Find($"#delete-adventure-{adventureId}").Click();

        // Assert
        _service.Received(1).DeleteAdventureAsync(_defaultAdventures[0].Id);
    }

    [Fact]
    public void WhenCloneButtonIsClicked_ClonesAdventure() {
        // Act
        var adventureId = _defaultAdventures[0].Id;
        var cut = RenderComponent<AdventuresPage>();
        cut.WaitForState(() => cut.Instance.IsReady, TimeSpan.FromMilliseconds(500));
        var clonedAdventure = new Adventure {
            Name = _defaultAdventures[0].Name,
            OwnerId = CurrentUser!.Id,
            Visibility = Visibility.Hidden,
        };
        _service.CloneAdventureAsync(Arg.Any<Guid>(), Arg.Any<CloneAdventureRequest>()).Returns(clonedAdventure);

        // Act
        cut.Find($"#clone-adventure-{adventureId}").Click();

        // Assert
        _service.Received(1).CloneAdventureAsync(Arg.Any<Guid>(), Arg.Any<CloneAdventureRequest>());
    }
}