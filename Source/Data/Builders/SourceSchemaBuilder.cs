using SceneSource = VttTools.Data.Library.Entities.SceneSource;
using Source = VttTools.Data.Library.Entities.Source;

namespace VttTools.Data.Builders;

internal static class SourceSchemaBuilder {
    public static void ConfigureModel(ModelBuilder builder) {
        builder.Entity<Source>(entity => {
            entity.ToTable("Sources");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.OwnerId).IsRequired();
            entity.Property(e => e.Name).IsRequired().HasMaxLength(128);
            entity.Property(e => e.Description).HasMaxLength(4096);
            entity.Property(e => e.SourceType).IsRequired().HasMaxLength(64);
            entity.Property(e => e.DefaultRange).IsRequired().HasPrecision(5, 2).HasDefaultValue(5.0m);
            entity.Property(e => e.DefaultIntensity).IsRequired().HasPrecision(3, 2).HasDefaultValue(1.0m);
            entity.Property(e => e.DefaultIsGradient).IsRequired().HasDefaultValue(true);
            entity.Property(e => e.CreatedAt).IsRequired();
        });

        builder.Entity<SceneSource>(entity => {
            entity.ToTable("SceneSources");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.SceneId).IsRequired();
            entity.Property(e => e.SourceId).IsRequired();
            entity.Property(e => e.Range).IsRequired().HasPrecision(5, 2).HasDefaultValue(5.0m);
            entity.Property(e => e.Intensity).IsRequired().HasPrecision(3, 2).HasDefaultValue(1.0m);
            entity.Property(e => e.IsGradient).IsRequired().HasDefaultValue(true);

            entity.ComplexProperty(e => e.Position, position => {
                position.IsRequired();
                position.Property(p => p.X).IsRequired().HasDefaultValue(0.0);
                position.Property(p => p.Y).IsRequired().HasDefaultValue(0.0);
            });

            entity.HasOne(e => e.Scene)
                .WithMany()
                .HasForeignKey(e => e.SceneId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Source)
                .WithMany()
                .HasForeignKey(e => e.SourceId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasIndex(e => e.SceneId);
            entity.HasIndex(e => e.SourceId);
        });
    }
}