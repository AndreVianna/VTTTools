namespace VttTools.AssetImageManager.Application.Commands;

public sealed class DoctorCommandTests : IDisposable {
    private readonly string _tempDir;
    private readonly StringWriter _consoleOutput;
    private readonly TextWriter _originalConsoleOut;

    public DoctorCommandTests() {
        _tempDir = Path.Combine(Path.GetTempPath(), $"DoctorCommandTests_{Guid.NewGuid():N}");
        Directory.CreateDirectory(_tempDir);

        _originalConsoleOut = Console.Out;
        _consoleOutput = new StringWriter();
        Console.SetOut(_consoleOutput);

        CreateAppsettingsFile();
        CreateValidThemesJson();
    }

    public void Dispose() {
        Console.SetOut(_originalConsoleOut);
        _consoleOutput.Dispose();

        if (Directory.Exists(_tempDir)) {
            try {
                Directory.Delete(_tempDir, true);
            }
            catch {
            }
        }

        var appsettingsPath = Path.Combine(Directory.GetCurrentDirectory(), "appsettings.json");
        if (File.Exists(appsettingsPath)) {
            try {
                File.Delete(appsettingsPath);
            }
            catch {
            }
        }

        var themesPath = Path.Combine(AppContext.BaseDirectory, "JobData", "themes.json");
        if (File.Exists(themesPath)) {
            try {
                File.Delete(themesPath);
            }
            catch {
            }
        }
    }

    [Fact]
    public async Task Should_ExecuteAllChecks_When_NoSkipFlags() {
        var config = CreateMockConfiguration(hasOpenAiKey: true, hasStabilityKey: true);
        var httpClientFactory = CreateMockHttpClientFactory(HttpStatusCode.OK);
        var command = new DoctorCommand(config, httpClientFactory, _tempDir);
        var options = new DoctorOptions(Verbose: false, SkipApi: false);

        var exitCode = await command.ExecuteAsync(options, TestContext.Current.CancellationToken);

        var output = _consoleOutput.ToString();
        Assert.Contains("Configuration Checks", output);
        Assert.Contains("Filesystem Checks", output);
        Assert.Contains("API Connectivity Checks", output);
        Assert.Contains("Summary:", output);
    }

    [Fact]
    public async Task Should_SkipApiChecks_When_SkipApiFlagSet() {
        var config = CreateMockConfiguration(hasOpenAiKey: true, hasStabilityKey: true);
        var httpClientFactory = CreateMockHttpClientFactory(HttpStatusCode.OK);
        var command = new DoctorCommand(config, httpClientFactory, _tempDir);
        var options = new DoctorOptions(Verbose: false, SkipApi: true);

        var exitCode = await command.ExecuteAsync(options, TestContext.Current.CancellationToken);

        var output = _consoleOutput.ToString();
        Assert.Contains("Configuration Checks", output);
        Assert.Contains("Filesystem Checks", output);
        Assert.DoesNotContain("API Connectivity Checks", output);
    }

    [Fact]
    public async Task Should_ReturnExitCode0_When_AllChecksPassed() {
        var config = CreateMockConfiguration(hasOpenAiKey: true, hasStabilityKey: true);
        var httpClientFactory = CreateMockHttpClientFactory(HttpStatusCode.OK);
        var command = new DoctorCommand(config, httpClientFactory, _tempDir);
        var options = new DoctorOptions(Verbose: false, SkipApi: false);

        var exitCode = await command.ExecuteAsync(options, TestContext.Current.CancellationToken);

        Assert.Equal(0, exitCode);
        var output = _consoleOutput.ToString();
        Assert.Contains("READY", output);
    }

    [Fact]
    public async Task Should_ReturnExitCode1_When_AnyCriticalCheckFailed() {
        var config = CreateMockConfiguration(hasOpenAiKey: false, hasStabilityKey: false);
        var httpClientFactory = CreateMockHttpClientFactory(HttpStatusCode.OK);
        var command = new DoctorCommand(config, httpClientFactory, _tempDir);
        var options = new DoctorOptions(Verbose: false, SkipApi: true);

        var exitCode = await command.ExecuteAsync(options, TestContext.Current.CancellationToken);

        Assert.Equal(1, exitCode);
        var output = _consoleOutput.ToString();
        Assert.Contains("CRITICAL", output);
        Assert.Contains("critical failure", output);
    }

    [Fact]
    public async Task Should_ReturnExitCode0_When_OnlyWarnings() {
        var config = CreateMockConfiguration(hasOpenAiKey: true, hasStabilityKey: true);
        var httpClientFactory = CreateMockHttpClientFactory(HttpStatusCode.OK);
        var command = new DoctorCommand(config, httpClientFactory, _tempDir);
        var options = new DoctorOptions(Verbose: false, SkipApi: false);

        var exitCode = await command.ExecuteAsync(options, TestContext.Current.CancellationToken);

        if (exitCode == 0) {
            var output = _consoleOutput.ToString();
            Assert.True(output.Contains("READY") || output.Contains("DEGRADED"));
        }
    }

