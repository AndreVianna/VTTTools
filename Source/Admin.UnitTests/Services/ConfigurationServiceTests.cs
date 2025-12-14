using Microsoft.Extensions.Configuration;

using VttTools.Admin.Configuration.Model;
using VttTools.Common.Services;
using VttTools.Common.Utilities;

namespace VttTools.Admin.UnitTests.Services;

public class ConfigurationServiceTests {
    private readonly IConfigurationRoot _configuration;
    private readonly ConfigurationSourceDetector _sourceDetector;
    private readonly FrontendConfigurationService _mockFrontendService;
    private readonly UserManager<User> _mockUserManager;
    private readonly ILogger<ConfigurationService> _mockLogger;
    private readonly IConfigurationService _sut;

    public ConfigurationServiceTests() {
        _configuration = CreateConfiguration();
        _sourceDetector = new ConfigurationSourceDetector(_configuration);
        _mockFrontendService = Substitute.For<FrontendConfigurationService>(Substitute.For<ILogger<FrontendConfigurationService>>());
        _mockUserManager = CreateMockUserManager();
        _mockLogger = Substitute.For<ILogger<ConfigurationService>>();

        _sut = new ConfigurationService(
            _configuration,
            _sourceDetector,
            _mockFrontendService,
            _mockUserManager,
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
        var act = async () => await _sut.GetServiceConfigurationAsync("Auth", TestContext.Current.CancellationToken);

        await act.Should().ThrowAsync<NotSupportedException>()
            .WithMessage("*is not supported by Admin API*");
    }

    #endregion

    #region RevealConfigValueAsync Tests

    [Fact]
    public async Task RevealConfigValueAsync_WithValidTotp_ReturnsActualValue() {
        var userId = Guid.CreateVersion7();
        var user = new User { Id = userId, TwoFactorEnabled = true };

        _mockUserManager.FindByIdAsync(userId.ToString()).Returns(user);
        _mockUserManager.VerifyTwoFactorTokenAsync(user, "Authenticator", "123456")
            .Returns(Task.FromResult(true));

        var result = await _sut.RevealConfigValueAsync(
            userId,
            "Admin",
            "TestPassword",
            "123456",
            TestContext.Current.CancellationToken);

        result.Should().NotBeNull();
        result.Should().Be("SecretValue123");
        await _mockUserManager.Received(1).FindByIdAsync(userId.ToString());
        await _mockUserManager.Received(1).VerifyTwoFactorTokenAsync(user, "Authenticator", "123456");
    }

    [Fact]
    public async Task RevealConfigValueAsync_WithInvalidTotp_ThrowsUnauthorizedAccessException() {
        var userId = Guid.CreateVersion7();
        var user = new User { Id = userId, TwoFactorEnabled = true };

        _mockUserManager.FindByIdAsync(userId.ToString()).Returns(user);
        _mockUserManager.VerifyTwoFactorTokenAsync(user, "Authenticator", "wrong-code")
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
        var user = new User { Id = userId, TwoFactorEnabled = false };

        _mockUserManager.FindByIdAsync(userId.ToString()).Returns(user);

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

        _mockUserManager.FindByIdAsync(userId.ToString()).Returns(Task.FromResult<User?>(null));

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
        var user = new User { Id = userId, TwoFactorEnabled = true };

        _mockUserManager.FindByIdAsync(userId.ToString()).Returns(user);
        _mockUserManager.VerifyTwoFactorTokenAsync(user, "Authenticator", "123456")
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

    private static UserManager<User> CreateMockUserManager() {
        var userStoreMock = Substitute.For<IUserStore<User>>();
        var optionsMock = Substitute.For<Microsoft.Extensions.Options.IOptions<IdentityOptions>>();
        var passwordHasherMock = Substitute.For<IPasswordHasher<User>>();
        var userValidators = new List<IUserValidator<User>>();
        var passwordValidators = new List<IPasswordValidator<User>>();
        var keyNormalizer = Substitute.For<ILookupNormalizer>();
        var errors = Substitute.For<IdentityErrorDescriber>();
        var services = Substitute.For<IServiceProvider>();
        var loggerMock = Substitute.For<ILogger<UserManager<User>>>();

        return Substitute.For<UserManager<User>>(
            userStoreMock,
            optionsMock,
            passwordHasherMock,
            userValidators,
            passwordValidators,
            keyNormalizer,
            errors,
            services,
            loggerMock
        );
    }

    #endregion
}