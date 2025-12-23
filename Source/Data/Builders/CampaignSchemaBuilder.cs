using Campaign = VttTools.Data.Library.Entities.Campaign;
using CampaignResource = VttTools.Data.Library.Entities.CampaignResource;

namespace VttTools.Data.Builders;

/// <summary>
/// Configures the EF model for the Campaign entity.
/// </summary>
internal static class CampaignSchemaBuilder {
    public static void ConfigureModel(ModelBuilder builder) {
        builder.Entity<Campaign>(entity => {
            entity.ToTable("Campaigns");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.OwnerId).IsRequired();
            entity.Property(e => e.WorldId).IsRequired(false);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(128);
            entity.Property(e => e.Description).IsRequired().HasMaxLength(4096);
            entity.Property(e => e.IsPublished).IsRequired();
            entity.Property(e => e.IsPublic).IsRequired();
            entity.HasMany(e => e.Adventures).WithOne(e => e.Campaign)
                  .HasForeignKey(a => a.CampaignId).IsRequired(false)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        builder.Entity<CampaignResource>(entity => {
            entity.ToTable("CampaignResources");
            entity.HasKey(e => new { e.CampaignId, e.ResourceId });
            entity.Property(e => e.Role).IsRequired().HasConversion<string>();
            entity.Property(e => e.Index).IsRequired();
            entity.HasIndex(e => new { e.CampaignId, e.Role, e.Index }).IsUnique();
            entity.HasOne(e => e.Resource)
                .WithMany()
                .HasForeignKey(e => e.ResourceId)
                .OnDelete(DeleteBehavior.Restrict);
            entity.HasOne(e => e.Campaign)
                .WithMany(e => e.Resources)
                .HasForeignKey(e => e.CampaignId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
}