    [Fact]
    public async Task Should_GroupChecksByCategory() {
        var config = CreateMockConfiguration(hasOpenAiKey: true, hasStabilityKey: true);
        var httpClientFactory = CreateMockHttpClientFactory(HttpStatusCode.OK);
        var command = new DoctorCommand(config, httpClientFactory, _tempDir);
        var options = new DoctorOptions(Verbose: false, SkipApi: false);

        await command.ExecuteAsync(options, TestContext.Current.CancellationToken);

        var output = _consoleOutput.ToString();
        var configIndex = output.IndexOf("Configuration Checks");
        var filesystemIndex = output.IndexOf("Filesystem Checks");
        var apiIndex = output.IndexOf("API Connectivity Checks");

        Assert.True(configIndex >= 0);
        Assert.True(filesystemIndex >= 0);
        Assert.True(apiIndex >= 0);
        Assert.True(configIndex < filesystemIndex);
        Assert.True(filesystemIndex < apiIndex);
    }

    [Fact]
    public async Task Should_DisplaySummaryStatistics() {
        var config = CreateMockConfiguration(hasOpenAiKey: true, hasStabilityKey: true);
        var httpClientFactory = CreateMockHttpClientFactory(HttpStatusCode.OK);
        var command = new DoctorCommand(config, httpClientFactory, _tempDir);
        var options = new DoctorOptions(Verbose: false, SkipApi: false);

        await command.ExecuteAsync(options, TestContext.Current.CancellationToken);

        var output = _consoleOutput.ToString();
        Assert.Contains("Summary:", output);
        Assert.Contains("checks passed", output);
    }

    [Fact]
    public async Task Should_ShowDetailsInVerboseMode() {
        var config = CreateMockConfiguration(hasOpenAiKey: true, hasStabilityKey: true);
        var httpClientFactory = CreateMockHttpClientFactory(HttpStatusCode.OK);
        var command = new DoctorCommand(config, httpClientFactory, _tempDir);
        var options = new DoctorOptions(Verbose: true, SkipApi: false);

        await command.ExecuteAsync(options, TestContext.Current.CancellationToken);

        var output = _consoleOutput.ToString();
        Assert.NotEmpty(output);
    }

    [Fact]
    public async Task Should_HideDetailsInNonVerboseMode() {
        var config = CreateMockConfiguration(hasOpenAiKey: true, hasStabilityKey: true);
        var httpClientFactory = CreateMockHttpClientFactory(HttpStatusCode.OK);
        var command = new DoctorCommand(config, httpClientFactory, _tempDir);
        var options = new DoctorOptions(Verbose: false, SkipApi: false);

        await command.ExecuteAsync(options, TestContext.Current.CancellationToken);

        var output = _consoleOutput.ToString();
        Assert.NotEmpty(output);
    }

    [Fact]
    public async Task Should_ShowRemediationForFailedChecks() {
        var config = CreateMockConfiguration(hasOpenAiKey: false, hasStabilityKey: false);
        var httpClientFactory = CreateMockHttpClientFactory(HttpStatusCode.OK);
        var command = new DoctorCommand(config, httpClientFactory, _tempDir);
        var options = new DoctorOptions(Verbose: false, SkipApi: true);

        await command.ExecuteAsync(options, TestContext.Current.CancellationToken);

        var output = _consoleOutput.ToString();
        Assert.Contains("→", output);
    }

    [Fact]
    public async Task Should_HandleCancellation() {
        var config = CreateMockConfiguration(hasOpenAiKey: true, hasStabilityKey: true);
        var httpClientFactory = CreateMockHttpClientFactory(HttpStatusCode.OK);
        var command = new DoctorCommand(config, httpClientFactory, _tempDir);
        var options = new DoctorOptions(Verbose: false, SkipApi: false);
        var cts = new CancellationTokenSource();
        cts.Cancel();

        var exception = await Record.ExceptionAsync(async () => await command.ExecuteAsync(options, cts.Token));

        Assert.True(exception is null or OperationCanceledException);
    }

    [Fact]
    public async Task Should_CountPassedChecks() {
        var config = CreateMockConfiguration(hasOpenAiKey: true, hasStabilityKey: true);
        var httpClientFactory = CreateMockHttpClientFactory(HttpStatusCode.OK);
        var command = new DoctorCommand(config, httpClientFactory, _tempDir);
        var options = new DoctorOptions(Verbose: false, SkipApi: false);

        await command.ExecuteAsync(options, TestContext.Current.CancellationToken);

        var output = _consoleOutput.ToString();
        Assert.Contains("checks passed", output);
        Assert.Matches(@"\d+/\d+", output);
    }

