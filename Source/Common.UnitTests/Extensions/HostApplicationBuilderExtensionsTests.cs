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
        options.SerializerOptions.Converters.Should().HaveCount(2);
        options.SerializerOptions.Converters.Should().Contain(x => x is JsonStringEnumConverter);
        options.SerializerOptions.Converters.Should().Contain(x => x is OptionalConverterFactory);
    }

    [Fact]
    public void ConfigureCorsOptions_DoesNotThrow() {
        var options = new CorsOptions();
        HostApplicationBuilderExtensions.ConfigureCorsOptions(options);
        options.GetPolicy(options.DefaultPolicyName).Should().NotBeNull();
    }

    [Fact]
    public void ConfigureCorsPolicy_DoesNotThrow() {
        var builder = new CorsPolicyBuilder();
        HostApplicationBuilderExtensions.ConfigureCorsPolicy(builder);
        var policy = builder.Build();
        policy.Origins.Should().HaveCount(2);
        policy.Origins.Should().Contain("https://localhost:5001");
        policy.Origins.Should().Contain("https://localhost:7040");
        policy.AllowAnyMethod.Should().BeTrue();
        policy.AllowAnyHeader.Should().BeTrue();
    }

    [Fact]
    public void AddServiceDiscovery_DoesNotThrow() {
        var builder = new HostApplicationBuilder();
        var action = builder.AddServiceDiscovery;
        action.Should().NotThrow();
    }
}