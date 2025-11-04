
using VttTools.Audit.Services;

namespace VttTools.Middlewares;

public class AuditLoggingMiddlewareTests {
    [Fact]
    public async Task InvokeAsync_WithPostRequest_CapturesRequestBody() {
        var logger = Substitute.For<ILogger<AuditLoggingMiddleware>>();
        var auditLogService = Substitute.For<IAuditLogService>();
        var serviceProvider = CreateServiceProvider(auditLogService);
        var options = CreateAuditLoggingOptions();
        var middleware = new AuditLoggingMiddleware(
            _ => Task.CompletedTask,
            serviceProvider,
            options,
            logger);

        var httpContext = new DefaultHttpContext();
        httpContext.Request.Method = "POST";
        httpContext.Request.Path = "/api/test";
        const string requestBody = "{\"username\":\"john\",\"password\":\"secret\"}";
        httpContext.Request.Body = new MemoryStream(Encoding.UTF8.GetBytes(requestBody));
        httpContext.Request.ContentType = "application/json";

        AuditLog? capturedLog = null;
        auditLogService.AddAsync(Arg.Any<AuditLog>(), Arg.Any<CancellationToken>())
            .Returns(callInfo => {
                capturedLog = callInfo.Arg<AuditLog>();
                return Task.FromResult(capturedLog);
            });

        await middleware.InvokeAsync(httpContext);

        await Task.Delay(100, TestContext.Current.CancellationToken);

        capturedLog.Should().NotBeNull();
        capturedLog!.RequestBody.Should().NotBeNull();
        capturedLog.RequestBody.Should().Contain("***REDACTED***");
    }

    [Fact]
    public async Task InvokeAsync_WithGetRequest_DoesNotCaptureRequestBody() {
        var logger = Substitute.For<ILogger<AuditLoggingMiddleware>>();
        var auditLogService = Substitute.For<IAuditLogService>();
        var serviceProvider = CreateServiceProvider(auditLogService);
        var options = CreateAuditLoggingOptions();
        var middleware = new AuditLoggingMiddleware(
            _ => Task.CompletedTask,
            serviceProvider,
            options,
            logger);

        var httpContext = new DefaultHttpContext();
        httpContext.Request.Method = "GET";
        httpContext.Request.Path = "/api/test";

        AuditLog? capturedLog = null;
        auditLogService.AddAsync(Arg.Any<AuditLog>(), Arg.Any<CancellationToken>())
            .Returns(callInfo => {
                capturedLog = callInfo.Arg<AuditLog>();
                return Task.FromResult(capturedLog);
            });

        await middleware.InvokeAsync(httpContext);

        await Task.Delay(100, TestContext.Current.CancellationToken);

        capturedLog.Should().NotBeNull();
        capturedLog!.RequestBody.Should().BeNull();
    }

    [Fact]
    public async Task InvokeAsync_SanitizesRequestBodyBeforeLogging() {
        var logger = Substitute.For<ILogger<AuditLoggingMiddleware>>();
        var auditLogService = Substitute.For<IAuditLogService>();
        var serviceProvider = CreateServiceProvider(auditLogService);
        var options = CreateAuditLoggingOptions();
        var middleware = new AuditLoggingMiddleware(
            _ => Task.CompletedTask,
            serviceProvider,
            options,
            logger);

        var httpContext = new DefaultHttpContext();
        httpContext.Request.Method = "POST";
        httpContext.Request.Path = "/api/auth/login";
        const string requestBody = "{\"username\":\"john\",\"password\":\"secret123\"}";
        httpContext.Request.Body = new MemoryStream(Encoding.UTF8.GetBytes(requestBody));

        AuditLog? capturedLog = null;
        auditLogService.AddAsync(Arg.Any<AuditLog>(), Arg.Any<CancellationToken>())
            .Returns(callInfo => {
                capturedLog = callInfo.Arg<AuditLog>();
                return Task.FromResult(capturedLog);
            });

        await middleware.InvokeAsync(httpContext);

        await Task.Delay(100, TestContext.Current.CancellationToken);

        capturedLog.Should().NotBeNull();
        capturedLog!.RequestBody.Should().Contain("***REDACTED***");
        capturedLog.RequestBody.Should().NotContain("secret123");
    }

