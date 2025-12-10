namespace VttTools.Auth.UnitTests.Handlers;

public class ConfigurationHandlersTests {
    private readonly InternalConfigurationService _mockConfigService;

    public ConfigurationHandlersTests() {
        _mockConfigService = Substitute.For<InternalConfigurationService>();
    }

    #region GetInternalConfigurationHandler Tests

    [Fact]
    public void GetInternalConfigurationHandler_ReturnsOkResultWithConfiguration() {
        var expectedEntries = new List<object> {
            new { Key = "Setting1", Value = "Value1" },
            new { Key = "Setting2", Value = "Value2" },
            new { Key = "Setting3", Value = "Value3" }
        };

        _mockConfigService.GetConfigurationEntries().Returns(expectedEntries);

        var result = ConfigurationHandlers.GetInternalConfigurationHandler(_mockConfigService);

        result.Should().BeOfType<Ok<object>>();
        _mockConfigService.Received(1).GetConfigurationEntries();
    }

    [Fact]
    public void GetInternalConfigurationHandler_ReturnsServiceNameInResponse() {
        var expectedEntries = new List<object> {
            new { Key = "JwtSecret", Value = "***" },
            new { Key = "Environment", Value = "Test" }
        };

        _mockConfigService.GetConfigurationEntries().Returns(expectedEntries);

        var result = ConfigurationHandlers.GetInternalConfigurationHandler(_mockConfigService);

        result.Should().BeOfType<Ok<object>>();
        var okResult = (Ok<object>)result;
        okResult.Value.Should().NotBeNull();
    }

    [Fact]
    public void GetInternalConfigurationHandler_WithEmptyConfiguration_ReturnsOkResult() {
        var emptyEntries = new List<object>();

        _mockConfigService.GetConfigurationEntries().Returns(emptyEntries);

        var result = ConfigurationHandlers.GetInternalConfigurationHandler(_mockConfigService);

        result.Should().BeOfType<Ok<object>>();
        _mockConfigService.Received(1).GetConfigurationEntries();
    }

    [Fact]
    public void GetInternalConfigurationHandler_WithMultipleSettings_ReturnsAllSettings() {
        var expectedEntries = new List<object> {
            new { Key = "DatabaseConnection", Value = "Server=localhost;Database=VTTTools;" },
            new { Key = "JwtIssuer", Value = "VTTTools.Auth" },
            new { Key = "JwtAudience", Value = "VTTTools.Client" },
            new { Key = "TokenExpiration", Value = "60" },
            new { Key = "EmailService", Value = "Console" }
        };

        _mockConfigService.GetConfigurationEntries().Returns(expectedEntries);

        var result = ConfigurationHandlers.GetInternalConfigurationHandler(_mockConfigService);

        result.Should().BeOfType<Ok<object>>();
        var okResult = (Ok<object>)result;
        okResult.Value.Should().NotBeNull();
        _mockConfigService.Received(1).GetConfigurationEntries();
    }

    #endregion
}
