using VttTools.WebApp.Pages.Meeting;

namespace VttTools.WebApp.Components.Meeting.Pages;

public sealed class ChatPageHandlerTests {
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
    }

    private Task RefreshAsync() {
        _refreshCalled = true;
        return Task.CompletedTask;
    }

    [Fact]
    public async Task OnMessageReceived_AddsMessageToStateAndCallsRefresh() {
        // Arrange
        await using var handler = await ChatPage.Handler.InitializeAsync(_builder, _chatUri, RefreshAsync);

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
        await using var handler = await ChatPage.Handler.InitializeAsync(_builder, _chatUri, RefreshAsync);
        handler.State.NewMessage = "Test message";

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
        await using var handler = await ChatPage.Handler.InitializeAsync(_builder, _chatUri, RefreshAsync);
        handler.State.NewMessage = message!;

        // Act
        await handler.SendMessage();

        // Assert
        _hubStarted.Should().BeTrue();
        handler.State.Messages.Should().BeEmpty();
        _refreshCalled.Should().BeFalse();
    }
}