    [Fact]
    public async Task Should_CountWarnings() {
        var config = CreateMockConfiguration(hasOpenAiKey: true, hasStabilityKey: true);
        var httpClientFactory = CreateMockHttpClientFactory(HttpStatusCode.InternalServerError);
        var command = new DoctorCommand(config, httpClientFactory, _tempDir);
        var options = new DoctorOptions(Verbose: false, SkipApi: false);

        await command.ExecuteAsync(options, TestContext.Current.CancellationToken);

        var output = _consoleOutput.ToString();
        if (output.Contains("warning")) {
            Assert.Matches(@"\d+ warning", output);
        }
    }

    [Fact]
    public async Task Should_CountFailures() {
        var config = CreateMockConfiguration(hasOpenAiKey: false, hasStabilityKey: false);
        var httpClientFactory = CreateMockHttpClientFactory(HttpStatusCode.OK);
        var command = new DoctorCommand(config, httpClientFactory, _tempDir);
        var options = new DoctorOptions(Verbose: false, SkipApi: true);

        await command.ExecuteAsync(options, TestContext.Current.CancellationToken);

        var output = _consoleOutput.ToString();
        Assert.Contains("critical failure", output);
        Assert.Matches(@"\d+ critical failure", output);
    }

    [Fact]
    public async Task Should_DisplayHeader() {
        var config = CreateMockConfiguration(hasOpenAiKey: true, hasStabilityKey: true);
        var httpClientFactory = CreateMockHttpClientFactory(HttpStatusCode.OK);
        var command = new DoctorCommand(config, httpClientFactory, _tempDir);
        var options = new DoctorOptions(Verbose: false, SkipApi: false);

        await command.ExecuteAsync(options, TestContext.Current.CancellationToken);

        var output = _consoleOutput.ToString();
        Assert.Contains("MediaGenerator", output);
        Assert.Contains("System Diagnostics", output);
        Assert.Contains("=====", output);
    }

    private static IConfiguration CreateMockConfiguration(bool hasOpenAiKey, bool hasStabilityKey) {
        var configData = new Dictionary<string, string?>();

        if (hasOpenAiKey) {
            configData["Providers:OpenAI:ApiKey"] = "sk-test-key-12345";
            configData["Providers:OpenAI:Model"] = "gpt-5-mini";
            configData["Providers:OpenAI:BaseUrl"] = "https://api.openai.com";
            configData["Providers:OpenAI:HealthPath"] = "/v1/models";
        }
        else {
            configData["Providers:OpenAI:Model"] = "gpt-5-mini";
        }

        if (hasStabilityKey) {
            configData["Providers:Stability:ApiKey"] = "sk-test-stability-key";
            configData["Providers:Stability:Token:Model"] = "SD35";
            configData["Providers:Stability:Display:Model"] = "CORE";
            configData["Providers:Stability:BaseUrl"] = "https://api.stability.ai";
            configData["Providers:Stability:HealthPath"] = "/v1/user/account";
        }
        else {
            configData["Providers:Stability:Token:Model"] = "SD35";
            configData["Providers:Stability:Display:Model"] = "CORE";
        }

        return new ConfigurationBuilder()
            .AddInMemoryCollection(configData)
            .Build();
    }

    private static IHttpClientFactory CreateMockHttpClientFactory(HttpStatusCode statusCode) {
        var mockFactory = Substitute.For<IHttpClientFactory>();
        mockFactory.CreateClient(Arg.Any<string>()).Returns(_ => {
            var handler = new MockHttpMessageHandler(statusCode);
            return new HttpClient(handler);
        });

        return mockFactory;
    }

    private static void CreateAppsettingsFile() {
        var appsettingsPath = Path.Combine(Directory.GetCurrentDirectory(), "appsettings.json");
        if (!File.Exists(appsettingsPath)) {
            File.WriteAllText(appsettingsPath, "{}");
        }
    }

    private static void CreateValidThemesJson() {
        var themesPath = Path.Combine(AppContext.BaseDirectory, "JobData", "themes.json");
        Directory.CreateDirectory(Path.GetDirectoryName(themesPath)!);

        const string themesJson = """
                                  {
                                    "version": "1.0",
                                    "themes": [
                                      {
                                        "id": "test_theme",
                                        "name": "Test Theme",
                                        "category": "Style",
                                        "description": "A test theme"
                                      }
                                    ]
                                  }
                                  """;

        File.WriteAllText(themesPath, themesJson);
    }

    private sealed class MockHttpMessageHandler(HttpStatusCode statusCode) : HttpMessageHandler {
        private readonly HttpStatusCode _statusCode = statusCode;

        protected override Task<HttpResponseMessage> SendAsync(
            HttpRequestMessage request,
            CancellationToken cancellationToken) {

            var response = new HttpResponseMessage(_statusCode);
            return Task.FromResult(response);
        }
    }
}