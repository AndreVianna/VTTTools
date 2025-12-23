namespace VttTools.Services;

public class AuditLogServiceTests {
    private readonly IAuditLogStorage _storage;
    private readonly ILogger<AuditLogService> _logger;
    private readonly AuditLogService _service;

    public AuditLogServiceTests() {
        _storage = Substitute.For<IAuditLogStorage>();
        _logger = Substitute.For<ILogger<AuditLogService>>();
        _service = new(_storage, _logger);
    }

    [Fact]
    public async Task AddAsync_WithValidAuditLog_CallsStorage() {
        var auditLog = new AuditLog {
            Id = Guid.NewGuid(),
            UserId = Guid.NewGuid(),
            Action = "Create",
            EntityType = "User",
            EntityId = Guid.NewGuid().ToString(),
            Timestamp = DateTime.UtcNow,
                                    };

        await _service.AddAsync(auditLog, TestContext.Current.CancellationToken);

        await _storage.Received(1).AddAsync(
            Arg.Is<AuditLog>(a => a.Id == auditLog.Id),
            TestContext.Current.CancellationToken);
    }

    [Fact]
    public Task AddAsync_WithNullAuditLog_ThrowsArgumentNullException()
        => Assert.ThrowsAsync<ArgumentNullException>(() => _service.AddAsync(null!, TestContext.Current.CancellationToken));

    [Fact]
    public async Task AddAsync_WithValidAuditLog_NoValidationError() {
        var auditLog = new AuditLog {
            Id = Guid.NewGuid(),
            UserId = Guid.NewGuid(),
            Action = "Create",
            EntityType = "User",
            EntityId = Guid.NewGuid().ToString(),
            Timestamp = DateTime.UtcNow,
                                    };

        await _service.AddAsync(auditLog, TestContext.Current.CancellationToken);

        await _storage.Received(1).AddAsync(Arg.Any<AuditLog>(), TestContext.Current.CancellationToken);
    }

    [Fact]
    public async Task AddAsync_WithDefaultTimestamp_SetsUtcNow() {
        var auditLog = new AuditLog {
            Id = Guid.NewGuid(),
            UserId = Guid.NewGuid(),
            Action = "Create",
            EntityType = "User",
            EntityId = Guid.NewGuid().ToString(),
            Timestamp = default,
                                    };

        await _service.AddAsync(auditLog, TestContext.Current.CancellationToken);

        await _storage.Received(1).AddAsync(
            Arg.Is<AuditLog>(a => a.Timestamp > DateTime.UtcNow.AddSeconds(-5)),
            TestContext.Current.CancellationToken);
    }

    [Fact]
    public async Task AddAsync_WithSpecifiedTimestamp_PreservesTimestamp() {
        var timestamp = DateTime.UtcNow.AddHours(-1);
        var auditLog = new AuditLog {
            Id = Guid.NewGuid(),
            UserId = Guid.NewGuid(),
            Action = "Create",
            EntityType = "User",
            EntityId = Guid.NewGuid().ToString(),
            Timestamp = timestamp,
                                    };

        await _service.AddAsync(auditLog, TestContext.Current.CancellationToken);

        await _storage.Received(1).AddAsync(
            Arg.Is<AuditLog>(a => a.Timestamp == timestamp),
            TestContext.Current.CancellationToken);
    }

    [Fact]
    public async Task GetByIdAsync_WithExistingId_ReturnsAuditLog() {
        var id = Guid.NewGuid();
        var auditLog = new AuditLog {
            Id = id,
            UserId = Guid.NewGuid(),
            Action = "Create",
            EntityType = "User",
            EntityId = Guid.NewGuid().ToString(),
            Timestamp = DateTime.UtcNow,
                                    };
        _storage.GetByIdAsync(id, TestContext.Current.CancellationToken).Returns(auditLog);

        var result = await _service.GetByIdAsync(id, TestContext.Current.CancellationToken);

        result.Should().NotBeNull();
        result.Id.Should().Be(id);
    }

    [Fact]
    public async Task GetByIdAsync_WithNonExistingId_ReturnsNull() {
        var id = Guid.NewGuid();
        _storage.GetByIdAsync(id, TestContext.Current.CancellationToken).Returns((AuditLog?)null);

        var result = await _service.GetByIdAsync(id, TestContext.Current.CancellationToken);

        result.Should().BeNull();
    }

