using VttTools.Data.Library.Adventures;
using VttTools.Data.Library.Encounters;

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
            sd.ServiceType == typeof(IEncounterStorage) &&
            sd.ImplementationType == typeof(EncounterStorage));
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
            sd.ServiceType == typeof(IEncounterService) &&
            sd.ImplementationType == typeof(EncounterService));
    }
}