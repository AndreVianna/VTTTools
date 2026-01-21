using VttTools.Audit.Model.Payloads;

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

    private static string CreateHttpPayload(string httpMethod, string path, int statusCode, string result, int durationMs, string? ipAddress = null) {
        var payload = new HttpAuditPayload {
            HttpMethod = httpMethod,
            Path = path,
            StatusCode = statusCode,
            Result = result,
            DurationMs = durationMs,
            IpAddress = ipAddress,
            UserAgent = "Mozilla/5.0",
        };
        return JsonSerializer.Serialize(payload, JsonDefaults.Options);
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
                Payload = CreateHttpPayload("POST", "/api/auth/login", 200, "Success", 150, "192.168.1.1"),
            },
            new Entities.AuditLog {
                Id = Guid.CreateVersion7(),
                Timestamp = baseDate.AddDays(1),
                UserId = _userId1,
                UserEmail = "user1@test.com",
                Action = "Campaign:Created:ByUser",
                EntityType = "Campaign",
                EntityId = Guid.CreateVersion7().ToString(),
                Payload = CreateHttpPayload("POST", "/api/campaigns", 201, "Success", 250, "192.168.1.1"),
            },
            new Entities.AuditLog {
                Id = Guid.CreateVersion7(),
                Timestamp = baseDate.AddDays(2),
                UserId = _userId2,
                UserEmail = "user2@test.com",
                Action = "Login",
                EntityType = "User",
                EntityId = _userId2.ToString(),
                Payload = CreateHttpPayload("POST", "/api/auth/login", 200, "Success", 120, "192.168.1.2"),
            },
            new Entities.AuditLog {
                Id = Guid.CreateVersion7(),
                Timestamp = baseDate.AddDays(3),
                UserId = null,
                UserEmail = null,
                Action = "System:HealthCheck",
                EntityType = "System",
                Payload = CreateHttpPayload("GET", "/api/health", 200, "Success", 50, "192.168.1.100"),
            },
            new Entities.AuditLog {
                Id = Guid.CreateVersion7(),
                Timestamp = baseDate.AddDays(4),
                UserId = _userId1,
                UserEmail = "user1@test.com",
                Action = "Asset:Updated:ByUser",
                EntityType = "Asset",
                EntityId = Guid.CreateVersion7().ToString(),
                Payload = CreateHttpPayload("PUT", "/api/assets", 400, "Failure", 80, "192.168.1.1"),
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
            Action = "World:Deleted:ByUser",
            EntityType = "World",
            EntityId = Guid.CreateVersion7().ToString(),
            Payload = CreateHttpPayload("DELETE", "/api/worlds", 200, "Success", 100, "192.168.1.1"),
        };

        await _storage.AddAsync(auditLog, _ct);

        var dbLog = await _context.AuditLogs.FindAsync([auditLog.Id], _ct);
        dbLog.Should().NotBeNull();
        dbLog.Id.Should().Be(auditLog.Id);
        dbLog.Action.Should().Be(auditLog.Action);
        dbLog.EntityType.Should().Be(auditLog.EntityType);
        dbLog.Payload.Should().NotBeNullOrEmpty();
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
        (var items, var totalCount) = await _storage.QueryAsync(ct: _ct);

        totalCount.Should().Be(5);
        items.Should().HaveCount(5);
    }

    [Fact]
    public async Task QueryAsync_WithStartDate_ReturnsLogsAfterDate() {
        // Seeded logs: baseDate (-30 days), +1, +2, +3, +4 = -30, -29, -28, -27, -26 days ago
        // Using -31 days to capture all 5 logs (avoids race condition with time component)
        _context.ChangeTracker.Clear();
        var startDate = DateTime.UtcNow.AddDays(-31);

        (var items, var totalCount) = await _storage.QueryAsync(startDate: startDate, ct: _ct);

        totalCount.Should().Be(5);
        items.Should().OnlyContain(log => log.Timestamp >= startDate);
    }

    [Fact]
    public async Task QueryAsync_WithEndDate_ReturnsLogsBeforeDate() {
        var endDate = DateTime.UtcNow.AddDays(-27);

        (var items, var totalCount) = await _storage.QueryAsync(endDate: endDate, ct: _ct);

        items.Should().OnlyContain(log => log.Timestamp <= endDate);
    }

    [Fact]
    public async Task QueryAsync_WithUserId_ReturnsLogsForUser() {
        (var items, var totalCount) = await _storage.QueryAsync(userId: _userId1, ct: _ct);

        totalCount.Should().Be(3);
        items.Should().OnlyContain(log => log.UserId == _userId1);
    }

    [Fact]
    public async Task QueryAsync_WithAction_ReturnsLogsWithAction() {
        (var items, var totalCount) = await _storage.QueryAsync(action: "Login", ct: _ct);

        totalCount.Should().Be(2);
        items.Should().OnlyContain(log => log.Action == "Login");
    }

    [Fact]
    public async Task QueryAsync_WithEntityType_ReturnsLogsForEntityType() {
        (var items, var totalCount) = await _storage.QueryAsync(entityType: "User", ct: _ct);

        totalCount.Should().Be(2);
        items.Should().OnlyContain(log => log.EntityType == "User");
    }

    [Fact]
    public async Task QueryAsync_WithPagination_ReturnsPagedResults() {
        (var items, var totalCount) = await _storage.QueryAsync(skip: 1, take: 2, ct: _ct);

        totalCount.Should().Be(5);
        items.Should().HaveCount(2);
    }

    [Fact]
    public async Task QueryAsync_OrdersByTimestampDescending() {
        (var items, _) = await _storage.QueryAsync(ct: _ct);

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
        // Seeded logs: baseDate (-30 days), +1, +2, +3, +4 = -30, -29, -28, -27, -26 days ago
        // Using -31 days to capture all 5 logs (avoids race condition with time component)
        _context.ChangeTracker.Clear();
        var startDate = DateTime.UtcNow.AddDays(-31);

        var count = await _storage.GetCountInPeriodAsync(startDate, _ct);

        count.Should().Be(5);
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

    [Fact]
    public async Task AddAsync_WithJobPayload_StoresPayloadCorrectly() {
        var jobPayload = new JobCreatedPayload {
            Type = "BulkAssetGeneration",
            TotalItems = 5,
            EstimatedDuration = "00:00:07.5",
        };
        var auditLog = new AuditLog {
            Id = Guid.CreateVersion7(),
            Timestamp = DateTime.UtcNow,
            UserId = _userId1,
            UserEmail = "test@test.com",
            Action = "Job:Created",
            EntityType = "Job",
            EntityId = Guid.CreateVersion7().ToString(),
            Payload = JsonSerializer.Serialize(jobPayload, JsonDefaults.Options),
        };

        await _storage.AddAsync(auditLog, _ct);

        var dbLog = await _context.AuditLogs.FindAsync([auditLog.Id], _ct);
        dbLog.Should().NotBeNull();
        dbLog.Payload.Should().Contain("BulkAssetGeneration");
        dbLog.Payload.Should().Contain("5");
    }

    [Fact]
    public async Task AddAsync_WithAssetGeneratedPayload_StoresPayloadCorrectly() {
        var assetPayload = new AssetGeneratedPayload {
            JobId = Guid.CreateVersion7().ToString(),
            JobItemIndex = 0,
            PortraitResourceId = Guid.CreateVersion7().ToString(),
            TokenResourceId = Guid.CreateVersion7().ToString(),
        };
        var auditLog = new AuditLog {
            Id = Guid.CreateVersion7(),
            Timestamp = DateTime.UtcNow,
            UserId = _userId1,
            UserEmail = "test@test.com",
            Action = "Asset:Generated:ViaJob",
            EntityType = "Asset",
            EntityId = Guid.CreateVersion7().ToString(),
            Payload = JsonSerializer.Serialize(assetPayload, JsonDefaults.Options),
        };

        await _storage.AddAsync(auditLog, _ct);

        var dbLog = await _context.AuditLogs.FindAsync([auditLog.Id], _ct);
        dbLog.Should().NotBeNull();
        dbLog.Payload.Should().Contain("jobId");
        dbLog.Payload.Should().Contain("portraitResourceId");
    }
}