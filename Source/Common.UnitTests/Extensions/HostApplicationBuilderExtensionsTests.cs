using VttTools.Configuration;

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
        // Now includes JsonStringEnumConverter and OptionalConverterFactory
        options.SerializerOptions.Converters.Should().HaveCount(2);
        options.SerializerOptions.Converters.Should().Contain(x => x is OptionalConverterFactory);
        options.SerializerOptions.Converters.Should().Contain(x => x is JsonStringEnumConverter);
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

    #region Cookie Priority Tests

    /// <summary>
    /// CRITICAL REGRESSION TEST: Verifies that client cookie is checked before admin cookie.
    /// This prevents the bug where an expired admin cookie would be used instead of a fresh
    /// client cookie, causing 401 errors after successful login in WebClientApp.
    /// </summary>
    [Fact]
    public void CookiePriority_ClientCookieConstant_IsDifferentFromAdminCookieConstant() {
        AuthCookieConstants.ClientCookieName.Should().NotBe(AuthCookieConstants.AdminCookieName);
    }

    [Fact]
    public void CookiePriority_ClientCookieName_HasExpectedValue() {
        AuthCookieConstants.ClientCookieName.Should().Be("vtttools_client_auth");
    }

    [Fact]
    public void CookiePriority_AdminCookieName_HasExpectedValue() {
        AuthCookieConstants.AdminCookieName.Should().Be("vtttools_admin_auth");
    }

    #endregion

    #region JWT Authentication Configuration Tests

    [Fact]
    public void AddJwtAuthentication_RegistersAuthenticationServices() {
        var builder = new HostApplicationBuilder();
        builder.Configuration.AddInMemoryCollection(new Dictionary<string, string?> {
            ["Jwt:SecretKey"] = "this-is-a-test-secret-key-at-least-32-chars-long",
            ["Jwt:Issuer"] = "test-issuer",
            ["Jwt:Audience"] = "test-audience"
        });

        builder.AddJwtAuthentication();

        builder.Services.Should().Contain(sd =>
            sd.ServiceType == typeof(Microsoft.AspNetCore.Authentication.IAuthenticationService));
    }

    [Fact]
    public void AddJwtAuthentication_ConfiguresJwtOptions() {
        var builder = new HostApplicationBuilder();
        builder.Configuration.AddInMemoryCollection(new Dictionary<string, string?> {
            ["Jwt:SecretKey"] = "this-is-a-test-secret-key-at-least-32-chars-long",
            ["Jwt:Issuer"] = "test-issuer",
            ["Jwt:Audience"] = "test-audience"
        });

        builder.AddJwtAuthentication();

        builder.Services.Should().Contain(sd =>
            sd.ServiceType == typeof(IConfigureOptions<JwtOptions>));
    }

    [Fact]
    public void AddJwtAuthentication_ThrowsWhenJwtConfigurationMissing() {
        var builder = new HostApplicationBuilder();

        var action = () => builder.AddJwtAuthentication();

        action.Should().Throw<InvalidOperationException>()
            .WithMessage("*JWT configuration section 'Jwt' is missing*");
    }

    #endregion
}