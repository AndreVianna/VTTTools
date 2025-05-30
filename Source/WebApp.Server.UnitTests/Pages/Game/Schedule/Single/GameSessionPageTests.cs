namespace VttTools.WebApp.Pages.Game.Schedule.Single;

public class GameSessionPageTests
    : ComponentTestContext {
    private readonly IGameSessionsHttpClient _client = Substitute.For<IGameSessionsHttpClient>();
    private readonly Guid _sessionId = Guid.NewGuid();
    private readonly GameSessionDetails? _defaultGameSession;

    public GameSessionPageTests() {
        Services.AddScoped(_ => _client);
        EnsureAuthenticated();
        _defaultGameSession = new() { Title = "Session 1", OwnerId = CurrentUser!.Id };
    }

    [Fact]
    public void BeforeIsReady_RendersLoadingState() {
        // Arrange
        _client.GetGameSessionByIdAsync(Arg.Any<Guid>()).Returns(Task.Delay(1000, CancellationToken).ContinueWith(_ => _defaultGameSession));

        // Act
        var cut = RenderComponent<GameSessionPage>(ps => ps.Add(p => p.GameSessionId, _sessionId));

        // Assert
        cut.Markup.Should().Contain("""<span class="visually-hidden">Loading...</span>""");
    }

    [Fact]
    public void WhenIsReady_RendersCorrectly() {
        // Arrange
        _client.GetGameSessionByIdAsync(Arg.Any<Guid>()).Returns(_defaultGameSession);

        // Act
        var cut = RenderComponent<GameSessionPage>(ps => ps.Add(p => p.GameSessionId, _sessionId));

        // Assert
        cut.Find("h1").TextContent.Should().Be("Session 1");
        cut.Find("button.btn-secondary").TextContent.Should().Be("Back to GameSessions");
    }

    [Fact]
    public void WhenIsReady_ForGameMaster_ShowsEditButton() {
        // Arrange
        _client.GetGameSessionByIdAsync(Arg.Any<Guid>()).Returns(_defaultGameSession);

        // Act
        var cut = RenderComponent<GameSessionPage>(ps => ps.Add(p => p.GameSessionId, _sessionId));

        // Assert
        var editButton = cut.FindAll("button").FirstOrDefault(b => b.TextContent.Contains("Edit GameSession"));
        editButton.Should().NotBeNull();
    }

    [Fact]
    public void WhenBackToGameSessionsButtonIsClicked_NavigatesToGameSessions() {
        // Arrange
        _client.GetGameSessionByIdAsync(Arg.Any<Guid>()).Returns(_defaultGameSession);
        var cut = RenderComponent<GameSessionPage>(ps => ps.Add(p => p.GameSessionId, _sessionId));
        var navigationSpy = cut.Instance.NavigationManager.Should().BeOfType<FakeNavigationManager>().Subject;

        // Act
        cut.Find("button.btn-secondary").Click();

        // Assert
        navigationSpy.History.First().Uri.Should().Be("/sessions");
    }

    [Fact]
    public void WhenEditButtonIsClicked_ShowsEditDialog() {
        // Arrange
        _client.GetGameSessionByIdAsync(Arg.Any<Guid>()).Returns(_defaultGameSession);
        var cut = RenderComponent<GameSessionPage>(ps => ps.Add(p => p.GameSessionId, _sessionId));

        // Act
        cut.FindAll("button").First(b => b.TextContent.Contains("Edit GameSession")).Click();

        // Assert
        cut.Find(".modal.show").Should().NotBeNull();
        cut.Instance.State.ShowEditDialog.Should().BeTrue();
        cut.Instance.State.Input.Title.Should().Be("Session 1");
    }
}