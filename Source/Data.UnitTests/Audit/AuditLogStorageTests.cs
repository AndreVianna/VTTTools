namespace VttTools.Data.Audit;

public class AuditLogStorageTests
    : IDisposable {
    private readonly AuditLogStorage _storage;
    private readonly ApplicationDbContext _context;
    private readonly CancellationToken _ct;
    private readonly Guid _userId1 = Guid.CreateVersion7();
    private readonly Guid _userId2 = Guid.CreateVersion7();

    public AuditLogStorageTests() {
        _context = DbContextHelper.CreateInMemoryContext(Guid.CreateVersion7());
        _storage = new(_context);
        _ct = TestContext.Current.CancellationToken;
        SeedAuditLogs();
    }

    public void Dispose() {
        DbContextHelper.Dispose(_context);
        GC.SuppressFinalize(this);
    }

    private void SeedAuditLogs() {
        var baseDate = DateTime.UtcNow.AddDays(-30);
        var logs = new[] {
            new Entities.AuditLog {
                Id = Guid.CreateVersion7(),
                Timestamp = baseDate,
                UserId = _userId1,
                UserEmail = "user1@test.com",
                Action = "Login",
                EntityType = "User",
                EntityId = _userId1.ToString(),
                HttpMethod = "POST",
                Path = "/api/auth/login",
                StatusCode = 200,
                IpAddress = "192.168.1.1",
                UserAgent = "Mozilla/5.0",
                DurationInMilliseconds = 150,
                Result = "Success",
            },
            new Entities.AuditLog {
                Id = Guid.CreateVersion7(),
                Timestamp = baseDate.AddDays(1),
                UserId = _userId1,
                UserEmail = "user1@test.com",
                Action = "Create",
                EntityType = "Campaign",
                EntityId = Guid.CreateVersion7().ToString(),
                HttpMethod = "POST",
                Path = "/api/campaigns",
                StatusCode = 201,
                IpAddress = "192.168.1.1",
                UserAgent = "Mozilla/5.0",
                DurationInMilliseconds = 250,
                Result = "Success",
            },
            new Entities.AuditLog {
                Id = Guid.CreateVersion7(),
                Timestamp = baseDate.AddDays(2),
                UserId = _userId2,
                UserEmail = "user2@test.com",
                Action = "Login",
                EntityType = "User",
                EntityId = _userId2.ToString(),
                HttpMethod = "POST",
                Path = "/api/auth/login",
                StatusCode = 200,
                IpAddress = "192.168.1.2",
                UserAgent = "Mozilla/5.0",
                DurationInMilliseconds = 120,
                Result = "Success",
            },
            new Entities.AuditLog {
                Id = Guid.CreateVersion7(),
                Timestamp = baseDate.AddDays(3),
                UserId = null,
                UserEmail = null,
                Action = "HealthCheck",
                EntityType = "System",
                HttpMethod = "GET",
                Path = "/api/health",
                StatusCode = 200,
                IpAddress = "192.168.1.100",
                UserAgent = "HealthCheckBot",
                DurationInMilliseconds = 50,
                Result = "Success",
            },
            new Entities.AuditLog {
                Id = Guid.CreateVersion7(),
                Timestamp = baseDate.AddDays(4),
                UserId = _userId1,
                UserEmail = "user1@test.com",
                Action = "Update",
                EntityType = "Asset",
                EntityId = Guid.CreateVersion7().ToString(),
                HttpMethod = "PUT",
                Path = "/api/assets",
                StatusCode = 400,
                IpAddress = "192.168.1.1",
                UserAgent = "Mozilla/5.0",
                DurationInMilliseconds = 80,
                Result = "Failed",
                ErrorMessage = "Validation error",
            },
        };
        _context.AuditLogs.AddRange(logs);
        _context.SaveChanges();
    }

    [Fact]
    public async Task AddAsync_WithValidAuditLog_AddsToDatabase() {
        var auditLog = new AuditLog {
            Id = Guid.CreateVersion7(),
            Timestamp = DateTime.UtcNow,
            UserId = _userId1,
            UserEmail = "test@test.com",
            Action = "Delete",
            EntityType = "World",
            EntityId = Guid.CreateVersion7().ToString(),
            HttpMethod = "DELETE",
            Path = "/api/worlds",
            StatusCode = 200,
            IpAddress = "192.168.1.1",
            UserAgent = "Mozilla/5.0",
            DurationInMilliseconds = 100,
            Result = "Success",
        };

        await _storage.AddAsync(auditLog, _ct);

        var dbLog = await _context.AuditLogs.FindAsync([auditLog.Id], _ct);
        dbLog.Should().NotBeNull();
        dbLog.Id.Should().Be(auditLog.Id);
        dbLog.Action.Should().Be(auditLog.Action);
        dbLog.EntityType.Should().Be(auditLog.EntityType);
        dbLog.Result.Should().Be(auditLog.Result);
    }

    [Fact]
    public async Task GetByIdAsync_WithExistingId_ReturnsAuditLog() {
        var entity = await _context.AuditLogs.FirstAsync(_ct);

        var result = await _storage.GetByIdAsync(entity.Id, _ct);

        result.Should().NotBeNull();
        result.Id.Should().Be(entity.Id);
        result.Action.Should().Be(entity.Action);
        result.EntityType.Should().Be(entity.EntityType);
        result.UserId.Should().Be(entity.UserId);
    }

    [Fact]
    public async Task GetByIdAsync_WithNonExistingId_ReturnsNull() {
        var nonExistingId = Guid.CreateVersion7();

        var result = await _storage.GetByIdAsync(nonExistingId, _ct);

        result.Should().BeNull();
    }

    [Fact]
    public async Task QueryAsync_WithNoFilters_ReturnsAllLogs() {
        var (items, totalCount) = await _storage.QueryAsync(ct: _ct);

        totalCount.Should().Be(5);
        items.Should().HaveCount(5);
    }

    [Fact]
    public async Task QueryAsync_WithStartDate_ReturnsLogsAfterDate() {
        var startDate = DateTime.UtcNow.AddDays(-25);

        var (items, totalCount) = await _storage.QueryAsync(startDate: startDate, ct: _ct);

        totalCount.Should().BeGreaterThanOrEqualTo(4);
        items.Should().OnlyContain(log => log.Timestamp >= startDate);
    }

    [Fact]
    public async Task QueryAsync_WithEndDate_ReturnsLogsBeforeDate() {
        var endDate = DateTime.UtcNow.AddDays(-27);

        var (items, totalCount) = await _storage.QueryAsync(endDate: endDate, ct: _ct);

        items.Should().OnlyContain(log => log.Timestamp <= endDate);
    }

    [Fact]
    public async Task QueryAsync_WithUserId_ReturnsLogsForUser() {
        var (items, totalCount) = await _storage.QueryAsync(userId: _userId1, ct: _ct);

        totalCount.Should().Be(3);
        items.Should().OnlyContain(log => log.UserId == _userId1);
    }

    [Fact]
    public async Task QueryAsync_WithAction_ReturnsLogsWithAction() {
        var (items, totalCount) = await _storage.QueryAsync(action: "Login", ct: _ct);

        totalCount.Should().Be(2);
        items.Should().OnlyContain(log => log.Action == "Login");
    }

    [Fact]
    public async Task QueryAsync_WithEntityType_ReturnsLogsForEntityType() {
        var (items, totalCount) = await _storage.QueryAsync(entityType: "User", ct: _ct);

        totalCount.Should().Be(2);
        items.Should().OnlyContain(log => log.EntityType == "User");
    }

    [Fact]
    public async Task QueryAsync_WithResult_ReturnsLogsWithResult() {
        var (items, totalCount) = await _storage.QueryAsync(result: "Failed", ct: _ct);

        totalCount.Should().Be(1);
        items.Should().OnlyContain(log => log.Result == "Failed");
    }

    [Fact]
    public async Task QueryAsync_WithPagination_ReturnsPagedResults() {
        var (items, totalCount) = await _storage.QueryAsync(skip: 1, take: 2, ct: _ct);

        totalCount.Should().Be(5);
        items.Should().HaveCount(2);
    }

    [Fact]
    public async Task QueryAsync_OrdersByTimestampDescending() {
        var (items, _) = await _storage.QueryAsync(ct: _ct);

        var timestamps = items.Select(log => log.Timestamp).ToArray();
        timestamps.Should().BeInDescendingOrder();
    }

    [Fact]
    public async Task GetCountAsync_ReturnsCorrectCount() {
        var count = await _storage.GetCountAsync(_ct);

        count.Should().Be(5);
    }

    [Fact]
    public async Task GetDistinctActiveUsersCountAsync_ReturnsCorrectCount() {
        var startDate = DateTime.UtcNow.AddDays(-35);

        var count = await _storage.GetDistinctActiveUsersCountAsync(startDate, _ct);

        count.Should().Be(2);
    }

    [Fact]
    public async Task GetDistinctActiveUsersCountAsync_ExcludesNullUserIds() {
        var startDate = DateTime.UtcNow.AddDays(-35);

        var count = await _storage.GetDistinctActiveUsersCountAsync(startDate, _ct);

        count.Should().Be(2);
    }

    [Fact]
    public async Task GetCountInPeriodAsync_ReturnsCorrectCount() {
        var startDate = DateTime.UtcNow.AddDays(-27);

        var count = await _storage.GetCountInPeriodAsync(startDate, _ct);

        count.Should().BeGreaterThanOrEqualTo(4);
    }

    [Fact]
    public async Task GetAverageResponseTimeAsync_ReturnsCorrectAverage() {
        var startDate = DateTime.UtcNow.AddDays(-35);

        var average = await _storage.GetAverageResponseTimeAsync(startDate, _ct);

        average.Should().BeGreaterThan(0);
        average.Should().Be((150 + 250 + 120 + 50 + 80) / 5.0);
    }

    [Fact]
    public async Task GetAverageResponseTimeAsync_WithNoDuration_ReturnsZero() {
        _context.AuditLogs.RemoveRange(_context.AuditLogs);
        await _context.SaveChangesAsync(_ct);

        var startDate = DateTime.UtcNow.AddDays(-35);

        var average = await _storage.GetAverageResponseTimeAsync(startDate, _ct);

        average.Should().Be(0);
    }

    [Fact]
    public async Task GetHourlyAverageResponseTimesAsync_ReturnsGroupedData() {
        var startDate = DateTime.UtcNow.AddDays(-35);

        var result = await _storage.GetHourlyAverageResponseTimesAsync(startDate, _ct);

        result.Should().NotBeEmpty();
        result.Should().BeInAscendingOrder(dp => dp.Timestamp);
        result.Should().OnlyContain(dp => dp.Value > 0);
    }

    [Fact]
    public async Task GetUserCreatedDateAsync_ReturnsEarliestTimestamp() {
        var result = await _storage.GetUserCreatedDateAsync(_userId1, _ct);

        result.Should().NotBe(DateTime.MinValue);
        var expectedDate = await _context.AuditLogs
            .Where(a => a.UserId == _userId1)
            .MinAsync(a => a.Timestamp, _ct);
        result.Should().Be(expectedDate);
    }

    [Fact]
    public async Task GetUserCreatedDateAsync_WithNoLogs_ReturnsMinValue() {
        var nonExistingUserId = Guid.CreateVersion7();

        var result = await _storage.GetUserCreatedDateAsync(nonExistingUserId, _ct);

        result.Should().Be(DateTime.MinValue);
    }

    [Fact]
    public async Task GetUserLastLoginDateAsync_ReturnsLatestLoginTimestamp() {
        var result = await _storage.GetUserLastLoginDateAsync(_userId1, _ct);

        result.Should().NotBeNull();
        var expectedDate = await _context.AuditLogs
            .Where(a => a.UserId == _userId1 && a.Action == "Login")
            .MaxAsync(a => (DateTime?)a.Timestamp, _ct);
        result.Should().Be(expectedDate);
    }

    [Fact]
    public async Task GetUserLastLoginDateAsync_WithNoLogins_ReturnsNull() {
        var nonExistingUserId = Guid.CreateVersion7();

        var result = await _storage.GetUserLastLoginDateAsync(nonExistingUserId, _ct);

        result.Should().BeNull();
    }

    [Fact]
    public async Task GetUserLastModifiedDateAsync_ReturnsLatestTimestamp() {
        var result = await _storage.GetUserLastModifiedDateAsync(_userId1, _ct);

        result.Should().NotBeNull();
        var expectedDate = await _context.AuditLogs
            .Where(a => a.UserId == _userId1)
            .MaxAsync(a => (DateTime?)a.Timestamp, _ct);
        result.Should().Be(expectedDate);
    }

    [Fact]
    public async Task GetUserLastModifiedDateAsync_WithNoLogs_ReturnsNull() {
        var nonExistingUserId = Guid.CreateVersion7();

        var result = await _storage.GetUserLastModifiedDateAsync(nonExistingUserId, _ct);

        result.Should().BeNull();
    }
}
