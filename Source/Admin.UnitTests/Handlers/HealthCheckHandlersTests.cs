using Microsoft.Extensions.Diagnostics.HealthChecks;

namespace VttTools.Admin.Handlers;

public class HealthCheckHandlersTests {
    private sealed class TestHealthCheckService : HealthCheckService {
        private HealthReport? _healthReport;

        public void SetHealthReport(HealthReport report) => _healthReport = report;

        public override Task<HealthReport> CheckHealthAsync(
            Func<HealthCheckRegistration, bool>? predicate = null,
            CancellationToken cancellationToken = default) => Task.FromResult(_healthReport ?? throw new InvalidOperationException("Health report not set"));
    }

    private readonly TestHealthCheckService _healthCheckService = new();
    private readonly IAuditLogService _mockAuditLogService = Substitute.For<IAuditLogService>();
    private readonly ClaimsPrincipal _testUser = new(new ClaimsIdentity([
                                                                            new(ClaimTypes.NameIdentifier, Guid.NewGuid().ToString())
                                                                        ], "Test"));

    [Fact]
    public async Task GetHealthChecksHandler_ReturnsHealthy_WhenAllChecksPass() {
        var healthReport = new HealthReport(
            new Dictionary<string, HealthReportEntry> {
                ["Database"] = new(
                                   HealthStatus.Healthy,
                                   "Database connection successful",
                                   TimeSpan.FromMilliseconds(50),
                                   null,
                                   new Dictionary<string, object> {
                                       ["connectionTime"] = "50ms",
                                       ["server"] = "localhost",
                                       ["database"] = "VttTools"
                                   }
                                  ),
                ["BlobStorage"] = new(
                                      HealthStatus.Healthy,
                                      "Blob storage accessible",
                                      TimeSpan.FromMilliseconds(75),
                                      null,
                                      new Dictionary<string, object> {
                                          ["accessTime"] = "75ms",
                                          ["containerName"] = "assets"
                                      }
                                     )
            },
            TimeSpan.FromMilliseconds(125)
        );

        _healthCheckService.SetHealthReport(healthReport);

        var result = await HealthCheckHandlers.GetHealthChecksHandler(
            _testUser,
            _healthCheckService,
            _mockAuditLogService,
            TestContext.Current.CancellationToken);

        var okResult = Assert.IsType<Ok<HealthCheckResponse>>(result);
        Assert.Equal("Healthy", okResult.Value!.Status);
        Assert.Equal("125.00ms", okResult.Value!.TotalDuration);
        Assert.Equal(2, okResult.Value!.Results.Count);

        var dbCheck = okResult.Value!.Results.First(r => r.Name == "Database");
        Assert.Equal("Healthy", dbCheck.Status);
        Assert.Equal("50.00ms", dbCheck.Duration);
        Assert.Equal("Database connection successful", dbCheck.Description);
        Assert.NotNull(dbCheck.Data);
        Assert.Equal(3, dbCheck.Data.Count);
    }

    [Fact]
    public async Task GetHealthChecksHandler_ReturnsUnhealthy_WhenCheckFails() {
        var healthReport = new HealthReport(
            new Dictionary<string, HealthReportEntry> {
                ["Database"] = new(
                                   HealthStatus.Unhealthy,
                                   "Database connection failed: Timeout expired",
                                   TimeSpan.FromMilliseconds(5000),
                                   new("Connection timeout"),
                                   new Dictionary<string, object> {
                                       ["connectionTime"] = "5000ms",
                                       ["sqlErrorNumber"] = 53
                                   }
                                  )
            },
            TimeSpan.FromMilliseconds(5000)
        );

        _healthCheckService.SetHealthReport(healthReport);

        var result = await HealthCheckHandlers.GetHealthChecksHandler(
            _testUser,
            _healthCheckService,
            _mockAuditLogService,
            TestContext.Current.CancellationToken);

        var okResult = Assert.IsType<Ok<HealthCheckResponse>>(result);
        Assert.Equal("Unhealthy", okResult.Value!.Status);
        Assert.Equal("5000.00ms", okResult.Value!.TotalDuration);
        Assert.Single(okResult.Value!.Results);

        var dbCheck = okResult.Value!.Results[0];
        Assert.Equal("Database", dbCheck.Name);
        Assert.Equal("Unhealthy", dbCheck.Status);
        Assert.Equal("5000.00ms", dbCheck.Duration);
        Assert.Contains("timeout", dbCheck.Description, StringComparison.OrdinalIgnoreCase);
        Assert.NotNull(dbCheck.Data);
        Assert.Equal(2, dbCheck.Data.Count);
    }

    [Fact]
    public async Task GetHealthChecksHandler_IncludesDetailedMetrics() {
        var healthReport = new HealthReport(
            new Dictionary<string, HealthReportEntry> {
                ["Database"] = new(
                                   HealthStatus.Healthy,
                                   "Database connection successful",
                                   TimeSpan.FromMilliseconds(123.456),
                                   null,
                                   new Dictionary<string, object> {
                                       ["connectionTime"] = "123.45ms",
                                       ["server"] = "sql.example.com",
                                       ["database"] = "VttToolsDb",
                                       ["queryResult"] = "1"
                                   }
                                  ),
                ["BlobStorage"] = new(
                                      HealthStatus.Degraded,
                                      "Slow response time",
                                      TimeSpan.FromMilliseconds(987.654),
                                      null,
                                      new Dictionary<string, object>()
                                     )
            },
            TimeSpan.FromMilliseconds(1111.11)
        );

        _healthCheckService.SetHealthReport(healthReport);

        var result = await HealthCheckHandlers.GetHealthChecksHandler(
            _testUser,
            _healthCheckService,
            _mockAuditLogService,
            TestContext.Current.CancellationToken);

        var okResult = Assert.IsType<Ok<HealthCheckResponse>>(result);
        Assert.Equal("1111.11ms", okResult.Value!.TotalDuration);

        var dbCheck = okResult.Value!.Results.First(r => r.Name == "Database");
        Assert.Equal("123.46ms", dbCheck.Duration);
        Assert.NotNull(dbCheck.Data);
        Assert.Equal(4, dbCheck.Data.Count);
        Assert.Equal("123.45ms", dbCheck.Data["connectionTime"]);
        Assert.Equal("sql.example.com", dbCheck.Data["server"]);

        var blobCheck = okResult.Value!.Results.First(r => r.Name == "BlobStorage");
        Assert.Equal("987.65ms", blobCheck.Duration);
        Assert.Equal("Degraded", blobCheck.Status);
        Assert.Null(blobCheck.Data);
    }
}