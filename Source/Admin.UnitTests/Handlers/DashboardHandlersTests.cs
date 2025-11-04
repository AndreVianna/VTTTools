namespace VttTools.Admin.UnitTests.Handlers;

public class DashboardHandlersTests {
    private readonly IDashboardService _mockDashboardService;
    private readonly IAuditLogService _mockAuditLogService;
    private readonly ClaimsPrincipal _testUser;

    public DashboardHandlersTests() {
        _mockDashboardService = Substitute.For<IDashboardService>();
        _mockAuditLogService = Substitute.For<IAuditLogService>();
        _testUser = new ClaimsPrincipal(new ClaimsIdentity([
            new Claim(ClaimTypes.NameIdentifier, Guid.NewGuid().ToString())
        ], "Test"));
    }

    [Fact]
    public async Task GetDashboardStatsHandler_ReturnsStats_WhenServiceSucceeds() {
        var expectedStats = new DashboardStatsResponse {
            TotalUsers = 100,
            ActiveUsers24h = 25,
            TotalAuditLogs = 1000,
            StorageUsedGB = 5.5m
        };

        _mockDashboardService.GetStatsAsync(Arg.Any<CancellationToken>())
            .Returns(expectedStats);

        var result = await DashboardHandlers.GetDashboardStatsHandler(
            _mockDashboardService,
            TestContext.Current.CancellationToken);

        Assert.IsType<Ok<DashboardStatsResponse>>(result);
        var okResult = result as Ok<DashboardStatsResponse>;
        Assert.NotNull(okResult);
        Assert.Equal(expectedStats.TotalUsers, okResult.Value!.TotalUsers);
        Assert.Equal(expectedStats.ActiveUsers24h, okResult.Value.ActiveUsers24h);
        Assert.Equal(expectedStats.TotalAuditLogs, okResult.Value.TotalAuditLogs);
        Assert.Equal(expectedStats.StorageUsedGB, okResult.Value.StorageUsedGB);

        await _mockDashboardService.Received(1).GetStatsAsync(Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task GetDashboardStatsHandler_ReturnsProblem_WhenServiceThrows() {
        _mockDashboardService.GetStatsAsync(Arg.Any<CancellationToken>())
            .ThrowsAsync(new InvalidOperationException("Database error"));

        var result = await DashboardHandlers.GetDashboardStatsHandler(
            _mockDashboardService,
            TestContext.Current.CancellationToken);

        Assert.IsType<ProblemHttpResult>(result);
    }

    [Fact]
    public async Task GetPerformanceMetricsHandler_ReturnsMetrics_WhenValidHours() {
        var expectedMetrics = new PerformanceMetricsResponse {
            AverageResponseTimeMs = 125.5,
            RequestsPerMinute = 50,
            ResponseTimeHistory = [
                new TimeSeriesDataPoint { Timestamp = DateTime.UtcNow.AddHours(-1), Value = 120 },
                new TimeSeriesDataPoint { Timestamp = DateTime.UtcNow, Value = 130 }
            ]
        };

        _mockDashboardService.GetMetricsAsync(24, Arg.Any<CancellationToken>())
            .Returns(expectedMetrics);

        var result = await DashboardHandlers.GetPerformanceMetricsHandler(
            24,
            _mockDashboardService,
            TestContext.Current.CancellationToken);

        Assert.IsType<Ok<PerformanceMetricsResponse>>(result);
        var okResult = result as Ok<PerformanceMetricsResponse>;
        Assert.NotNull(okResult);
        Assert.Equal(expectedMetrics.AverageResponseTimeMs, okResult.Value!.AverageResponseTimeMs);
        Assert.Equal(expectedMetrics.RequestsPerMinute, okResult.Value.RequestsPerMinute);
        Assert.Equal(2, okResult.Value.ResponseTimeHistory.Count);

        await _mockDashboardService.Received(1).GetMetricsAsync(24, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task GetPerformanceMetricsHandler_ReturnsBadRequest_WhenHoursIsZero() {
        var result = await DashboardHandlers.GetPerformanceMetricsHandler(
            0,
            _mockDashboardService,
            TestContext.Current.CancellationToken);

        Assert.IsType<IResult>(result, exactMatch: false);
        var badRequestResult = result;
        Assert.NotNull(badRequestResult);

        await _mockDashboardService.DidNotReceive().GetMetricsAsync(Arg.Any<int>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task GetPerformanceMetricsHandler_ReturnsBadRequest_WhenHoursIsGreaterThan168() {
        var result = await DashboardHandlers.GetPerformanceMetricsHandler(
            200,
            _mockDashboardService,
            TestContext.Current.CancellationToken);

        Assert.IsType<IResult>(result, exactMatch: false);
        var badRequestResult = result;
        Assert.NotNull(badRequestResult);

        await _mockDashboardService.DidNotReceive().GetMetricsAsync(Arg.Any<int>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task GetPerformanceMetricsHandler_ReturnsProblem_WhenServiceThrows() {
        _mockDashboardService.GetMetricsAsync(Arg.Any<int>(), Arg.Any<CancellationToken>())
            .ThrowsAsync(new InvalidOperationException("Database error"));

        var result = await DashboardHandlers.GetPerformanceMetricsHandler(
            24,
            _mockDashboardService,
            TestContext.Current.CancellationToken);

        Assert.IsType<ProblemHttpResult>(result);
    }
}
