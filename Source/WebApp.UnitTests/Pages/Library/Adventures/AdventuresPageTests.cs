namespace VttTools.WebApp.Pages.Library.Adventures;

public class AdventuresPageTests
    : ComponentTestContext {
    private readonly ILibraryClient _client = Substitute.For<ILibraryClient>();
    private readonly AdventureListItem[] _defaultAdventures;

    public AdventuresPageTests() {
        EnsureAuthenticated();
        Services.AddScoped(_ => _client);
        _defaultAdventures = [
        new() {
            Name = "Adventure 1",
            Description = "Adventure 1 Description",
            Type = AdventureType.Survival,
            ImagePath = "path/to/image1.png",
            IsVisible = true,
            IsPublic = true,
        },
        new() {
            Name = "Adventure 2",
            Description = "Adventure 2 Description",
            Type = AdventureType.OpenWorld,
            ImagePath = "path/to/image2.png",
            IsVisible = false,
            IsPublic = false,
        }];
        _client.GetAdventuresAsync().Returns(_defaultAdventures);
    }

    [Fact]
    public void BeforeIsReady_RendersLoadingState() {
        // Arrange
        _client.GetAdventuresAsync().Returns(Task.Delay(1000, CancellationToken).ContinueWith(_ => _defaultAdventures));

        // Act
        var cut = RenderComponent<AdventuresPage>();

        // Assert
        cut.Markup.Should().Contain("<h1>Adventures</h1>");
        cut.Markup.Should().Contain("""<span class="visually-hidden">Loading...</span>""");
    }

    [Fact]
    public void WhenIsReady_WithNoAdventures_RendersAsEmpty() {
        // Arrange
        _client.GetAdventuresAsync().Returns([]);

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
        cut.Find("#create-adventure-name-input").Change("New Adventure");
        var newAdventure = new AdventureListItem {
            Name = "New Adventure",
            Description = "Adventure 1 Description",
            Type = AdventureType.Survival,
            ImagePath = "path/to/image1.png",
            IsVisible = true,
            IsPublic = true,
        };
        _client.CreateAdventureAsync(Arg.Any<CreateAdventureRequest>()).Returns(newAdventure);

        // Act
        cut.Find("#create-adventure").Click();

        // Assert
        _client.Received(1).CreateAdventureAsync(Arg.Any<CreateAdventureRequest>());
    }

    [Fact]
    public void WhenViewButtonIsClicked_NavigatesToAdventureScenes() {
        // Arrange
        var adventureId = _defaultAdventures[0].Id;
        var cut = RenderComponent<AdventuresPage>();
        var navigationSpy = cut.Instance.NavigationManager.Should().BeOfType<FakeNavigationManager>().Subject;
        cut.WaitForState(() => cut.Instance.IsReady, TimeSpan.FromMilliseconds(500));
        _client.DeleteAdventureAsync(Arg.Any<Guid>()).Returns(true);

        // Act
        cut.Find($"#view-adventure-{adventureId}").Click();

        // Assert
        navigationSpy.History.First().Uri.Should().Be($"/adventures/{adventureId}/scenes");
    }

    [Fact]
    public void WhenEditButtonIsClicked_ShowsEditModal() {
        // Arrange
        var adventureId = _defaultAdventures[0].Id;
        var cut = RenderComponent<AdventuresPage>();
        cut.WaitForState(() => cut.Instance.IsReady, TimeSpan.FromMilliseconds(500));
        _client.UpdateAdventureAsync(Arg.Any<Guid>(), Arg.Any<UpdateAdventureRequest>()).Returns(Result.Success());

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
        _client.DeleteAdventureAsync(Arg.Any<Guid>()).Returns(true);

        // Act
        cut.Find($"#delete-adventure-{adventureId}").Click();

        // Assert
        _client.Received(1).DeleteAdventureAsync(_defaultAdventures[0].Id);
    }

    [Fact]
    public void WhenCloneButtonIsClicked_ClonesAdventure() {
        // Act
        var adventureId = _defaultAdventures[0].Id;
        var cut = RenderComponent<AdventuresPage>();
        cut.WaitForState(() => cut.Instance.IsReady, TimeSpan.FromMilliseconds(500));
        var clonedAdventure = new AdventureListItem {
            Name = _defaultAdventures[0].Name,
            Description = "Adventure 1 Description",
            Type = AdventureType.Survival,
            ImagePath = "path/to/image1.png",
            IsVisible = true,
            IsPublic = true,
        };
        _client.CloneAdventureAsync(Arg.Any<Guid>(), Arg.Any<CloneAdventureRequest>()).Returns(clonedAdventure);

        // Act
        cut.Find($"#clone-adventure-{adventureId}").Click();

        // Assert
        _client.Received(1).CloneAdventureAsync(Arg.Any<Guid>(), Arg.Any<CloneAdventureRequest>());
    }
}