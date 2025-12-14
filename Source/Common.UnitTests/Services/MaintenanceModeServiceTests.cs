
namespace VttTools.Common.UnitTests.Services;

public class MaintenanceModeServiceTests {
    private readonly IMaintenanceModeStorage _storage;
    private readonly ILogger<MaintenanceModeService> _logger;
    private readonly MaintenanceModeService _service;

    public MaintenanceModeServiceTests() {
        _storage = Substitute.For<IMaintenanceModeStorage>();
        _logger = Substitute.For<ILogger<MaintenanceModeService>>();
        _service = new MaintenanceModeService(_storage, _logger);
    }

    [Fact]
    public async Task GetCurrentAsync_WithActiveMode_ReturnsMaintenanceMode() {
        var maintenanceMode = new MaintenanceMode {
            Id = Guid.NewGuid(),
            IsEnabled = true,
            Message = "System maintenance in progress",
            EnabledAt = DateTime.UtcNow,
            EnabledBy = Guid.NewGuid()
        };
        _storage.GetCurrentAsync(TestContext.Current.CancellationToken).Returns(maintenanceMode);

        var result = await _service.GetCurrentAsync(TestContext.Current.CancellationToken);

        result.Should().NotBeNull();
        result.IsEnabled.Should().BeTrue();
    }

    [Fact]
    public async Task GetCurrentAsync_WithNoActiveMode_ReturnsNull() {
        _storage.GetCurrentAsync(TestContext.Current.CancellationToken).Returns((MaintenanceMode?)null);

        var result = await _service.GetCurrentAsync(TestContext.Current.CancellationToken);

        result.Should().BeNull();
    }

    [Fact]
    public async Task EnableAsync_WithValidParameters_CreatesMaintenanceMode() {
        const string message = "Scheduled maintenance";
        var scheduledStart = DateTime.UtcNow.AddHours(1);
        var scheduledEnd = DateTime.UtcNow.AddHours(2);
        var enabledBy = Guid.NewGuid();
        _storage.GetCurrentAsync(TestContext.Current.CancellationToken).Returns((MaintenanceMode?)null);

        var result = await _service.EnableAsync(
            message,
            scheduledStart,
            scheduledEnd,
            enabledBy,
            TestContext.Current.CancellationToken);

        result.Should().NotBeNull();
        result.IsEnabled.Should().BeTrue();
        result.Message.Should().Be(message);
        result.ScheduledStartTime.Should().Be(scheduledStart);
        result.ScheduledEndTime.Should().Be(scheduledEnd);
        result.EnabledBy.Should().Be(enabledBy);
        await _storage.Received(1).SaveAsync(Arg.Any<MaintenanceMode>(), TestContext.Current.CancellationToken);
    }

    [Fact]
    public async Task EnableAsync_WithNullMessage_ThrowsArgumentException() {
        var exception = await Assert.ThrowsAsync<ArgumentException>(
            async () => await _service.EnableAsync(
                null!,
                null,
                null,
                Guid.NewGuid(),
                TestContext.Current.CancellationToken));

        exception.ParamName.Should().Be("message");
    }

    [Fact]
    public async Task EnableAsync_WithEmptyMessage_ThrowsArgumentException() {
        var exception = await Assert.ThrowsAsync<ArgumentException>(
            async () => await _service.EnableAsync(
                string.Empty,
                null,
                null,
                Guid.NewGuid(),
                TestContext.Current.CancellationToken));

        exception.ParamName.Should().Be("message");
    }

    [Fact]
    public async Task EnableAsync_WithWhitespaceMessage_ThrowsArgumentException() {
        var exception = await Assert.ThrowsAsync<ArgumentException>(
            async () => await _service.EnableAsync(
                "   ",
                null,
                null,
                Guid.NewGuid(),
                TestContext.Current.CancellationToken));

        exception.ParamName.Should().Be("message");
    }

    [Fact]
    public async Task EnableAsync_WithMessageExceeding2000Characters_ThrowsArgumentException() {
        var longMessage = new string('a', 2001);

        var exception = await Assert.ThrowsAsync<ArgumentException>(
            async () => await _service.EnableAsync(
                longMessage,
                null,
                null,
                Guid.NewGuid(),
                TestContext.Current.CancellationToken));

        exception.ParamName.Should().Be("message");
        exception.Message.Should().Contain("must not exceed 2000 characters");
    }

