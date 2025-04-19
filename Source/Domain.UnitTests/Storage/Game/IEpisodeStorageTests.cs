namespace VttTools.Storage.Game;

public class IEpisodeStorageTests {
    [Fact]
    public void Interface_HasRequiredMethods() {
        // Arrange
        var type = typeof(IEpisodeStorage);

        // Act & Assert
        var methods = type.GetMethods();

        methods.Should().Contain(m => m.Name == "GetByParentIdAsync" &&
                                      m.GetParameters().Length >= 1 &&
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