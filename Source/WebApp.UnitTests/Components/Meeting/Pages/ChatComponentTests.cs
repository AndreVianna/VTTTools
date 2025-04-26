//namespace VttTools.WebApp.Components.Meeting.Pages;

//public class ChatComponentTests : Bunit.TestContext {
//    [Fact]
//    public void Chat_RendersCorrectly() {
//        // Act
//        this.Configure();
//        var cut = RenderComponent<Chat>();

//        // Assert
//        cut.Find("h1").TextContent.Should().Be("Chat");
//        cut.Find("input").Should().NotBeNull();
//        cut.Find("button").TextContent.Should().Be("Send");
//    }

//    [Fact]
//    public void Chat_DisplaysMessages() {
//        this.Configure();
//        var cut = RenderComponent<Chat>();

//        // Manually add messages to the state
//        cut.Instance.State.Messages.Add(new(ChatMessageDirection.Sent, "Test message 1"));
//        cut.Instance.State.Messages.Add(new(ChatMessageDirection.Received, "Test message 2"));
//        cut.SetParametersAndRender();

//        // Assert
//        var messages = cut.FindAll("li");
//        messages.Count.Should().Be(2);
//        messages[0].TextContent.Should().Contain(": (Sent)\n      Test message 1");
//        messages[1].TextContent.Should().Contain(": (Received)\n      Test message 2");
//    }
//}