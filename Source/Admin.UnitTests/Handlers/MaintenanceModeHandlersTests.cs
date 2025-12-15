namespace VttTools.Admin.UnitTests.Handlers;

public class MaintenanceModeHandlersTests {
    private readonly IMaintenanceModeService _mockService;

    public MaintenanceModeHandlersTests() {
        _mockService = Substitute.For<IMaintenanceModeService>();
    }

    [Fact]
    public async Task GetMaintenanceModeStatusHandler_WithExistingMode_ReturnsStatus() {
        var maintenanceMode = CreateTestMaintenanceMode(isEnabled: true);
        _mockService.GetCurrentAsync(Arg.Any<CancellationToken>())
            .Returns(maintenanceMode);

        var result = await MaintenanceModeHandlers.GetMaintenanceModeStatusHandler(
            _mockService,
            TestContext.Current.CancellationToken);

        var okResult = Assert.IsType<Ok<MaintenanceModeStatusResponse>>(result);
        Assert.NotNull(okResult.Value);
        Assert.Equal(maintenanceMode.Id, okResult.Value.Id);
        Assert.True(okResult.Value.IsEnabled);
        Assert.Equal(maintenanceMode.Message, okResult.Value.Message);
        Assert.Equal(maintenanceMode.EnabledAt, okResult.Value.EnabledAt);
        Assert.Equal(maintenanceMode.EnabledBy, okResult.Value.EnabledBy);
    }

    [Fact]
    public async Task GetMaintenanceModeStatusHandler_WithNoMode_ReturnsDisabledStatus() {
        _mockService.GetCurrentAsync(Arg.Any<CancellationToken>())
            .Returns((MaintenanceMode?)null);

        var result = await MaintenanceModeHandlers.GetMaintenanceModeStatusHandler(
            _mockService,
            TestContext.Current.CancellationToken);

        var okResult = Assert.IsType<Ok<MaintenanceModeStatusResponse>>(result);
        Assert.NotNull(okResult.Value);
        Assert.False(okResult.Value.IsEnabled);
        Assert.Null(okResult.Value.Id);
        Assert.Null(okResult.Value.Message);
    }

    [Fact]
    public async Task EnableMaintenanceModeHandler_WithValidData_ReturnsOk() {
        var userId = Guid.CreateVersion7();
        var request = CreateEnableRequest("System maintenance in progress");
        var maintenanceMode = CreateTestMaintenanceMode(isEnabled: true, message: request.Message);
        var context = CreateHttpContextWithUser(userId);

        _mockService.EnableAsync(
            request.Message,
            request.ScheduledStartTime,
            request.ScheduledEndTime,
            userId,
            Arg.Any<CancellationToken>())
            .Returns(maintenanceMode);

        var result = await MaintenanceModeHandlers.EnableMaintenanceModeHandler(
            request,
            _mockService,
            context.User,
            TestContext.Current.CancellationToken);

        var okResult = Assert.IsType<Ok<MaintenanceModeStatusResponse>>(result);
        Assert.NotNull(okResult.Value);
        Assert.True(okResult.Value.IsEnabled);
        Assert.Equal(request.Message, okResult.Value.Message);
    }

    [Fact]
    public async Task EnableMaintenanceModeHandler_WithInvalidSchedule_ReturnsBadRequest() {
        var userId = Guid.CreateVersion7();
        var request = CreateEnableRequest(
            "System maintenance",
            scheduledStart: DateTime.UtcNow.AddHours(2),
            scheduledEnd: DateTime.UtcNow.AddHours(1));
        var context = CreateHttpContextWithUser(userId);

        var result = await MaintenanceModeHandlers.EnableMaintenanceModeHandler(
            request,
            _mockService,
            context.User,
            TestContext.Current.CancellationToken);

        Assert.IsNotType<Ok<MaintenanceModeStatusResponse>>(result);
        Assert.IsType<IResult>(result, exactMatch: false);
    }

    [Fact]
    public async Task EnableMaintenanceModeHandler_WithMissingUserClaim_ReturnsUnauthorized() {
        var request = CreateEnableRequest("System maintenance");
        var context = CreateHttpContextWithoutUser();

        var result = await MaintenanceModeHandlers.EnableMaintenanceModeHandler(
            request,
            _mockService,
            context.User,
            TestContext.Current.CancellationToken);

        Assert.IsType<UnauthorizedHttpResult>(result);
    }

    [Fact]
    public async Task EnableMaintenanceModeHandler_WithInvalidUserClaim_ReturnsUnauthorized() {
        var request = CreateEnableRequest("System maintenance");
        var context = new DefaultHttpContext();
        var claims = new List<Claim> {
            new(ClaimTypes.NameIdentifier, "invalid-guid")
        };
        var identity = new ClaimsIdentity(claims, "TestAuth");
        context.User = new ClaimsPrincipal(identity);

        var result = await MaintenanceModeHandlers.EnableMaintenanceModeHandler(
            request,
            _mockService,
            context.User,
            TestContext.Current.CancellationToken);

        Assert.IsType<UnauthorizedHttpResult>(result);
    }

