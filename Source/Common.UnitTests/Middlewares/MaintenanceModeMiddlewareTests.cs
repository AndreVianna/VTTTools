
namespace VttTools.Middlewares;

public class MaintenanceModeMiddlewareTests {
    [Fact]
    public async Task InvokeAsync_WhenMaintenanceModeActive_Returns503() {
        var maintenanceService = Substitute.For<IMaintenanceModeService>();
        maintenanceService.GetCurrentAsync(Arg.Any<CancellationToken>())
            .Returns(CreateTestMaintenanceMode(
                isEnabled: true,
                message: "System under maintenance"));

        var serviceProvider = CreateServiceProvider(maintenanceService);
        var logger = Substitute.For<ILogger<MaintenanceModeMiddleware>>();
        var middleware = new MaintenanceModeMiddleware(
            _ => Task.CompletedTask,
            serviceProvider,
            logger);

        var context = CreateHttpContext("/api/test");
        context.Response.Body = new MemoryStream();

        await middleware.InvokeAsync(context);

        context.Response.StatusCode.Should().Be(503);
        context.Response.ContentType.Should().StartWith("application/json");

        context.Response.Body.Position = 0;
        using var reader = new StreamReader(context.Response.Body);
        var responseBody = await reader.ReadToEndAsync(TestContext.Current.CancellationToken);
        var response = JsonSerializer.Deserialize<JsonElement>(responseBody);

        response.GetProperty("error").GetString().Should().Be("Service Unavailable");
        response.GetProperty("message").GetString().Should().Be("System under maintenance");
        response.TryGetProperty("retryAfter", out _).Should().BeTrue();
    }

    [Fact]
    public async Task InvokeAsync_WhenMaintenanceModeInactive_PassesThrough() {
        var maintenanceService = Substitute.For<IMaintenanceModeService>();
        maintenanceService.GetCurrentAsync(Arg.Any<CancellationToken>())
            .Returns(CreateTestMaintenanceMode(isEnabled: false));

        var serviceProvider = CreateServiceProvider(maintenanceService);
        var logger = Substitute.For<ILogger<MaintenanceModeMiddleware>>();

        var nextCalled = false;
        Task Next(HttpContext _) {
            nextCalled = true;
            return Task.CompletedTask;
        }

        var middleware = new MaintenanceModeMiddleware(Next, serviceProvider, logger);
        var context = CreateHttpContext("/api/test");

        await middleware.InvokeAsync(context);

        nextCalled.Should().BeTrue();
        context.Response.StatusCode.Should().Be(200);
    }

    [Fact]
    public async Task InvokeAsync_WhenMaintenanceModeNull_PassesThrough() {
        var maintenanceService = Substitute.For<IMaintenanceModeService>();
        maintenanceService.GetCurrentAsync(Arg.Any<CancellationToken>())
            .Returns((MaintenanceMode?)null);

        var serviceProvider = CreateServiceProvider(maintenanceService);
        var logger = Substitute.For<ILogger<MaintenanceModeMiddleware>>();

        var nextCalled = false;
        Task Next(HttpContext _) {
            nextCalled = true;
            return Task.CompletedTask;
        }

        var middleware = new MaintenanceModeMiddleware(Next, serviceProvider, logger);
        var context = CreateHttpContext("/api/test");

        await middleware.InvokeAsync(context);

        nextCalled.Should().BeTrue();
        context.Response.StatusCode.Should().Be(200);
    }

