using VttTools.WebApp.Pages.GameSessions;
using VttTools.WebApp.ViewModels;

namespace VttTools.WebApp.Pages.Game;

public sealed class GameSessionChatPageHandlerTests
    : ComponentTestContext {
    private readonly IHubConnectionBuilder _builder = Substitute.For<IHubConnectionBuilder>();
    private readonly HubConnection _hubConnectionSpy = Substitute.For<HubConnection>(Substitute.For<IConnectionFactory>(),
                                                                                     Substitute.For<IHubProtocol>(),
                                                                                     Substitute.For<EndPoint>(),
                                                                                     Substitute.For<IServiceProvider>(),
                                                                                     NullLoggerFactory.Instance);
    private readonly Uri _chatUri = new("https://example.com/hubs/chat");
    private bool _hubStarted;
    private bool _refreshCalled;

    public GameSessionChatPageHandlerTests() {
        _builder.Build().Returns(_hubConnectionSpy);
        _hubConnectionSpy.When(x => x.StartAsync())
            .Do(_ => _hubStarted = true);
        _hubConnectionSpy.When(x => x.SendCoreAsync(Arg.Any<string>(), Arg.Any<object?[]>(), Arg.Any<CancellationToken>()))
            .DoNotCallBase();
        _hubConnectionSpy.On(Arg.Any<string>(), Arg.Any<Type[]>(), Arg.Any<Func<object?[], object, Task>>(), Arg.Any<object>())
            .Returns(Substitute.For<IDisposable>());
    }

    private Task RefreshAsync() {
        _refreshCalled = true;
        return Task.CompletedTask;
    }

    [Fact]
    public async Task OnMessageReceived_AddsMessageToStateAndCallsRefresh() {
        // Arrange
        var handler = await CreateHandler();

        // Act
        await handler.OnMessageReceived("Test message");

        // Assert
        _hubStarted.Should().BeTrue();
        handler.State.Messages.Should().ContainSingle().Which.Text.Should().Be("Test message");
        handler.State.Messages.Should().ContainSingle().Which.Direction.Should().Be(ChatMessageDirection.Received);
        _refreshCalled.Should().BeTrue();
    }

    [Fact]
    public async Task SendMessage_WithNonEmptyMessage_SendsMessageAndClearsInput() {
        // Arrange
        var handler = await CreateHandler();
        handler.State.Input.Message = "Test message";

        // Act
        await handler.SendMessage();

        // Assert
        _hubStarted.Should().BeTrue();
        handler.State.Messages.Should().ContainSingle().Which.Text.Should().Be("Test message");
        handler.State.Messages.Should().ContainSingle().Which.Direction.Should().Be(ChatMessageDirection.Sent);
        _refreshCalled.Should().BeTrue();
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public async Task SendMessage_WithEmptyMessage_DoesNotSendMessageAndReturnsEmpty(string? message) {
        // Arrange
        var handler = await CreateHandler();
        handler.State.Input.Message = message!;

        // Act
        await handler.SendMessage();

        // Assert
        _hubStarted.Should().BeTrue();
        handler.State.Messages.Should().BeEmpty();
        _refreshCalled.Should().BeFalse();
    }

    private async Task<GameSessionChatPageHandler> CreateHandler(bool isAuthorized = true, bool isConfigured = true) {
        if (isAuthorized)
            EnsureAuthenticated();
        var page = Substitute.For<IAuthenticatedPage>();
        page.HttpContext.Returns(HttpContext);
        page.NavigationManager.Returns(NavigationManager);
        page.Logger.Returns(NullLogger.Instance);
        var handler = new GameSessionChatPageHandler(page);
        if (isConfigured)
            await handler.SetHubConnectionAsync(_builder, _chatUri, RefreshAsync);
        return handler;
    }
}