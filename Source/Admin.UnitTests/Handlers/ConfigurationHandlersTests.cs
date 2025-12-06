namespace VttTools.Admin.UnitTests.Handlers;

public class ConfigurationHandlersTests {
    private readonly IConfigurationService _mockConfigService;

    public ConfigurationHandlersTests() {
        _mockConfigService = Substitute.For<IConfigurationService>();
    }

    [Fact]
    public async Task GetConfigurationHandler_WithValidService_ReturnsOkWithConfiguration() {
        var expectedConfig = CreateTestConfigurationResponse("Admin");
        _mockConfigService.GetServiceConfigurationAsync("Admin", Arg.Any<CancellationToken>())
            .Returns(expectedConfig);

        var result = await ConfigurationHandlers.GetConfigurationHandler(
            "Admin",
            _mockConfigService,
            TestContext.Current.CancellationToken);

        var okResult = Assert.IsType<Ok<ConfigurationResponse>>(result);
        Assert.NotNull(okResult.Value);
        Assert.Equal("Admin", okResult.Value.ServiceName);
        Assert.NotEmpty(okResult.Value.Entries);
    }

    [Fact]
    public async Task GetConfigurationHandler_CallsServiceCorrectly() {
        var expectedConfig = CreateTestConfigurationResponse("Game");
        _mockConfigService.GetServiceConfigurationAsync("Game", Arg.Any<CancellationToken>())
            .Returns(expectedConfig);

        await ConfigurationHandlers.GetConfigurationHandler(
            "Game",
            _mockConfigService,
            TestContext.Current.CancellationToken);

        await _mockConfigService.Received(1).GetServiceConfigurationAsync(
            "Game",
            Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task RevealConfigValueHandler_WithValidTotp_ReturnsOkWithValue() {
        var userId = Guid.CreateVersion7();
        var request = new RevealConfigValueRequest {
            ServiceName = "Admin",
            Key = "JwtSecret",
            TotpCode = "123456"
        };
        var user = CreateTestUser(userId);

        _mockConfigService.RevealConfigValueAsync(
            userId,
            "Admin",
            "JwtSecret",
            "123456",
            Arg.Any<CancellationToken>())
            .Returns("secret-value-123");

        var result = await ConfigurationHandlers.RevealConfigValueHandler(
            request,
            user,
            _mockConfigService,
            TestContext.Current.CancellationToken);

        var okResult = Assert.IsType<Ok<RevealConfigValueResponse>>(result);
        Assert.NotNull(okResult.Value);
        Assert.Equal("secret-value-123", okResult.Value.Value);
        Assert.NotEqual(default, okResult.Value.RevealedAt);
    }

    [Fact]
    public async Task RevealConfigValueHandler_WithInvalidTotp_Returns401() {
        var userId = Guid.CreateVersion7();
        var request = new RevealConfigValueRequest {
            ServiceName = "Admin",
            Key = "JwtSecret",
            TotpCode = "999999"
        };
        var user = CreateTestUser(userId);

        _mockConfigService.RevealConfigValueAsync(
            Arg.Any<Guid>(),
            Arg.Any<string>(),
            Arg.Any<string>(),
            Arg.Any<string>(),
            Arg.Any<CancellationToken>())
            .Throws(new UnauthorizedAccessException("Invalid TOTP code"));

        var result = await ConfigurationHandlers.RevealConfigValueHandler(
            request,
            user,
            _mockConfigService,
            TestContext.Current.CancellationToken);

        var problemResult = Assert.IsType<ProblemHttpResult>(result);
        Assert.Equal(401, problemResult.StatusCode);
    }

    [Fact]
    public async Task RevealConfigValueHandler_WithNonexistentKey_Returns404() {
        var userId = Guid.CreateVersion7();
        var request = new RevealConfigValueRequest {
            ServiceName = "Admin",
            Key = "NonExistentKey",
            TotpCode = "123456"
        };
        var user = CreateTestUser(userId);

        _mockConfigService.RevealConfigValueAsync(
            Arg.Any<Guid>(),
            Arg.Any<string>(),
            Arg.Any<string>(),
            Arg.Any<string>(),
            Arg.Any<CancellationToken>())
            .Throws(new KeyNotFoundException("Configuration key not found"));

        var result = await ConfigurationHandlers.RevealConfigValueHandler(
            request,
            user,
            _mockConfigService,
            TestContext.Current.CancellationToken);

        var problemResult = Assert.IsType<ProblemHttpResult>(result);
        Assert.Equal(404, problemResult.StatusCode);
    }

    [Fact]
    public async Task RevealConfigValueHandler_WithUnsupportedService_Returns400() {
        var userId = Guid.CreateVersion7();
        var request = new RevealConfigValueRequest {
            ServiceName = "InvalidService",
            Key = "SomeKey",
            TotpCode = "123456"
        };
        var user = CreateTestUser(userId);

        _mockConfigService.RevealConfigValueAsync(
            Arg.Any<Guid>(),
            Arg.Any<string>(),
            Arg.Any<string>(),
            Arg.Any<string>(),
            Arg.Any<CancellationToken>())
            .Throws(new NotSupportedException("Service not supported"));

        var result = await ConfigurationHandlers.RevealConfigValueHandler(
            request,
            user,
            _mockConfigService,
            TestContext.Current.CancellationToken);

        var problemResult = Assert.IsType<ProblemHttpResult>(result);
        Assert.Equal(400, problemResult.StatusCode);
    }

    [Fact]
    public async Task RevealConfigValueHandler_ExtractsUserIdFromClaims() {
        var userId = Guid.CreateVersion7();
        var request = new RevealConfigValueRequest {
            ServiceName = "Admin",
            Key = "JwtSecret",
            TotpCode = "123456"
        };
        var user = CreateTestUser(userId);

        _mockConfigService.RevealConfigValueAsync(
            userId,
            "Admin",
            "JwtSecret",
            "123456",
            Arg.Any<CancellationToken>())
            .Returns("secret-value");

        await ConfigurationHandlers.RevealConfigValueHandler(
            request,
            user,
            _mockConfigService,
            TestContext.Current.CancellationToken);

        await _mockConfigService.Received(1).RevealConfigValueAsync(
            userId,
            "Admin",
            "JwtSecret",
            "123456",
            Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task RevealConfigValueHandler_WithMissingUserClaim_ReturnsUnauthorized() {
        var request = new RevealConfigValueRequest {
            ServiceName = "Admin",
            Key = "JwtSecret",
            TotpCode = "123456"
        };
        var user = new ClaimsPrincipal(new ClaimsIdentity());

        var result = await ConfigurationHandlers.RevealConfigValueHandler(
            request,
            user,
            _mockConfigService,
            TestContext.Current.CancellationToken);

        Assert.IsType<UnauthorizedHttpResult>(result);
    }

    [Fact]
    public async Task RevealConfigValueHandler_WithInvalidUserClaim_ReturnsUnauthorized() {
        var request = new RevealConfigValueRequest {
            ServiceName = "Admin",
            Key = "JwtSecret",
            TotpCode = "123456"
        };
        var claims = new[] {
            new Claim(ClaimTypes.NameIdentifier, "invalid-guid")
        };
        var user = new ClaimsPrincipal(new ClaimsIdentity(claims, "TestAuth"));

        var result = await ConfigurationHandlers.RevealConfigValueHandler(
            request,
            user,
            _mockConfigService,
            TestContext.Current.CancellationToken);

        Assert.IsType<UnauthorizedHttpResult>(result);
    }

    private static ClaimsPrincipal CreateTestUser(Guid userId) {
        var claims = new[] {
            new Claim(ClaimTypes.NameIdentifier, userId.ToString())
        };
        return new ClaimsPrincipal(new ClaimsIdentity(claims, "TestAuth"));
    }

    private static ConfigurationResponse CreateTestConfigurationResponse(string serviceName) => new() {
        ServiceName = serviceName,
        Entries = [
            new() {
                Key = "JwtSecret",
                Value = "***REDACTED***",
                Source = new ConfigurationSource {
                    Type = ConfigSourceType.EnvironmentVariable
                },
                Category = "Security"
            },
            new() {
                Key = "DatabaseConnection",
                Value = "***REDACTED***",
                Source = new ConfigurationSource {
                    Type = ConfigSourceType.JsonFile,
                    Path = "appsettings.json"
                },
                Category = "Database"
            }
        ]
    };
}