    [Fact]
    public async Task InvokeAsync_WhenScheduledForFuture_PassesThrough() {
        var futureStart = DateTime.UtcNow.AddHours(1);
        var maintenanceService = Substitute.For<IMaintenanceModeService>();
        maintenanceService.GetCurrentAsync(Arg.Any<CancellationToken>())
            .Returns(CreateTestMaintenanceMode(
                isEnabled: true,
                scheduledStart: futureStart,
                scheduledEnd: futureStart.AddHours(2)));

        var serviceProvider = CreateServiceProvider(maintenanceService);
        var logger = Substitute.For<ILogger<MaintenanceModeMiddleware>>();

        var nextCalled = false;
        Task Next(HttpContext _) {
            nextCalled = true;
            return Task.CompletedTask;
        }

        var middleware = new MaintenanceModeMiddleware(Next, serviceProvider, logger);
        var context = CreateHttpContext("/api/test");

        await middleware.InvokeAsync(context);

        nextCalled.Should().BeTrue();
        context.Response.StatusCode.Should().Be(200);
    }

    [Fact]
    public async Task InvokeAsync_WhenScheduledEndInPast_PassesThrough() {
        var pastStart = DateTime.UtcNow.AddHours(-2);
        var pastEnd = DateTime.UtcNow.AddHours(-1);
        var maintenanceService = Substitute.For<IMaintenanceModeService>();
        maintenanceService.GetCurrentAsync(Arg.Any<CancellationToken>())
            .Returns(CreateTestMaintenanceMode(
                isEnabled: true,
                scheduledStart: pastStart,
                scheduledEnd: pastEnd));

        var serviceProvider = CreateServiceProvider(maintenanceService);
        var logger = Substitute.For<ILogger<MaintenanceModeMiddleware>>();

        var nextCalled = false;
        Task Next(HttpContext _) {
            nextCalled = true;
            return Task.CompletedTask;
        }

        var middleware = new MaintenanceModeMiddleware(Next, serviceProvider, logger);
        var context = CreateHttpContext("/api/test");

        await middleware.InvokeAsync(context);

        nextCalled.Should().BeTrue();
        context.Response.StatusCode.Should().Be(200);
    }

    [Fact]
    public async Task InvokeAsync_WhenScheduledAndActive_Returns503() {
        var activeStart = DateTime.UtcNow.AddMinutes(-30);
        var activeEnd = DateTime.UtcNow.AddMinutes(30);
        var maintenanceService = Substitute.For<IMaintenanceModeService>();
        maintenanceService.GetCurrentAsync(Arg.Any<CancellationToken>())
            .Returns(CreateTestMaintenanceMode(
                isEnabled: true,
                message: "Scheduled maintenance in progress",
                scheduledStart: activeStart,
                scheduledEnd: activeEnd));

        var serviceProvider = CreateServiceProvider(maintenanceService);
        var logger = Substitute.For<ILogger<MaintenanceModeMiddleware>>();
        var middleware = new MaintenanceModeMiddleware(
            _ => Task.CompletedTask,
            serviceProvider,
            logger);

        var context = CreateHttpContext("/api/test");
        context.Response.Body = new MemoryStream();

        await middleware.InvokeAsync(context);

        context.Response.StatusCode.Should().Be(503);
    }

    [Fact]
    public async Task InvokeAsync_WhenAdminUserAndMaintenanceActive_Bypasses() {
        var maintenanceService = Substitute.For<IMaintenanceModeService>();
        maintenanceService.GetCurrentAsync(Arg.Any<CancellationToken>())
            .Returns(CreateTestMaintenanceMode(isEnabled: true));

        var serviceProvider = CreateServiceProvider(maintenanceService);
        var logger = Substitute.For<ILogger<MaintenanceModeMiddleware>>();

        var nextCalled = false;
        Task Next(HttpContext _) {
            nextCalled = true;
            return Task.CompletedTask;
        }

        var middleware = new MaintenanceModeMiddleware(Next, serviceProvider, logger);
        var context = CreateHttpContext("/api/test", isAdmin: true);

        await middleware.InvokeAsync(context);

        nextCalled.Should().BeTrue();
        context.Response.StatusCode.Should().Be(200);
    }

