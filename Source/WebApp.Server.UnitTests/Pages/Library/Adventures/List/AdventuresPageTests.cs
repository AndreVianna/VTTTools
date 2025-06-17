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
            Id = Guid.NewGuid(),
            Name = "Adventure 1",
            Description = "Adventure 1 Description",
            Type = AdventureType.Survival,
            IsPublished = true,
            IsPublic = true,
            OwnerId = Guid.NewGuid(), // Different owner so it appears in public section
            ScenesCount = 3,
        },
        new() {
            Id = Guid.NewGuid(),
            Name = "Adventure 2",
            Description = "Adventure 2 Description",
            Type = AdventureType.OpenWorld,
            IsPublished = false,
            IsPublic = false,
            OwnerId = DefaultUser.Id,
            ScenesCount = 1,
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
    public void WhenCreateButtonIsClicked_NavigatesToCreatePage() {
        // Arrange
        var cut = RenderComponent<AdventuresPage>();
        var navigationSpy = cut.Instance.NavigationManager.Should().BeOfType<FakeNavigationManager>().Subject;
        cut.WaitForState(() => cut.Instance.IsReady, TimeSpan.FromMilliseconds(500));

        // Act
        cut.Find("#create-adventure-button").Click();

        // Assert
        navigationSpy.History.First().Uri.Should().Be("/adventure/create");
    }

    [Fact]
    public void WhenViewButtonIsClicked_NavigatesToAdventureView() {
        // Arrange
        var adventureId = _defaultAdventures[0].Id;
        var cut = RenderComponent<AdventuresPage>();
        var navigationSpy = cut.Instance.NavigationManager.Should().BeOfType<FakeNavigationManager>().Subject;
        cut.WaitForState(() => cut.Instance.IsReady, TimeSpan.FromMilliseconds(500));

        // Act
        cut.Find($"#view-adventure-{adventureId}").Click();

        // Assert
        navigationSpy.History.First().Uri.Should().Be($"/adventure/view/{adventureId}");
    }

    [Fact]
    public void WhenDeleteButtonIsClicked_DeletesAdventure() {
        // Arrange
        var adventureId = _defaultAdventures[1].Id; // Use owned adventure (Adventure 2)
        var cut = RenderComponent<AdventuresPage>();
        cut.WaitForState(() => cut.Instance.IsReady, TimeSpan.FromMilliseconds(500));
        _serverHttpClient.DeleteAdventureAsync(Arg.Any<Guid>()).Returns(true);

        // Act
        cut.Find($"#delete-adventure-{adventureId}").Click();

        // Assert
        _serverHttpClient.Received(1).DeleteAdventureAsync(_defaultAdventures[1].Id);
    }

    [Fact]
    public void WhenCloneButtonIsClicked_NavigatesToClonePage() {
        // Arrange
        var adventureId = _defaultAdventures[0].Id;
        var cut = RenderComponent<AdventuresPage>();
        var navigationSpy = cut.Instance.NavigationManager.Should().BeOfType<FakeNavigationManager>().Subject;
        cut.WaitForState(() => cut.Instance.IsReady, TimeSpan.FromMilliseconds(500));

        // Act
        cut.Find($"#clone-adventure-{adventureId}").Click();

        // Assert
        navigationSpy.History.First().Uri.Should().Be($"/adventure/clone/{adventureId}");
    }
}