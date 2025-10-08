using Resource = VttTools.Data.Media.Entities.Resource;

namespace VttTools.Data.Builders;

internal static class ResourceSchemaBuilder {
    public static void ConfigureModel(ModelBuilder builder)
        => builder.Entity<Resource>(entity => {
            entity.ToTable("Resources");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Type).IsRequired().HasConversion<string>().HasDefaultValue(ResourceType.Undefined);
            entity.Property(e => e.Path).IsRequired().HasMaxLength(128);
            entity.Property(e => e.ContentType).IsRequired().HasMaxLength(64);
            entity.Property(e => e.FileName).HasMaxLength(128);
            entity.Property(e => e.FileLength).HasDefaultValue(0);
            entity.ComplexProperty(e => e.ImageSize, scaleBuilder => {
                scaleBuilder.Property(s => s.Width).IsRequired().HasDefaultValue(0);
                scaleBuilder.Property(s => s.Height).IsRequired().HasDefaultValue(0);
            });
            entity.Property(e => e.Duration).HasDefaultValue(TimeSpan.Zero);
            entity.PrimitiveCollection(e => e.Tags).HasDefaultValue(Array.Empty<string>());
        });
}