    [Fact]
    public async Task InvokeAsync_SanitizesResponseBodyBeforeLogging() {
        var logger = Substitute.For<ILogger<AuditLoggingMiddleware>>();
        var auditLogService = Substitute.For<IAuditLogService>();
        const string responseBody = "{\"token\":\"abc123\",\"username\":\"john\"}";

        var serviceProvider = CreateServiceProvider(auditLogService);
        var options = CreateAuditLoggingOptions();
        var middleware = new AuditLoggingMiddleware(
            async context => await context.Response.WriteAsync(responseBody),
            serviceProvider,
            options,
            logger);

        var httpContext = new DefaultHttpContext();
        httpContext.Request.Method = "GET";
        httpContext.Request.Path = "/api/test";
        httpContext.Response.Body = new MemoryStream();

        AuditLog? capturedLog = null;
        auditLogService.AddAsync(Arg.Any<AuditLog>(), Arg.Any<CancellationToken>())
            .Returns(callInfo => {
                capturedLog = callInfo.Arg<AuditLog>();
                return Task.FromResult(capturedLog);
            });

        await middleware.InvokeAsync(httpContext);

        await Task.Delay(100, TestContext.Current.CancellationToken);

        capturedLog.Should().NotBeNull();
        capturedLog!.ResponseBody.Should().NotBeNull();
        capturedLog.ResponseBody.Should().Contain("***REDACTED***");
        capturedLog.ResponseBody.Should().NotContain("abc123");
    }

    [Fact]
    public async Task InvokeAsync_WithAuthenticatedUser_ExtractsUserId() {
        var logger = Substitute.For<ILogger<AuditLoggingMiddleware>>();
        var auditLogService = Substitute.For<IAuditLogService>();
        var serviceProvider = CreateServiceProvider(auditLogService);
        var options = CreateAuditLoggingOptions();
        var middleware = new AuditLoggingMiddleware(
            _ => Task.CompletedTask,
            serviceProvider,
            options,
            logger);

        var userId = Guid.NewGuid();
        var claims = new List<Claim> {
            new(ClaimTypes.NameIdentifier, userId.ToString()),
            new(ClaimTypes.Email, "test@example.com")
        };
        var identity = new ClaimsIdentity(claims, "TestAuth");
        var principal = new ClaimsPrincipal(identity);

        var httpContext = new DefaultHttpContext {
            User = principal
        };
        httpContext.Request.Method = "GET";
        httpContext.Request.Path = "/api/test";

        AuditLog? capturedLog = null;
        auditLogService.AddAsync(Arg.Any<AuditLog>(), Arg.Any<CancellationToken>())
            .Returns(callInfo => {
                capturedLog = callInfo.Arg<AuditLog>();
                return Task.FromResult(capturedLog);
            });

        await middleware.InvokeAsync(httpContext);

        await Task.Delay(100, TestContext.Current.CancellationToken);

        capturedLog.Should().NotBeNull();
        capturedLog!.UserId.Should().Be(userId);
        capturedLog.UserEmail.Should().Be("test@example.com");
    }

    [Fact]
    public async Task InvokeAsync_WithSuccessStatusCode_SetsResultToSuccess() {
        var logger = Substitute.For<ILogger<AuditLoggingMiddleware>>();
        var auditLogService = Substitute.For<IAuditLogService>();
        var serviceProvider = CreateServiceProvider(auditLogService);
        var options = CreateAuditLoggingOptions();
        var middleware = new AuditLoggingMiddleware(
            context => {
                context.Response.StatusCode = 200;
                return Task.CompletedTask;
            },
            serviceProvider,
            options,
            logger);

        var httpContext = new DefaultHttpContext();
        httpContext.Request.Method = "GET";
        httpContext.Request.Path = "/api/test";

        AuditLog? capturedLog = null;
        auditLogService.AddAsync(Arg.Any<AuditLog>(), Arg.Any<CancellationToken>())
            .Returns(callInfo => {
                capturedLog = callInfo.Arg<AuditLog>();
                return Task.FromResult(capturedLog);
            });

        await middleware.InvokeAsync(httpContext);

        await Task.Delay(100, TestContext.Current.CancellationToken);

        capturedLog.Should().NotBeNull();
        capturedLog!.Result.Should().Be("Success");
        capturedLog.StatusCode.Should().Be(200);
    }