    [Fact]
    public async Task InvokeAsync_WhenNotAuthenticatedAndMaintenanceActive_BlockedByMaintenance() {
        var maintenanceService = Substitute.For<IMaintenanceModeService>();
        maintenanceService.GetCurrentAsync(Arg.Any<CancellationToken>())
            .Returns(CreateTestMaintenanceMode(isEnabled: true));

        var serviceProvider = CreateServiceProvider(maintenanceService);
        var logger = Substitute.For<ILogger<MaintenanceModeMiddleware>>();
        var middleware = new MaintenanceModeMiddleware(
            _ => Task.CompletedTask,
            serviceProvider,
            logger);

        var context = CreateHttpContext("/api/test", isAdmin: false);
        context.Response.Body = new MemoryStream();

        await middleware.InvokeAsync(context);

        context.Response.StatusCode.Should().Be(503);
    }

    [Fact]
    public async Task InvokeAsync_WithHealthPath_AlwaysExcluded() {
        var maintenanceService = Substitute.For<IMaintenanceModeService>();
        maintenanceService.GetCurrentAsync(Arg.Any<CancellationToken>())
            .Returns(CreateTestMaintenanceMode(isEnabled: true));

        var serviceProvider = CreateServiceProvider(maintenanceService);
        var logger = Substitute.For<ILogger<MaintenanceModeMiddleware>>();

        var nextCalled = false;
        Task Next(HttpContext _) {
            nextCalled = true;
            return Task.CompletedTask;
        }

        var middleware = new MaintenanceModeMiddleware(Next, serviceProvider, logger);
        var context = CreateHttpContext("/health");

        await middleware.InvokeAsync(context);

        nextCalled.Should().BeTrue();
        context.Response.StatusCode.Should().Be(200);
    }

    [Fact]
    public async Task InvokeAsync_WithHealthzPath_AlwaysExcluded() {
        var maintenanceService = Substitute.For<IMaintenanceModeService>();
        maintenanceService.GetCurrentAsync(Arg.Any<CancellationToken>())
            .Returns(CreateTestMaintenanceMode(isEnabled: true));

        var serviceProvider = CreateServiceProvider(maintenanceService);
        var logger = Substitute.For<ILogger<MaintenanceModeMiddleware>>();

        var nextCalled = false;
        Task Next(HttpContext _) {
            nextCalled = true;
            return Task.CompletedTask;
        }

        var middleware = new MaintenanceModeMiddleware(Next, serviceProvider, logger);
        var context = CreateHttpContext("/healthz");

        await middleware.InvokeAsync(context);

        nextCalled.Should().BeTrue();
        context.Response.StatusCode.Should().Be(200);
    }

    [Fact]
    public async Task InvokeAsync_WithAlivePath_AlwaysExcluded() {
        var maintenanceService = Substitute.For<IMaintenanceModeService>();
        maintenanceService.GetCurrentAsync(Arg.Any<CancellationToken>())
            .Returns(CreateTestMaintenanceMode(isEnabled: true));

        var serviceProvider = CreateServiceProvider(maintenanceService);
        var logger = Substitute.For<ILogger<MaintenanceModeMiddleware>>();

        var nextCalled = false;
        Task Next(HttpContext _) {
            nextCalled = true;
            return Task.CompletedTask;
        }

        var middleware = new MaintenanceModeMiddleware(Next, serviceProvider, logger);
        var context = CreateHttpContext("/alive");

        await middleware.InvokeAsync(context);

        nextCalled.Should().BeTrue();
        context.Response.StatusCode.Should().Be(200);
    }

    [Fact]
    public async Task InvokeAsync_WithHealthSubPath_AlsoExcluded() {
        var maintenanceService = Substitute.For<IMaintenanceModeService>();
        maintenanceService.GetCurrentAsync(Arg.Any<CancellationToken>())
            .Returns(CreateTestMaintenanceMode(isEnabled: true));

        var serviceProvider = CreateServiceProvider(maintenanceService);
        var logger = Substitute.For<ILogger<MaintenanceModeMiddleware>>();

        var nextCalled = false;
        Task Next(HttpContext _) {
            nextCalled = true;
            return Task.CompletedTask;
        }

        var middleware = new MaintenanceModeMiddleware(Next, serviceProvider, logger);
        var context = CreateHttpContext("/health/detailed");

        await middleware.InvokeAsync(context);

        nextCalled.Should().BeTrue();
        context.Response.StatusCode.Should().Be(200);
    }

