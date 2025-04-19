namespace VttTools.Data.Extensions;

public class HostApplicationBuilderExtensionsTests {
    [Fact]
    public void AddGameDataStorage_RegistersStorageServices() {
        // Arrange
        var mockServiceCollection = new TestServiceCollection();
        var mockBuilder = Substitute.For<IHostApplicationBuilder>();
        mockBuilder.Services.Returns(mockServiceCollection);

        // Act
        mockBuilder.AddGameDataStorage();

        // Assert
        mockServiceCollection.Should().Contain(sd => sd.ServiceType == typeof(IAdventureStorage) && sd.ImplementationType == typeof(AdventureStorage));
        mockServiceCollection.Should().Contain(sd => sd.ServiceType == typeof(IEpisodeStorage) && sd.ImplementationType == typeof(EpisodeStorage));
        mockServiceCollection.Should().Contain(sd => sd.ServiceType == typeof(IMeetingStorage) && sd.ImplementationType == typeof(MeetingStorage));
    }

    private sealed class TestServiceCollection
        : List<ServiceDescriptor>, IServiceCollection;
}