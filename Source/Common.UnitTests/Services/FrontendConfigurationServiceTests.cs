
namespace VttTools.Common.UnitTests.Services;

public class FrontendConfigurationServiceTests {
    private readonly ILogger<FrontendConfigurationService> _logger;
    private readonly FrontendConfigurationService _service;
    private readonly string _testDirectory;

    public FrontendConfigurationServiceTests() {
        _logger = Substitute.For<ILogger<FrontendConfigurationService>>();
        _service = new FrontendConfigurationService(_logger);
        _testDirectory = Path.Combine(Path.GetTempPath(), $"VttToolsTest_{Guid.CreateVersion7():N}");
        Directory.CreateDirectory(_testDirectory);
    }

    [Fact]
    public async Task GetFrontendConfigurationAsync_WithNonExistentFile_ReturnsEmptyList() {
        const string appName = "NonExistentApp";

        var result = await _service.GetFrontendConfigurationAsync(appName, TestContext.Current.CancellationToken);

        result.Should().BeEmpty();
    }

    [Fact]
    public async Task GetFrontendConfigurationAsync_WithValidEnvFile_ReturnsEntries() {
        const string appName = "TestApp";
        var parentDir = Path.Combine(_testDirectory, "parent");
        Directory.CreateDirectory(parentDir);
        var appPath = Path.Combine(_testDirectory, appName);
        Directory.CreateDirectory(appPath);
        var envFilePath = Path.Combine(appPath, ".env");
        await File.WriteAllTextAsync(envFilePath, "APP_NAME=VALUE1\nAPP_VERSION=VALUE2", TestContext.Current.CancellationToken);

        var currentDir = Directory.GetCurrentDirectory();
        try {
            Directory.SetCurrentDirectory(parentDir);

            var result = await _service.GetFrontendConfigurationAsync(appName, TestContext.Current.CancellationToken);

            result.Should().HaveCount(2);
            result[0].Key.Should().Be("APP_NAME");
            result[0].Value.Should().Be("VALUE1");
            result[1].Key.Should().Be("APP_VERSION");
            result[1].Value.Should().Be("VALUE2");
        }
        finally {
            Directory.SetCurrentDirectory(currentDir);
            Directory.Delete(_testDirectory, true);
        }
    }

    [Fact]
    public async Task GetFrontendConfigurationAsync_WithSensitiveKeys_RedactsValues() {
        const string appName = "TestApp";
        var parentDir = Path.Combine(_testDirectory, "parent");
        Directory.CreateDirectory(parentDir);
        var appPath = Path.Combine(_testDirectory, appName);
        Directory.CreateDirectory(appPath);
        var envFilePath = Path.Combine(appPath, ".env");
        await File.WriteAllTextAsync(envFilePath, "API_KEY=secret123\nAPI_PASSWORD=pass123\nREGULAR_SETTING=visible", TestContext.Current.CancellationToken);

        var currentDir = Directory.GetCurrentDirectory();
        try {
            Directory.SetCurrentDirectory(parentDir);

            var result = await _service.GetFrontendConfigurationAsync(appName, TestContext.Current.CancellationToken);

            result.Should().HaveCount(3);
            var apiKeyEntry = result.First(e => e.Key == "API_KEY");
            apiKeyEntry.Value.Should().Be("***REDACTED***");
            var passwordEntry = result.First(e => e.Key == "API_PASSWORD");
            passwordEntry.Value.Should().Be("***REDACTED***");
            var regularEntry = result.First(e => e.Key == "REGULAR_SETTING");
            regularEntry.Value.Should().Be("visible");
        }
        finally {
            Directory.SetCurrentDirectory(currentDir);
            Directory.Delete(_testDirectory, true);
        }
    }

