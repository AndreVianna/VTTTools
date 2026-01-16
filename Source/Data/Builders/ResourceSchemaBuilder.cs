using Resource = VttTools.Data.Media.Entities.Resource;

namespace VttTools.Data.Builders;

internal static class ResourceSchemaBuilder {
    public static void ConfigureModel(ModelBuilder builder)
        => builder.Entity<Resource>(entity => {
            entity.ToTable("Resources");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.OwnerId).IsRequired();
            entity.Property(e => e.Role).IsRequired().HasConversion<string>();
            entity.Property(e => e.ContentType).IsRequired().HasMaxLength(64);
            entity.Property(e => e.Path).IsRequired().HasMaxLength(512);
            entity.Property(e => e.FileName).HasMaxLength(128);
            entity.Property(e => e.FileSize).HasDefaultValue(0);
            entity.Property(e => e.Name).HasMaxLength(256).HasDefaultValue("");
            entity.Property(e => e.Description).HasMaxLength(1024);
            entity.Property(e => e.Tags)
                .HasConversion(
                    v => JsonSerializer.Serialize(v, (JsonSerializerOptions?)null),
                    v => JsonSerializer.Deserialize<string[]>(v, (JsonSerializerOptions?)null) ?? Array.Empty<string>())
                .HasColumnType("jsonb")
                .HasDefaultValueSql("'[]'::jsonb");
            entity.OwnsOne(e => e.Dimensions, scaleBuilder => {
                scaleBuilder.Property(s => s.Width).IsRequired().HasDefaultValue(0).HasColumnName(nameof(Size.Width));
                scaleBuilder.Property(s => s.Height).IsRequired().HasDefaultValue(0).HasColumnName(nameof(Size.Height));
            });
            entity.Property(e => e.Duration).HasDefaultValue(TimeSpan.Zero);
            entity.HasIndex(e => new { e.Path, e.FileName });
            entity.HasIndex(e => e.Role);
            entity.HasIndex(e => e.Tags).HasMethod("gin");
        });
}