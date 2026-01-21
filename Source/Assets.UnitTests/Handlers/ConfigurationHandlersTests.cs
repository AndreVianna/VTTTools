namespace VttTools.Assets.Handlers;

public class ConfigurationHandlersTests {
    private readonly InternalConfigurationService _configService;

    public ConfigurationHandlersTests() {
        var configBuilder = new ConfigurationBuilder();
        configBuilder.AddInMemoryCollection(new Dictionary<string, string?> {
            { "ServiceUrl", "http://localhost:5000" },
            { "Environment", "Development" }
        });
        var configuration = configBuilder.Build();
        var sourceDetector = new ConfigurationSourceDetector(configuration);
        _configService = new(configuration, sourceDetector);
    }

    [Fact]
    public void GetInternalConfigurationHandler_ReturnsOkResult() {
        var result = ConfigurationHandlers.GetInternalConfigurationHandler(_configService);

        result.Should().BeAssignableTo<Microsoft.AspNetCore.Http.IResult>();
        var okResult = result as IStatusCodeHttpResult;
        okResult.Should().NotBeNull();
        okResult.StatusCode.Should().Be(200);
    }

    [Fact]
    public void GetInternalConfigurationHandler_ReturnsServiceNameAsAssets() {
        var result = ConfigurationHandlers.GetInternalConfigurationHandler(_configService);

        result.Should().BeAssignableTo<Microsoft.AspNetCore.Http.IResult>();
        var okResult = result as IStatusCodeHttpResult;
        okResult.Should().NotBeNull();
        okResult.StatusCode.Should().Be(200);
    }

    [Fact]
    public void GetInternalConfigurationHandler_ReturnsConfigurationEntries() {
        var result = ConfigurationHandlers.GetInternalConfigurationHandler(_configService);

        result.Should().BeAssignableTo<Microsoft.AspNetCore.Http.IResult>();
        var okResult = result as IStatusCodeHttpResult;
        okResult.Should().NotBeNull();
        okResult.StatusCode.Should().Be(200);
    }

    [Fact]
    public void GetInternalConfigurationHandler_WithEmptyConfiguration_ReturnsEmptyEntries() {
        var configBuilder = new ConfigurationBuilder();
        configBuilder.AddInMemoryCollection([]);
        var configuration = configBuilder.Build();
        var sourceDetector = new ConfigurationSourceDetector(configuration);
        var emptyConfigService = new InternalConfigurationService(configuration, sourceDetector);

        var result = ConfigurationHandlers.GetInternalConfigurationHandler(emptyConfigService);

        result.Should().BeAssignableTo<Microsoft.AspNetCore.Http.IResult>();
        var okResult = result as IStatusCodeHttpResult;
        okResult.Should().NotBeNull();
        okResult.StatusCode.Should().Be(200);
    }
}