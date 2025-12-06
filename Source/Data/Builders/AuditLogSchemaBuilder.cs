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
        entity.Property(e => e.EntityType).HasMaxLength(100);
        entity.Property(e => e.EntityId).HasMaxLength(50);
        entity.Property(e => e.HttpMethod).IsRequired().HasMaxLength(10);
        entity.Property(e => e.Path).IsRequired().HasMaxLength(500);
        entity.Property(e => e.QueryString).HasMaxLength(2000);
        entity.Property(e => e.StatusCode).IsRequired();
        entity.Property(e => e.IpAddress).HasMaxLength(50);
        entity.Property(e => e.UserAgent).HasMaxLength(500);
        entity.Property(e => e.RequestBody).HasMaxLength(8000);
        entity.Property(e => e.ResponseBody).HasMaxLength(8000);
        entity.Property(e => e.DurationInMilliseconds).IsRequired();
        entity.Property(e => e.Result).IsRequired().HasMaxLength(50);
        entity.Property(e => e.ErrorMessage).HasMaxLength(4000);

        entity.HasIndex(e => e.Timestamp).IsDescending();
        entity.HasIndex(e => e.UserId);
        entity.HasIndex(e => e.Action);
        entity.HasIndex(e => e.EntityType);
        entity.HasIndex(e => e.Result);
        entity.HasIndex(e => new { e.Timestamp, e.UserId }).IsDescending(true, false);
    });
}