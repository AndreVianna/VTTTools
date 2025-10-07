using Structure = VttTools.Data.Library.Entities.Structure;
using SceneStructure = VttTools.Data.Library.Entities.SceneStructure;

namespace VttTools.Data.Builders;

internal static class StructureSchemaBuilder {
    public static void ConfigureModel(ModelBuilder builder) {
        // Configure Structure template entity
        builder.Entity<Structure>(entity => {
            entity.ToTable("Structures");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.OwnerId).IsRequired();
            entity.Property(e => e.Name).IsRequired().HasMaxLength(128);
            entity.Property(e => e.Description).HasMaxLength(4096);
            entity.Property(e => e.IsBlocking).IsRequired().HasDefaultValue(true);
            entity.Property(e => e.IsOpaque).IsRequired().HasDefaultValue(true);
            entity.Property(e => e.IsSecret).IsRequired().HasDefaultValue(false);
            entity.Property(e => e.IsOpenable).IsRequired().HasDefaultValue(false);
            entity.Property(e => e.IsLocked).IsRequired().HasDefaultValue(false);
            entity.Property(e => e.CreatedAt).IsRequired();
            entity.HasOne(e => e.Visual)
                .WithMany()
                .HasForeignKey(e => e.VisualResourceId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // Configure SceneStructure placement entity
        builder.Entity<SceneStructure>(entity => {
            entity.ToTable("SceneStructures");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.SceneId).IsRequired();
            entity.Property(e => e.StructureId).IsRequired();
            entity.Property(e => e.IsOpen);
            entity.Property(e => e.IsLocked);
            entity.Property(e => e.IsSecret);

            // Store vertices as JSON (List<Point>)
            entity.OwnsMany(e => e.Vertices, vertices => {
                vertices.ToJson();
                vertices.Property(v => v.X).IsRequired();
                vertices.Property(v => v.Y).IsRequired();
            });

            entity.HasOne(e => e.Scene)
                .WithMany()
                .HasForeignKey(e => e.SceneId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Structure)
                .WithMany()
                .HasForeignKey(e => e.StructureId)
                .OnDelete(DeleteBehavior.Restrict);
        });
    }
}
