using Effect = VttTools.Data.Library.Entities.Effect;
using SceneEffect = VttTools.Data.Library.Entities.SceneEffect;

namespace VttTools.Data.Builders;

internal static class EffectSchemaBuilder {
    public static void ConfigureModel(ModelBuilder builder) {
        // Configure Effect template entity
        builder.Entity<Effect>(entity => {
            entity.ToTable("Effects");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.OwnerId).IsRequired();
            entity.Property(e => e.Name).IsRequired().HasMaxLength(128);
            entity.Property(e => e.Description).HasMaxLength(4096);
            entity.Property(e => e.Shape).IsRequired().HasConversion<string>();
            entity.Property(e => e.Size).IsRequired();
            entity.Property(e => e.Direction);
            entity.Property(e => e.BoundedByStructures).IsRequired().HasDefaultValue(true);
            entity.Property(e => e.Category).HasMaxLength(50);
            entity.Property(e => e.CreatedAt).IsRequired();
            entity.HasOne(e => e.Visual)
                .WithMany()
                .HasForeignKey(e => e.VisualResourceId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // Configure SceneEffect placement entity
        builder.Entity<SceneEffect>(entity => {
            entity.ToTable("SceneEffects");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.SceneId).IsRequired();
            entity.Property(e => e.EffectId).IsRequired();
            entity.Property(e => e.Size);
            entity.Property(e => e.Direction);

            // Store Origin as ComplexProperty (Point)
            entity.ComplexProperty(e => e.Origin, origin => {
                origin.IsRequired();
                origin.Property(p => p.X).IsRequired();
                origin.Property(p => p.Y).IsRequired();
            });

            entity.HasOne(e => e.Scene)
                .WithMany()
                .HasForeignKey(e => e.SceneId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Effect)
                .WithMany()
                .HasForeignKey(e => e.EffectId)
                .OnDelete(DeleteBehavior.Restrict);
        });
    }
}