namespace VttTools.Services.Media;

public class IStorageServiceTests {
    [Fact]
    public void Interface_HasRequiredMethods() {
        // Arrange
        var type = typeof(IStorageService);

        // Act & Assert
        var methods = type.GetMethods();

        methods.Should().Contain(m => m.Name == "UploadImageAsync" &&
                                      m.GetParameters().Length >= 2 &&
                                      m.ReturnType.IsGenericType &&
                                      m.ReturnType.GetGenericTypeDefinition() == typeof(Task<>));

        methods.Should().Contain(m => m.Name == "DeleteImageAsync" &&
                                      m.GetParameters().Length >= 1 &&
                                      m.ReturnType == typeof(Task));
    }
}