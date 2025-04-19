namespace VttTools.Storage.Game;

public class IMeetingStorageTests {
    [Fact]
    public void Interface_HasRequiredMethods() {
        // Arrange
        var type = typeof(IMeetingStorage);

        // Act & Assert
        var methods = type.GetMethods();

        methods.Should().Contain(m => m.Name == "GetByUserIdAsync" &&
                                      m.GetParameters().Length >= 1 &&
                                      m.ReturnType.IsGenericType &&
                                      m.ReturnType.GetGenericTypeDefinition() == typeof(Task<>));

        methods.Should().Contain(m => m.Name == "GetByIdAsync" &&
                                      m.GetParameters().Length >= 1 &&
                                      m.ReturnType.IsGenericType &&
                                      m.ReturnType.GetGenericTypeDefinition() == typeof(Task<>));

        methods.Should().Contain(m => m.Name == "GetAllAsync" &&
                                      m.ReturnType.IsGenericType &&
                                      m.ReturnType.GetGenericTypeDefinition() == typeof(Task<>));

        methods.Should().Contain(m => m.Name == "AddAsync" &&
                                      m.GetParameters().Length >= 1 &&
                                      m.ReturnType == typeof(Task));

        methods.Should().Contain(m => m.Name == "UpdateAsync" &&
                                      m.GetParameters().Length >= 1 &&
                                      m.ReturnType == typeof(Task));

        methods.Should().Contain(m => m.Name == "DeleteAsync" &&
                                      m.GetParameters().Length >= 1 &&
                                      m.ReturnType == typeof(Task));
    }
}