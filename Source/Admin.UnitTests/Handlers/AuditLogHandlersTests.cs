namespace VttTools.Admin.Handlers;

public class AuditLogHandlersTests {
    private readonly IAuditLogService _mockService = Substitute.For<IAuditLogService>();

    [Fact]
    public async Task QueryAuditLogsHandler_WithValidRequest_ReturnsOkWithPaginatedResults() {
        var request = new AuditLogQueryRequest {
            StartDate = DateTime.UtcNow.AddDays(-7),
            EndDate = DateTime.UtcNow,
            UserId = Guid.CreateVersion7(),
            Action = "User.Login",
            EntityType = "User",
            Skip = 0,
            Take = 50
        };

        var logs = new[] {
            CreateTestAuditLog("User.Login"),
            CreateTestAuditLog("User.Login")
        };

        _mockService.QueryAsync(
            request.StartDate,
            request.EndDate,
            request.UserId,
            request.Action,
            request.EntityType,
            request.Skip,
            request.Take,
            Arg.Any<CancellationToken>())
            .Returns((logs.AsEnumerable(), 100));

        var result = await AuditLogHandlers.QueryAuditLogsHandler(
            request,
            _mockService,
            TestContext.Current.CancellationToken);

        var okResult = Assert.IsType<Ok<AuditLogQueryResponse>>(result);
        Assert.Equal(2, okResult.Value!.Items.Count());
        Assert.Equal(100, okResult.Value!.TotalCount);
    }

    [Fact]
    public async Task QueryAuditLogsHandler_WithTakeGreaterThan100_ReturnsBadRequest() {
        var request = new AuditLogQueryRequest {
            Skip = 0,
            Take = 101
        };

        var result = await AuditLogHandlers.QueryAuditLogsHandler(
            request,
            _mockService,
            TestContext.Current.CancellationToken);

        Assert.IsNotType<Ok<AuditLogQueryResponse>>(result);
        Assert.IsType<IResult>(result, exactMatch: false);
    }

    [Fact]
    public async Task QueryAuditLogsHandler_WithNegativeSkip_ReturnsBadRequest() {
        var request = new AuditLogQueryRequest {
            Skip = -1,
            Take = 50
        };

        var result = await AuditLogHandlers.QueryAuditLogsHandler(
            request,
            _mockService,
            TestContext.Current.CancellationToken);

        Assert.IsNotType<Ok<AuditLogQueryResponse>>(result);
        Assert.IsType<IResult>(result, exactMatch: false);
    }

    [Fact]
    public async Task QueryAuditLogsHandler_WithZeroTake_ReturnsBadRequest() {
        var request = new AuditLogQueryRequest {
            Skip = 0,
            Take = 0
        };

        var result = await AuditLogHandlers.QueryAuditLogsHandler(
            request,
            _mockService,
            TestContext.Current.CancellationToken);

        Assert.IsNotType<Ok<AuditLogQueryResponse>>(result);
        Assert.IsType<IResult>(result, exactMatch: false);
    }

    [Fact]
    public async Task QueryAuditLogsHandler_WithDefaultPagination_ReturnsResults() {
        var request = new AuditLogQueryRequest();
        var logs = new[] { CreateTestAuditLog("User.Login") };

        _mockService.QueryAsync(
            null,
            null,
            null,
            null,
            null,
            0,
            50,
            Arg.Any<CancellationToken>())
            .Returns((logs, 1));

        var result = await AuditLogHandlers.QueryAuditLogsHandler(
            request,
            _mockService,
            TestContext.Current.CancellationToken);

        var okResult = Assert.IsType<Ok<AuditLogQueryResponse>>(result);
        Assert.Single(okResult.Value!.Items);
        Assert.Equal(1, okResult.Value!.TotalCount);
    }

    [Fact]
    public async Task GetAuditLogByIdHandler_WhenAuditLogExists_ReturnsOk() {
        var auditLog = CreateTestAuditLog("User.Login");
        _mockService.GetByIdAsync(auditLog.Id, Arg.Any<CancellationToken>())
            .Returns(auditLog);

        var result = await AuditLogHandlers.GetAuditLogByIdHandler(
            auditLog.Id,
            _mockService,
            TestContext.Current.CancellationToken);

        var okResult = Assert.IsType<Ok<AuditLog>>(result);
        Assert.Equal(auditLog.Id, okResult.Value!.Id);
        Assert.Equal(auditLog.Action, okResult.Value!.Action);
    }

    [Fact]
    public async Task GetAuditLogByIdHandler_WhenAuditLogNotFound_ReturnsNotFound() {
        var id = Guid.CreateVersion7();
        _mockService.GetByIdAsync(id, Arg.Any<CancellationToken>())
            .Returns((AuditLog?)null);

        var result = await AuditLogHandlers.GetAuditLogByIdHandler(
            id,
            _mockService,
            TestContext.Current.CancellationToken);

        Assert.IsType<NotFound>(result);
    }

    [Fact]
    public async Task GetAuditLogCountHandler_ReturnsOkWithCount() {
        const int expectedCount = 42;
        _mockService.GetTotalCountAsync(Arg.Any<CancellationToken>())
            .Returns(expectedCount);

        var result = await AuditLogHandlers.GetAuditLogCountHandler(
            _mockService,
            TestContext.Current.CancellationToken);

        var okResult = Assert.IsType<Ok<AuditLogCountResponse>>(result);
        Assert.Equal(expectedCount, okResult.Value!.Count);
    }

    [Fact]
    public async Task GetAuditLogCountHandler_WhenNoLogs_ReturnsZeroCount() {
        _mockService.GetTotalCountAsync(Arg.Any<CancellationToken>())
            .Returns(0);

        var result = await AuditLogHandlers.GetAuditLogCountHandler(
            _mockService,
            TestContext.Current.CancellationToken);

        var okResult = Assert.IsType<Ok<AuditLogCountResponse>>(result);
        Assert.Equal(0, okResult.Value!.Count);
    }

    private static AuditLog CreateTestAuditLog(string action) => new() {
        Id = Guid.CreateVersion7(),
        Timestamp = DateTime.UtcNow,
        UserId = Guid.CreateVersion7(),
        UserEmail = "test@example.com",
        Action = action,
        EntityType = "User",
        EntityId = Guid.CreateVersion7().ToString()
    };
}