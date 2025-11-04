namespace VttTools.Maintenance.Services;

public interface IMaintenanceModeService {
    Task<MaintenanceMode?> GetCurrentAsync(CancellationToken ct = default);

    Task<MaintenanceMode> EnableAsync(
        string message,
        DateTime? scheduledStart,
        DateTime? scheduledEnd,
        Guid enabledBy,
        CancellationToken ct = default);

    Task<MaintenanceMode> DisableAsync(Guid disabledBy, CancellationToken ct = default);

    Task<MaintenanceMode> UpdateAsync(
        Guid id,
        string message,
        DateTime? scheduledStart,
        DateTime? scheduledEnd,
        CancellationToken ct = default);

    Task<bool> IsMaintenanceModeActiveAsync(CancellationToken ct = default);
}