    [Fact]
    public async Task InvokeAsync_WithClientErrorStatusCode_SetsResultToFailure() {
        var logger = Substitute.For<ILogger<AuditLoggingMiddleware>>();
        var auditLogService = Substitute.For<IAuditLogService>();
        var serviceProvider = CreateServiceProvider(auditLogService);
        var options = CreateAuditLoggingOptions();
        var middleware = new AuditLoggingMiddleware(
            context => {
                context.Response.StatusCode = 404;
                return Task.CompletedTask;
            },
            serviceProvider,
            options,
            logger);

        var httpContext = new DefaultHttpContext();
        httpContext.Request.Method = "GET";
        httpContext.Request.Path = "/api/test";

        AuditLog? capturedLog = null;
        auditLogService.AddAsync(Arg.Any<AuditLog>(), Arg.Any<CancellationToken>())
            .Returns(callInfo => {
                capturedLog = callInfo.Arg<AuditLog>();
                return Task.FromResult(capturedLog);
            });

        await middleware.InvokeAsync(httpContext);

        await Task.Delay(100, TestContext.Current.CancellationToken);

        capturedLog.Should().NotBeNull();
        capturedLog!.Result.Should().Be("Failure");
        capturedLog.StatusCode.Should().Be(404);
    }

    [Fact]
    public async Task InvokeAsync_WithServerErrorStatusCode_SetsResultToError() {
        var logger = Substitute.For<ILogger<AuditLoggingMiddleware>>();
        var auditLogService = Substitute.For<IAuditLogService>();
        var serviceProvider = CreateServiceProvider(auditLogService);
        var options = CreateAuditLoggingOptions();
        var middleware = new AuditLoggingMiddleware(
            context => {
                context.Response.StatusCode = 500;
                return Task.CompletedTask;
            },
            serviceProvider,
            options,
            logger);

        var httpContext = new DefaultHttpContext();
        httpContext.Request.Method = "GET";
        httpContext.Request.Path = "/api/test";

        AuditLog? capturedLog = null;
        auditLogService.AddAsync(Arg.Any<AuditLog>(), Arg.Any<CancellationToken>())
            .Returns(callInfo => {
                capturedLog = callInfo.Arg<AuditLog>();
                return Task.FromResult(capturedLog);
            });

        await middleware.InvokeAsync(httpContext);

        await Task.Delay(100, TestContext.Current.CancellationToken);

        capturedLog.Should().NotBeNull();
        capturedLog!.Result.Should().Be("Error");
        capturedLog.StatusCode.Should().Be(500);
    }

    [Fact]
    public async Task InvokeAsync_WhenAuditLoggingFails_DoesNotCrashRequest() {
        var logger = Substitute.For<ILogger<AuditLoggingMiddleware>>();
        var auditLogService = Substitute.For<IAuditLogService>();
        var serviceProvider = CreateServiceProvider(auditLogService);
        var options = CreateAuditLoggingOptions();
        var middleware = new AuditLoggingMiddleware(
            _ => Task.CompletedTask,
            serviceProvider,
            options,
            logger);

        var httpContext = new DefaultHttpContext();
        httpContext.Request.Method = "GET";
        httpContext.Request.Path = "/api/test";

        auditLogService.AddAsync(Arg.Any<AuditLog>(), Arg.Any<CancellationToken>())
            .Returns(_ => throw new InvalidOperationException("Database error"));

        var act = async () => await middleware.InvokeAsync(httpContext);

        await act.Should().NotThrowAsync();
    }

    [Fact]
    public async Task InvokeAsync_WithQueryString_SanitizesIt() {
        var logger = Substitute.For<ILogger<AuditLoggingMiddleware>>();
        var auditLogService = Substitute.For<IAuditLogService>();
        var serviceProvider = CreateServiceProvider(auditLogService);
        var options = CreateAuditLoggingOptions();
        var middleware = new AuditLoggingMiddleware(
            _ => Task.CompletedTask,
            serviceProvider,
            options,
            logger);

        var httpContext = new DefaultHttpContext();
        httpContext.Request.Method = "GET";
        httpContext.Request.Path = "/api/test";
        httpContext.Request.QueryString = new QueryString("?token=abc123&user=john");

        AuditLog? capturedLog = null;
        auditLogService.AddAsync(Arg.Any<AuditLog>(), Arg.Any<CancellationToken>())
            .Returns(callInfo => {
                capturedLog = callInfo.Arg<AuditLog>();
                return Task.FromResult(capturedLog);
            });

        await middleware.InvokeAsync(httpContext);

        await Task.Delay(100, TestContext.Current.CancellationToken);

        capturedLog.Should().NotBeNull();
        capturedLog!.QueryString.Should().NotBeNull();
        capturedLog.QueryString.Should().Contain("token=***REDACTED***");
        capturedLog.QueryString.Should().Contain("user=john");
    }

