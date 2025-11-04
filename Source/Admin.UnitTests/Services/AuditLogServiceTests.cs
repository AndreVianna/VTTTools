namespace VttTools.Admin.UnitTests.Services;

public class AuditLogServiceTests {
    private readonly IAuditLogStorage _mockStorage;
    private readonly ILogger<AuditLogService> _mockLogger;
    private readonly IAuditLogService _sut;

    public AuditLogServiceTests() {
        _mockStorage = Substitute.For<IAuditLogStorage>();
        _mockLogger = Substitute.For<ILogger<AuditLogService>>();
        _sut = new AuditLogService(_mockStorage, _mockLogger);
    }

    #region AddAsync Tests

    [Fact]
    public async Task AddAsync_WithValidAuditLog_CreatesSuccessfully() {
        var auditLog = CreateTestAuditLog("User.Login", "Success");
        _mockStorage.AddAsync(Arg.Any<AuditLog>(), Arg.Any<CancellationToken>())
            .Returns(Task.CompletedTask);

        await _sut.AddAsync(auditLog, TestContext.Current.CancellationToken);
        await _mockStorage.Received(1).AddAsync(Arg.Any<AuditLog>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task AddAsync_WithNoTimestamp_SetsTimestampToUtcNow() {
        var beforeCall = DateTime.UtcNow;
        var auditLog = CreateTestAuditLog("User.Login", "Success") with { Timestamp = default };
        var createdLog = auditLog with { Timestamp = DateTime.UtcNow };

        _mockStorage.AddAsync(Arg.Any<AuditLog>(), Arg.Any<CancellationToken>())
            .Returns(Task.CompletedTask);

        await _sut.AddAsync(auditLog, TestContext.Current.CancellationToken);
        var afterCall = DateTime.UtcNow;

        await _mockStorage.Received(1).AddAsync(
            Arg.Is<AuditLog>(log => log.Timestamp >= beforeCall && log.Timestamp <= afterCall),
            Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task AddAsync_WithNullAuditLog_ThrowsArgumentNullException() {
        await Assert.ThrowsAsync<ArgumentNullException>(
            async () => await _sut.AddAsync(null!, TestContext.Current.CancellationToken));

        await _mockStorage.DidNotReceive().AddAsync(Arg.Any<AuditLog>(), Arg.Any<CancellationToken>());
    }

    [Theory]
    [InlineData("InvalidResult")]
    [InlineData("")]
    [InlineData("success")]
    [InlineData("FAILURE")]
    [InlineData("Unknown")]
    public async Task AddAsync_WithInvalidResult_ThrowsArgumentException(string invalidResult) {
        var auditLog = CreateTestAuditLog("User.Login", invalidResult);

        var exception = await Assert.ThrowsAsync<ArgumentException>(async () => await _sut.AddAsync(auditLog, TestContext.Current.CancellationToken));

        Assert.Contains("Result must be one of: Success, Failure, Error", exception.Message);
        await _mockStorage.DidNotReceive().AddAsync(Arg.Any<AuditLog>(), Arg.Any<CancellationToken>());
    }

    [Theory]
    [InlineData("Success")]
    [InlineData("Failure")]
    [InlineData("Error")]
    public async Task AddAsync_WithValidResult_CreatesSuccessfully(string validResult) {
        var auditLog = CreateTestAuditLog("User.Login", validResult);
        _mockStorage.AddAsync(Arg.Any<AuditLog>(), Arg.Any<CancellationToken>())
            .Returns(Task.CompletedTask);

        await _sut.AddAsync(auditLog, TestContext.Current.CancellationToken);
        await _mockStorage.Received(1).AddAsync(Arg.Any<AuditLog>(), Arg.Any<CancellationToken>());
    }

    #endregion

    #region GetAuditLogByIdAsync Tests

    [Fact]
    public async Task GetAuditLogByIdAsync_WhenFound_ReturnsAuditLog() {
        var auditLog = CreateTestAuditLog("User.Login", "Success");
        _mockStorage.GetByIdAsync(auditLog.Id, Arg.Any<CancellationToken>())
            .Returns(auditLog);

        var result = await _sut.GetByIdAsync(auditLog.Id, TestContext.Current.CancellationToken);

        Assert.NotNull(result);
        Assert.Equal(auditLog.Id, result.Id);
        Assert.Equal(auditLog.Action, result.Action);
        await _mockStorage.Received(1).GetByIdAsync(auditLog.Id, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task GetAuditLogByIdAsync_WhenNotFound_ReturnsNull() {
        var id = Guid.CreateVersion7();
        _mockStorage.GetByIdAsync(id, Arg.Any<CancellationToken>())
            .Returns((AuditLog?)null);

        var result = await _sut.GetByIdAsync(id, TestContext.Current.CancellationToken);

        Assert.Null(result);
        await _mockStorage.Received(1).GetByIdAsync(id, Arg.Any<CancellationToken>());
    }

    #endregion

    #region QueryAuditLogsAsync Tests

    [Fact]
    public async Task QueryAuditLogsAsync_WithAllFilters_QueriesSuccessfully() {
        var startDate = DateTime.UtcNow.AddDays(-7);
        var endDate = DateTime.UtcNow;
        var userId = Guid.CreateVersion7();
        const string action = "User.Login";
        const string entityType = "User";
        const string result = "Success";
        const int skip = 10;
        const int take = 20;

        var logs = new[] {
            CreateTestAuditLog(action, result),
            CreateTestAuditLog(action, result)
        };
        var queryResult = (Items: (IEnumerable<AuditLog>)logs, TotalCount: 100);

        _mockStorage.QueryAsync(
            startDate,
            endDate,
            userId,
            action,
            entityType,
            result,
            skip,
            take,
            Arg.Any<CancellationToken>())
            .Returns(queryResult);

        var (items, totalCount) = await _sut.QueryAsync(
            startDate,
            endDate,
            userId,
            action,
            entityType,
            result,
            skip,
            take,
            TestContext.Current.CancellationToken);

        Assert.Equal(2, items.Count());
        Assert.Equal(100, totalCount);
        await _mockStorage.Received(1).QueryAsync(
            startDate,
            endDate,
            userId,
            action,
            entityType,
            result,
            skip,
            take,
            Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task QueryAuditLogsAsync_WithNoFilters_ReturnsAllLogs() {
        var logs = new[] {
            CreateTestAuditLog("User.Login", "Success"),
            CreateTestAuditLog("User.Logout", "Success"),
            CreateTestAuditLog("Asset.Upload", "Failure")
        };
        var queryResult = (Items: (IEnumerable<AuditLog>)logs, TotalCount: 3);

        _mockStorage.QueryAsync(
            null,
            null,
            null,
            null,
            null,
            null,
            0,
            50,
            Arg.Any<CancellationToken>())
            .Returns(queryResult);

        var (items, totalCount) = await _sut.QueryAsync(
            ct: TestContext.Current.CancellationToken);

        Assert.Equal(3, items.Count());
        Assert.Equal(3, totalCount);
    }

    [Fact]
    public async Task QueryAuditLogsAsync_WithNegativeSkip_ThrowsArgumentOutOfRangeException() {
        var exception = await Assert.ThrowsAsync<ArgumentOutOfRangeException>(
            async () => await _sut.QueryAsync(skip: -1, ct: TestContext.Current.CancellationToken));

        Assert.Equal("skip", exception.ParamName);
        Assert.Contains("Skip must be greater than or equal to 0", exception.Message);
        await _mockStorage.DidNotReceive().QueryAsync(
            Arg.Any<DateTime?>(),
            Arg.Any<DateTime?>(),
            Arg.Any<Guid?>(),
            Arg.Any<string?>(),
            Arg.Any<string?>(),
            Arg.Any<string?>(),
            Arg.Any<int>(),
            Arg.Any<int>(),
            Arg.Any<CancellationToken>());
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-1)]
    [InlineData(-10)]
    public async Task QueryAuditLogsAsync_WithZeroOrNegativeTake_ThrowsArgumentOutOfRangeException(int invalidTake) {
        var exception = await Assert.ThrowsAsync<ArgumentOutOfRangeException>(
            async () => await _sut.QueryAsync(take: invalidTake, ct: TestContext.Current.CancellationToken));

        Assert.Equal("take", exception.ParamName);
        Assert.Contains("Take must be greater than 0", exception.Message);
    }

    [Theory]
    [InlineData(101)]
    [InlineData(200)]
    [InlineData(1000)]
    public async Task QueryAuditLogsAsync_WithTakeGreaterThan100_ThrowsArgumentOutOfRangeException(int invalidTake) {
        var exception = await Assert.ThrowsAsync<ArgumentOutOfRangeException>(
            async () => await _sut.QueryAsync(take: invalidTake, ct: TestContext.Current.CancellationToken));

        Assert.Equal("take", exception.ParamName);
        Assert.Contains("Take must be less than or equal to 100", exception.Message);
    }

    [Theory]
    [InlineData(1)]
    [InlineData(50)]
    [InlineData(100)]
    public async Task QueryAuditLogsAsync_WithValidTake_QueriesSuccessfully(int validTake) {
        var logs = new[] { CreateTestAuditLog("User.Login", "Success") };
        var queryResult = (Items: (IEnumerable<AuditLog>)logs, TotalCount: 1);

        _mockStorage.QueryAsync(
            Arg.Any<DateTime?>(),
            Arg.Any<DateTime?>(),
            Arg.Any<Guid?>(),
            Arg.Any<string?>(),
            Arg.Any<string?>(),
            Arg.Any<string?>(),
            Arg.Any<int>(),
            validTake,
            Arg.Any<CancellationToken>())
            .Returns(queryResult);

        await _sut.QueryAsync(take: validTake, ct: TestContext.Current.CancellationToken);

        await _mockStorage.Received(1).QueryAsync(
            Arg.Any<DateTime?>(),
            Arg.Any<DateTime?>(),
            Arg.Any<Guid?>(),
            Arg.Any<string?>(),
            Arg.Any<string?>(),
            Arg.Any<string?>(),
            Arg.Any<int>(),
            validTake,
            Arg.Any<CancellationToken>());
    }

    #endregion

    #region GetTotalAuditLogCountAsync Tests

    [Fact]
    public async Task GetTotalAuditLogCountAsync_ReturnsCountFromStorage() {
        const int expectedCount = 42;
        _mockStorage.GetCountAsync(Arg.Any<CancellationToken>())
            .Returns(expectedCount);

        var result = await _sut.GetTotalCountAsync(TestContext.Current.CancellationToken);

        Assert.Equal(expectedCount, result);
        await _mockStorage.Received(1).GetCountAsync(Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task GetTotalAuditLogCountAsync_WhenNoLogs_ReturnsZero() {
        _mockStorage.GetCountAsync(Arg.Any<CancellationToken>())
            .Returns(0);

        var result = await _sut.GetTotalCountAsync(TestContext.Current.CancellationToken);

        Assert.Equal(0, result);
    }

    #endregion

    #region Helper Methods

    private static AuditLog CreateTestAuditLog(string action, string result) => new() {
        Id = Guid.CreateVersion7(),
        Timestamp = DateTime.UtcNow,
        UserId = Guid.CreateVersion7(),
        UserEmail = "test@example.com",
        Action = action,
        EntityType = "User",
        EntityId = Guid.CreateVersion7().ToString(),
        HttpMethod = "POST",
        Path = "/api/test",
        StatusCode = 200,
        IpAddress = "127.0.0.1",
        UserAgent = "Test Agent",
        DurationInMilliseconds = 100,
        Result = result
    };

    #endregion
}
