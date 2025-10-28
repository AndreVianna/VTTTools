using Barrier = VttTools.Data.Library.Entities.Barrier;
using SceneBarrier = VttTools.Data.Library.Entities.SceneBarrier;

namespace VttTools.Data.Builders;

internal static class BarrierSchemaBuilder {
    public static void ConfigureModel(ModelBuilder builder) {
        builder.Entity<Barrier>(entity => {
            entity.ToTable("Barriers");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.OwnerId).IsRequired();
            entity.Property(e => e.Name).IsRequired().HasMaxLength(128);
            entity.Property(e => e.Description).HasMaxLength(4096);
            entity.Property(e => e.IsOpaque).IsRequired().HasDefaultValue(true);
            entity.Property(e => e.IsSolid).IsRequired().HasDefaultValue(true);
            entity.Property(e => e.IsSecret).IsRequired().HasDefaultValue(false);
            entity.Property(e => e.IsOpenable).IsRequired().HasDefaultValue(false);
            entity.Property(e => e.IsLocked).IsRequired().HasDefaultValue(false);
            entity.Property(e => e.CreatedAt).IsRequired();
        });

        builder.Entity<SceneBarrier>(entity => {
            entity.ToTable("SceneBarriers");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.SceneId).IsRequired();
            entity.Property(e => e.BarrierId).IsRequired();
            entity.Property(e => e.IsOpen);
            entity.Property(e => e.IsLocked);

            entity.OwnsMany(e => e.Vertices, vertices => {
                vertices.ToJson();
                vertices.Property(v => v.X).IsRequired();
                vertices.Property(v => v.Y).IsRequired();
            });

            entity.HasOne(e => e.Scene)
                .WithMany()
                .HasForeignKey(e => e.SceneId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Barrier)
                .WithMany()
                .HasForeignKey(e => e.BarrierId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasIndex(e => e.SceneId);
            entity.HasIndex(e => e.BarrierId);
        });
    }
}
