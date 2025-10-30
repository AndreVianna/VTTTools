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
            entity.Property(e => e.Visibility).IsRequired().HasDefaultValue(WallVisibility.Normal);
            entity.Property(e => e.IsClosed).IsRequired().HasDefaultValue(false);
            entity.Property(e => e.Material).HasMaxLength(64);
            entity.Property(e => e.CreatedAt).IsRequired();

            entity.OwnsMany(e => e.Poles, poles => {
                poles.ToJson();
                poles.Property(p => p.X).IsRequired();
                poles.Property(p => p.Y).IsRequired();
                poles.Property(p => p.H).IsRequired();
            });
        });

        builder.Entity<SceneBarrier>(entity => {
            entity.ToTable("SceneBarriers");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.SceneId).IsRequired();
            entity.Property(e => e.BarrierId).IsRequired();

            entity.OwnsMany(e => e.Poles, poles => {
                poles.ToJson();
                poles.Property(p => p.X).IsRequired();
                poles.Property(p => p.Y).IsRequired();
                poles.Property(p => p.H).IsRequired();
            });

            entity.HasOne(e => e.Scene)
                .WithMany(s => s.SceneBarriers)
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