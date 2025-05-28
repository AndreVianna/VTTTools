using VttTools.Media.Services;

namespace VttTools.Assets.Extensions;

public class HostApplicationBuilderExtensionsTests {
    [Fact]
    public void AddStorage_RegistersStorageServices() {
        var builder = new HostApplicationBuilder();
        builder.AddStorage();

        var services = builder.Services;
        services.Should().Contain(sd =>
            sd.ServiceType == typeof(IAssetStorage) &&
            sd.ImplementationType == typeof(AssetStorage));
    }

    [Fact]
    public void AddService_RegistersStorageServices() {
        var builder = new HostApplicationBuilder();
        builder.AddServices();

        var services = builder.Services;
        services.Should().Contain(sd =>
            sd.ServiceType == typeof(IAssetService) &&
            sd.ImplementationType == typeof(AssetService));
    }
}