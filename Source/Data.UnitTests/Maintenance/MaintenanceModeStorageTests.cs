namespace VttTools.Data.Maintenance;

public class MaintenanceModeStorageTests
    : IDisposable {
    private readonly MaintenanceModeStorage _storage;
    private readonly ApplicationDbContext _context;
    private readonly CancellationToken _ct;
    private readonly Guid _adminId = Guid.CreateVersion7();

    public MaintenanceModeStorageTests() {
        _context = DbContextHelper.CreateInMemoryContext(Guid.CreateVersion7());
        _storage = new(_context);
        _ct = TestContext.Current.CancellationToken;
        SeedMaintenanceModes();
    }

    public void Dispose() {
        DbContextHelper.Dispose(_context);
        GC.SuppressFinalize(this);
    }

    private void SeedMaintenanceModes() {
        var modes = new[] {
            new Entities.MaintenanceMode {
                Id = Guid.CreateVersion7(),
                IsEnabled = true,
                Message = "System maintenance in progress",
                ScheduledStartTime = DateTime.UtcNow.AddHours(-1),
                ScheduledEndTime = DateTime.UtcNow.AddHours(1),
                EnabledAt = DateTime.UtcNow.AddHours(-1),
                EnabledBy = _adminId,
            },
            new Entities.MaintenanceMode {
                Id = Guid.CreateVersion7(),
                IsEnabled = false,
                Message = "Scheduled maintenance",
                ScheduledStartTime = DateTime.UtcNow.AddDays(1),
                ScheduledEndTime = DateTime.UtcNow.AddDays(1).AddHours(2),
                DisabledAt = DateTime.UtcNow.AddDays(-1),
                DisabledBy = _adminId,
            },
        };
        _context.MaintenanceMode.AddRange(modes);
        _context.SaveChanges();
    }

    [Fact]
    public async Task GetCurrentAsync_WithEnabledMode_ReturnsEnabledMode() {
        var result = await _storage.GetCurrentAsync(_ct);

        result.Should().NotBeNull();
        result.IsEnabled.Should().BeTrue();
        result.Message.Should().Be("System maintenance in progress");
    }

    [Fact]
    public async Task GetCurrentAsync_WithNoEnabledMode_ReturnsNull() {
        _context.MaintenanceMode.RemoveRange(_context.MaintenanceMode);
        _context.MaintenanceMode.Add(new Entities.MaintenanceMode {
            Id = Guid.CreateVersion7(),
            IsEnabled = false,
            Message = "Disabled",
        });
        await _context.SaveChangesAsync(_ct);

        var result = await _storage.GetCurrentAsync(_ct);

        result.Should().BeNull();
    }

    [Fact]
    public async Task GetByIdAsync_WithExistingId_ReturnsMaintenanceMode() {
        _context.ChangeTracker.Clear();
        var entity = await _context.MaintenanceMode.AsNoTracking().FirstAsync(_ct);

        var result = await _storage.GetByIdAsync(entity.Id, _ct);

        result.Should().NotBeNull();
        result.Id.Should().Be(entity.Id);
        result.IsEnabled.Should().Be(entity.IsEnabled);
        result.Message.Should().Be(entity.Message);
    }

    [Fact]
    public async Task GetByIdAsync_WithNonExistingId_ReturnsNull() {
        var nonExistingId = Guid.CreateVersion7();

        var result = await _storage.GetByIdAsync(nonExistingId, _ct);

        result.Should().BeNull();
    }

    [Fact]
    public async Task SaveAsync_WithNewMaintenanceMode_AddsToDatabase() {
        var maintenanceMode = new VttTools.Maintenance.Model.MaintenanceMode {
            Id = Guid.CreateVersion7(),
            IsEnabled = true,
            Message = "Emergency maintenance",
            ScheduledStartTime = DateTime.UtcNow,
            ScheduledEndTime = DateTime.UtcNow.AddHours(4),
            EnabledAt = DateTime.UtcNow,
            EnabledBy = _adminId,
        };

        var result = await _storage.SaveAsync(maintenanceMode, _ct);

        result.Should().NotBeNull();
        result.Id.Should().Be(maintenanceMode.Id);

        var dbMode = await _context.MaintenanceMode.FindAsync([maintenanceMode.Id], _ct);
        dbMode.Should().NotBeNull();
        dbMode.IsEnabled.Should().BeTrue();
        dbMode.Message.Should().Be("Emergency maintenance");
    }

    [Fact]
    public async Task SaveAsync_WithExistingMaintenanceMode_UpdatesDatabase() {
        _context.ChangeTracker.Clear();
        var entity = await _context.MaintenanceMode.AsNoTracking().FirstAsync(_ct);
        var updatedMode = new VttTools.Maintenance.Model.MaintenanceMode {
            Id = entity.Id,
            IsEnabled = false,
            Message = "Updated message",
            ScheduledStartTime = DateTime.UtcNow.AddHours(2),
            ScheduledEndTime = DateTime.UtcNow.AddHours(4),
            DisabledAt = DateTime.UtcNow,
            DisabledBy = _adminId,
        };

        var result = await _storage.SaveAsync(updatedMode, _ct);

        result.Should().NotBeNull();
        result.Id.Should().Be(updatedMode.Id);

        _context.ChangeTracker.Clear();
        var updated = await _context.MaintenanceMode.AsNoTracking().FirstOrDefaultAsync(m => m.Id == entity.Id, _ct);
        updated.Should().NotBeNull();
        updated!.IsEnabled.Should().BeFalse();
        updated.Message.Should().Be("Updated message");
        updated.DisabledAt.Should().NotBeNull();
        updated.DisabledBy.Should().Be(_adminId);
    }

    [Fact]
    public async Task SaveAsync_WithScheduledMaintenance_SavesAllFields() {
        var scheduledStart = DateTime.UtcNow.AddDays(1);
        var scheduledEnd = DateTime.UtcNow.AddDays(1).AddHours(3);
        var maintenanceMode = new VttTools.Maintenance.Model.MaintenanceMode {
            Id = Guid.CreateVersion7(),
            IsEnabled = false,
            Message = "Scheduled database upgrade",
            ScheduledStartTime = scheduledStart,
            ScheduledEndTime = scheduledEnd,
        };

        var result = await _storage.SaveAsync(maintenanceMode, _ct);

        result.Should().NotBeNull();

        var dbMode = await _context.MaintenanceMode.FindAsync([maintenanceMode.Id], _ct);
        dbMode.Should().NotBeNull();
        dbMode.ScheduledStartTime.Should().Be(scheduledStart);
        dbMode.ScheduledEndTime.Should().Be(scheduledEnd);
        dbMode.IsEnabled.Should().BeFalse();
        dbMode.EnabledAt.Should().BeNull();
        dbMode.EnabledBy.Should().BeNull();
    }
}