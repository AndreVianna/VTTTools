using MaintenanceMode = VttTools.Data.Maintenance.Entities.MaintenanceMode;

namespace VttTools.Data.Builders;

internal static class MaintenanceModeSchemaBuilder {
    public static void ConfigureModel(ModelBuilder builder) => builder.Entity<MaintenanceMode>(entity => {
        entity.ToTable("MaintenanceMode");
        entity.HasKey(e => e.Id);

        entity.Property(e => e.IsEnabled).IsRequired().HasColumnType("BIT").HasDefaultValue(false);
        entity.Property(e => e.Message).IsRequired().HasMaxLength(2000);
        entity.Property(e => e.ScheduledStartTime).HasColumnType("DATETIME2");
        entity.Property(e => e.ScheduledEndTime).HasColumnType("DATETIME2");
        entity.Property(e => e.EnabledAt).HasColumnType("DATETIME2");
        entity.Property(e => e.EnabledBy);
        entity.Property(e => e.DisabledAt).HasColumnType("DATETIME2");
        entity.Property(e => e.DisabledBy);

        entity.HasIndex(e => e.IsEnabled);
        entity.HasIndex(e => e.ScheduledStartTime);
        entity.HasIndex(e => e.ScheduledEndTime);
        entity.HasIndex(e => e.EnabledBy);
        entity.HasIndex(e => new { e.IsEnabled, e.ScheduledStartTime });
    });
}
