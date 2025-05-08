namespace VttTools.Data.Extensions;

public class HostApplicationBuilderExtensionsTests {
    [Fact]
    public void AddGameDataStorage_RegistersStorageServices() {
        // Arrange
        var mockServiceCollection = new TestServiceCollection();
        var mockBuilder = Substitute.For<IHostApplicationBuilder>();
        mockBuilder.Services.Returns(mockServiceCollection);

        // Act
        mockBuilder.AddDataStorage();

        // Assert
        mockServiceCollection.Should().Contain(sd => sd.ServiceType == typeof(IAdventureStorage) && sd.ImplementationType == typeof(AdventureStorage));
        mockServiceCollection.Should().Contain(sd => sd.ServiceType == typeof(ISceneStorage) && sd.ImplementationType == typeof(SceneStorage));
        mockServiceCollection.Should().Contain(sd => sd.ServiceType == typeof(IGameSessionStorage) && sd.ImplementationType == typeof(GameSessionStorage));
    }

    private sealed class TestServiceCollection
        : List<ServiceDescriptor>, IServiceCollection;
}