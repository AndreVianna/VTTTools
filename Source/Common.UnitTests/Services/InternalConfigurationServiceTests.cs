
namespace VttTools.Services;

public class InternalConfigurationServiceTests {
    private readonly IConfiguration _configuration;
    private readonly ConfigurationSourceDetector _sourceDetector;
    private readonly InternalConfigurationService _service;

    public InternalConfigurationServiceTests() {
        var configBuilder = new ConfigurationBuilder();
        configBuilder.AddInMemoryCollection(new Dictionary<string, string?> {
            { "ApplicationName", "TestValue1" },
            { "ApplicationVersion", "TestValue2" },
            { "Password", "SecretPassword" },
            { "ApiKey", "SecretApiKey" },
            { "ConnectionStrings:Default", "Server=localhost" },
                                                                            });
        _configuration = configBuilder.Build();
        _sourceDetector = new((IConfigurationRoot)_configuration);
        _service = new(_configuration, _sourceDetector);
    }

    [Fact]
    public void GetConfigurationEntries_ReturnsAllEntries() {
        var result = _service.GetConfigurationEntries();

        result.Should().NotBeEmpty();
    }

    [Fact]
    public void GetConfigurationEntries_WithSensitivePassword_RedactsValue() {
        var result = _service.GetConfigurationEntries();

        var passwordEntry = result.FirstOrDefault(e => {
            var key = e.GetType().GetProperty("Key")?.GetValue(e)?.ToString();
            return key == "Password";
        });

        passwordEntry.Should().NotBeNull();
        var value = passwordEntry.GetType().GetProperty("Value")?.GetValue(passwordEntry)?.ToString();
        value.Should().Be("***REDACTED***");
    }

    [Fact]
    public void GetConfigurationEntries_WithSensitiveApiKey_RedactsValue() {
        var result = _service.GetConfigurationEntries();

        var apiKeyEntry = result.FirstOrDefault(e => {
            var key = e.GetType().GetProperty("Key")?.GetValue(e)?.ToString();
            return key == "ApiKey";
        });

        apiKeyEntry.Should().NotBeNull();
        var value = apiKeyEntry.GetType().GetProperty("Value")?.GetValue(apiKeyEntry)?.ToString();
        value.Should().Be("***REDACTED***");
    }

    [Fact]
    public void GetConfigurationEntries_WithSensitiveConnectionString_RedactsValue() {
        var result = _service.GetConfigurationEntries();

        var connStringEntry = result.FirstOrDefault(e => {
            var key = e.GetType().GetProperty("Key")?.GetValue(e)?.ToString();
            return key == "ConnectionStrings:Default";
        });

        connStringEntry.Should().NotBeNull();
        var value = connStringEntry.GetType().GetProperty("Value")?.GetValue(connStringEntry)?.ToString();
        value.Should().Be("***REDACTED***");
    }

    [Fact]
    public void GetConfigurationEntries_WithNonSensitiveKey_ShowsValue() {
        var result = _service.GetConfigurationEntries();

        var testEntry = result.FirstOrDefault(e => {
            var key = e.GetType().GetProperty("Key")?.GetValue(e)?.ToString();
            return key == "ApplicationName";
        });

        testEntry.Should().NotBeNull();
        var value = testEntry.GetType().GetProperty("Value")?.GetValue(testEntry)?.ToString();
        value.Should().Be("TestValue1");
    }

    [Fact]
    public void GetConfigurationEntries_SkipsNullOrEmptyKeys() {
        var result = _service.GetConfigurationEntries();

        result.Should().AllSatisfy(entry => {
            var key = entry.GetType().GetProperty("Key")?.GetValue(entry)?.ToString();
            key.Should().NotBeNullOrEmpty();
        });
    }

    [Fact]
    public void GetConfigurationEntries_SkipsNullOrEmptyValues() {
        var result = _service.GetConfigurationEntries();

        result.Should().AllSatisfy(entry => {
            var value = entry.GetType().GetProperty("Value")?.GetValue(entry)?.ToString();
            value.Should().NotBeNullOrEmpty();
        });
    }

