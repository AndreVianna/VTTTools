namespace VttTools.Services.Game;

public class IMeetingServiceTests {
    [Fact]
    public void Interface_HasRequiredMethods() {
        // Arrange
        var type = typeof(IMeetingService);

        // Act & Assert
        var methods = type.GetMethods();

        methods.Should().Contain(m => m.Name == "GetMeetingsAsync" &&
                                      m.GetParameters().Length == 2 &&
                                      m.ReturnType.IsGenericType &&
                                      m.ReturnType.GetGenericTypeDefinition() == typeof(Task<>));

        methods.Should().Contain(m => m.Name == "GetMeetingAsync" &&
                                      m.GetParameters().Length == 3 &&
                                      m.ReturnType.IsGenericType &&
                                      m.ReturnType.GetGenericTypeDefinition() == typeof(Task<>));

        methods.Should().Contain(m => m.Name == "CreateMeetingAsync" &&
                                      m.GetParameters().Length == 3 &&
                                      m.ReturnType.IsGenericType &&
                                      m.ReturnType.GetGenericTypeDefinition() == typeof(Task<>));

        methods.Should().Contain(m => m.Name == "UpdateMeetingAsync" &&
                                      m.GetParameters().Length == 4 &&
                                      m.ReturnType.IsGenericType &&
                                      m.ReturnType.GetGenericTypeDefinition() == typeof(Task<>));

        methods.Should().Contain(m => m.Name == "DeleteMeetingAsync" &&
                                      m.GetParameters().Length == 3 &&
                                      m.ReturnType.IsGenericType &&
                                      m.ReturnType.GetGenericTypeDefinition() == typeof(Task<>));

        methods.Should().Contain(m => m.Name == "JoinMeetingAsync" &&
                                      m.GetParameters().Length == 4 &&
                                      m.ReturnType.IsGenericType &&
                                      m.ReturnType.GetGenericTypeDefinition() == typeof(Task<>));

        methods.Should().Contain(m => m.Name == "LeaveMeetingAsync" &&
                                      m.GetParameters().Length == 3 &&
                                      m.ReturnType.IsGenericType &&
                                      m.ReturnType.GetGenericTypeDefinition() == typeof(Task<>));

        methods.Should().Contain(m => m.Name == "SetActiveEpisodeAsync" &&
                                      m.GetParameters().Length == 4 &&
                                      m.ReturnType.IsGenericType &&
                                      m.ReturnType.GetGenericTypeDefinition() == typeof(Task<>));

        methods.Should().Contain(m => m.Name == "StartMeetingAsync" &&
                                      m.GetParameters().Length == 3 &&
                                      m.ReturnType.IsGenericType &&
                                      m.ReturnType.GetGenericTypeDefinition() == typeof(Task<>));

        methods.Should().Contain(m => m.Name == "StopMeetingAsync" &&
                                      m.GetParameters().Length == 3 &&
                                      m.ReturnType.IsGenericType &&
                                      m.ReturnType.GetGenericTypeDefinition() == typeof(Task<>));
    }
}