using AuditLog = VttTools.Data.Audit.Entities.AuditLog;

namespace VttTools.Data.Builders;

internal static class AuditLogSchemaBuilder {
    public static void ConfigureModel(ModelBuilder builder) => builder.Entity<AuditLog>(entity => {
        entity.ToTable("AuditLogs");
        entity.HasKey(e => e.Id);

        entity.Property(e => e.Timestamp).IsRequired();
        entity.Property(e => e.UserId);
        entity.Property(e => e.UserEmail);
        entity.Property(e => e.Action).IsRequired().HasMaxLength(100);
        entity.Property(e => e.ErrorMessage).HasMaxLength(4000);
        entity.Property(e => e.EntityType).HasMaxLength(100);
        entity.Property(e => e.EntityId).HasMaxLength(50);
        entity.Property(e => e.Payload).HasMaxLength(8000);

        entity.HasIndex(e => e.Timestamp).IsDescending();
        entity.HasIndex(e => e.UserId);
        entity.HasIndex(e => e.Action);
        entity.HasIndex(e => e.EntityType);
        entity.HasIndex(e => new { e.Timestamp, e.UserId }).IsDescending(true, false);
    });
}
