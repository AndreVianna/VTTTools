using VttTools.Admin.ApiContracts;
using VttTools.Common.Utilities;

namespace VttTools.Common.UnitTests.Utilities;

public class ConfigurationSourceDetectorTests {
    [Fact]
    public void DetectSource_WithJsonConfigurationProvider_ReturnsJsonFile() {
        var configBuilder = new ConfigurationBuilder();
        configBuilder.AddInMemoryCollection(new Dictionary<string, string?> {
            { "TestKey", "TestValue" }
        });
        var configRoot = configBuilder.Build();
        var detector = new ConfigurationSourceDetector(configRoot);

        var result = detector.DetectSource("TestKey");

        result.Type.Should().Be(ConfigSourceType.InMemory);
    }

    [Fact]
    public void DetectSource_WithEnvironmentVariablesProvider_ReturnsEnvironmentVariable() {
        var configBuilder = new ConfigurationBuilder();
        configBuilder.AddEnvironmentVariables();
        var configRoot = configBuilder.Build();
        var detector = new ConfigurationSourceDetector(configRoot);

        Environment.SetEnvironmentVariable("TEST_VAR_FOR_UNIT_TEST", "TestValue");
        try {
            var result = detector.DetectSource("TEST_VAR_FOR_UNIT_TEST");

            result.Type.Should().Be(ConfigSourceType.EnvironmentVariable);
            result.Path.Should().BeNull();
        }
        finally {
            Environment.SetEnvironmentVariable("TEST_VAR_FOR_UNIT_TEST", null);
        }
    }

    [Fact]
    public void DetectSource_WithInMemoryProvider_ReturnsInMemory() {
        var configBuilder = new ConfigurationBuilder();
        configBuilder.AddInMemoryCollection(new Dictionary<string, string?> {
            { "InMemoryKey", "InMemoryValue" }
        });
        var configRoot = configBuilder.Build();
        var detector = new ConfigurationSourceDetector(configRoot);

        var result = detector.DetectSource("InMemoryKey");

        result.Type.Should().Be(ConfigSourceType.InMemory);
        result.Path.Should().BeNull();
    }

    [Fact]
    public void DetectSource_WithNonExistentKey_ReturnsNotFound() {
        var configBuilder = new ConfigurationBuilder();
        var configRoot = configBuilder.Build();
        var detector = new ConfigurationSourceDetector(configRoot);

        var result = detector.DetectSource("NonExistentKey");

        result.Type.Should().Be(ConfigSourceType.NotFound);
        result.Path.Should().BeNull();
    }

    [Fact]
    public void DetermineCategory_WithJwtPrefix_ReturnsSecurity() {
        var category = ConfigurationSourceDetector.DetermineCategory("Jwt:SecretKey");

        category.Should().Be("Security");
    }

    [Fact]
    public void DetermineCategory_WithIdentityPrefix_ReturnsSecurity() {
        var category = ConfigurationSourceDetector.DetermineCategory("Identity:Password:RequiredLength");

        category.Should().Be("Security");
    }

    [Fact]
    public void DetermineCategory_WithAuthPrefix_ReturnsSecurity() {
        var category = ConfigurationSourceDetector.DetermineCategory("Authentication:Schemes");

        category.Should().Be("Security");
    }

    [Fact]
    public void DetermineCategory_WithConnectionStringsPrefix_ReturnsStorage() {
        var category = ConfigurationSourceDetector.DetermineCategory("ConnectionStrings:DefaultConnection");

        category.Should().Be("Storage");
    }

    [Fact]
    public void DetermineCategory_WithBlobPrefix_ReturnsStorage() {
        var category = ConfigurationSourceDetector.DetermineCategory("BlobStorage:ConnectionString");

        category.Should().Be("Storage");
    }

    [Fact]
    public void DetermineCategory_WithAzurePrefix_ReturnsStorage() {
        var category = ConfigurationSourceDetector.DetermineCategory("Azure:Storage:AccountName");

        category.Should().Be("Storage");
    }

    [Fact]
    public void DetermineCategory_WithLoggingPrefix_ReturnsLogging() {
        var category = ConfigurationSourceDetector.DetermineCategory("Logging:LogLevel:Default");

        category.Should().Be("Logging");
    }

    [Fact]
    public void DetermineCategory_WithEmailPrefix_ReturnsEmail() {
        var category = ConfigurationSourceDetector.DetermineCategory("Email:SmtpServer");

        category.Should().Be("Email");
    }

    [Fact]
    public void DetermineCategory_WithSmtpPrefix_ReturnsEmail() {
        var category = ConfigurationSourceDetector.DetermineCategory("Smtp:Host");

        category.Should().Be("Email");
    }

    [Fact]
    public void DetermineCategory_WithUnknownPrefix_ReturnsGeneral() {
        var category = ConfigurationSourceDetector.DetermineCategory("RandomKey");

        category.Should().Be("General");
    }

    [Fact]
    public void DetermineCategory_IsCaseInsensitive() {
        var category1 = ConfigurationSourceDetector.DetermineCategory("JWT:SecretKey");
        var category2 = ConfigurationSourceDetector.DetermineCategory("jwt:secretkey");
        var category3 = ConfigurationSourceDetector.DetermineCategory("JwT:SeCrEtKeY");

        category1.Should().Be("Security");
        category2.Should().Be("Security");
        category3.Should().Be("Security");
    }

    [Fact]
    public void DetermineCategory_WithLoggingUpperCase_ReturnsLogging() {
        var category = ConfigurationSourceDetector.DetermineCategory("LOGGING:LOGLEVEL:DEFAULT");

        category.Should().Be("Logging");
    }

    [Fact]
    public void DetermineCategory_WithConnectionStringsMixedCase_ReturnsStorage() {
        var category = ConfigurationSourceDetector.DetermineCategory("ConnectionStrings:Default");

        category.Should().Be("Storage");
    }

    [Fact]
    public void DetectSource_ProcessesProvidersInReverseOrder() {
        var configBuilder = new ConfigurationBuilder();
        configBuilder.AddInMemoryCollection(new Dictionary<string, string?> {
            { "SharedKey", "InMemoryValue" }
        });
        configBuilder.AddInMemoryCollection(new Dictionary<string, string?> {
            { "SharedKey", "SecondInMemoryValue" }
        });
        var configRoot = configBuilder.Build();
        var detector = new ConfigurationSourceDetector(configRoot);

        var result = detector.DetectSource("SharedKey");

        result.Type.Should().Be(ConfigSourceType.InMemory);
    }
}
