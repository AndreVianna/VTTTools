namespace VttTools.WebApp.Pages.Game.Chat;

public sealed class ChatPageHandlerTests
    : ComponentTestContext {
    private readonly ChatPage _page = Substitute.For<ChatPage>();
    private readonly IHubConnectionBuilder _builder = Substitute.For<IHubConnectionBuilder>();
    private readonly HubConnection _hubConnectionSpy = Substitute.For<HubConnection>(Substitute.For<IConnectionFactory>(),
                                                                                     Substitute.For<IHubProtocol>(),
                                                                                     Substitute.For<EndPoint>(),
                                                                                     Substitute.For<IServiceProvider>(),
                                                                                     NullLoggerFactory.Instance);
    private readonly Uri _chatUri = new("https://example.com/hubs/chat");
    private bool _hubStarted;
    private bool _refreshCalled;

    public ChatPageHandlerTests() {
        _builder.Build().Returns(_hubConnectionSpy);
        _hubConnectionSpy.When(x => x.StartAsync())
            .Do(_ => _hubStarted = true);
        _hubConnectionSpy.When(x => x.SendCoreAsync(Arg.Any<string>(), Arg.Any<object?[]>(), Arg.Any<CancellationToken>()))
            .DoNotCallBase();
        _hubConnectionSpy.On(Arg.Any<string>(), Arg.Any<Type[]>(), Arg.Any<Func<object?[], object, Task>>(), Arg.Any<object>())
            .Returns(Substitute.For<IDisposable>());
        _page.HttpContext.Returns(HttpContext);
        _page.NavigationManager.Returns(NavigationManager);
        _page.Logger.Returns(NullLogger.Instance);
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
        _page.State.Messages.Should().ContainSingle().Which.Text.Should().Be("Test message");
        _page.State.Messages.Should().ContainSingle().Which.Direction.Should().Be(ChatMessageDirection.Received);
        _refreshCalled.Should().BeTrue();
    }

    [Fact]
    public async Task SendMessage_WithNonEmptyMessage_SendsMessageAndClearsInput() {
        // Arrange
        var handler = await CreateHandler();
        _page.State.Input.Message = "Test message";

        // Act
        await handler.SendMessage();

        // Assert
        _hubStarted.Should().BeTrue();
        _page.State.Messages.Should().ContainSingle().Which.Text.Should().Be("Test message");
        _page.State.Messages.Should().ContainSingle().Which.Direction.Should().Be(ChatMessageDirection.Sent);
        _refreshCalled.Should().BeTrue();
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public async Task SendMessage_WithEmptyMessage_DoesNotSendMessageAndReturnsEmpty(string? message) {
        // Arrange
        var handler = await CreateHandler();
        _page.State.Input.Message = message!;

        // Act
        await handler.SendMessage();

        // Assert
        _hubStarted.Should().BeTrue();
        _page.State.Messages.Should().BeEmpty();
        _refreshCalled.Should().BeFalse();
    }

    private async Task<ChatPageHandler> CreateHandler(bool isAuthorized = true, bool isConfigured = true) {
        if (isAuthorized)
            EnsureAuthenticated();
        var handler = new ChatPageHandler(_page);
        if (isConfigured)
            await handler.SetHubConnectionAsync(_builder, _chatUri, RefreshAsync);
        return handler;
    }
}