    [Fact]
    public void GetConfigurationEntries_IncludesSourceInformation() {
        var result = _service.GetConfigurationEntries();

        result.Should().AllSatisfy(entry => {
            var source = entry.GetType().GetProperty("Source")?.GetValue(entry);
            source.Should().NotBeNull();
            var sourceType = source.GetType().GetProperty("Type")?.GetValue(source)?.ToString();
            sourceType.Should().NotBeNullOrEmpty();
        });
    }

    [Fact]
    public void GetConfigurationEntries_IncludesCategory() {
        var result = _service.GetConfigurationEntries();

        result.Should().AllSatisfy(entry => {
            var category = entry.GetType().GetProperty("Category")?.GetValue(entry)?.ToString();
            category.Should().NotBeNullOrEmpty();
        });
    }

    [Fact]
    public void GetConfigurationEntries_IncludesIsRedactedFlag() {
        var result = _service.GetConfigurationEntries();

        result.Should().AllSatisfy(entry => {
            var isRedacted = entry.GetType().GetProperty("IsRedacted");
            isRedacted.Should().NotBeNull();
        });
    }

    [Fact]
    public void GetConfigurationEntries_SensitiveKeysHaveIsRedactedTrue() {
        var result = _service.GetConfigurationEntries();

        var passwordEntry = result.FirstOrDefault(e => {
            var key = e.GetType().GetProperty("Key")?.GetValue(e)?.ToString();
            return key == "Password";
        });

        passwordEntry.Should().NotBeNull();
        var isRedacted = passwordEntry.GetType().GetProperty("IsRedacted")?.GetValue(passwordEntry);
        isRedacted.Should().Be(true);
    }

    [Fact]
    public void GetConfigurationEntries_NonSensitiveKeysHaveIsRedactedFalse() {
        var result = _service.GetConfigurationEntries();

        var testEntry = result.FirstOrDefault(e => {
            var key = e.GetType().GetProperty("Key")?.GetValue(e)?.ToString();
            return key == "ApplicationName";
        });

        testEntry.Should().NotBeNull();
        var isRedacted = testEntry.GetType().GetProperty("IsRedacted")?.GetValue(testEntry);
        isRedacted.Should().Be(false);
    }

    [Fact]
    public void GetConfigurationEntries_ReturnsReadOnlyList() {
        var result = _service.GetConfigurationEntries();

        result.Should().BeAssignableTo<IReadOnlyList<object>>();
    }

    [Fact]
    public void GetConfigurationEntries_WithSecretKeyword_RedactsValue() {
        var configBuilder = new ConfigurationBuilder();
        configBuilder.AddInMemoryCollection(new Dictionary<string, string?> {
            { "ClientSecret", "VerySecretValue" },
            { "RegularKey", "RegularValue" },
                                                                            });
        var config = configBuilder.Build();
        var detector = new ConfigurationSourceDetector(config);
        var service = new InternalConfigurationService(config, detector);

        var result = service.GetConfigurationEntries();

        var secretEntry = result.FirstOrDefault(e => {
            var key = e.GetType().GetProperty("Key")?.GetValue(e)?.ToString();
            return key == "ClientSecret";
        });

        secretEntry.Should().NotBeNull();
        var value = secretEntry.GetType().GetProperty("Value")?.GetValue(secretEntry)?.ToString();
        value.Should().Be("***REDACTED***");
    }

    [Fact]
    public void GetConfigurationEntries_WithTokenKeyword_RedactsValue() {
        var configBuilder = new ConfigurationBuilder();
        configBuilder.AddInMemoryCollection(new Dictionary<string, string?> {
            { "BearerToken", "TokenValue" },
            { "RegularKey", "RegularValue" },
                                                                            });
        var config = configBuilder.Build();
        var detector = new ConfigurationSourceDetector(config);
        var service = new InternalConfigurationService(config, detector);

        var result = service.GetConfigurationEntries();

        var tokenEntry = result.FirstOrDefault(e => {
            var key = e.GetType().GetProperty("Key")?.GetValue(e)?.ToString();
            return key == "BearerToken";
        });

        tokenEntry.Should().NotBeNull();
        var value = tokenEntry.GetType().GetProperty("Value")?.GetValue(tokenEntry)?.ToString();
        value.Should().Be("***REDACTED***");
    }
}