namespace VttTools.WebApp.Pages.Meeting;

public class ChatPageTests
    : WebAppTestContext {
    private readonly IHubConnectionBuilder _builder = Substitute.For<IHubConnectionBuilder>();
    private readonly HubConnection _hubConnection
        = Substitute.For<HubConnection>(Substitute.For<IConnectionFactory>(),
                                        Substitute.For<IHubProtocol>(),
                                        Substitute.For<EndPoint>(),
                                        Substitute.For<IServiceProvider>(),
                                        NullLoggerFactory.Instance);
    public ChatPageTests() {
        _builder.Build().Returns(_hubConnection);
        Services.AddSingleton(_builder);
        EnsureAuthenticated();
    }

    [Fact]
    public void BeforeIsReady_RendersLoadingState() {
        // Arrange
        _hubConnection.StartAsync(Arg.Any<CancellationToken>()).Returns(Task.Delay(1000, CancellationToken));

        // Act
        var cut = RenderComponent<ChatPage>();

        // Assert
        cut.Markup.Should().Contain("""<span class="visually-hidden">Loading...</span>""");
    }

    [Fact]
    public void WhenIsReady_RendersCorrectly() {
        // Act
        var cut = RenderComponent<ChatPage>();
        cut.WaitForState(() => cut.Instance.IsReady, TimeSpan.FromMilliseconds(500));

        // Assert
        cut.Find("h1").TextContent.Should().Be("Chat");
        cut.Find("input").Should().NotBeNull();
        cut.Find("button").TextContent.Should().Be("Send");
    }

    [Fact]
    public void WhenHaveMessages_DisplaysMessages() {
        // Arrange
        var cut = RenderComponent<ChatPage>();
        cut.Instance.State.Messages.Add(new(ChatMessageDirection.Sent, "Test message 1"));
        cut.Instance.State.Messages.Add(new(ChatMessageDirection.Received, "Test message 2"));
        cut.WaitForState(() => cut.Instance.IsReady, TimeSpan.FromMilliseconds(500));

        // Act
        cut.SetParametersAndRender();

        // Assert
        var messages = cut.FindAll("li");
        messages.Count.Should().Be(2);
        messages[0].TextContent.Should().Contain("""
                                                 : (Sent) Test message 1
                                                 """);
        messages[1].TextContent.Should().Contain("""
                                                 : (Received) Test message 2
                                                 """);
    }
}