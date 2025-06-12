using Resource = VttTools.Data.Resources.Entities.Resource;

namespace VttTools.Data.Builders;

internal static class ResourceSchemaBuilder {
    public static void ConfigureModel(ModelBuilder builder)
        => builder.Entity<Resource>(entity => {
            entity.ToTable("Resources");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Path).IsRequired().HasMaxLength(128);
            entity.Property(e => e.ContentType).IsRequired().HasMaxLength(64);
            entity.Property(e => e.FileName).HasMaxLength(128);
            entity.Property(e => e.FileSize);
            entity.Property(e => e.ImageSize);
            entity.Property(e => e.Duration);
        });
}
