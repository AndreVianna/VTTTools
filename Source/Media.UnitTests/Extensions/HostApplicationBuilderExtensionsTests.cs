using VttTools.Media.Services;

namespace VttTools.Media.Extensions;

public class HostApplicationBuilderExtensionsTests {
    [Fact]
    public void AddService_RegistersStorageServices() {
        var builder = new HostApplicationBuilder();
        builder.AddServices();

        var services = builder.Services;
        services.Should().Contain(sd =>
            sd.ServiceType == typeof(IResourceService) &&
            sd.ImplementationType == typeof(AzureResourceService));
    }
}