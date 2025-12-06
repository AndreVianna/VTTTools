using MaintenanceMode = VttTools.Maintenance.Model.MaintenanceMode;

namespace VttTools.Data.Maintenance;

public class MaintenanceModeStorage(ApplicationDbContext context)
    : IMaintenanceModeStorage {
    public async Task<MaintenanceMode?> GetCurrentAsync(CancellationToken ct = default) {
        var entity = await context.MaintenanceMode
            .AsNoTracking()
            .FirstOrDefaultAsync(m => m.IsEnabled, ct);
        return entity?.ToModel();
    }

    public async Task<MaintenanceMode> SaveAsync(MaintenanceMode maintenanceMode, CancellationToken ct = default) {
        var existing = await context.MaintenanceMode
            .FirstOrDefaultAsync(m => m.Id == maintenanceMode.Id, ct);

        if (existing is null) {
            var entity = maintenanceMode.ToEntity();
            await context.MaintenanceMode.AddAsync(entity, ct);
        }
        else {
            existing.UpdateFrom(maintenanceMode);
        }

        await context.SaveChangesAsync(ct);
        return maintenanceMode;
    }

    public async Task<MaintenanceMode?> GetByIdAsync(Guid id, CancellationToken ct = default) {
        var entity = await context.MaintenanceMode
            .AsNoTracking()
            .FirstOrDefaultAsync(m => m.Id == id, ct);
        return entity?.ToModel();
    }
}