    [Fact]
    public async Task QueryAsync_WithValidParameters_ReturnsResults() {
        var items = new List<AuditLog> {
            new() {
                Id = Guid.NewGuid(),
                UserId = Guid.NewGuid(),
                Action = "Create",
                EntityType = "User",
                EntityId = Guid.NewGuid().ToString(),
                Timestamp = DateTime.UtcNow,
                  },
                                       };
        _storage.QueryAsync(
            Arg.Any<DateTime?>(),
            Arg.Any<DateTime?>(),
            Arg.Any<Guid?>(),
            Arg.Any<string?>(),
            Arg.Any<string?>(),
            Arg.Any<int>(),
            Arg.Any<int>(),
            TestContext.Current.CancellationToken)
            .Returns((items, 1));

        (var logs, var totalCount) = await _service.QueryAsync(ct: TestContext.Current.CancellationToken);

        logs.Should().HaveCount(1);
        totalCount.Should().Be(1);
    }

    [Fact]
    public async Task QueryAsync_WithNegativeSkip_ThrowsArgumentOutOfRangeException() {
        var exception = await Assert.ThrowsAsync<ArgumentOutOfRangeException>(
            async () => await _service.QueryAsync(skip: -1, ct: TestContext.Current.CancellationToken));

        exception.ParamName.Should().Be("skip");
    }

    [Fact]
    public async Task QueryAsync_WithZeroTake_ThrowsArgumentOutOfRangeException() {
        var exception = await Assert.ThrowsAsync<ArgumentOutOfRangeException>(
            async () => await _service.QueryAsync(take: 0, ct: TestContext.Current.CancellationToken));

        exception.ParamName.Should().Be("take");
    }

    [Fact]
    public async Task QueryAsync_WithNegativeTake_ThrowsArgumentOutOfRangeException() {
        var exception = await Assert.ThrowsAsync<ArgumentOutOfRangeException>(
            async () => await _service.QueryAsync(take: -1, ct: TestContext.Current.CancellationToken));

        exception.ParamName.Should().Be("take");
    }

    [Fact]
    public async Task QueryAsync_WithTakeGreaterThan100_ThrowsArgumentOutOfRangeException() {
        var exception = await Assert.ThrowsAsync<ArgumentOutOfRangeException>(
            async () => await _service.QueryAsync(take: 101, ct: TestContext.Current.CancellationToken));

        exception.ParamName.Should().Be("take");
    }

    [Fact]
    public async Task QueryAsync_WithTake100_DoesNotThrow() {
        _storage.QueryAsync(
            Arg.Any<DateTime?>(),
            Arg.Any<DateTime?>(),
            Arg.Any<Guid?>(),
            Arg.Any<string?>(),
            Arg.Any<string?>(),
            Arg.Any<int>(),
            Arg.Any<int>(),
            TestContext.Current.CancellationToken)
            .Returns((new List<AuditLog>(), 0));

        (var items, var totalCount) = await _service.QueryAsync(take: 100, ct: TestContext.Current.CancellationToken);

        items.Should().BeEmpty();
        totalCount.Should().Be(0);
    }

    [Fact]
    public async Task QueryAsync_WithAllFilters_PassesToStorage() {
        var startDate = DateTime.UtcNow.AddDays(-7);
        var endDate = DateTime.UtcNow;
        var userId = Guid.NewGuid();
        const string action = "Create";
        const string entityType = "User";
        const int skip = 10;
        const int take = 20;

        _storage.QueryAsync(
            startDate,
            endDate,
            userId,
            action,
            entityType,
            skip,
            take,
            TestContext.Current.CancellationToken)
            .Returns((new List<AuditLog>(), 0));

        await _service.QueryAsync(
            startDate,
            endDate,
            userId,
            action,
            entityType,
            skip,
            take,
            TestContext.Current.CancellationToken);

        await _storage.Received(1).QueryAsync(
            startDate,
            endDate,
            userId,
            action,
            entityType,
            skip,
            take,
            TestContext.Current.CancellationToken);
    }

    [Fact]
    public async Task GetTotalCountAsync_ReturnsCountFromStorage() {
        _storage.GetCountAsync(TestContext.Current.CancellationToken).Returns(42);

        var count = await _service.GetTotalCountAsync(TestContext.Current.CancellationToken);

        count.Should().Be(42);
    }

