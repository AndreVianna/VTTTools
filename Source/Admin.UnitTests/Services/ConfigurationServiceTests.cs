using Microsoft.Extensions.Configuration;

using VttTools.Admin.Configuration.Model;
using VttTools.Utilities;

namespace VttTools.Admin.Services;

public class ConfigurationServiceTests {
    private readonly IConfigurationRoot _configuration;
    private readonly ConfigurationSourceDetector _sourceDetector;
    private readonly FrontendConfigurationService _mockFrontendService;
    private readonly IUserStorage _mockUserStorage;
    private readonly ILogger<ConfigurationService> _mockLogger;
    private readonly IConfigurationService _sut;

    public ConfigurationServiceTests() {
        _configuration = CreateConfiguration();
        _sourceDetector = new(_configuration);
        _mockFrontendService = Substitute.For<FrontendConfigurationService>(Substitute.For<ILogger<FrontendConfigurationService>>());
        _mockUserStorage = Substitute.For<IUserStorage>();
        _mockLogger = Substitute.For<ILogger<ConfigurationService>>();

        _sut = new ConfigurationService(
            _configuration,
            _sourceDetector,
            _mockFrontendService,
            _mockUserStorage,
            _mockLogger
        );
    }

    #region GetServiceConfigurationAsync Tests

    [Fact]
    public async Task GetServiceConfigurationAsync_WithAdmin_ReturnsLocalConfiguration() {
        var result = await _sut.GetServiceConfigurationAsync("Admin", TestContext.Current.CancellationToken);

        result.Should().NotBeNull();
        result.ServiceName.Should().Be("Admin");
        result.Entries.Should().NotBeNull();
        result.Entries.Should().Contain(e => e.Key == "TestKey");
        result.Entries.Should().Contain(e => e.Key == "TestPassword");
        result.Entries.First(e => e.Key == "TestPassword").Value.Should().Be("***REDACTED***");
    }

    [Fact]
    public async Task GetServiceConfigurationAsync_WithFrontend_ReturnsFrontendConfiguration() {
        var result = await _sut.GetServiceConfigurationAsync("WebClientApp", TestContext.Current.CancellationToken);

        result.Should().NotBeNull();
        result.ServiceName.Should().Be("WebClientApp");
        result.Entries.Should().NotBeNull();
    }

    [Fact]
    public async Task GetServiceConfigurationAsync_WithUnsupportedService_ThrowsNotSupportedException() {
        var act = () => _sut.GetServiceConfigurationAsync("Auth", TestContext.Current.CancellationToken);

        await act.Should().ThrowAsync<NotSupportedException>()
            .WithMessage("*is not supported by Admin API*");
    }

    #endregion

    #region RevealConfigValueAsync Tests

