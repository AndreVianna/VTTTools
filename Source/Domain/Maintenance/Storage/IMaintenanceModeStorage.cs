namespace VttTools.Maintenance.Storage;

public interface IMaintenanceModeStorage {
    Task<MaintenanceMode?> GetCurrentAsync(CancellationToken ct = default);
    Task<MaintenanceMode> SaveAsync(MaintenanceMode maintenanceMode, CancellationToken ct = default);
    Task<MaintenanceMode?> GetByIdAsync(Guid id, CancellationToken ct = default);
}
