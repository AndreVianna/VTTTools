using VttTools.Common.Utilities;
using VttTools.Services;

namespace VttTools.Game.Handlers;

public class ConfigurationHandlersTests {
    [Fact]
    public void GetInternalConfigurationHandler_ReturnsOkResultWithServiceNameAndEntries() {
        // Arrange
        var configRoot = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?> {
                { "TestKey1", "TestValue1" },
                { "TestKey2", "TestValue2" }
            })
            .Build();

        var sourceDetector = new ConfigurationSourceDetector(configRoot);
        var configService = new InternalConfigurationService(configRoot, sourceDetector);

        // Act
        var result = ConfigurationHandlers.GetInternalConfigurationHandler(configService);

        // Assert
        result.Should().BeAssignableTo<Microsoft.AspNetCore.Http.IResult>();
        var resultType = result.GetType();
        resultType.Name.Should().StartWith("Ok");

        var valueProperty = resultType.GetProperty("Value");
        valueProperty.Should().NotBeNull();
        var value = valueProperty!.GetValue(result);
        value.Should().NotBeNull();

        var serviceName = value!.GetType().GetProperty("ServiceName")?.GetValue(value);
        serviceName.Should().Be("Game");

        var entries = value.GetType().GetProperty("Entries")?.GetValue(value) as IReadOnlyList<object>;
        entries.Should().HaveCount(2);
    }

    [Fact]
    public void GetInternalConfigurationHandler_WithEmptyEntries_ReturnsOkResultWithEmptyList() {
        // Arrange
        var configRoot = new ConfigurationBuilder()
            .AddInMemoryCollection([])
            .Build();

        var sourceDetector = new ConfigurationSourceDetector(configRoot);
        var configService = new InternalConfigurationService(configRoot, sourceDetector);

        // Act
        var result = ConfigurationHandlers.GetInternalConfigurationHandler(configService);

        // Assert
        result.Should().BeAssignableTo<Microsoft.AspNetCore.Http.IResult>();
        var resultType = result.GetType();
        resultType.Name.Should().StartWith("Ok");

        var valueProperty = resultType.GetProperty("Value");
        valueProperty.Should().NotBeNull();
        var value = valueProperty!.GetValue(result);
        value.Should().NotBeNull();

        var entries = value!.GetType().GetProperty("Entries")?.GetValue(value) as IReadOnlyList<object>;
        entries.Should().BeEmpty();
    }
}
