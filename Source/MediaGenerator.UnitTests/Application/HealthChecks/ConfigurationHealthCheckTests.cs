using VttTools.MediaGenerator.Application.HealthChecks;

namespace VttTools.AssetImageManager.Application.HealthChecks;

public sealed class ConfigurationHealthCheckTests {
    [Fact]
    public async Task Should_ReturnWarning_When_AppsettingsJsonNotFound() {
        var appsettingsPath = Path.Combine(Directory.GetCurrentDirectory(), "appsettings.json");
        if (File.Exists(appsettingsPath)) {
            File.Delete(appsettingsPath);
        }

        var config = CreateMockConfiguration(hasOpenAiKey: true, hasStabilityKey: true);
        var check = new ConfigurationHealthCheck(config);

        var result = await check.ExecuteAsync(TestContext.Current.CancellationToken);

        Assert.Equal(HealthCheckStatus.Warning, result.Status);
        Assert.Equal("Configuration", result.CheckName);
        Assert.Equal("appsettings.json not found", result.Message);
        Assert.NotNull(result.Details);
        Assert.Contains("Checked path:", result.Details);
        Assert.NotNull(result.Remediation);
        Assert.Contains("Create appsettings.json", result.Remediation);
    }

    [Fact]
    public async Task Should_ReturnFail_When_OpenAiApiKeyMissing() {
        CreateAppsettingsFile();
        var config = CreateMockConfiguration(hasOpenAiKey: false, hasStabilityKey: true);
        var check = new ConfigurationHealthCheck(config);

        var result = await check.ExecuteAsync(TestContext.Current.CancellationToken);

        Assert.Equal(HealthCheckStatus.Fail, result.Status);
        Assert.Equal("Configuration", result.CheckName);
        Assert.Contains("Missing API keys", result.Message);
        Assert.NotNull(result.Details);
        Assert.Contains("OpenAI", result.Details);
        Assert.NotNull(result.Remediation);
    }

    [Fact]
    public async Task Should_ReturnFail_When_StabilityApiKeyMissing() {
        CreateAppsettingsFile();
        var config = CreateMockConfiguration(hasOpenAiKey: true, hasStabilityKey: false);
        var check = new ConfigurationHealthCheck(config);

        var result = await check.ExecuteAsync(TestContext.Current.CancellationToken);

        Assert.Equal(HealthCheckStatus.Fail, result.Status);
        Assert.Equal("Configuration", result.CheckName);
        Assert.Contains("Missing API keys", result.Message);
        Assert.NotNull(result.Details);
        Assert.Contains("Stability", result.Details);
        Assert.NotNull(result.Remediation);
    }

    [Fact]
    public async Task Should_ReturnFail_When_OpenAiApiKeyIsPlaceholder() {
        CreateAppsettingsFile();
        var configData = new Dictionary<string, string?> {
            ["Providers:OpenAI:ApiKey"] = "your-openai-api-key-here",
            ["Providers:Stability:ApiKey"] = "sk-test-stability-key"
        };

        var config = new ConfigurationBuilder()
            .AddInMemoryCollection(configData)
            .Build();
        var check = new ConfigurationHealthCheck(config);

        var result = await check.ExecuteAsync(TestContext.Current.CancellationToken);

        Assert.Equal(HealthCheckStatus.Fail, result.Status);
        Assert.Contains("Missing API keys", result.Message);
        Assert.NotNull(result.Details);
        Assert.Contains("OpenAI", result.Details);
    }

    [Fact]
    public async Task Should_ReturnFail_When_StabilityApiKeyIsPlaceholder() {
        CreateAppsettingsFile();
        var configData = new Dictionary<string, string?> {
            ["Providers:OpenAI:ApiKey"] = "sk-test-openai-key",
            ["Providers:Stability:ApiKey"] = "your-stability-api-key-here"
        };

        var config = new ConfigurationBuilder()
            .AddInMemoryCollection(configData)
            .Build();
        var check = new ConfigurationHealthCheck(config);

        var result = await check.ExecuteAsync(TestContext.Current.CancellationToken);

        Assert.Equal(HealthCheckStatus.Fail, result.Status);
        Assert.Contains("Missing API keys", result.Message);
        Assert.NotNull(result.Details);
        Assert.Contains("Stability", result.Details);
    }

