namespace VttTools.Game.Extensions;

public class HostApplicationBuilderExtensionsTests {
    [Fact]
    public void AddStorage_RegistersStorageServices() {
        var builder = new HostApplicationBuilder();
        builder.AddStorage();

        var services = builder.Services;
        services.Should().Contain(sd =>
            sd.ServiceType == typeof(IGameSessionStorage) &&
            sd.ImplementationType == typeof(GameSessionStorage));
    }

    [Fact]
    public void AddService_RegistersStorageServices() {
        var builder = new HostApplicationBuilder();
        builder.AddServices();

        var services = builder.Services;
        services.Should().Contain(sd =>
            sd.ServiceType == typeof(IGameSessionService) &&
            sd.ImplementationType == typeof(GameSessionService));
    }

    [Fact]
    public void AddServices_DoesNotThrow() {
        // Arrange
        var builder = new HostApplicationBuilder();

        // Act
        var action = builder.AddServices;

        // Assert
        action.Should().NotThrow();
    }

    [Fact]
    public void AddStorage_DoesNotThrow() {
        // Arrange
        var builder = new HostApplicationBuilder();

        // Act
        var action = builder.AddStorage;

        // Assert
        action.Should().NotThrow();
    }
}