    [Fact]
    public async Task GetDistinctActiveUsersCountAsync_ReturnsCountFromStorage() {
        var startDate = DateTime.UtcNow.AddDays(-30);
        _storage.GetDistinctActiveUsersCountAsync(startDate, TestContext.Current.CancellationToken).Returns(15);

        var count = await _service.GetDistinctActiveUsersCountAsync(startDate, TestContext.Current.CancellationToken);

        count.Should().Be(15);
    }

    [Fact]
    public async Task GetCountInPeriodAsync_ReturnsCountFromStorage() {
        var startDate = DateTime.UtcNow.AddDays(-7);
        _storage.GetCountInPeriodAsync(startDate, TestContext.Current.CancellationToken).Returns(100);

        var count = await _service.GetCountInPeriodAsync(startDate, TestContext.Current.CancellationToken);

        count.Should().Be(100);
    }

    [Fact]
    public async Task GetAverageResponseTimeAsync_ReturnsAverageFromStorage() {
        var startDate = DateTime.UtcNow.AddDays(-1);
        _storage.GetAverageResponseTimeAsync(startDate, TestContext.Current.CancellationToken).Returns(123.45);

        var average = await _service.GetAverageResponseTimeAsync(startDate, TestContext.Current.CancellationToken);

        average.Should().Be(123.45);
    }

    [Fact]
    public async Task GetHourlyAverageResponseTimesAsync_ReturnsDataFromStorage() {
        var startDate = DateTime.UtcNow.AddDays(-1);
        var dataPoints = new List<TimeSeriesDataPoint> {
            new() { Timestamp = DateTime.UtcNow.AddHours(-2), Value = 100 },
            new() { Timestamp = DateTime.UtcNow.AddHours(-1), Value = 150 },
                                                       };
        _storage.GetHourlyAverageResponseTimesAsync(startDate, TestContext.Current.CancellationToken).Returns(dataPoints);

        var result = await _service.GetHourlyAverageResponseTimesAsync(startDate, TestContext.Current.CancellationToken);

        result.Should().HaveCount(2);
        result[0].Value.Should().Be(100);
        result[1].Value.Should().Be(150);
    }

    [Fact]
    public async Task GetUserCreatedDateAsync_ReturnsDateFromStorage() {
        var userId = Guid.NewGuid();
        var createdDate = DateTime.UtcNow.AddMonths(-6);
        _storage.GetUserCreatedDateAsync(userId, TestContext.Current.CancellationToken).Returns(createdDate);

        var result = await _service.GetUserCreatedDateAsync(userId, TestContext.Current.CancellationToken);

        result.Should().Be(createdDate);
    }

    [Fact]
    public async Task GetUserLastLoginDateAsync_WithLoginHistory_ReturnsDate() {
        var userId = Guid.NewGuid();
        var lastLogin = DateTime.UtcNow.AddHours(-2);
        _storage.GetUserLastLoginDateAsync(userId, TestContext.Current.CancellationToken).Returns(lastLogin);

        var result = await _service.GetUserLastLoginDateAsync(userId, TestContext.Current.CancellationToken);

        result.Should().Be(lastLogin);
    }

    [Fact]
    public async Task GetUserLastLoginDateAsync_WithNoLoginHistory_ReturnsNull() {
        var userId = Guid.NewGuid();
        _storage.GetUserLastLoginDateAsync(userId, TestContext.Current.CancellationToken).Returns((DateTime?)null);

        var result = await _service.GetUserLastLoginDateAsync(userId, TestContext.Current.CancellationToken);

        result.Should().BeNull();
    }

    [Fact]
    public async Task GetUserLastModifiedDateAsync_WithModificationHistory_ReturnsDate() {
        var userId = Guid.NewGuid();
        var lastModified = DateTime.UtcNow.AddHours(-1);
        _storage.GetUserLastModifiedDateAsync(userId, TestContext.Current.CancellationToken).Returns(lastModified);

        var result = await _service.GetUserLastModifiedDateAsync(userId, TestContext.Current.CancellationToken);

        result.Should().Be(lastModified);
    }

    [Fact]
    public async Task GetUserLastModifiedDateAsync_WithNoModificationHistory_ReturnsNull() {
        var userId = Guid.NewGuid();
        _storage.GetUserLastModifiedDateAsync(userId, TestContext.Current.CancellationToken).Returns((DateTime?)null);

        var result = await _service.GetUserLastModifiedDateAsync(userId, TestContext.Current.CancellationToken);

        result.Should().BeNull();
    }
}
