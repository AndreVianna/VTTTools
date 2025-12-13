namespace VttTools.Game.EndpointMappers;

public class ConfigurationEndpointsMapperTests {
    [Fact]
    public void MapConfigurationEndpoints_DoesNotThrow() {
        var builder = WebApplication.CreateBuilder();
        builder.AddRequiredServices();
        var app = builder.Build();

        var action = () => app.MapConfigurationEndpoints();
        action.Should().NotThrow();
    }
}
