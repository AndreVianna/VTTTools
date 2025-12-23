using World = VttTools.Data.Library.Entities.World;
using WorldResource = VttTools.Data.Library.Entities.WorldResource;

namespace VttTools.Data.Builders;

/// <summary>
/// Configures the EF model for the World entity.
/// </summary>
internal static class WorldSchemaBuilder {
    public static void ConfigureModel(ModelBuilder builder) {
        builder.Entity<World>(entity => {
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
        });

        builder.Entity<WorldResource>(entity => {
            entity.ToTable("WorldResources");
            entity.HasKey(e => new { e.WorldId, e.ResourceId });
            entity.Property(e => e.Role).IsRequired().HasConversion<string>();
            entity.Property(e => e.Index).IsRequired();
            entity.HasIndex(e => new { e.WorldId, e.Role, e.Index }).IsUnique();
            entity.HasOne(e => e.Resource)
                .WithMany()
                .HasForeignKey(e => e.ResourceId)
                .OnDelete(DeleteBehavior.Restrict);
            entity.HasOne(e => e.World)
                .WithMany(e => e.Resources)
                .HasForeignKey(e => e.WorldId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
}