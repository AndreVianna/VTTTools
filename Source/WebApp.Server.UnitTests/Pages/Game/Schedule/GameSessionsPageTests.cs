namespace VttTools.WebApp.Pages.Game.Schedule;

public class GameSessionsPageTests
    : ComponentTestContext {
    private readonly IGameHttpClient _ServerGameHttpClient = Substitute.For<IGameHttpClient>();
    private readonly ILibraryHttpClient _ServerLibraryHttpClient = Substitute.For<ILibraryHttpClient>();
    private readonly GameSession[] _defaultGameSessions;

    public GameSessionsPageTests() {
        Services.AddScoped(_ => _ServerGameHttpClient);
        Services.AddScoped(_ => _ServerLibraryHttpClient);
        EnsureAuthenticated();
        _defaultGameSessions = [
            new() { Title = "Session 1", OwnerId = CurrentUser!.Id },
            new() { Title = "Session 2", OwnerId = Guid.NewGuid() },
        ];
    }

    [Fact]
    public void BeforeIsReady_RendersLoadingState() {
        // Arrange
        _ServerGameHttpClient.GetGameSessionsAsync().Returns(Task.Delay(1000, CancellationToken).ContinueWith(_ => _defaultGameSessions));

        // Act
        var cut = RenderComponent<GameSessionsPage>();

        // Assert
        cut.Markup.Should().Contain("""<span class="visually-hidden">Loading...</span>""");
    }

    [Fact]
    public void WhenIsReady_WithNoGameSessions_RendersEmptyState() {
        // Arrange
        _ServerGameHttpClient.GetGameSessionsAsync().Returns([]);

        // Act
        var cut = RenderComponent<GameSessionsPage>();

        // Assert
        cut.Markup.Should().Contain("You don't have any game sessions yet. Create a new game session to get started!");
    }

    [Fact]
    public void WhenIsReady_WithGameSessions_RendersGameSessions() {
        // Arrange
        _ServerGameHttpClient.GetGameSessionsAsync().Returns(_defaultGameSessions);

        // Act
        var cut = RenderComponent<GameSessionsPage>();

        // Assert
        var cards = cut.FindAll(".card");
        cards.Count.Should().Be(2);

        cards[0].QuerySelector(".card-title")!.TextContent.Should().Be("Session 1");
        cards[0].QuerySelector(".join").Should().NotBeNull();
        cards[0].QuerySelector(".edit").Should().NotBeNull();
        cards[0].QuerySelector(".delete").Should().NotBeNull();

        cards[1].QuerySelector(".card-title")!.TextContent.Should().Be("Session 2");
        cards[1].QuerySelector(".join").Should().NotBeNull();
        cards[1].QuerySelector(".edit").Should().NotBeNull();
        cards[1].QuerySelector(".delete").Should().BeNull();
    }

    [Fact]
    public void WhenCreateButtonIsClicked_OpensCreateDialog() {
        // Arrange
        _ServerGameHttpClient.GetGameSessionsAsync().Returns(_defaultGameSessions);
        var cut = RenderComponent<GameSessionsPage>();
        var createButton = cut.Find("#create-session");

        // Act
        createButton.Click();
        cut.WaitForState(() => cut.Instance.State.IsCreating, TimeSpan.FromMilliseconds(500));

        // Assert
        cut.Find("#create-session-dialog").Should().NotBeNull();
    }

    [Fact]
    public void WhenJoinButtonIsClicked_NavigatesToGameSession() {
        // Arrange
        _ServerGameHttpClient.GetGameSessionsAsync().Returns(_defaultGameSessions);
        var cut = RenderComponent<GameSessionsPage>();
        var navigationSpy = cut.Instance.NavigationManager.Should().BeOfType<FakeNavigationManager>().Subject;
        var sessionId = _defaultGameSessions[0].Id;
        var joinButton = cut.Find($"#session-{sessionId} .join");
        _ServerGameHttpClient.JoinGameSessionAsync(Arg.Any<Guid>()).Returns(true);

        // Act
        joinButton.Click();

        // Assert
        navigationSpy.History.First().Uri.Should().Be($"/sessions/{sessionId}/join");
    }

    [Fact]
    public void WhenEditButtonIsClicked_NavigatesToGameSessionDetails() {
        // Arrange
        _ServerGameHttpClient.GetGameSessionsAsync().Returns(_defaultGameSessions);
        var cut = RenderComponent<GameSessionsPage>();
        var navigationSpy = cut.Instance.NavigationManager.Should().BeOfType<FakeNavigationManager>().Subject;
        var sessionId = _defaultGameSessions[0].Id;
        var editButton = cut.Find($"#session-{sessionId} .edit");

        // Act
        editButton.Click();

        // Assert
        navigationSpy.History.First().Uri.Should().Be($"/sessions/{sessionId}");
    }
}