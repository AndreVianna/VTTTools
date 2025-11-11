using World = VttTools.Data.Library.Entities.World;

namespace VttTools.Data.Builders;

/// <summary>
/// Configures the EF model for the World entity.
/// </summary>
internal static class WorldSchemaBuilder {
    public static void ConfigureModel(ModelBuilder builder)
        => builder.Entity<World>(entity => {
            entity.ToTable("Worlds");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.OwnerId).IsRequired();
            entity.Property(e => e.Name).IsRequired().HasMaxLength(128);
            entity.Property(e => e.Description).IsRequired().HasMaxLength(4096);
            entity.HasOne(s => s.Background).WithMany()
                  .HasForeignKey(s => s.BackgroundId).IsRequired(false)
                  .OnDelete(DeleteBehavior.Restrict);
            entity.Property(e => e.IsPublished).IsRequired();
            entity.Property(e => e.IsPublic).IsRequired();
            entity.HasMany(e => e.Campaigns).WithOne(e => e.World)
                  .HasForeignKey(c => c.WorldId).IsRequired(false)
                  .OnDelete(DeleteBehavior.Restrict);
            entity.HasMany(e => e.Adventures).WithOne(e => e.World)
                  .HasForeignKey(c => c.WorldId).IsRequired(false)
                  .OnDelete(DeleteBehavior.Restrict);
        });
}