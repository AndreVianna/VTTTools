namespace VttTools.Library.Handlers;

public class ConfigurationHandlersTests {
    [Fact]
    public void GetInternalConfigurationHandler_ReturnsConfiguration() {
        var configData = new Dictionary<string, string?> {
            { "Key1", "Value1" },
            { "Key2", "Value2" }
        };
        var configRoot = new ConfigurationBuilder()
            .AddInMemoryCollection(configData)
            .Build();

        var configSourceDetector = new ConfigurationSourceDetector(configRoot);
        var configService = new InternalConfigurationService(configRoot, configSourceDetector);

        var result = ConfigurationHandlers.GetInternalConfigurationHandler(configService);

        result.Should().NotBeNull();
        var value = result.GetType().GetProperty("Value")?.GetValue(result);
        value.Should().NotBeNull();

        var serviceName = value!.GetType().GetProperty("ServiceName")?.GetValue(value);
        var resultEntries = value.GetType().GetProperty("Entries")?.GetValue(value) as IReadOnlyList<object>;

        serviceName.Should().Be("Library");
        resultEntries.Should().NotBeNull();
        resultEntries.Should().HaveCount(2);
    }

    [Fact]
    public void GetInternalConfigurationHandler_WithEmptyEntries_ReturnsEmptyConfiguration() {
        var configData = new Dictionary<string, string?>();
        var configRoot = new ConfigurationBuilder()
            .AddInMemoryCollection(configData)
            .Build();

        var configSourceDetector = new ConfigurationSourceDetector(configRoot);
        var configService = new InternalConfigurationService(configRoot, configSourceDetector);

        var result = ConfigurationHandlers.GetInternalConfigurationHandler(configService);

        result.Should().NotBeNull();
        var value = result.GetType().GetProperty("Value")?.GetValue(result);
        value.Should().NotBeNull();

        var resultEntries = value!.GetType().GetProperty("Entries")?.GetValue(value) as IReadOnlyList<object>;
        resultEntries.Should().NotBeNull();
        resultEntries.Should().BeEmpty();
    }
}
