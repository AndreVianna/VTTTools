namespace VttTools.Services.Chat;

public class IChatServiceTests {
    [Fact]
    public void Interface_HasRequiredMethods() {
        // Arrange
        var type = typeof(IChatService);

        // Act & Assert
        var methods = type.GetMethods();

        methods.Should().Contain(m => m.Name == "SendMessageAsync" &&
                                      m.GetParameters().Length >= 3 &&
                                      m.ReturnType.IsGenericType &&
                                      m.ReturnType.GetGenericTypeDefinition() == typeof(Task<>));

        methods.Should().Contain(m => m.Name == "GetMeetingHistoryAsync" &&
                                      m.GetParameters().Length >= 2 &&
                                      m.ReturnType.IsGenericType &&
                                      m.ReturnType.GetGenericTypeDefinition() == typeof(Task<>));

        methods.Should().Contain(m => m.Name == "RollDiceAsync" &&
                                      m.GetParameters().Length >= 1 &&
                                      m.ReturnType.IsGenericType &&
                                      m.ReturnType.GetGenericTypeDefinition() == typeof(Task<>));
    }
}