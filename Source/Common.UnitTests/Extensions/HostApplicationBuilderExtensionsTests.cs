namespace VttTools.Extensions;

public class HostApplicationBuilderExtensionsTests {
    [Fact]
    public void AddRequiredServices_RegistersStorageServiceAndTimeProvider() {
        var builder = new HostApplicationBuilder();
        builder.AddRequiredServices();

        var services = builder.Services;
        services.Should().Contain(sd =>
            sd.ServiceType == typeof(TimeProvider) &&
            sd.ImplementationInstance == TimeProvider.System);
    }

    [Fact]
    public void ConfigureJsonOptions_DoesNotThrow() {
        var options = new JsonOptions();
        HostApplicationBuilderExtensions.ConfigureJsonOptions(options);

        options.SerializerOptions.PropertyNameCaseInsensitive.Should().BeTrue();
        options.SerializerOptions.PropertyNamingPolicy.Should().Be(JsonNamingPolicy.CamelCase);
        options.SerializerOptions.Converters.Should().HaveCount(1);
        options.SerializerOptions.Converters.Should().Contain(x => x is OptionalConverterFactory);
    }

    [Fact]
    public void AddServiceDiscovery_DoesNotThrow() {
        var builder = new HostApplicationBuilder();
        var action = builder.AddServiceDiscovery;
        action.Should().NotThrow();
    }

    [Fact]
    public void AddDetailedHealthChecks_RegistersHealthChecksBuilder() {
        var builder = new HostApplicationBuilder();

        var healthChecksBuilder = builder.AddDetailedHealthChecks();

        healthChecksBuilder.Should().NotBeNull();
        builder.Services.Should().Contain(sd => sd.ServiceType == typeof(HealthCheckService));
    }

    [Fact]
    public void AddCustomHealthCheck_RegistersCustomHealthCheck() {
        var builder = new HostApplicationBuilder();
        var healthChecksBuilder = builder.AddDetailedHealthChecks();

        var result = healthChecksBuilder.AddCustomHealthCheck("test", () => HealthCheckResult.Healthy());

        result.Should().NotBeNull();
        result.Should().BeSameAs(healthChecksBuilder);
    }

    [Fact]
    public void AddAsyncCustomHealthCheck_RegistersAsyncCustomHealthCheck() {
        var builder = new HostApplicationBuilder();
        var healthChecksBuilder = builder.AddDetailedHealthChecks();

        var result = healthChecksBuilder.AddAsyncCustomHealthCheck("async-test",
            _ => Task.FromResult(HealthCheckResult.Healthy()));

        result.Should().NotBeNull();
        result.Should().BeSameAs(healthChecksBuilder);
    }
}