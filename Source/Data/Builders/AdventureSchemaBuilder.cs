using Adventure = VttTools.Data.Library.Entities.Adventure;
using AdventureResource = VttTools.Data.Library.Entities.AdventureResource;

namespace VttTools.Data.Builders;

/// <summary>
/// Configures the EF model for the Adventure entity.
/// </summary>
internal static class AdventureSchemaBuilder {
    public static void ConfigureModel(ModelBuilder builder) {
        builder.Entity<Adventure>(entity => {
            entity.ToTable("Adventures");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.OwnerId).IsRequired();
            entity.Property(e => e.WorldId).IsRequired(false);
            entity.Property(e => e.CampaignId).IsRequired(false);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(128);
            entity.Property(e => e.Description).IsRequired().HasMaxLength(4096);
            entity.Property(e => e.Style).IsRequired().HasConversion<string>();
            entity.Property(e => e.IsOneShot).IsRequired();
            entity.Property(e => e.IsPublished).IsRequired();
            entity.Property(e => e.IsPublic).IsRequired();
            entity.HasMany(e => e.Encounters).WithOne(e => e.Adventure)
                  .HasForeignKey(ep => ep.AdventureId).IsRequired().OnDelete(DeleteBehavior.Cascade);
        });

        builder.Entity<AdventureResource>(entity => {
            entity.ToTable("AdventureResources");
            entity.HasKey(e => new { e.AdventureId, e.ResourceId });
            entity.Property(e => e.Role).IsRequired().HasConversion<string>();
            entity.Property(e => e.Index).IsRequired();
            entity.HasIndex(e => new { e.AdventureId, e.Role, e.Index }).IsUnique();
            entity.HasOne(e => e.Resource)
                .WithMany()
                .HasForeignKey(e => e.ResourceId)
                .OnDelete(DeleteBehavior.Restrict);
            entity.HasOne(e => e.Adventure)
                .WithMany(e => e.Resources)
                .HasForeignKey(e => e.AdventureId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
}