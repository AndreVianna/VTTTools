namespace VttTools.Storage.Game;

public class IAssetStorageTests {
    [Fact]
    public void Interface_HasRequiredMethods() {
        // Arrange
        var type = typeof(IAssetStorage);

        // Act & Assert
        var methods = type.GetMethods();

        methods.Should().Contain(m => m.Name == "GetAllAsync" &&
                                      m.GetParameters().Length <= 1 &&
                                      m.ReturnType.IsGenericType &&
                                      m.ReturnType.GetGenericTypeDefinition() == typeof(Task<>));

        methods.Should().Contain(m => m.Name == "GetByIdAsync" &&
                                      m.GetParameters().Length == 2 &&
                                      m.ReturnType.IsGenericType &&
                                      m.ReturnType.GetGenericTypeDefinition() == typeof(Task<>));

        methods.Should().Contain(m => m.Name == "AddAsync" &&
                                      m.GetParameters().Length == 2 &&
                                      m.ReturnType.IsGenericType &&
                                      m.ReturnType.GetGenericTypeDefinition() == typeof(Task<>));

        methods.Should().Contain(m => m.Name == "UpdateAsync" &&
                                      m.GetParameters().Length == 2 &&
                                      m.ReturnType.IsGenericType &&
                                      m.ReturnType.GetGenericTypeDefinition() == typeof(Task<>));

        methods.Should().Contain(m => m.Name == "DeleteAsync" &&
                                      m.GetParameters().Length >= 1 &&
                                      m.ReturnType == typeof(Task));
    }
}