using World = VttTools.Data.Library.Worlds.Entities.World;

namespace VttTools.Data.Builders;

internal static class WorldSchemaBuilder {
    public static void ConfigureModel(ModelBuilder builder) => builder.Entity<World>(entity => {
        entity.ToTable("Worlds");
        entity.HasKey(e => e.Id);
        entity.Property(e => e.OwnerId).IsRequired();
        entity.Property(e => e.Name).IsRequired().HasMaxLength(128);
        entity.Property(e => e.Description).IsRequired().HasMaxLength(4096);
        entity.Property(e => e.IsPublished).IsRequired();
        entity.Property(e => e.IsPublic).IsRequired();
        entity.HasMany(e => e.Campaigns).WithOne(e => e.World)
              .HasForeignKey(c => c.WorldId).IsRequired(false)
              .OnDelete(DeleteBehavior.Restrict);
        entity.HasMany(e => e.Adventures).WithOne(e => e.World)
              .HasForeignKey(c => c.WorldId).IsRequired(false)
              .OnDelete(DeleteBehavior.Restrict);
        entity.HasOne(e => e.Background).WithMany()
              .HasForeignKey(e => e.BackgroundId).IsRequired(false)
              .OnDelete(DeleteBehavior.SetNull);
    });
}