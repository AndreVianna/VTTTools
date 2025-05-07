namespace VttTools.Model.Game;

public class MessageTypeTests {
    [Fact]
    public void MessageType_HasExpectedValues()
        // Assert
        => Enum.GetValues<MessageType>().Should().Contain([
            MessageType.Text,
            MessageType.Command,
        ]);
}