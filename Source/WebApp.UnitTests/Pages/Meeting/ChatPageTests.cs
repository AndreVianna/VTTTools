namespace VttTools.WebApp.Pages.Meeting;

public class ChatPageTests : WebAppTestContext {
    private readonly IHubConnectionBuilder _builder = Substitute.For<IHubConnectionBuilder>();
    private readonly HubConnection _hubConnectionSpy = Substitute.For<HubConnection>(Substitute.For<IConnectionFactory>(),
                                                                                     Substitute.For<IHubProtocol>(),
                                                                                     Substitute.For<EndPoint>(),
                                                                                     Substitute.For<IServiceProvider>(),
                                                                                     NullLoggerFactory.Instance);
    public ChatPageTests() {
        _builder.Build().Returns(_hubConnectionSpy);
        Services.AddSingleton(_builder);
    }

    [Fact]
    public void Chat_RendersCorrectly() {
        // Act
        var cut = RenderComponent<ChatPage>();

        // Assert
        cut.Find("h1").TextContent.Should().Be("Chat");
        cut.Find("input").Should().NotBeNull();
        cut.Find("button").TextContent.Should().Be("Send");
    }

    [Fact]
    public void Chat_DisplaysMessages() {
        // Arrange
        var cut = RenderComponent<ChatPage>();
        cut.Instance.State.Messages.Add(new(ChatMessageDirection.Sent, "Test message 1"));
        cut.Instance.State.Messages.Add(new(ChatMessageDirection.Received, "Test message 2"));

        // Act
        cut.SetParametersAndRender();

        // Assert
        var messages = cut.FindAll("li");
        messages.Count.Should().Be(2);
        messages[0].TextContent.Should().Contain(": (Sent)\n      Test message 1");
        messages[1].TextContent.Should().Contain(": (Received)\n      Test message 2");
    }
}