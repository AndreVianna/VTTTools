using MaintenanceMode = VttTools.Maintenance.Model.MaintenanceMode;
using MaintenanceModeEntity = VttTools.Data.Maintenance.Entities.MaintenanceMode;

namespace VttTools.Data.Maintenance;

internal static class Mapper {
    internal static MaintenanceMode? ToModel(this MaintenanceModeEntity? entity)
        => entity == null ? null : new() {
            Id = entity.Id,
            IsEnabled = entity.IsEnabled,
            Message = entity.Message,
            ScheduledStartTime = entity.ScheduledStartTime,
            ScheduledEndTime = entity.ScheduledEndTime,
            EnabledAt = entity.EnabledAt,
            EnabledBy = entity.EnabledBy,
            DisabledAt = entity.DisabledAt,
            DisabledBy = entity.DisabledBy,
        };

    [return: NotNullIfNotNull(nameof(model))]
    internal static MaintenanceModeEntity ToEntity(this MaintenanceMode model)
        => new() {
            Id = model.Id,
            IsEnabled = model.IsEnabled,
            Message = model.Message,
            ScheduledStartTime = model.ScheduledStartTime,
            ScheduledEndTime = model.ScheduledEndTime,
            EnabledAt = model.EnabledAt,
            EnabledBy = model.EnabledBy,
            DisabledAt = model.DisabledAt,
            DisabledBy = model.DisabledBy,
        };

    internal static void UpdateFrom(this MaintenanceModeEntity entity, MaintenanceMode model) {
        entity.IsEnabled = model.IsEnabled;
        entity.Message = model.Message;
        entity.ScheduledStartTime = model.ScheduledStartTime;
        entity.ScheduledEndTime = model.ScheduledEndTime;
        entity.EnabledAt = model.EnabledAt;
        entity.EnabledBy = model.EnabledBy;
        entity.DisabledAt = model.DisabledAt;
        entity.DisabledBy = model.DisabledBy;
    }
}