using Resource = VttTools.Data.Media.Entities.Resource;

namespace VttTools.Data.Builders;

internal static class ResourceSchemaBuilder {
    // With junction tables architecture, Role is stored in junction tables (AssetToken, etc.)
    // not in the Display table. Resources are pure media metadata.
    public static void ConfigureModel(ModelBuilder builder)
        => builder.Entity<Resource>(entity => {
            entity.ToTable("Resources");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.ContentType).IsRequired().HasMaxLength(64);
            entity.Property(e => e.Path).IsRequired().HasMaxLength(512);
            entity.Property(e => e.FileName).HasMaxLength(128);
            entity.Property(e => e.FileSize).HasDefaultValue(0);
            entity.OwnsOne(e => e.Dimensions, scaleBuilder => {
                scaleBuilder.Property(s => s.Width).IsRequired().HasDefaultValue(0).HasColumnName(nameof(Size.Width));
                scaleBuilder.Property(s => s.Height).IsRequired().HasDefaultValue(0).HasColumnName(nameof(Size.Height));
            });
            entity.Property(e => e.Duration).HasDefaultValue(TimeSpan.Zero);
            entity.HasIndex(e => new { e.Path, e.FileName });
        });
}