using Microsoft.Extensions.Diagnostics.HealthChecks;

namespace VttTools.EndpointMappers;

public class HealthEndpointsMapperTests {
    private readonly IEndpointRouteBuilder _app = Substitute.For<IEndpointRouteBuilder>();

    public HealthEndpointsMapperTests() {
        var serviceCollection = new ServiceCollection();
        serviceCollection.AddHealthChecks();
        serviceCollection.AddOptions<HealthCheckServiceOptions>();
        serviceCollection.AddSingleton(typeof(ILogger<>), typeof(NullLogger<>));
        _app.ServiceProvider.Returns(serviceCollection.BuildServiceProvider());
        _app.DataSources.Returns([]);
    }

    [Fact]
    public void MapHealthCheckEndpoints_RegistersTwoHealthEndpoints() {
        // Act
        _app.MapHealthCheckEndpoints();

        // Assert that two health check endpoints were registered
        _app.DataSources.Should().HaveCount(1);
        var groupDataSource = _app.DataSources.First();
        groupDataSource.Endpoints.Should().HaveCount(2);
        var healthRoute = groupDataSource.Endpoints[0].Should().BeOfType<RouteEndpoint>().Subject;
        healthRoute.RoutePattern.RawText.Should().Be("/health");
        var aliveRoute = groupDataSource.Endpoints[1].Should().BeOfType<RouteEndpoint>().Subject;
        aliveRoute.RoutePattern.RawText.Should().Be("/alive");
    }

    [Theory]
    [InlineData("live", true)]
    [InlineData("not-live", false)]
    public void RegistrationTagContainsLive_ReturnsCorrectly(string tag, bool expectedResult) {
        var instance = Substitute.For<IHealthCheck>();
        const HealthStatus status = new();
        var registration = new HealthCheckRegistration("Test", instance, status, [tag]);
        var result = HealthEndpointsMapper.RegistrationTagContainsLive(registration);
        result.Should().Be(expectedResult);
    }
}