    [Fact]
    public async Task GetFrontendConfigurationAsync_WithPasswordInKey_RedactsValue() {
        const string appName = "TestApp";
        var parentDir = Path.Combine(_testDirectory, "parent");
        Directory.CreateDirectory(parentDir);
        var appPath = Path.Combine(_testDirectory, appName);
        Directory.CreateDirectory(appPath);
        var envFilePath = Path.Combine(appPath, ".env");
        await File.WriteAllTextAsync(envFilePath, "DB_PASSWORD=secret\nUSER_PASS=hidden", TestContext.Current.CancellationToken);

        var currentDir = Directory.GetCurrentDirectory();
        try {
            Directory.SetCurrentDirectory(parentDir);

            var result = await _service.GetFrontendConfigurationAsync(appName, TestContext.Current.CancellationToken);

            result.Should().HaveCount(2);
            result.Should().AllSatisfy(e => e.Value.Should().Be("***REDACTED***"));
        }
        finally {
            Directory.SetCurrentDirectory(currentDir);
            Directory.Delete(_testDirectory, true);
        }
    }

    [Fact]
    public async Task GetFrontendConfigurationAsync_WithTokenInKey_RedactsValue() {
        const string appName = "TestApp";
        var parentDir = Path.Combine(_testDirectory, "parent");
        Directory.CreateDirectory(parentDir);
        var appPath = Path.Combine(_testDirectory, appName);
        Directory.CreateDirectory(appPath);
        var envFilePath = Path.Combine(appPath, ".env");
        await File.WriteAllTextAsync(envFilePath,
            "ACCESS_TOKEN=token123\nREFRESHTOKEN=refresh456\nBEARER_TOKEN=bearer789", TestContext.Current.CancellationToken);

        var currentDir = Directory.GetCurrentDirectory();
        try {
            Directory.SetCurrentDirectory(parentDir);

            var result = await _service.GetFrontendConfigurationAsync(appName, TestContext.Current.CancellationToken);

            result.Should().HaveCount(3);
            result.Should().AllSatisfy(e => e.Value.Should().Be("***REDACTED***"));
        }
        finally {
            Directory.SetCurrentDirectory(currentDir);
            Directory.Delete(_testDirectory, true);
        }
    }

    [Fact]
    public async Task GetFrontendConfigurationAsync_WithSecretInKey_RedactsValue() {
        const string appName = "TestApp";
        var parentDir = Path.Combine(_testDirectory, "parent");
        Directory.CreateDirectory(parentDir);
        var appPath = Path.Combine(_testDirectory, appName);
        Directory.CreateDirectory(appPath);
        var envFilePath = Path.Combine(appPath, ".env");
        await File.WriteAllTextAsync(envFilePath, "CLIENT_SECRET=secret123\nAPI_SECRET=apisecret456", TestContext.Current.CancellationToken);

        var currentDir = Directory.GetCurrentDirectory();
        try {
            Directory.SetCurrentDirectory(parentDir);

            var result = await _service.GetFrontendConfigurationAsync(appName, TestContext.Current.CancellationToken);

            result.Should().HaveCount(2);
            result.Should().AllSatisfy(e => e.Value.Should().Be("***REDACTED***"));
        }
        finally {
            Directory.SetCurrentDirectory(currentDir);
            Directory.Delete(_testDirectory, true);
        }
    }

    [Fact]
    public async Task GetFrontendConfigurationAsync_WithConnectionStringInKey_RedactsValue() {
        const string appName = "TestApp";
        var parentDir = Path.Combine(_testDirectory, "parent");
        Directory.CreateDirectory(parentDir);
        var appPath = Path.Combine(_testDirectory, appName);
        Directory.CreateDirectory(appPath);
        var envFilePath = Path.Combine(appPath, ".env");
        await File.WriteAllTextAsync(envFilePath, "CONNECTIONSTRING=Server=localhost;Database=test", TestContext.Current.CancellationToken);

        var currentDir = Directory.GetCurrentDirectory();
        try {
            Directory.SetCurrentDirectory(parentDir);

            var result = await _service.GetFrontendConfigurationAsync(appName, TestContext.Current.CancellationToken);

            result.Should().HaveCount(1);
            result[0].Value.Should().Be("***REDACTED***");
        }
        finally {
            Directory.SetCurrentDirectory(currentDir);
            Directory.Delete(_testDirectory, true);
        }
    }

