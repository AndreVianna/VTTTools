namespace VttTools.Services.Game;

public class IEpisodeServiceTests {
    [Fact]
    public void Interface_HasRequiredMethods() {
        // Arrange
        var type = typeof(IEpisodeService);

        // Act & Assert
        var methods = type.GetMethods();

        methods.Should().Contain(m => m.Name == "AddAssetAsync" &&
                                      m.GetParameters().Length >= 3 &&
                                      m.ReturnType.IsGenericType &&
                                      m.ReturnType.GetGenericTypeDefinition() == typeof(Task<>));

        methods.Should().Contain(m => m.Name == "UpdateAssetAsync" &&
                                      m.GetParameters().Length >= 3 &&
                                      m.ReturnType.IsGenericType);

        methods.Should().Contain(m => m.Name == "RemoveAssetAsync" &&
                                      m.GetParameters().Length >= 2 &&
                                      m.ReturnType.IsGenericType);
    }
}