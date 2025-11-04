using VttTools.Maintenance.Services;

namespace VttTools.Services;

public class MaintenanceModeService(
    IMaintenanceModeStorage storage,
    ILogger<MaintenanceModeService> logger)
    : IMaintenanceModeService {

    public async Task<MaintenanceMode?> GetCurrentAsync(CancellationToken ct = default) {
        logger.LogDebug("Retrieving current maintenance mode configuration");

        var maintenanceMode = await storage.GetCurrentAsync(ct);

        if (maintenanceMode is null) {
            logger.LogDebug("No active maintenance mode found");
        }
        else {
            logger.LogDebug(
                "Active maintenance mode found: Id={Id}, Message={Message}",
                maintenanceMode.Id,
                maintenanceMode.Message);
        }

        return maintenanceMode;
    }

    public async Task<MaintenanceMode> EnableAsync(
        string message,
        DateTime? scheduledStart,
        DateTime? scheduledEnd,
        Guid enabledBy,
        CancellationToken ct = default) {

        if (string.IsNullOrWhiteSpace(message)) {
            throw new ArgumentException("Message is required", nameof(message));
        }

        if (message.Length > 2000) {
            throw new ArgumentException("Message must not exceed 2000 characters", nameof(message));
        }

        if (scheduledStart.HasValue && scheduledEnd.HasValue && scheduledEnd.Value < scheduledStart.Value) {
            throw new ArgumentException(
                "ScheduledEndTime must be after ScheduledStartTime",
                nameof(scheduledEnd));
        }

        var current = await storage.GetCurrentAsync(ct);
        if (current is not null) {
            throw new InvalidOperationException("Maintenance mode is already enabled");
        }

        var maintenanceMode = new MaintenanceMode {
            IsEnabled = true,
            Message = message,
            ScheduledStartTime = scheduledStart,
            ScheduledEndTime = scheduledEnd,
            EnabledAt = DateTime.UtcNow,
            EnabledBy = enabledBy
        };

        logger.LogInformation(
            "Enabling maintenance mode: Message={Message}, ScheduledStart={ScheduledStart}, ScheduledEnd={ScheduledEnd}, EnabledBy={EnabledBy}",
            message,
            scheduledStart,
            scheduledEnd,
            enabledBy);

        await storage.SaveAsync(maintenanceMode, ct);

        logger.LogDebug("Maintenance mode enabled successfully with ID: {Id}", maintenanceMode.Id);

        return maintenanceMode;
    }

    public async Task<MaintenanceMode> DisableAsync(Guid disabledBy, CancellationToken ct = default) {
        logger.LogDebug("Disabling maintenance mode");

        var current = await storage.GetCurrentAsync(ct)
            ?? throw new InvalidOperationException("No active maintenance mode to disable");

        var updated = current with {
            IsEnabled = false,
            DisabledAt = DateTime.UtcNow,
            DisabledBy = disabledBy
        };

        logger.LogInformation(
            "Disabling maintenance mode: Id={Id}, DisabledBy={DisabledBy}",
            current.Id,
            disabledBy);

        await storage.SaveAsync(updated, ct);

        logger.LogDebug("Maintenance mode disabled successfully");

        return updated;
    }

    public async Task<MaintenanceMode> UpdateAsync(
        Guid id,
        string message,
        DateTime? scheduledStart,
        DateTime? scheduledEnd,
        CancellationToken ct = default) {

        if (string.IsNullOrWhiteSpace(message)) {
            throw new ArgumentException("Message is required", nameof(message));
        }

        if (message.Length > 2000) {
            throw new ArgumentException("Message must not exceed 2000 characters", nameof(message));
        }

        if (scheduledStart.HasValue && scheduledEnd.HasValue && scheduledEnd.Value < scheduledStart.Value) {
            throw new ArgumentException(
                "ScheduledEndTime must be after ScheduledStartTime",
                nameof(scheduledEnd));
        }

        var existing = await storage.GetByIdAsync(id, ct)
            ?? throw new InvalidOperationException($"Maintenance mode with ID {id} not found");

        var updated = existing with {
            Message = message,
            ScheduledStartTime = scheduledStart,
            ScheduledEndTime = scheduledEnd
        };

        logger.LogInformation(
            "Updating maintenance mode: Id={Id}, Message={Message}, ScheduledStart={ScheduledStart}, ScheduledEnd={ScheduledEnd}",
            id,
            message,
            scheduledStart,
            scheduledEnd);

        await storage.SaveAsync(updated, ct);

        logger.LogDebug("Maintenance mode updated successfully");

        return updated;
    }

    public async Task<bool> IsMaintenanceModeActiveAsync(CancellationToken ct = default) {
        logger.LogDebug("Checking if maintenance mode is active");

        var current = await storage.GetCurrentAsync(ct);
        if (current?.IsEnabled != true) {
            logger.LogDebug("Maintenance mode is not active");
            return false;
        }

        var now = DateTime.UtcNow;

        if (current.ScheduledStartTime.HasValue && now < current.ScheduledStartTime.Value) {
            logger.LogDebug(
                "Maintenance mode scheduled but not yet started: ScheduledStart={ScheduledStart}",
                current.ScheduledStartTime.Value);
            return false;
        }

        if (current.ScheduledEndTime.HasValue && now > current.ScheduledEndTime.Value) {
            logger.LogDebug(
                "Maintenance mode scheduled time has passed: ScheduledEnd={ScheduledEnd}",
                current.ScheduledEndTime.Value);
            return false;
        }

        logger.LogDebug("Maintenance mode is currently active");
        return true;
    }
}