    [Fact]
    public async Task GetFrontendConfigurationAsync_WithHashInKey_RedactsValue() {
        const string appName = "TestApp";
        var parentDir = Path.Combine(_testDirectory, "parent");
        Directory.CreateDirectory(parentDir);
        var appPath = Path.Combine(_testDirectory, appName);
        Directory.CreateDirectory(appPath);
        var envFilePath = Path.Combine(appPath, ".env");
        await File.WriteAllTextAsync(envFilePath, "PASSWORD_HASH=hash123", TestContext.Current.CancellationToken);

        var currentDir = Directory.GetCurrentDirectory();
        try {
            Directory.SetCurrentDirectory(parentDir);

            var result = await _service.GetFrontendConfigurationAsync(appName, TestContext.Current.CancellationToken);

            result.Should().HaveCount(1);
            result[0].Value.Should().Be("***REDACTED***");
        }
        finally {
            Directory.SetCurrentDirectory(currentDir);
            Directory.Delete(_testDirectory, true);
        }
    }

    [Fact]
    public async Task GetFrontendConfigurationAsync_WithComments_SkipsCommentLines() {
        const string appName = "TestApp";
        var parentDir = Path.Combine(_testDirectory, "parent");
        Directory.CreateDirectory(parentDir);
        var appPath = Path.Combine(_testDirectory, appName);
        Directory.CreateDirectory(appPath);
        var envFilePath = Path.Combine(appPath, ".env");
        await File.WriteAllTextAsync(envFilePath, "# This is a comment\nAPP_NAME=VALUE1\n# Another comment\nAPP_VERSION=VALUE2", TestContext.Current.CancellationToken);

        var currentDir = Directory.GetCurrentDirectory();
        try {
            Directory.SetCurrentDirectory(parentDir);

            var result = await _service.GetFrontendConfigurationAsync(appName, TestContext.Current.CancellationToken);

            result.Should().HaveCount(2);
            result[0].Key.Should().Be("APP_NAME");
            result[1].Key.Should().Be("APP_VERSION");
        }
        finally {
            Directory.SetCurrentDirectory(currentDir);
            Directory.Delete(_testDirectory, true);
        }
    }

    [Fact]
    public async Task GetFrontendConfigurationAsync_WithEmptyLines_SkipsEmptyLines() {
        const string appName = "TestApp";
        var parentDir = Path.Combine(_testDirectory, "parent");
        Directory.CreateDirectory(parentDir);
        var appPath = Path.Combine(_testDirectory, appName);
        Directory.CreateDirectory(appPath);
        var envFilePath = Path.Combine(appPath, ".env");
        await File.WriteAllTextAsync(envFilePath, "APP_NAME=VALUE1\n\n\nAPP_VERSION=VALUE2\n\n", TestContext.Current.CancellationToken);

        var currentDir = Directory.GetCurrentDirectory();
        try {
            Directory.SetCurrentDirectory(parentDir);

            var result = await _service.GetFrontendConfigurationAsync(appName, TestContext.Current.CancellationToken);

            result.Should().HaveCount(2);
        }
        finally {
            Directory.SetCurrentDirectory(currentDir);
            Directory.Delete(_testDirectory, true);
        }
    }