    [Fact]
    public async Task EnableAsync_WithMessageAt2000Characters_DoesNotThrow() {
        var maxMessage = new string('a', 2000);
        _storage.GetCurrentAsync(TestContext.Current.CancellationToken).Returns((MaintenanceMode?)null);

        var result = await _service.EnableAsync(
            maxMessage,
            null,
            null,
            Guid.NewGuid(),
            TestContext.Current.CancellationToken);

        result.Should().NotBeNull();
        result.Message.Should().Be(maxMessage);
    }

    [Fact]
    public async Task EnableAsync_WithScheduledEndBeforeStart_ThrowsArgumentException() {
        var scheduledStart = DateTime.UtcNow.AddHours(2);
        var scheduledEnd = DateTime.UtcNow.AddHours(1);

        var exception = await Assert.ThrowsAsync<ArgumentException>(
            async () => await _service.EnableAsync(
                "Test message",
                scheduledStart,
                scheduledEnd,
                Guid.NewGuid(),
                TestContext.Current.CancellationToken));

        exception.ParamName.Should().Be("scheduledEnd");
        exception.Message.Should().Contain("must be after");
    }

    [Fact]
    public async Task EnableAsync_WhenAlreadyEnabled_ThrowsInvalidOperationException() {
        var existing = new MaintenanceMode {
            Id = Guid.NewGuid(),
            IsEnabled = true,
            Message = "Already in maintenance",
            EnabledAt = DateTime.UtcNow,
            EnabledBy = Guid.NewGuid()
        };
        _storage.GetCurrentAsync(TestContext.Current.CancellationToken).Returns(existing);

        var exception = await Assert.ThrowsAsync<InvalidOperationException>(
            async () => await _service.EnableAsync(
                "New message",
                null,
                null,
                Guid.NewGuid(),
                TestContext.Current.CancellationToken));

        exception.Message.Should().Contain("already enabled");
    }

    [Fact]
    public async Task EnableAsync_WithNullScheduledTimes_CreatesWithoutSchedule() {
        _storage.GetCurrentAsync(TestContext.Current.CancellationToken).Returns((MaintenanceMode?)null);

        var result = await _service.EnableAsync(
            "Immediate maintenance",
            null,
            null,
            Guid.NewGuid(),
            TestContext.Current.CancellationToken);

        result.ScheduledStartTime.Should().BeNull();
        result.ScheduledEndTime.Should().BeNull();
    }

    [Fact]
    public async Task DisableAsync_WithActiveMode_DisablesMode() {
        var current = new MaintenanceMode {
            Id = Guid.NewGuid(),
            IsEnabled = true,
            Message = "Maintenance in progress",
            EnabledAt = DateTime.UtcNow.AddHours(-1),
            EnabledBy = Guid.NewGuid()
        };
        _storage.GetCurrentAsync(TestContext.Current.CancellationToken).Returns(current);
        var disabledBy = Guid.NewGuid();

        var result = await _service.DisableAsync(disabledBy, TestContext.Current.CancellationToken);

        result.Should().NotBeNull();
        result.IsEnabled.Should().BeFalse();
        result.DisabledBy.Should().Be(disabledBy);
        result.DisabledAt.Should().NotBeNull();
        await _storage.Received(1).SaveAsync(Arg.Any<MaintenanceMode>(), TestContext.Current.CancellationToken);
    }

    [Fact]
    public async Task DisableAsync_WithNoActiveMode_ThrowsInvalidOperationException() {
        _storage.GetCurrentAsync(TestContext.Current.CancellationToken).Returns((MaintenanceMode?)null);

        var exception = await Assert.ThrowsAsync<InvalidOperationException>(
            async () => await _service.DisableAsync(Guid.NewGuid(), TestContext.Current.CancellationToken));

        exception.Message.Should().Contain("No active maintenance mode");
    }

