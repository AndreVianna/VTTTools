namespace VttTools.Data.Maintenance;

public class MaintenanceMapperTests {
    [Fact]
    public void ToModel_WithValidEntity_ReturnsCorrectModel() {
        var enabledAt = DateTime.UtcNow.AddHours(-1);
        var scheduledStart = DateTime.UtcNow;
        var scheduledEnd = DateTime.UtcNow.AddHours(2);
        var enabledBy = Guid.CreateVersion7();

        var entity = new Entities.MaintenanceMode {
            Id = Guid.CreateVersion7(),
            IsEnabled = true,
            Message = "System maintenance in progress",
            ScheduledStartTime = scheduledStart,
            ScheduledEndTime = scheduledEnd,
            EnabledAt = enabledAt,
            EnabledBy = enabledBy,
            DisabledAt = null,
            DisabledBy = null,
        };

        var result = entity.ToModel();

        result.Should().NotBeNull();
        result.Id.Should().Be(entity.Id);
        result.IsEnabled.Should().BeTrue();
        result.Message.Should().Be(entity.Message);
        result.ScheduledStartTime.Should().Be(scheduledStart);
        result.ScheduledEndTime.Should().Be(scheduledEnd);
        result.EnabledAt.Should().Be(enabledAt);
        result.EnabledBy.Should().Be(enabledBy);
        result.DisabledAt.Should().BeNull();
        result.DisabledBy.Should().BeNull();
    }

    [Fact]
    public void ToModel_WithNullEntity_ReturnsNull() {
        Entities.MaintenanceMode? entity = null;

        var result = entity.ToModel();

        result.Should().BeNull();
    }

    [Fact]
    public void ToModel_WithDisabledMode_IncludesDisabledFields() {
        var disabledAt = DateTime.UtcNow;
        var disabledBy = Guid.CreateVersion7();

        var entity = new Entities.MaintenanceMode {
            Id = Guid.CreateVersion7(),
            IsEnabled = false,
            Message = "Maintenance completed",
            ScheduledStartTime = null,
            ScheduledEndTime = null,
            EnabledAt = DateTime.UtcNow.AddHours(-2),
            EnabledBy = Guid.CreateVersion7(),
            DisabledAt = disabledAt,
            DisabledBy = disabledBy,
        };

        var result = entity.ToModel();

        result.Should().NotBeNull();
        result.IsEnabled.Should().BeFalse();
        result.DisabledAt.Should().Be(disabledAt);
        result.DisabledBy.Should().Be(disabledBy);
    }

    [Fact]
    public void ToEntity_WithValidModel_ReturnsCorrectEntity() {
        var scheduledStart = DateTime.UtcNow.AddDays(1);
        var scheduledEnd = DateTime.UtcNow.AddDays(1).AddHours(3);
        var enabledBy = Guid.CreateVersion7();

        var model = new VttTools.Maintenance.Model.MaintenanceMode {
            Id = Guid.CreateVersion7(),
            IsEnabled = true,
            Message = "Planned maintenance",
            ScheduledStartTime = scheduledStart,
            ScheduledEndTime = scheduledEnd,
            EnabledAt = DateTime.UtcNow,
            EnabledBy = enabledBy,
        };

        var result = model.ToEntity();

        result.Should().NotBeNull();
        result.Id.Should().Be(model.Id);
        result.IsEnabled.Should().BeTrue();
        result.Message.Should().Be(model.Message);
        result.ScheduledStartTime.Should().Be(scheduledStart);
        result.ScheduledEndTime.Should().Be(scheduledEnd);
        result.EnabledAt.Should().NotBeNull();
        result.EnabledBy.Should().Be(enabledBy);
    }

    [Fact]
    public void ToEntity_WithNullOptionalFields_HandlesNulls() {
        var model = new VttTools.Maintenance.Model.MaintenanceMode {
            Id = Guid.CreateVersion7(),
            IsEnabled = false,
            Message = "No scheduled time",
            ScheduledStartTime = null,
            ScheduledEndTime = null,
            EnabledAt = null,
            EnabledBy = null,
            DisabledAt = null,
            DisabledBy = null,
        };

        var result = model.ToEntity();

        result.Should().NotBeNull();
        result.ScheduledStartTime.Should().BeNull();
        result.ScheduledEndTime.Should().BeNull();
        result.EnabledAt.Should().BeNull();
        result.EnabledBy.Should().BeNull();
        result.DisabledAt.Should().BeNull();
        result.DisabledBy.Should().BeNull();
    }

    [Fact]
    public void UpdateFrom_UpdatesAllProperties() {
        var entity = new Entities.MaintenanceMode {
            Id = Guid.CreateVersion7(),
            IsEnabled = false,
            Message = "Old message",
            ScheduledStartTime = DateTime.UtcNow,
            ScheduledEndTime = DateTime.UtcNow.AddHours(1),
            EnabledAt = null,
            EnabledBy = null,
            DisabledAt = DateTime.UtcNow.AddDays(-1),
            DisabledBy = Guid.CreateVersion7(),
        };

        var newScheduledStart = DateTime.UtcNow.AddHours(2);
        var newScheduledEnd = DateTime.UtcNow.AddHours(4);
        var newEnabledAt = DateTime.UtcNow;
        var newEnabledBy = Guid.CreateVersion7();

        var model = new VttTools.Maintenance.Model.MaintenanceMode {
            Id = entity.Id,
            IsEnabled = true,
            Message = "New message",
            ScheduledStartTime = newScheduledStart,
            ScheduledEndTime = newScheduledEnd,
            EnabledAt = newEnabledAt,
            EnabledBy = newEnabledBy,
            DisabledAt = null,
            DisabledBy = null,
        };

        entity.UpdateFrom(model);

        entity.IsEnabled.Should().BeTrue();
        entity.Message.Should().Be("New message");
        entity.ScheduledStartTime.Should().Be(newScheduledStart);
        entity.ScheduledEndTime.Should().Be(newScheduledEnd);
        entity.EnabledAt.Should().Be(newEnabledAt);
        entity.EnabledBy.Should().Be(newEnabledBy);
        entity.DisabledAt.Should().BeNull();
        entity.DisabledBy.Should().BeNull();
    }

    [Fact]
    public void UpdateFrom_WithDisabledMode_UpdatesDisabledFields() {
        var entity = new Entities.MaintenanceMode {
            Id = Guid.CreateVersion7(),
            IsEnabled = true,
            Message = "Active maintenance",
            EnabledAt = DateTime.UtcNow.AddHours(-1),
            EnabledBy = Guid.CreateVersion7(),
        };

        var disabledAt = DateTime.UtcNow;
        var disabledBy = Guid.CreateVersion7();

        var model = new VttTools.Maintenance.Model.MaintenanceMode {
            Id = entity.Id,
            IsEnabled = false,
            Message = "Maintenance completed",
            DisabledAt = disabledAt,
            DisabledBy = disabledBy,
        };

        entity.UpdateFrom(model);

        entity.IsEnabled.Should().BeFalse();
        entity.Message.Should().Be("Maintenance completed");
        entity.DisabledAt.Should().Be(disabledAt);
        entity.DisabledBy.Should().Be(disabledBy);
    }
}
