using MaintenanceMode = VttTools.Data.Maintenance.Entities.MaintenanceMode;

namespace VttTools.Data.Builders;

internal static class MaintenanceModeSchemaBuilder {
    public static void ConfigureModel(ModelBuilder builder) => builder.Entity<MaintenanceMode>(entity => {
        entity.ToTable("MaintenanceMode");
        entity.HasKey(e => e.Id);

        entity.Property(e => e.IsEnabled).IsRequired().HasDefaultValue(false);
        entity.Property(e => e.Message).IsRequired().HasMaxLength(2000);
        entity.Property(e => e.ScheduledStartTime);
        entity.Property(e => e.ScheduledEndTime);
        entity.Property(e => e.EnabledAt);
        entity.Property(e => e.EnabledBy);
        entity.Property(e => e.DisabledAt);
        entity.Property(e => e.DisabledBy);

        entity.HasIndex(e => e.IsEnabled);
        entity.HasIndex(e => e.ScheduledStartTime);
        entity.HasIndex(e => e.ScheduledEndTime);
        entity.HasIndex(e => e.EnabledBy);
        entity.HasIndex(e => new { e.IsEnabled, e.ScheduledStartTime });
    });
}