using VttTools.Data.Media.Entities;

using Resource = VttTools.Data.Media.Entities.Resource;

namespace VttTools.Data.Builders;

internal static class ResourceSchemaBuilder {
    public static void ConfigureModel(ModelBuilder builder) {
        builder.Entity<Resource>(entity => {
            entity.ToTable("Resources");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Description).IsRequired(false).HasMaxLength(1024);
            entity.Property(e => e.Type).IsRequired().HasConversion<string>().HasDefaultValue(ResourceType.Undefined);
            entity.Property(e => e.Path).IsRequired().HasMaxLength(512);
            entity.Property(e => e.ContentType).IsRequired().HasMaxLength(64);
            entity.Property(e => e.FileName).HasMaxLength(128);
            entity.Property(e => e.FileLength).HasDefaultValue(0);
            entity.OwnsOne(e => e.Size, scaleBuilder => {
                scaleBuilder.Property(s => s.Width).IsRequired().HasDefaultValue(0).HasColumnName("Width");
                scaleBuilder.Property(s => s.Height).IsRequired().HasDefaultValue(0).HasColumnName("Height");
            });
            entity.Property(e => e.Duration).HasDefaultValue(TimeSpan.Zero);
            entity.HasMany(e => e.Features)
                .WithOne(e => e.Resource)
                .HasForeignKey(e => e.ResourceId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.Property(e => e.IsPublished).IsRequired().HasDefaultValue(false);
            entity.Property(e => e.IsPublic).IsRequired().HasDefaultValue(false);
        });

        builder.Entity<ResourceFeature>(entity => {
            entity.ToTable("ResourceFeatures");
            entity.HasKey(e => new { e.ResourceId, e.Key, e.Index });
            entity.Property(e => e.Key).IsRequired().HasMaxLength(32);
            entity.Property(e => e.Index).IsRequired();
            entity.Property(e => e.Value).IsRequired().HasMaxLength(128);
        });
    }
}