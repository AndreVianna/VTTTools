namespace VttTools.Admin.UnitTests.Services;

public class MaintenanceModeServiceTests {
    private readonly IMaintenanceModeStorage _mockStorage;
    private readonly ILogger<MaintenanceModeService> _mockLogger;
    private readonly IMaintenanceModeService _sut;

    public MaintenanceModeServiceTests() {
        _mockStorage = Substitute.For<IMaintenanceModeStorage>();
        _mockLogger = Substitute.For<ILogger<MaintenanceModeService>>();
        _sut = new MaintenanceModeService(_mockStorage, _mockLogger);
    }

    #region GetCurrentAsync Tests

    [Fact]
    public async Task GetCurrentAsync_WhenMaintenanceModeExists_ReturnsMaintenanceMode() {
        var expectedMode = CreateTestMaintenanceMode(isEnabled: true);
        _mockStorage.GetCurrentAsync(Arg.Any<CancellationToken>())
            .Returns(expectedMode);

        var result = await _sut.GetCurrentAsync(TestContext.Current.CancellationToken);

        Assert.NotNull(result);
        Assert.Equal(expectedMode.Id, result.Id);
        Assert.Equal(expectedMode.Message, result.Message);
        Assert.True(result.IsEnabled);
        await _mockStorage.Received(1).GetCurrentAsync(Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task GetCurrentAsync_WhenNoMaintenanceMode_ReturnsNull() {
        _mockStorage.GetCurrentAsync(Arg.Any<CancellationToken>())
            .Returns((MaintenanceMode?)null);

        var result = await _sut.GetCurrentAsync(TestContext.Current.CancellationToken);

        Assert.Null(result);
        await _mockStorage.Received(1).GetCurrentAsync(Arg.Any<CancellationToken>());
    }

    #endregion

    #region EnableAsync Tests

    [Fact]
    public async Task EnableAsync_WithValidData_EnablesSuccessfully() {
        var enabledBy = Guid.CreateVersion7();
        const string message = "System maintenance in progress";
        var scheduledStart = DateTime.UtcNow.AddHours(1);
        var scheduledEnd = DateTime.UtcNow.AddHours(3);

        _mockStorage.GetCurrentAsync(Arg.Any<CancellationToken>())
            .Returns((MaintenanceMode?)null);
        _mockStorage.SaveAsync(Arg.Any<MaintenanceMode>(), Arg.Any<CancellationToken>())
            .Returns(args => args.Arg<MaintenanceMode>());

        var result = await _sut.EnableAsync(message, scheduledStart, scheduledEnd, enabledBy, TestContext.Current.CancellationToken);

        Assert.NotNull(result);
        Assert.True(result.IsEnabled);
        Assert.Equal(message, result.Message);
        Assert.Equal(scheduledStart, result.ScheduledStartTime);
        Assert.Equal(scheduledEnd, result.ScheduledEndTime);
        Assert.Equal(enabledBy, result.EnabledBy);
        Assert.NotNull(result.EnabledAt);
        await _mockStorage.Received(1).SaveAsync(Arg.Any<MaintenanceMode>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task EnableAsync_WithNullSchedule_EnablesImmediately() {
        var enabledBy = Guid.CreateVersion7();
        const string message = "Emergency maintenance";

        _mockStorage.GetCurrentAsync(Arg.Any<CancellationToken>())
            .Returns((MaintenanceMode?)null);
        _mockStorage.SaveAsync(Arg.Any<MaintenanceMode>(), Arg.Any<CancellationToken>())
            .Returns(args => args.Arg<MaintenanceMode>());

        var result = await _sut.EnableAsync(message, null, null, enabledBy, TestContext.Current.CancellationToken);

        Assert.NotNull(result);
        Assert.True(result.IsEnabled);
        Assert.Null(result.ScheduledStartTime);
        Assert.Null(result.ScheduledEndTime);
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public async Task EnableAsync_WithEmptyMessage_ThrowsArgumentException(string? invalidMessage) {
        var enabledBy = Guid.CreateVersion7();

        var exception = await Assert.ThrowsAsync<ArgumentException>(
            async () => await _sut.EnableAsync(invalidMessage!, null, null, enabledBy, TestContext.Current.CancellationToken));

        Assert.Equal("message", exception.ParamName);
        Assert.Contains("Message is required", exception.Message);
        await _mockStorage.DidNotReceive().SaveAsync(Arg.Any<MaintenanceMode>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task EnableAsync_WithMessageExceeding2000Chars_ThrowsArgumentException() {
        var enabledBy = Guid.CreateVersion7();
        var longMessage = new string('a', 2001);

        var exception = await Assert.ThrowsAsync<ArgumentException>(
            async () => await _sut.EnableAsync(longMessage, null, null, enabledBy, TestContext.Current.CancellationToken));

        Assert.Equal("message", exception.ParamName);
        Assert.Contains("must not exceed 2000 characters", exception.Message);
        await _mockStorage.DidNotReceive().SaveAsync(Arg.Any<MaintenanceMode>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task EnableAsync_WithEndBeforeStart_ThrowsArgumentException() {
        var enabledBy = Guid.CreateVersion7();
        const string message = "Maintenance";
        var scheduledStart = DateTime.UtcNow.AddHours(3);
        var scheduledEnd = DateTime.UtcNow.AddHours(1);

        var exception = await Assert.ThrowsAsync<ArgumentException>(
            async () => await _sut.EnableAsync(message, scheduledStart, scheduledEnd, enabledBy, TestContext.Current.CancellationToken));

        Assert.Equal("scheduledEnd", exception.ParamName);
        Assert.Contains("must be after", exception.Message);
        await _mockStorage.DidNotReceive().SaveAsync(Arg.Any<MaintenanceMode>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task EnableAsync_WhenAlreadyEnabled_ThrowsInvalidOperationException() {
        var enabledBy = Guid.CreateVersion7();
        const string message = "Maintenance";
        var existingMode = CreateTestMaintenanceMode(isEnabled: true);

        _mockStorage.GetCurrentAsync(Arg.Any<CancellationToken>())
            .Returns(existingMode);

        var exception = await Assert.ThrowsAsync<InvalidOperationException>(
            async () => await _sut.EnableAsync(message, null, null, enabledBy, TestContext.Current.CancellationToken));

        Assert.Contains("already enabled", exception.Message);
        await _mockStorage.DidNotReceive().SaveAsync(Arg.Any<MaintenanceMode>(), Arg.Any<CancellationToken>());
    }

    #endregion

    #region DisableAsync Tests

    [Fact]
    public async Task DisableAsync_WhenMaintenanceModeActive_DisablesSuccessfully() {
        var disabledBy = Guid.CreateVersion7();
        var activeMode = CreateTestMaintenanceMode(isEnabled: true);

        _mockStorage.GetCurrentAsync(Arg.Any<CancellationToken>())
            .Returns(activeMode);
        _mockStorage.SaveAsync(Arg.Any<MaintenanceMode>(), Arg.Any<CancellationToken>())
            .Returns(args => args.Arg<MaintenanceMode>());

        var result = await _sut.DisableAsync(disabledBy, TestContext.Current.CancellationToken);

        Assert.NotNull(result);
        Assert.False(result.IsEnabled);
        Assert.Equal(disabledBy, result.DisabledBy);
        Assert.NotNull(result.DisabledAt);
        await _mockStorage.Received(1).SaveAsync(
            Arg.Is<MaintenanceMode>(m => !m.IsEnabled && m.DisabledBy == disabledBy),
            Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task DisableAsync_WhenNoMaintenanceMode_ThrowsInvalidOperationException() {
        var disabledBy = Guid.CreateVersion7();

        _mockStorage.GetCurrentAsync(Arg.Any<CancellationToken>())
            .Returns((MaintenanceMode?)null);

        var exception = await Assert.ThrowsAsync<InvalidOperationException>(
            async () => await _sut.DisableAsync(disabledBy, TestContext.Current.CancellationToken));

        Assert.Contains("No active maintenance mode", exception.Message);
        await _mockStorage.DidNotReceive().SaveAsync(Arg.Any<MaintenanceMode>(), Arg.Any<CancellationToken>());
    }

    #endregion

    #region UpdateAsync Tests

    [Fact]
    public async Task UpdateAsync_WithValidData_UpdatesSuccessfully() {
        var id = Guid.CreateVersion7();
        const string newMessage = "Updated maintenance message";
        var newStart = DateTime.UtcNow.AddHours(2);
        var newEnd = DateTime.UtcNow.AddHours(4);
        var existingMode = CreateTestMaintenanceMode(isEnabled: true) with { Id = id };

        _mockStorage.GetByIdAsync(id, Arg.Any<CancellationToken>())
            .Returns(existingMode);
        _mockStorage.SaveAsync(Arg.Any<MaintenanceMode>(), Arg.Any<CancellationToken>())
            .Returns(args => args.Arg<MaintenanceMode>());

        var result = await _sut.UpdateAsync(id, newMessage, newStart, newEnd, TestContext.Current.CancellationToken);

        Assert.NotNull(result);
        Assert.Equal(newMessage, result.Message);
        Assert.Equal(newStart, result.ScheduledStartTime);
        Assert.Equal(newEnd, result.ScheduledEndTime);
        await _mockStorage.Received(1).SaveAsync(
            Arg.Is<MaintenanceMode>(m => m.Message == newMessage),
            Arg.Any<CancellationToken>());
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public async Task UpdateAsync_WithEmptyMessage_ThrowsArgumentException(string? invalidMessage) {
        var id = Guid.CreateVersion7();

        var exception = await Assert.ThrowsAsync<ArgumentException>(
            async () => await _sut.UpdateAsync(id, invalidMessage!, null, null, TestContext.Current.CancellationToken));

        Assert.Equal("message", exception.ParamName);
        Assert.Contains("Message is required", exception.Message);
        await _mockStorage.DidNotReceive().SaveAsync(Arg.Any<MaintenanceMode>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task UpdateAsync_WithMessageExceeding2000Chars_ThrowsArgumentException() {
        var id = Guid.CreateVersion7();
        var longMessage = new string('a', 2001);

        var exception = await Assert.ThrowsAsync<ArgumentException>(
            async () => await _sut.UpdateAsync(id, longMessage, null, null, TestContext.Current.CancellationToken));

        Assert.Equal("message", exception.ParamName);
        Assert.Contains("must not exceed 2000 characters", exception.Message);
    }

    [Fact]
    public async Task UpdateAsync_WithEndBeforeStart_ThrowsArgumentException() {
        var id = Guid.CreateVersion7();
        const string message = "Maintenance";
        var scheduledStart = DateTime.UtcNow.AddHours(3);
        var scheduledEnd = DateTime.UtcNow.AddHours(1);

        var exception = await Assert.ThrowsAsync<ArgumentException>(
            async () => await _sut.UpdateAsync(id, message, scheduledStart, scheduledEnd, TestContext.Current.CancellationToken));

        Assert.Equal("scheduledEnd", exception.ParamName);
        Assert.Contains("must be after", exception.Message);
    }

    [Fact]
    public async Task UpdateAsync_WhenNotFound_ThrowsInvalidOperationException() {
        var id = Guid.CreateVersion7();
        const string message = "Maintenance";

        _mockStorage.GetByIdAsync(id, Arg.Any<CancellationToken>())
            .Returns((MaintenanceMode?)null);

        var exception = await Assert.ThrowsAsync<InvalidOperationException>(
            async () => await _sut.UpdateAsync(id, message, null, null, TestContext.Current.CancellationToken));

        Assert.Contains("not found", exception.Message);
        await _mockStorage.DidNotReceive().SaveAsync(Arg.Any<MaintenanceMode>(), Arg.Any<CancellationToken>());
    }

    #endregion

    #region IsMaintenanceModeActiveAsync Tests

    [Fact]
    public async Task IsMaintenanceModeActiveAsync_WhenEnabled_ReturnsTrue() {
        var activeMode = CreateTestMaintenanceMode(isEnabled: true);
        _mockStorage.GetCurrentAsync(Arg.Any<CancellationToken>())
            .Returns(activeMode);

        var result = await _sut.IsMaintenanceModeActiveAsync(TestContext.Current.CancellationToken);

        Assert.True(result);
    }

    [Fact]
    public async Task IsMaintenanceModeActiveAsync_WhenDisabled_ReturnsFalse() {
        var inactiveMode = CreateTestMaintenanceMode(isEnabled: false);
        _mockStorage.GetCurrentAsync(Arg.Any<CancellationToken>())
            .Returns(inactiveMode);

        var result = await _sut.IsMaintenanceModeActiveAsync(TestContext.Current.CancellationToken);

        Assert.False(result);
    }

    [Fact]
    public async Task IsMaintenanceModeActiveAsync_WhenNoMaintenanceMode_ReturnsFalse() {
        _mockStorage.GetCurrentAsync(Arg.Any<CancellationToken>())
            .Returns((MaintenanceMode?)null);

        var result = await _sut.IsMaintenanceModeActiveAsync(TestContext.Current.CancellationToken);

        Assert.False(result);
    }

    [Fact]
    public async Task IsMaintenanceModeActiveAsync_WhenScheduledInFuture_ReturnsFalse() {
        var futureMode = CreateTestMaintenanceMode(isEnabled: true) with {
            ScheduledStartTime = DateTime.UtcNow.AddHours(1),
            ScheduledEndTime = DateTime.UtcNow.AddHours(3)
        };
        _mockStorage.GetCurrentAsync(Arg.Any<CancellationToken>())
            .Returns(futureMode);

        var result = await _sut.IsMaintenanceModeActiveAsync(TestContext.Current.CancellationToken);

        Assert.False(result);
    }

    [Fact]
    public async Task IsMaintenanceModeActiveAsync_WhenScheduledInPast_ReturnsFalse() {
        var pastMode = CreateTestMaintenanceMode(isEnabled: true) with {
            ScheduledStartTime = DateTime.UtcNow.AddHours(-3),
            ScheduledEndTime = DateTime.UtcNow.AddHours(-1)
        };
        _mockStorage.GetCurrentAsync(Arg.Any<CancellationToken>())
            .Returns(pastMode);

        var result = await _sut.IsMaintenanceModeActiveAsync(TestContext.Current.CancellationToken);

        Assert.False(result);
    }

    [Fact]
    public async Task IsMaintenanceModeActiveAsync_WhenScheduledAndActive_ReturnsTrue() {
        var activeScheduledMode = CreateTestMaintenanceMode(isEnabled: true) with {
            ScheduledStartTime = DateTime.UtcNow.AddHours(-1),
            ScheduledEndTime = DateTime.UtcNow.AddHours(1)
        };
        _mockStorage.GetCurrentAsync(Arg.Any<CancellationToken>())
            .Returns(activeScheduledMode);

        var result = await _sut.IsMaintenanceModeActiveAsync(TestContext.Current.CancellationToken);

        Assert.True(result);
    }

    #endregion

    #region Helper Methods

    private static MaintenanceMode CreateTestMaintenanceMode(bool isEnabled = true) => new() {
        Id = Guid.CreateVersion7(),
        IsEnabled = isEnabled,
        Message = "System maintenance in progress",
        ScheduledStartTime = null,
        ScheduledEndTime = null,
        EnabledAt = isEnabled ? DateTime.UtcNow : null,
        EnabledBy = isEnabled ? Guid.CreateVersion7() : null,
        DisabledAt = !isEnabled ? DateTime.UtcNow : null,
        DisabledBy = !isEnabled ? Guid.CreateVersion7() : null
    };

    #endregion
}