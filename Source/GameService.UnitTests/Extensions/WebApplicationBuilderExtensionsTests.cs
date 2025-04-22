namespace VttTools.GameService.Extensions;

public class WebApplicationBuilderExtensionsTests {
    [Theory]
    [InlineData(true, false)]
    [InlineData(false, false)]
    [InlineData(false, true)]
    public void ApplyRequiredConfiguration_DoesNotThrow(bool isDevelopment, bool isProduction) {
        var app = WebApplication.CreateBuilder().Build();
        var env = Substitute.For<IWebHostEnvironment>();
        if (isDevelopment)
            env.EnvironmentName.Returns(Environments.Development);
        if (isProduction)
            env.EnvironmentName.Returns(Environments.Production);

        var action = () => app.ApplyRequiredConfiguration(env);
        action.Should().NotThrow();
    }

    [Fact]
    public void MapApplicationEndpoints_DoesNotThrow() {
        var builder = WebApplication.CreateBuilder();
        builder.AddRequiredServices();
        var app = builder.Build();

        var action = app.MapApplicationEndpoints;
        action.Should().NotThrow();
    }
}