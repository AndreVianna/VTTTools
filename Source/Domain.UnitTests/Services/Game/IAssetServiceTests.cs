namespace VttTools.Services.Game;

public class IAssetServiceTests {
    [Fact]
    public void Interface_HasRequiredMethods() {
        // Arrange
        var type = typeof(IAssetService);

        // Act & Assert
        var methods = type.GetMethods();

        methods.Should().Contain(m => m.Name == "GetAssetsAsync" &&
                                      m.GetParameters().Length <= 1 &&
                                      m.ReturnType.IsGenericType &&
                                      m.ReturnType.GetGenericTypeDefinition() == typeof(Task<>));

        methods.Should().Contain(m => m.Name == "GetAssetAsync" &&
                                      m.GetParameters().Length == 2 &&
                                      m.ReturnType.IsGenericType &&
                                      m.ReturnType.GetGenericTypeDefinition() == typeof(Task<>));

        methods.Should().Contain(m => m.Name == "CreateAssetAsync" &&
                                      m.GetParameters().Length == 3 &&
                                      m.ReturnType.IsGenericType &&
                                      m.ReturnType.GetGenericTypeDefinition() == typeof(Task<>));

        methods.Should().Contain(m => m.Name == "UpdateAssetAsync" &&
                                      m.GetParameters().Length == 4 &&
                                      m.ReturnType.IsGenericType &&
                                      m.ReturnType.GetGenericTypeDefinition() == typeof(Task<>));

        methods.Should().Contain(m => m.Name == "DeleteAssetAsync" &&
                                      m.GetParameters().Length == 3 &&
                                      m.ReturnType.IsGenericType &&
                                      m.ReturnType.GetGenericTypeDefinition() == typeof(Task<>));
    }
}