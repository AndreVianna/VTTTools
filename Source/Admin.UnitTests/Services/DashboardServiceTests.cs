namespace VttTools.Admin.UnitTests.Services;

public class DashboardServiceTests {
    private readonly UserManager<User> _mockUserManager;
    private readonly IAuditLogService _mockAuditLogService;
    private readonly ILogger<DashboardService> _mockLogger;
    private readonly DashboardService _sut;

    public DashboardServiceTests() {
        _mockUserManager = CreateUserManagerMock();
        _mockAuditLogService = Substitute.For<IAuditLogService>();
        _mockLogger = Substitute.For<ILogger<DashboardService>>();
        _sut = new DashboardService(_mockUserManager, _mockAuditLogService, _mockLogger);
    }

    [Fact]
    public async Task GetStatsAsync_ReturnsTotalUsers_FromUserManager() {
        var users = new List<User> {
            CreateTestUser("user1@example.com", "User One"),
            CreateTestUser("user2@example.com", "User Two"),
            CreateTestUser("user3@example.com", "User Three"),
        };

        _mockUserManager.Users.Returns(users.AsQueryable());

        _mockAuditLogService.GetDistinctActiveUsersCountAsync(Arg.Any<DateTime>(), Arg.Any<CancellationToken>())
            .Returns(0);

        _mockAuditLogService.GetTotalCountAsync(Arg.Any<CancellationToken>())
            .Returns(10);

        var result = await _sut.GetStatsAsync(TestContext.Current.CancellationToken);

        Assert.Equal(3, result.TotalUsers);
        Assert.Equal(10, result.TotalAuditLogs);
        Assert.Equal(0, result.StorageUsedGB);
    }

    [Fact]
    public async Task GetStatsAsync_ReturnsActiveUsers24h_FromAuditLogs() {
        var users = new List<User> {
            CreateTestUser("user1@example.com", "User One")
        };

        _mockUserManager.Users.Returns(users.AsQueryable());

        _mockAuditLogService.GetDistinctActiveUsersCountAsync(Arg.Any<DateTime>(), Arg.Any<CancellationToken>())
            .Returns(3);

        _mockAuditLogService.GetTotalCountAsync(Arg.Any<CancellationToken>())
            .Returns(100);

        var result = await _sut.GetStatsAsync(TestContext.Current.CancellationToken);

        Assert.Equal(3, result.ActiveUsers24h);
        Assert.Equal(1, result.TotalUsers);
        Assert.Equal(100, result.TotalAuditLogs);
    }

    [Fact]
    public async Task GetMetricsAsync_ReturnsAverageResponseTime_FromAuditLogs() {
        _mockAuditLogService.GetCountInPeriodAsync(Arg.Any<DateTime>(), Arg.Any<CancellationToken>())
            .Returns(100);

        _mockAuditLogService.GetAverageResponseTimeAsync(Arg.Any<DateTime>(), Arg.Any<CancellationToken>())
            .Returns(250.0);

        _mockAuditLogService.GetHourlyAverageResponseTimesAsync(Arg.Any<DateTime>(), Arg.Any<CancellationToken>())
            .Returns([]);

        var result = await _sut.GetMetricsAsync(24, TestContext.Current.CancellationToken);

        Assert.Equal(250, result.AverageResponseTimeMs);
        Assert.True(result.RequestsPerMinute >= 0);
    }

    [Fact]
    public async Task GetMetricsAsync_ReturnsTimeSeriesData_ForRequestedHours() {
        _mockAuditLogService.GetCountInPeriodAsync(Arg.Any<DateTime>(), Arg.Any<CancellationToken>())
            .Returns(50);

        _mockAuditLogService.GetAverageResponseTimeAsync(Arg.Any<DateTime>(), Arg.Any<CancellationToken>())
            .Returns(150.0);

        _mockAuditLogService.GetHourlyAverageResponseTimesAsync(Arg.Any<DateTime>(), Arg.Any<CancellationToken>())
            .Returns([]);

        const int hours = 12;
        var result = await _sut.GetMetricsAsync(hours, TestContext.Current.CancellationToken);

        Assert.Equal(hours + 1, result.ResponseTimeHistory.Count);
        Assert.All(result.ResponseTimeHistory, dp => {
            Assert.True(dp.Timestamp <= DateTime.UtcNow);
            Assert.True(dp.Value >= 0);
        });
    }

    [Fact]
    public async Task GetMetricsAsync_ThrowsArgumentOutOfRangeException_WhenHoursIsLessThanOne()
        => await Assert.ThrowsAsync<ArgumentOutOfRangeException>(
            async () => await _sut.GetMetricsAsync(0, TestContext.Current.CancellationToken));

    [Fact]
    public async Task GetMetricsAsync_ThrowsArgumentOutOfRangeException_WhenHoursIsGreaterThan168()
        => await Assert.ThrowsAsync<ArgumentOutOfRangeException>(
            async () => await _sut.GetMetricsAsync(169, TestContext.Current.CancellationToken));

    private static UserManager<User> CreateUserManagerMock() {
        var userStore = Substitute.For<IUserStore<User>>();
        return Substitute.For<UserManager<User>>(
            userStore, null, null, null, null, null, null, null, null);
    }

    private static User CreateTestUser(string email, string name)
        => new() {
            Id = Guid.CreateVersion7(),
            UserName = email,
            Email = email,
            Name = name,
            DisplayName = name,
            EmailConfirmed = true
        };
}