    [Fact]
    public async Task EnableMaintenanceModeHandler_WhenAlreadyEnabled_ReturnsBadRequest() {
        var userId = Guid.CreateVersion7();
        var request = CreateEnableRequest("System maintenance");
        var context = CreateHttpContextWithUser(userId);

        _mockService.EnableAsync(
            Arg.Any<string>(),
            Arg.Any<DateTime?>(),
            Arg.Any<DateTime?>(),
            Arg.Any<Guid>(),
            Arg.Any<CancellationToken>())
            .Throws(new InvalidOperationException("Maintenance mode is already enabled"));

        var result = await MaintenanceModeHandlers.EnableMaintenanceModeHandler(
            request,
            _mockService,
            context.User,
            TestContext.Current.CancellationToken);

        Assert.IsNotType<Ok<MaintenanceModeStatusResponse>>(result);
        Assert.IsType<IResult>(result, exactMatch: false);
    }

    [Fact]
    public async Task DisableMaintenanceModeHandler_WithActiveMode_ReturnsOk() {
        var userId = Guid.CreateVersion7();
        var maintenanceMode = CreateTestMaintenanceMode(
            isEnabled: false,
            disabledAt: DateTime.UtcNow,
            disabledBy: userId);
        var context = CreateHttpContextWithUser(userId);

        _mockService.DisableAsync(userId, Arg.Any<CancellationToken>())
            .Returns(maintenanceMode);

        var result = await MaintenanceModeHandlers.DisableMaintenanceModeHandler(
            _mockService,
            context.User,
            TestContext.Current.CancellationToken);

        var okResult = Assert.IsType<Ok<MaintenanceModeStatusResponse>>(result);
        Assert.NotNull(okResult.Value);
        Assert.False(okResult.Value.IsEnabled);
        Assert.Equal(maintenanceMode.DisabledAt, okResult.Value.DisabledAt);
        Assert.Equal(maintenanceMode.DisabledBy, okResult.Value.DisabledBy);
    }

    [Fact]
    public async Task DisableMaintenanceModeHandler_WithMissingUserClaim_ReturnsUnauthorized() {
        var context = CreateHttpContextWithoutUser();

        var result = await MaintenanceModeHandlers.DisableMaintenanceModeHandler(
            _mockService,
            context.User,
            TestContext.Current.CancellationToken);

        Assert.IsType<UnauthorizedHttpResult>(result);
    }

    [Fact]
    public async Task DisableMaintenanceModeHandler_WithNoActiveMode_ReturnsBadRequest() {
        var userId = Guid.CreateVersion7();
        var context = CreateHttpContextWithUser(userId);

        _mockService.DisableAsync(userId, Arg.Any<CancellationToken>())
            .Throws(new InvalidOperationException("No active maintenance mode to disable"));

        var result = await MaintenanceModeHandlers.DisableMaintenanceModeHandler(
            _mockService,
            context.User,
            TestContext.Current.CancellationToken);

        Assert.IsNotType<Ok<MaintenanceModeStatusResponse>>(result);
        Assert.IsType<IResult>(result, exactMatch: false);
    }

    [Fact]
    public async Task UpdateMaintenanceModeHandler_WithValidData_ReturnsOk() {
        var id = Guid.CreateVersion7();
        var request = CreateUpdateRequest("Updated maintenance message");
        var maintenanceMode = CreateTestMaintenanceMode(isEnabled: true, message: request.Message);
        var context = new DefaultHttpContext();

        _mockService.UpdateAsync(
            id,
            request.Message,
            request.ScheduledStartTime,
            request.ScheduledEndTime,
            Arg.Any<CancellationToken>())
            .Returns(maintenanceMode);

        var result = await MaintenanceModeHandlers.UpdateMaintenanceModeHandler(
            id,
            request,
            _mockService,
            TestContext.Current.CancellationToken);

        var okResult = Assert.IsType<Ok<MaintenanceModeStatusResponse>>(result);
        Assert.NotNull(okResult.Value);
        Assert.Equal(request.Message, okResult.Value.Message);
    }

    [Fact]
    public async Task UpdateMaintenanceModeHandler_WithInvalidSchedule_ReturnsBadRequest() {
        var id = Guid.CreateVersion7();
        var request = CreateUpdateRequest(
            "Updated message",
            scheduledStart: DateTime.UtcNow.AddHours(2),
            scheduledEnd: DateTime.UtcNow.AddHours(1));
        var context = new DefaultHttpContext();

        var result = await MaintenanceModeHandlers.UpdateMaintenanceModeHandler(
            id,
            request,
            _mockService,
            TestContext.Current.CancellationToken);

        Assert.IsNotType<Ok<MaintenanceModeStatusResponse>>(result);
        Assert.IsType<IResult>(result, exactMatch: false);
    }