    [Fact]
    public async Task UpdateAsync_WithValidParameters_UpdatesMode() {
        var id = Guid.NewGuid();
        var existing = new MaintenanceMode {
            Id = id,
            IsEnabled = true,
            Message = "Old message",
            EnabledAt = DateTime.UtcNow.AddHours(-1),
            EnabledBy = Guid.NewGuid()
        };
        _storage.GetByIdAsync(id, TestContext.Current.CancellationToken).Returns(existing);
        const string newMessage = "Updated message";
        var newStart = DateTime.UtcNow.AddHours(1);
        var newEnd = DateTime.UtcNow.AddHours(2);

        var result = await _service.UpdateAsync(
            id,
            newMessage,
            newStart,
            newEnd,
            TestContext.Current.CancellationToken);

        result.Should().NotBeNull();
        result.Message.Should().Be(newMessage);
        result.ScheduledStartTime.Should().Be(newStart);
        result.ScheduledEndTime.Should().Be(newEnd);
        await _storage.Received(1).SaveAsync(Arg.Any<MaintenanceMode>(), TestContext.Current.CancellationToken);
    }

    [Fact]
    public async Task UpdateAsync_WithNullMessage_ThrowsArgumentException() {
        var exception = await Assert.ThrowsAsync<ArgumentException>(
            async () => await _service.UpdateAsync(
                Guid.NewGuid(),
                null!,
                null,
                null,
                TestContext.Current.CancellationToken));

        exception.ParamName.Should().Be("message");
    }

    [Fact]
    public async Task UpdateAsync_WithEmptyMessage_ThrowsArgumentException() {
        var exception = await Assert.ThrowsAsync<ArgumentException>(
            async () => await _service.UpdateAsync(
                Guid.NewGuid(),
                string.Empty,
                null,
                null,
                TestContext.Current.CancellationToken));

        exception.ParamName.Should().Be("message");
    }

    [Fact]
    public async Task UpdateAsync_WithMessageExceeding2000Characters_ThrowsArgumentException() {
        var longMessage = new string('a', 2001);

        var exception = await Assert.ThrowsAsync<ArgumentException>(
            async () => await _service.UpdateAsync(
                Guid.NewGuid(),
                longMessage,
                null,
                null,
                TestContext.Current.CancellationToken));

        exception.ParamName.Should().Be("message");
    }

    [Fact]
    public async Task UpdateAsync_WithScheduledEndBeforeStart_ThrowsArgumentException() {
        var scheduledStart = DateTime.UtcNow.AddHours(2);
        var scheduledEnd = DateTime.UtcNow.AddHours(1);

        var exception = await Assert.ThrowsAsync<ArgumentException>(
            async () => await _service.UpdateAsync(
                Guid.NewGuid(),
                "Test message",
                scheduledStart,
                scheduledEnd,
                TestContext.Current.CancellationToken));

        exception.ParamName.Should().Be("scheduledEnd");
    }

    [Fact]
    public async Task UpdateAsync_WithNonExistingId_ThrowsInvalidOperationException() {
        var id = Guid.NewGuid();
        _storage.GetByIdAsync(id, TestContext.Current.CancellationToken).Returns((MaintenanceMode?)null);

        var exception = await Assert.ThrowsAsync<InvalidOperationException>(
            async () => await _service.UpdateAsync(
                id,
                "New message",
                null,
                null,
                TestContext.Current.CancellationToken));

        exception.Message.Should().Contain("not found");
    }

    [Fact]
    public async Task IsMaintenanceModeActiveAsync_WithNoMode_ReturnsFalse() {
        _storage.GetCurrentAsync(TestContext.Current.CancellationToken).Returns((MaintenanceMode?)null);

        var isActive = await _service.IsMaintenanceModeActiveAsync(TestContext.Current.CancellationToken);

        isActive.Should().BeFalse();
    }

    [Fact]
    public async Task IsMaintenanceModeActiveAsync_WithDisabledMode_ReturnsFalse() {
        var mode = new MaintenanceMode {
            Id = Guid.NewGuid(),
            IsEnabled = false,
            Message = "Disabled",
            EnabledAt = DateTime.UtcNow.AddHours(-2),
            EnabledBy = Guid.NewGuid()
        };
        _storage.GetCurrentAsync(TestContext.Current.CancellationToken).Returns(mode);

        var isActive = await _service.IsMaintenanceModeActiveAsync(TestContext.Current.CancellationToken);

        isActive.Should().BeFalse();
    }

