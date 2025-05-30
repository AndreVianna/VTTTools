namespace VttTools.WebApp.Pages.Library.Adventures.List;

public class AdventuresPageTests
    : ComponentTestContext {
    private readonly IAdventuresHttpClient _serverHttpClient = Substitute.For<IAdventuresHttpClient>();
    private readonly AdventureListItem[] _defaultAdventures;

    public AdventuresPageTests() {
        EnsureAuthenticated();
        Services.AddScoped(_ => _serverHttpClient);
        _defaultAdventures = [
        new() {
            Name = "Adventure 1",
            Description = "Adventure 1 Description",
            Type = AdventureType.Survival,
            IsPublished = true,
            IsPublic = true,
        },
        new() {
            Name = "Adventure 2",
            Description = "Adventure 2 Description",
            Type = AdventureType.OpenWorld,
            IsPublished = false,
            IsPublic = false,
        }];
        _serverHttpClient.GetAdventuresAsync().Returns(_defaultAdventures);
    }

    [Fact]
    public void BeforeIsReady_RendersLoadingState() {
        // Arrange
        _serverHttpClient.GetAdventuresAsync().Returns(Task.Delay(1000, CancellationToken).ContinueWith(_ => _defaultAdventures));

        // Act
        var cut = RenderComponent<AdventuresPage>();

        // Assert
        cut.Markup.Should().Contain("<h1>Adventures</h1>");
        cut.Markup.Should().Contain("""<span class="visually-hidden">Loading...</span>""");
    }

    [Fact]
    public void WhenIsReady_WithNoAdventures_RendersAsEmpty() {
        // Arrange
        _serverHttpClient.GetAdventuresAsync().Returns([]);

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
            IsPublished = true,
            IsPublic = true,
        };
        _serverHttpClient.CreateAdventureAsync(Arg.Any<CreateAdventureRequest>()).Returns(newAdventure);

        // Act
        cut.Find("#create-adventure").Click();

        // Assert
        _serverHttpClient.Received(1).CreateAdventureAsync(Arg.Any<CreateAdventureRequest>());
    }

    [Fact]
    public void WhenViewButtonIsClicked_NavigatesToAdventureScenes() {
        // Arrange
        var adventureId = _defaultAdventures[0].Id;
        var cut = RenderComponent<AdventuresPage>();
        var navigationSpy = cut.Instance.NavigationManager.Should().BeOfType<FakeNavigationManager>().Subject;
        cut.WaitForState(() => cut.Instance.IsReady, TimeSpan.FromMilliseconds(500));
        _serverHttpClient.DeleteAdventureAsync(Arg.Any<Guid>()).Returns(true);

        // Act
        cut.Find($"#view-adventure-{adventureId}").Click();

        // Assert
        navigationSpy.History.First().Uri.Should().Be($"/adventures/{adventureId}/scenes");
    }

    [Fact]
    public void WhenDeleteButtonIsClicked_DeletesAdventure() {
        // Arrange
        var adventureId = _defaultAdventures[0].Id;
        var cut = RenderComponent<AdventuresPage>();
        cut.WaitForState(() => cut.Instance.IsReady, TimeSpan.FromMilliseconds(500));
        _serverHttpClient.DeleteAdventureAsync(Arg.Any<Guid>()).Returns(true);

        // Act
        cut.Find($"#delete-adventure-{adventureId}").Click();

        // Assert
        _serverHttpClient.Received(1).DeleteAdventureAsync(_defaultAdventures[0].Id);
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
            IsPublished = true,
            IsPublic = true,
        };
        _serverHttpClient.CloneAdventureAsync(Arg.Any<Guid>(), Arg.Any<CloneAdventureRequest>()).Returns(clonedAdventure);

        // Act
        cut.Find($"#clone-adventure-{adventureId}").Click();

        // Assert
        _serverHttpClient.Received(1).CloneAdventureAsync(Arg.Any<Guid>(), Arg.Any<CloneAdventureRequest>());
    }
}