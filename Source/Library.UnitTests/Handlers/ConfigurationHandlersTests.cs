namespace VttTools.Library.Handlers;

public class ConfigurationHandlersTests {
    [Fact]
    public void GetInternalConfigurationHandler_ReturnsConfiguration() {
        var configRoot = Substitute.For<IConfigurationRoot>();
        var config = Substitute.For<IConfiguration>();
        var configSourceDetector = new ConfigurationSourceDetector(configRoot);
        var configService = new InternalConfigurationService(config, configSourceDetector);
        var entries = new List<object>() {
            "Value1",
            "Value2",
        };
        configService.GetConfigurationEntries().Returns(entries);

        var result = ConfigurationHandlers.GetInternalConfigurationHandler(configService);

        var okResult = result.Should().BeOfType<Ok<object>>().Subject;
        var value = okResult.Value;
        value.Should().NotBeNull();

        var serviceName = value.GetType().GetProperty("ServiceName")?.GetValue(value);
        var resultEntries = value.GetType().GetProperty("Entries")?.GetValue(value) as Dictionary<string, string>;

        serviceName.Should().Be("Library");
        resultEntries.Should().BeEquivalentTo(entries);
        configService.Received(1).GetConfigurationEntries();
    }

    [Fact]
    public void GetInternalConfigurationHandler_WithEmptyEntries_ReturnsEmptyConfiguration() {
        var configRoot = Substitute.For<IConfigurationRoot>();
        var config = Substitute.For<IConfiguration>();
        var configSourceDetector = new ConfigurationSourceDetector(configRoot);
        var configService = new InternalConfigurationService(config, configSourceDetector);
        var entries = new List<object>();
        configService.GetConfigurationEntries().Returns(entries);

        var result = ConfigurationHandlers.GetInternalConfigurationHandler(configService);

        var okResult = result.Should().BeOfType<Ok<object>>().Subject;
        var value = okResult.Value;
        value.Should().NotBeNull();

        var resultEntries = value.GetType().GetProperty("Entries")?.GetValue(value) as Dictionary<string, string>;
        resultEntries.Should().NotBeNull();
        resultEntries.Should().BeEmpty();
    }
}