    [Fact]
    public async Task UpdateMaintenanceModeHandler_WhenNotFound_ReturnsNotFound() {
        var id = Guid.CreateVersion7();
        var request = CreateUpdateRequest("Updated maintenance message");
        var context = new DefaultHttpContext();

        _mockService.UpdateAsync(
            id,
            Arg.Any<string>(),
            Arg.Any<DateTime?>(),
            Arg.Any<DateTime?>(),
            Arg.Any<CancellationToken>())
            .Throws(new InvalidOperationException("Maintenance mode not found"));

        var result = await MaintenanceModeHandlers.UpdateMaintenanceModeHandler(
            id,
            request,
            _mockService,
            TestContext.Current.CancellationToken);

        Assert.IsNotType<Ok<MaintenanceModeStatusResponse>>(result);
        Assert.IsType<IResult>(result, exactMatch: false);
    }

    [Fact]
    public async Task EnableMaintenanceModeHandler_WithScheduledTimes_ReturnsOk() {
        var userId = Guid.CreateVersion7();
        var startTime = DateTime.UtcNow.AddHours(1);
        var endTime = DateTime.UtcNow.AddHours(3);
        var request = CreateEnableRequest(
            "Scheduled maintenance",
            scheduledStart: startTime,
            scheduledEnd: endTime);
        var maintenanceMode = CreateTestMaintenanceMode(
            isEnabled: true,
            message: request.Message,
            scheduledStart: startTime,
            scheduledEnd: endTime);
        var context = CreateHttpContextWithUser(userId);

        _mockService.EnableAsync(
            request.Message,
            request.ScheduledStartTime,
            request.ScheduledEndTime,
            userId,
            Arg.Any<CancellationToken>())
            .Returns(maintenanceMode);

        var result = await MaintenanceModeHandlers.EnableMaintenanceModeHandler(
            request,
            _mockService,
            context.User,
            TestContext.Current.CancellationToken);

        var okResult = Assert.IsType<Ok<MaintenanceModeStatusResponse>>(result);
        Assert.NotNull(okResult.Value);
        Assert.Equal(startTime, okResult.Value.ScheduledStartTime);
        Assert.Equal(endTime, okResult.Value.ScheduledEndTime);
    }

    [Fact]
    public async Task UpdateMaintenanceModeHandler_WithScheduledTimes_ReturnsOk() {
        var id = Guid.CreateVersion7();
        var startTime = DateTime.UtcNow.AddHours(2);
        var endTime = DateTime.UtcNow.AddHours(4);
        var request = CreateUpdateRequest(
            "Updated scheduled maintenance",
            scheduledStart: startTime,
            scheduledEnd: endTime);
        var maintenanceMode = CreateTestMaintenanceMode(
            isEnabled: true,
            message: request.Message,
            scheduledStart: startTime,
            scheduledEnd: endTime);
        var context = new DefaultHttpContext();

        _mockService.UpdateAsync(
            id,
            request.Message,
            request.ScheduledStartTime,
            request.ScheduledEndTime,
            Arg.Any<CancellationToken>())
            .Returns(maintenanceMode);

        var result = await MaintenanceModeHandlers.UpdateMaintenanceModeHandler(
            id,
            request,
            _mockService,
            TestContext.Current.CancellationToken);

        var okResult = Assert.IsType<Ok<MaintenanceModeStatusResponse>>(result);
        Assert.NotNull(okResult.Value);
        Assert.Equal(startTime, okResult.Value.ScheduledStartTime);
        Assert.Equal(endTime, okResult.Value.ScheduledEndTime);
    }

    private static MaintenanceMode CreateTestMaintenanceMode(
        bool isEnabled,
        string message = "System under maintenance",
        DateTime? scheduledStart = null,
        DateTime? scheduledEnd = null,
        DateTime? disabledAt = null,
        Guid? disabledBy = null) => new() {
            Id = Guid.CreateVersion7(),
            IsEnabled = isEnabled,
            Message = message,
            ScheduledStartTime = scheduledStart,
            ScheduledEndTime = scheduledEnd,
            EnabledAt = isEnabled ? DateTime.UtcNow : null,
            EnabledBy = isEnabled ? Guid.CreateVersion7() : null,
            DisabledAt = disabledAt,
            DisabledBy = disabledBy
        };

    private static DefaultHttpContext CreateHttpContextWithUser(Guid userId) {
        var context = new DefaultHttpContext();
        var claims = new List<Claim> {
            new(ClaimTypes.NameIdentifier, userId.ToString())
        };
        var identity = new ClaimsIdentity(claims, "TestAuth");
        context.User = new ClaimsPrincipal(identity);
        return context;
    }

    private static DefaultHttpContext CreateHttpContextWithoutUser() => new();

    private static EnableMaintenanceModeRequest CreateEnableRequest(
        string message = "Test maintenance",
        DateTime? scheduledStart = null,
        DateTime? scheduledEnd = null) => new() {
            Message = message,
            ScheduledStartTime = scheduledStart,
            ScheduledEndTime = scheduledEnd
        };

    private static UpdateMaintenanceModeRequest CreateUpdateRequest(
        string message = "Test maintenance update",
        DateTime? scheduledStart = null,
        DateTime? scheduledEnd = null) => new() {
            Message = message,
            ScheduledStartTime = scheduledStart,
            ScheduledEndTime = scheduledEnd
        };
}