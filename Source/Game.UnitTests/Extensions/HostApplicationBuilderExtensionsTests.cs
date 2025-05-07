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
}