    [Fact]
    public async Task GetFrontendConfigurationAsync_WithMalformedLines_SkipsMalformedLines() {
        const string appName = "TestApp";
        var parentDir = Path.Combine(_testDirectory, "parent");
        Directory.CreateDirectory(parentDir);
        var appPath = Path.Combine(_testDirectory, appName);
        Directory.CreateDirectory(appPath);
        var envFilePath = Path.Combine(appPath, ".env");
        await File.WriteAllTextAsync(envFilePath, "APP_NAME=VALUE1\nMALFORMED_LINE\nAPP_VERSION=VALUE2", TestContext.Current.CancellationToken);

        var currentDir = Directory.GetCurrentDirectory();
        try {
            Directory.SetCurrentDirectory(parentDir);

            var result = await _service.GetFrontendConfigurationAsync(appName, TestContext.Current.CancellationToken);

            result.Should().HaveCount(2);
            result[0].Key.Should().Be("APP_NAME");
            result[1].Key.Should().Be("APP_VERSION");
        }
        finally {
            Directory.SetCurrentDirectory(currentDir);
            Directory.Delete(_testDirectory, true);
        }
    }

    [Fact]
    public async Task GetFrontendConfigurationAsync_SetsCorrectSource() {
        const string appName = "TestApp";
        var parentDir = Path.Combine(_testDirectory, "parent");
        Directory.CreateDirectory(parentDir);
        var appPath = Path.Combine(_testDirectory, appName);
        Directory.CreateDirectory(appPath);
        var envFilePath = Path.Combine(appPath, ".env");
        await File.WriteAllTextAsync(envFilePath, "APP_NAME=VALUE1", TestContext.Current.CancellationToken);

        var currentDir = Directory.GetCurrentDirectory();
        try {
            Directory.SetCurrentDirectory(parentDir);

            var result = await _service.GetFrontendConfigurationAsync(appName, TestContext.Current.CancellationToken);

            result.Should().HaveCount(1);
            result[0].Source.Type.Should().Be(ConfigurationSourceType.FrontendEnvFile);
            result[0].Source.Path.Should().Be($"{appName}/.env");
        }
        finally {
            Directory.SetCurrentDirectory(currentDir);
            Directory.Delete(_testDirectory, true);
        }
    }

    [Fact]
    public async Task GetFrontendConfigurationAsync_SetsCorrectCategory() {
        const string appName = "TestApp";
        var parentDir = Path.Combine(_testDirectory, "parent");
        Directory.CreateDirectory(parentDir);
        var appPath = Path.Combine(_testDirectory, appName);
        Directory.CreateDirectory(appPath);
        var envFilePath = Path.Combine(appPath, ".env");
        await File.WriteAllTextAsync(envFilePath, "APP_NAME=VALUE1", TestContext.Current.CancellationToken);

        var currentDir = Directory.GetCurrentDirectory();
        try {
            Directory.SetCurrentDirectory(parentDir);

            var result = await _service.GetFrontendConfigurationAsync(appName, TestContext.Current.CancellationToken);

            result.Should().HaveCount(1);
            result[0].Category.Should().Be("Frontend");
        }
        finally {
            Directory.SetCurrentDirectory(currentDir);
            Directory.Delete(_testDirectory, true);
        }
    }

    [Fact]
    public async Task GetFrontendConfigurationAsync_WithValueContainingEquals_ParsesCorrectly() {
        const string appName = "TestApp";
        var parentDir = Path.Combine(_testDirectory, "parent");
        Directory.CreateDirectory(parentDir);
        var appPath = Path.Combine(_testDirectory, appName);
        Directory.CreateDirectory(appPath);
        var envFilePath = Path.Combine(appPath, ".env");
        await File.WriteAllTextAsync(envFilePath, "CONNECTION_STRING=Server=localhost;Database=test", TestContext.Current.CancellationToken);

        var currentDir = Directory.GetCurrentDirectory();
        try {
            Directory.SetCurrentDirectory(parentDir);

            var result = await _service.GetFrontendConfigurationAsync(appName, TestContext.Current.CancellationToken);

            result.Should().HaveCount(1);
            result[0].Key.Should().Be("CONNECTION_STRING");
        }
        finally {
            Directory.SetCurrentDirectory(currentDir);
            Directory.Delete(_testDirectory, true);
        }
    }
}