    [Fact]
    public async Task InvokeAsync_WithAuditEndpoint_DoesNotLogAudit() {
        var logger = Substitute.For<ILogger<AuditLoggingMiddleware>>();
        var auditLogService = Substitute.For<IAuditLogService>();
        var serviceProvider = CreateServiceProvider(auditLogService);
        var options = CreateAuditLoggingOptions(excludedPaths: ["/api/admin/audit"]);
        var middleware = new AuditLoggingMiddleware(
            _ => Task.CompletedTask,
            serviceProvider,
            options,
            logger);

        var httpContext = new DefaultHttpContext();
        httpContext.Request.Method = "GET";
        httpContext.Request.Path = "/api/admin/audit";

        await middleware.InvokeAsync(httpContext);

        await Task.Delay(100, TestContext.Current.CancellationToken);

        await auditLogService.DidNotReceive().AddAsync(Arg.Any<AuditLog>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task InvokeAsync_WithExcludedPath_DoesNotLogAudit() {
        var logger = Substitute.For<ILogger<AuditLoggingMiddleware>>();
        var auditLogService = Substitute.For<IAuditLogService>();
        var serviceProvider = CreateServiceProvider(auditLogService);
        var options = CreateAuditLoggingOptions(excludedPaths: ["/health", "/alive"]);
        var middleware = new AuditLoggingMiddleware(
            _ => Task.CompletedTask,
            serviceProvider,
            options,
            logger);

        var httpContext = new DefaultHttpContext();
        httpContext.Request.Method = "GET";
        httpContext.Request.Path = "/health";

        await middleware.InvokeAsync(httpContext);

        await Task.Delay(100, TestContext.Current.CancellationToken);

        await auditLogService.DidNotReceive().AddAsync(Arg.Any<AuditLog>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task InvokeAsync_WithPathStartingWithExcluded_DoesNotLogAudit() {
        var logger = Substitute.For<ILogger<AuditLoggingMiddleware>>();
        var auditLogService = Substitute.For<IAuditLogService>();
        var serviceProvider = CreateServiceProvider(auditLogService);
        var options = CreateAuditLoggingOptions(excludedPaths: ["/health"]);
        var middleware = new AuditLoggingMiddleware(
            _ => Task.CompletedTask,
            serviceProvider,
            options,
            logger);

        var httpContext = new DefaultHttpContext();
        httpContext.Request.Method = "GET";
        httpContext.Request.Path = "/health/checks/database";

        await middleware.InvokeAsync(httpContext);

        await Task.Delay(100, TestContext.Current.CancellationToken);

        await auditLogService.DidNotReceive().AddAsync(Arg.Any<AuditLog>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task InvokeAsync_WhenDisabled_DoesNotLogAudit() {
        var logger = Substitute.For<ILogger<AuditLoggingMiddleware>>();
        var auditLogService = Substitute.For<IAuditLogService>();
        var serviceProvider = CreateServiceProvider(auditLogService);
        var options = CreateAuditLoggingOptions(enabled: false);
        var middleware = new AuditLoggingMiddleware(
            _ => Task.CompletedTask,
            serviceProvider,
            options,
            logger);

        var httpContext = new DefaultHttpContext();
        httpContext.Request.Method = "GET";
        httpContext.Request.Path = "/api/test";

        await middleware.InvokeAsync(httpContext);

        await Task.Delay(100, TestContext.Current.CancellationToken);

        await auditLogService.DidNotReceive().AddAsync(Arg.Any<AuditLog>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task InvokeAsync_WithGuidInPath_ReplacesWithIdPlaceholder() {
        var logger = Substitute.For<ILogger<AuditLoggingMiddleware>>();
        var auditLogService = Substitute.For<IAuditLogService>();
        var serviceProvider = CreateServiceProvider(auditLogService);
        var options = CreateAuditLoggingOptions();
        var middleware = new AuditLoggingMiddleware(
            _ => Task.CompletedTask,
            serviceProvider,
            options,
            logger);

        var userId = Guid.NewGuid();
        var httpContext = new DefaultHttpContext();
        httpContext.Request.Method = "GET";
        httpContext.Request.Path = $"/api/admin/users/{userId}";

        AuditLog? capturedLog = null;
        auditLogService.AddAsync(Arg.Any<AuditLog>(), Arg.Any<CancellationToken>())
            .Returns(callInfo => {
                capturedLog = callInfo.Arg<AuditLog>();
                return Task.FromResult(capturedLog);
            });

        await middleware.InvokeAsync(httpContext);

        await Task.Delay(100, TestContext.Current.CancellationToken);

        capturedLog.Should().NotBeNull();
        capturedLog!.Action.Should().Be("GET admin/users/{guid}");
    }

    [Fact]
    public async Task InvokeAsync_WithIntegerInPath_ReplacesWithIntPlaceholder() {
        var logger = Substitute.For<ILogger<AuditLoggingMiddleware>>();
        var auditLogService = Substitute.For<IAuditLogService>();
        var serviceProvider = CreateServiceProvider(auditLogService);
        var options = CreateAuditLoggingOptions();
        var middleware = new AuditLoggingMiddleware(
            _ => Task.CompletedTask,
            serviceProvider,
            options,
            logger);

        var httpContext = new DefaultHttpContext();
        httpContext.Request.Method = "DELETE";
        httpContext.Request.Path = "/api/admin/audit/12345";

        AuditLog? capturedLog = null;
        auditLogService.AddAsync(Arg.Any<AuditLog>(), Arg.Any<CancellationToken>())
            .Returns(callInfo => {
                capturedLog = callInfo.Arg<AuditLog>();
                return Task.FromResult(capturedLog);
            });

        await middleware.InvokeAsync(httpContext);

        await Task.Delay(100, TestContext.Current.CancellationToken);

        capturedLog.Should().NotBeNull();
        capturedLog!.Action.Should().Be("DELETE admin/audit/{int}");
    }

    [Fact]
    public async Task InvokeAsync_WithFullApiPath_CapturesAllSegmentsAfterApi() {
        var logger = Substitute.For<ILogger<AuditLoggingMiddleware>>();
        var auditLogService = Substitute.For<IAuditLogService>();
        var serviceProvider = CreateServiceProvider(auditLogService);
        var options = CreateAuditLoggingOptions();
        var middleware = new AuditLoggingMiddleware(
            _ => Task.CompletedTask,
            serviceProvider,
            options,
            logger);

        var httpContext = new DefaultHttpContext();
        httpContext.Request.Method = "POST";
        httpContext.Request.Path = "/api/auth/login";

        AuditLog? capturedLog = null;
        auditLogService.AddAsync(Arg.Any<AuditLog>(), Arg.Any<CancellationToken>())
            .Returns(callInfo => {
                capturedLog = callInfo.Arg<AuditLog>();
                return Task.FromResult(capturedLog);
            });

        await middleware.InvokeAsync(httpContext);

        await Task.Delay(100, TestContext.Current.CancellationToken);

        capturedLog.Should().NotBeNull();
        capturedLog!.Action.Should().Be("POST auth/login");
    }

    [Fact]
    public async Task InvokeAsync_MeasuresDurationCorrectly() {
        var logger = Substitute.For<ILogger<AuditLoggingMiddleware>>();
        var auditLogService = Substitute.For<IAuditLogService>();
        var serviceProvider = CreateServiceProvider(auditLogService);
        var options = CreateAuditLoggingOptions();
        var middleware = new AuditLoggingMiddleware(
            async _ => await Task.Delay(50, TestContext.Current.CancellationToken),
            serviceProvider,
            options,
            logger);

        var httpContext = new DefaultHttpContext();
        httpContext.Request.Method = "GET";
        httpContext.Request.Path = "/api/test";

        AuditLog? capturedLog = null;
        auditLogService.AddAsync(Arg.Any<AuditLog>(), Arg.Any<CancellationToken>())
            .Returns(callInfo => {
                capturedLog = callInfo.Arg<AuditLog>();
                return Task.FromResult(capturedLog);
            });

        await middleware.InvokeAsync(httpContext);

        await Task.Delay(100, TestContext.Current.CancellationToken);

        capturedLog.Should().NotBeNull();
        capturedLog!.DurationInMilliseconds.Should().BeGreaterThanOrEqualTo(50);
    }

    private static IServiceProvider CreateServiceProvider(IAuditLogService auditLogService) {
        var services = new ServiceCollection();
        services.AddScoped<IAuditLogService>(_ => auditLogService);
        return services.BuildServiceProvider();
    }

    private static IOptions<AuditLoggingOptions> CreateAuditLoggingOptions(bool enabled = true, List<string>? excludedPaths = null) {
        var options = Substitute.For<IOptions<AuditLoggingOptions>>();
        options.Value.Returns(new AuditLoggingOptions {
            Enabled = enabled,
            ExcludedPaths = excludedPaths ?? []
        });
        return options;
    }
}
