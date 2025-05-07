namespace VttTools.Library.Extensions;

public class HostApplicationBuilderExtensionsTests {
    [Fact]
    public void AddStorage_RegistersStorageServices() {
        var builder = new HostApplicationBuilder();
        builder.AddStorage();

        var services = builder.Services;
        services.Should().Contain(sd =>
            sd.ServiceType == typeof(IAdventureStorage) &&
            sd.ImplementationType == typeof(AdventureStorage));
        services.Should().Contain(sd =>
            sd.ServiceType == typeof(ISceneStorage) &&
            sd.ImplementationType == typeof(SceneStorage));
    }

    [Fact]
    public void AddService_RegistersStorageServices() {
        var builder = new HostApplicationBuilder();
        builder.AddServices();

        var services = builder.Services;
        services.Should().Contain(sd =>
            sd.ServiceType == typeof(IAdventureService) &&
            sd.ImplementationType == typeof(AdventureService));
        services.Should().Contain(sd =>
            sd.ServiceType == typeof(ISceneService) &&
            sd.ImplementationType == typeof(SceneService));
    }
}