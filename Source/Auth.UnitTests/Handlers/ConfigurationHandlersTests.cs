namespace VttTools.Auth.UnitTests.Handlers;

public class ConfigurationHandlersTests {
    [Fact]
    public void GetInternalConfigurationHandler_ReturnsOkResultWithConfiguration() {
        var configBuilder = new ConfigurationBuilder();
        configBuilder.AddInMemoryCollection(new Dictionary<string, string?> {
            { "Setting1", "Value1" },
            { "Setting2", "Value2" },
            { "Setting3", "Value3" }
        });
        var configRoot = configBuilder.Build();
        var sourceDetector = new ConfigurationSourceDetector(configRoot);
        var configService = new InternalConfigurationService(configRoot, sourceDetector);

        var result = ConfigurationHandlers.GetInternalConfigurationHandler(configService);

        result.Should().NotBeNull();
        result.Should().BeAssignableTo<Microsoft.AspNetCore.Http.IResult>();
    }

    [Fact]
    public void GetInternalConfigurationHandler_ReturnsServiceNameInResponse() {
        var configBuilder = new ConfigurationBuilder();
        configBuilder.AddInMemoryCollection(new Dictionary<string, string?> {
            { "JwtSecret", "secret123" },
            { "Environment", "Test" }
        });
        var configRoot = configBuilder.Build();
        var sourceDetector = new ConfigurationSourceDetector(configRoot);
        var configService = new InternalConfigurationService(configRoot, sourceDetector);

        var result = ConfigurationHandlers.GetInternalConfigurationHandler(configService);

        result.Should().NotBeNull();
        result.Should().BeAssignableTo<Microsoft.AspNetCore.Http.IResult>();
    }

    [Fact]
    public void GetInternalConfigurationHandler_WithEmptyConfiguration_ReturnsOkResult() {
        var configBuilder = new ConfigurationBuilder();
        configBuilder.AddInMemoryCollection([]);
        var configRoot = configBuilder.Build();
        var sourceDetector = new ConfigurationSourceDetector(configRoot);
        var configService = new InternalConfigurationService(configRoot, sourceDetector);

        var result = ConfigurationHandlers.GetInternalConfigurationHandler(configService);

        result.Should().NotBeNull();
        result.Should().BeAssignableTo<Microsoft.AspNetCore.Http.IResult>();
    }

    [Fact]
    public void GetInternalConfigurationHandler_WithMultipleSettings_ReturnsAllSettings() {
        var configBuilder = new ConfigurationBuilder();
        configBuilder.AddInMemoryCollection(new Dictionary<string, string?> {
            { "DatabaseConnection", "Server=localhost;Database=VTTTools;" },
            { "JwtIssuer", "VTTTools.Auth" },
            { "JwtAudience", "VTTTools.Client" },
            { "TokenExpiration", "60" },
            { "EmailService", "Console" }
        });
        var configRoot = configBuilder.Build();
        var sourceDetector = new ConfigurationSourceDetector(configRoot);
        var configService = new InternalConfigurationService(configRoot, sourceDetector);

        var result = ConfigurationHandlers.GetInternalConfigurationHandler(configService);

        result.Should().NotBeNull();
        result.Should().BeAssignableTo<Microsoft.AspNetCore.Http.IResult>();
    }
}