    [Fact]
    public async Task RevealConfigValueAsync_WithValidTotp_ReturnsActualValue() {
        var userId = Guid.CreateVersion7();
        var user = new User { Id = userId, Email = "test@example.com", Name = "Test", TwoFactorEnabled = true };

        _mockUserStorage.FindByIdAsync(userId, Arg.Any<CancellationToken>()).Returns(user);
        _mockUserStorage.VerifyTwoFactorCodeAsync(userId, "123456", Arg.Any<CancellationToken>())
            .Returns(Task.FromResult(true));

        var result = await _sut.RevealConfigValueAsync(
            userId,
            "Admin",
            "TestPassword",
            "123456",
            TestContext.Current.CancellationToken);

        result.Should().NotBeNull();
        result.Should().Be("SecretValue123");
        await _mockUserStorage.Received(1).FindByIdAsync(userId, Arg.Any<CancellationToken>());
        await _mockUserStorage.Received(1).VerifyTwoFactorCodeAsync(userId, "123456", Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task RevealConfigValueAsync_WithInvalidTotp_ThrowsUnauthorizedAccessException() {
        var userId = Guid.CreateVersion7();
        var user = new User { Id = userId, Email = "test@example.com", Name = "Test", TwoFactorEnabled = true };

        _mockUserStorage.FindByIdAsync(userId, Arg.Any<CancellationToken>()).Returns(user);
        _mockUserStorage.VerifyTwoFactorCodeAsync(userId, "wrong-code", Arg.Any<CancellationToken>())
            .Returns(Task.FromResult(false));

        var exception = await Assert.ThrowsAsync<UnauthorizedAccessException>(
            async () => await _sut.RevealConfigValueAsync(
                userId,
                "Admin",
                "TestPassword",
                "wrong-code",
                TestContext.Current.CancellationToken));

        exception.Should().NotBeNull();
        exception.Message.Should().Contain("Invalid 2FA code");
    }

    [Fact]
    public async Task RevealConfigValueAsync_WithUser2FADisabled_ThrowsUnauthorizedAccessException() {
        var userId = Guid.CreateVersion7();
        var user = new User { Id = userId, Email = "test@example.com", Name = "Test", TwoFactorEnabled = false };

        _mockUserStorage.FindByIdAsync(userId, Arg.Any<CancellationToken>()).Returns(user);

        var exception = await Assert.ThrowsAsync<UnauthorizedAccessException>(
            async () => await _sut.RevealConfigValueAsync(
                userId,
                "Admin",
                "TestPassword",
                "123456",
                TestContext.Current.CancellationToken));

        exception.Should().NotBeNull();
        exception.Message.Should().Contain("2FA not enabled");
    }

    [Fact]
    public async Task RevealConfigValueAsync_WithNullUser_ThrowsUnauthorizedAccessException() {
        var userId = Guid.CreateVersion7();

        _mockUserStorage.FindByIdAsync(userId, Arg.Any<CancellationToken>()).Returns(Task.FromResult<User?>(null));

        var exception = await Assert.ThrowsAsync<UnauthorizedAccessException>(
            async () => await _sut.RevealConfigValueAsync(
                userId,
                "Admin",
                "TestPassword",
                "123456",
                TestContext.Current.CancellationToken));

        exception.Should().NotBeNull();
        exception.Message.Should().Contain("2FA not enabled");
    }

    [Fact]
    public async Task RevealConfigValueAsync_WithUnsupportedService_ThrowsNotSupportedException() {
        var userId = Guid.CreateVersion7();

        var exception = await Assert.ThrowsAsync<NotSupportedException>(
            async () => await _sut.RevealConfigValueAsync(
                userId,
                "UnsupportedService",
                "TestKey",
                "123456",
                TestContext.Current.CancellationToken));

        exception.Should().NotBeNull();
        exception.Message.Should().Contain("Configuration reveal not supported for service: UnsupportedService");
    }

    [Fact]
    public async Task RevealConfigValueAsync_WithNonexistentKey_ThrowsKeyNotFoundException() {
        var userId = Guid.CreateVersion7();
        var user = new User { Id = userId, Email = "test@example.com", Name = "Test", TwoFactorEnabled = true };

        _mockUserStorage.FindByIdAsync(userId, Arg.Any<CancellationToken>()).Returns(user);
        _mockUserStorage.VerifyTwoFactorCodeAsync(userId, "123456", Arg.Any<CancellationToken>())
            .Returns(Task.FromResult(true));

        var exception = await Assert.ThrowsAsync<KeyNotFoundException>(
            async () => await _sut.RevealConfigValueAsync(
                userId,
                "Admin",
                "NonExistentKey",
                "123456",
                TestContext.Current.CancellationToken));

        exception.Should().NotBeNull();
        exception.Message.Should().Contain("Configuration key 'NonExistentKey' not found");
    }

    #endregion

    #region GetLocalConfigurationAsync Tests (via GetServiceConfigurationAsync)

    [Fact]
    public async Task GetLocalConfigurationAsync_RedactsSensitiveKeys() {
        var result = await _sut.GetServiceConfigurationAsync("Admin", TestContext.Current.CancellationToken);

        var passwordEntry = result.Entries.FirstOrDefault(e => e.Key == "TestPassword");
        passwordEntry.Should().NotBeNull();
        passwordEntry.Value.Should().Be("***REDACTED***");
        passwordEntry.IsRedacted.Should().BeTrue();

        var keyEntry = result.Entries.FirstOrDefault(e => e.Key == "TestKey");
        keyEntry.Should().NotBeNull();
        keyEntry.Value.Should().Be("***REDACTED***");
        keyEntry.IsRedacted.Should().BeTrue();

        var apiKeyEntry = result.Entries.FirstOrDefault(e => e.Key == "ApiKey");
        apiKeyEntry.Should().NotBeNull();
        apiKeyEntry.Value.Should().Be("***REDACTED***");
        apiKeyEntry.IsRedacted.Should().BeTrue();
    }

    [Fact]
    public async Task GetLocalConfigurationAsync_DetectsSourceCorrectly() {
        var result = await _sut.GetServiceConfigurationAsync("Admin", TestContext.Current.CancellationToken);

        var entry = result.Entries[0];
        entry.Source.Should().NotBeNull();
        entry.Source.Type.Should().Be(ConfigurationSourceType.InMemory);
    }

    [Fact]
    public async Task GetLocalConfigurationAsync_CategorizesCorrectly() {
        var result = await _sut.GetServiceConfigurationAsync("Admin", TestContext.Current.CancellationToken);

        var jwtEntry = result.Entries.FirstOrDefault(e => e.Key == "JwtSecret");
        jwtEntry.Should().NotBeNull();
        jwtEntry.Category.Should().Be("Security");

        var connectionEntry = result.Entries.FirstOrDefault(e => e.Key == "ConnectionStrings:Open");
        connectionEntry.Should().NotBeNull();
        connectionEntry.Category.Should().Be("Storage");

        var logEntry = result.Entries.FirstOrDefault(e => e.Key == "Logging:LogLevel:Open");
        logEntry.Should().NotBeNull();
        logEntry.Category.Should().Be("Logging");

        var azureEntry = result.Entries.FirstOrDefault(e => e.Key == "Azure:BlobStorage:ConnectionString");
        azureEntry.Should().NotBeNull();
        azureEntry.Category.Should().Be("Storage");
    }

    #endregion

    #region Helper Methods

    private static IConfigurationRoot CreateConfiguration() {
        var configData = new Dictionary<string, string?> {
            { "TestKey", "TestValue" },
            { "TestPassword", "SecretValue123" },
            { "JwtSecret", "MySuperSecretJwtKey" },
            { "ConnectionStrings:Open", "Server=localhost;Database=test" },
            { "Logging:LogLevel:Open", "Information" },
            { "ApiKey", "12345" },
            { "Azure:BlobStorage:ConnectionString", "DefaultEndpointsProtocol=https" }
        };

        return new ConfigurationBuilder()
            .AddInMemoryCollection(configData)
            .Build();
    }

    #endregion
}