    [Fact]
    public async Task Should_ReturnPass_When_AllConfigurationValid() {
        CreateAppsettingsFile();
        var config = CreateMockConfiguration(hasOpenAiKey: true, hasStabilityKey: true);
        var check = new ConfigurationHealthCheck(config);

        var result = await check.ExecuteAsync(TestContext.Current.CancellationToken);

        Assert.Equal(HealthCheckStatus.Pass, result.Status);
        Assert.Equal("Configuration", result.CheckName);
        Assert.Equal("Configuration valid", result.Message);
        Assert.NotNull(result.Details);
        Assert.Contains("OpenAI", result.Details);
        Assert.Contains("Stability", result.Details);
        Assert.Null(result.Remediation);
    }

    [Fact]
    public async Task Should_DetectConfiguredModels() {
        CreateAppsettingsFile();
        var configData = new Dictionary<string, string?> {
            ["Providers:OpenAI:ApiKey"] = "sk-test-key-12345",
            ["Providers:Stability:ApiKey"] = "sk-test-stability-key",
            ["Providers:Stability:Token:Model"] = "SD35",
            ["Providers:Stability:Display:Model"] = "CORE"
        };

        var config = new ConfigurationBuilder()
            .AddInMemoryCollection(configData)
            .Build();
        var check = new ConfigurationHealthCheck(config);

        var result = await check.ExecuteAsync(TestContext.Current.CancellationToken);

        Assert.Equal(HealthCheckStatus.Pass, result.Status);
        Assert.NotNull(result.Details);
        Assert.Contains("OpenAI", result.Details);
        Assert.Contains("Stability", result.Details);
    }

    [Fact]
    public async Task Should_UseDefaultModels_When_ModelsNotConfigured() {
        CreateAppsettingsFile();
        var config = CreateMockConfiguration(hasOpenAiKey: true, hasStabilityKey: true);
        var check = new ConfigurationHealthCheck(config);

        var result = await check.ExecuteAsync(TestContext.Current.CancellationToken);

        Assert.Equal(HealthCheckStatus.Pass, result.Status);
        Assert.NotNull(result.Details);
        Assert.Contains("OpenAI", result.Details);
        Assert.Contains("Stability", result.Details);
    }

    [Fact]
    public async Task Should_HaveCriticalCriticality() {
        var config = CreateMockConfiguration(hasOpenAiKey: true, hasStabilityKey: true);
        var check = new ConfigurationHealthCheck(config);

        Assert.Equal(HealthCheckCriticality.Critical, check.Criticality);
    }

    [Fact]
    public async Task Should_HaveCorrectName() {
        var config = CreateMockConfiguration(hasOpenAiKey: true, hasStabilityKey: true);
        var check = new ConfigurationHealthCheck(config);

        Assert.Equal("Configuration", check.Name);
    }

    [Fact]
    public async Task Should_MeasureDuration() {
        CreateAppsettingsFile();
        var config = CreateMockConfiguration(hasOpenAiKey: true, hasStabilityKey: true);
        var check = new ConfigurationHealthCheck(config);

        var result = await check.ExecuteAsync(TestContext.Current.CancellationToken);

        Assert.NotNull(result.Duration);
        Assert.True(result.Duration.Value.TotalMilliseconds >= 0);
    }

    private static IConfiguration CreateMockConfiguration(bool hasOpenAiKey, bool hasStabilityKey) {
        var configData = new Dictionary<string, string?>();

        if (hasOpenAiKey) {
            configData["Providers:OpenAI:ApiKey"] = "sk-test-key-12345";
        }
        configData["Providers:OpenAI:Model"] = "gpt-5-mini";

        if (hasStabilityKey) {
            configData["Providers:Stability:ApiKey"] = "sk-test-stability-key";
        }
        configData["Providers:Stability:Token:Model"] = "SD35";
        configData["Providers:Stability:Display:Model"] = "CORE";

        return new ConfigurationBuilder()
            .AddInMemoryCollection(configData)
            .Build();
    }

    private static void CreateAppsettingsFile() {
        var appsettingsPath = Path.Combine(Directory.GetCurrentDirectory(), "appsettings.json");
        if (!File.Exists(appsettingsPath)) {
            File.WriteAllText(appsettingsPath, "{}");
        }
    }
}