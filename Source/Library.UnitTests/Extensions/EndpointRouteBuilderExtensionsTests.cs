namespace VttTools.Library.Extensions;

public class EndpointRouteBuilderExtensionsTests {
    [Fact]
    public void MapApplicationEndpoints_DoesNotThrow() {
        var builder = WebApplication.CreateBuilder();
        builder.AddRequiredServices();
        var app = builder.Build();

        var action = app.MapApplicationEndpoints;
        action.Should().NotThrow();
    }
}