    [Fact]
    public async Task InvokeAsync_JsonResponseContainsCorrectFields() {
        const string expectedMessage = "Test maintenance message";
        var scheduledEnd = DateTime.UtcNow.AddHours(2);
        var maintenanceService = Substitute.For<IMaintenanceModeService>();
        maintenanceService.GetCurrentAsync(Arg.Any<CancellationToken>())
            .Returns(CreateTestMaintenanceMode(
                isEnabled: true,
                message: expectedMessage,
                scheduledEnd: scheduledEnd));

        var serviceProvider = CreateServiceProvider(maintenanceService);
        var logger = Substitute.For<ILogger<MaintenanceModeMiddleware>>();
        var middleware = new MaintenanceModeMiddleware(
            _ => Task.CompletedTask,
            serviceProvider,
            logger);

        var context = CreateHttpContext("/api/test");
        context.Response.Body = new MemoryStream();

        await middleware.InvokeAsync(context);

        context.Response.StatusCode.Should().Be(503);
        context.Response.ContentType.Should().StartWith("application/json");

        context.Response.Body.Position = 0;
        using var reader = new StreamReader(context.Response.Body);
        var responseBody = await reader.ReadToEndAsync(TestContext.Current.CancellationToken);
        var response = JsonSerializer.Deserialize<JsonElement>(responseBody);

        response.GetProperty("error").GetString().Should().Be("Service Unavailable");
        response.GetProperty("message").GetString().Should().Be(expectedMessage);

        var retryAfter = response.GetProperty("retryAfter").GetString();
        retryAfter.Should().NotBeNullOrEmpty();
        DateTime.TryParse(retryAfter, out var parsedRetryAfter).Should().BeTrue();
    }

    private static IServiceProvider CreateServiceProvider(IMaintenanceModeService maintenanceService) {
        var serviceScope = Substitute.For<IServiceScope>();
        serviceScope.ServiceProvider.GetService(typeof(IMaintenanceModeService))
            .Returns(maintenanceService);

        var serviceScopeFactory = Substitute.For<IServiceScopeFactory>();
        serviceScopeFactory.CreateScope().Returns(serviceScope);

        var serviceProvider = Substitute.For<IServiceProvider>();
        serviceProvider.GetService(typeof(IServiceScopeFactory))
            .Returns(serviceScopeFactory);

        return serviceProvider;
    }

    private static MaintenanceMode CreateTestMaintenanceMode(
        bool isEnabled,
        string message = "System under maintenance",
        DateTime? scheduledStart = null,
        DateTime? scheduledEnd = null) => new() {
        Id = Guid.CreateVersion7(),
        IsEnabled = isEnabled,
        Message = message,
        ScheduledStartTime = scheduledStart,
        ScheduledEndTime = scheduledEnd,
        EnabledAt = isEnabled ? DateTime.UtcNow : null,
        EnabledBy = isEnabled ? Guid.CreateVersion7() : null
    };

    private static DefaultHttpContext CreateHttpContext(string path, bool isAdmin = false) {
        var context = new DefaultHttpContext();
        context.Request.Path = path;
        context.Request.Method = "GET";

        if (isAdmin) {
            var claims = new List<Claim> {
                new(ClaimTypes.NameIdentifier, Guid.CreateVersion7().ToString()),
                new(ClaimTypes.Role, "Admin")
            };
            var identity = new ClaimsIdentity(claims, "TestAuth");
            context.User = new ClaimsPrincipal(identity);
        }

        return context;
    }
}