    [Fact]
    public async Task IsMaintenanceModeActiveAsync_WithEnabledModeNoSchedule_ReturnsTrue() {
        var mode = new MaintenanceMode {
            Id = Guid.NewGuid(),
            IsEnabled = true,
            Message = "Maintenance active",
            EnabledAt = DateTime.UtcNow.AddHours(-1),
            EnabledBy = Guid.NewGuid()
        };
        _storage.GetCurrentAsync(TestContext.Current.CancellationToken).Returns(mode);

        var isActive = await _service.IsMaintenanceModeActiveAsync(TestContext.Current.CancellationToken);

        isActive.Should().BeTrue();
    }

    [Fact]
    public async Task IsMaintenanceModeActiveAsync_WithScheduledStartInFuture_ReturnsFalse() {
        var mode = new MaintenanceMode {
            Id = Guid.NewGuid(),
            IsEnabled = true,
            Message = "Scheduled maintenance",
            ScheduledStartTime = DateTime.UtcNow.AddHours(1),
            EnabledAt = DateTime.UtcNow,
            EnabledBy = Guid.NewGuid()
        };
        _storage.GetCurrentAsync(TestContext.Current.CancellationToken).Returns(mode);

        var isActive = await _service.IsMaintenanceModeActiveAsync(TestContext.Current.CancellationToken);

        isActive.Should().BeFalse();
    }

    [Fact]
    public async Task IsMaintenanceModeActiveAsync_WithScheduledEndInPast_ReturnsFalse() {
        var mode = new MaintenanceMode {
            Id = Guid.NewGuid(),
            IsEnabled = true,
            Message = "Past maintenance",
            ScheduledStartTime = DateTime.UtcNow.AddHours(-2),
            ScheduledEndTime = DateTime.UtcNow.AddHours(-1),
            EnabledAt = DateTime.UtcNow.AddHours(-3),
            EnabledBy = Guid.NewGuid()
        };
        _storage.GetCurrentAsync(TestContext.Current.CancellationToken).Returns(mode);

        var isActive = await _service.IsMaintenanceModeActiveAsync(TestContext.Current.CancellationToken);

        isActive.Should().BeFalse();
    }

    [Fact]
    public async Task IsMaintenanceModeActiveAsync_WithinScheduledWindow_ReturnsTrue() {
        var mode = new MaintenanceMode {
            Id = Guid.NewGuid(),
            IsEnabled = true,
            Message = "Current maintenance",
            ScheduledStartTime = DateTime.UtcNow.AddHours(-1),
            ScheduledEndTime = DateTime.UtcNow.AddHours(1),
            EnabledAt = DateTime.UtcNow.AddHours(-2),
            EnabledBy = Guid.NewGuid()
        };
        _storage.GetCurrentAsync(TestContext.Current.CancellationToken).Returns(mode);

        var isActive = await _service.IsMaintenanceModeActiveAsync(TestContext.Current.CancellationToken);

        isActive.Should().BeTrue();
    }

    [Fact]
    public async Task IsMaintenanceModeActiveAsync_WithOnlyScheduledStart_ChecksStartTime() {
        var mode = new MaintenanceMode {
            Id = Guid.NewGuid(),
            IsEnabled = true,
            Message = "Started maintenance",
            ScheduledStartTime = DateTime.UtcNow.AddMinutes(-5),
            ScheduledEndTime = null,
            EnabledAt = DateTime.UtcNow.AddHours(-1),
            EnabledBy = Guid.NewGuid()
        };
        _storage.GetCurrentAsync(TestContext.Current.CancellationToken).Returns(mode);

        var isActive = await _service.IsMaintenanceModeActiveAsync(TestContext.Current.CancellationToken);

        isActive.Should().BeTrue();
    }

    [Fact]
    public async Task IsMaintenanceModeActiveAsync_WithOnlyScheduledEnd_ChecksEndTime() {
        var mode = new MaintenanceMode {
            Id = Guid.NewGuid(),
            IsEnabled = true,
            Message = "Ending maintenance",
            ScheduledStartTime = null,
            ScheduledEndTime = DateTime.UtcNow.AddMinutes(5),
            EnabledAt = DateTime.UtcNow.AddHours(-1),
            EnabledBy = Guid.NewGuid()
        };
        _storage.GetCurrentAsync(TestContext.Current.CancellationToken).Returns(mode);

        var isActive = await _service.IsMaintenanceModeActiveAsync(TestContext.Current.CancellationToken);

        isActive.Should().BeTrue();
    }
}
