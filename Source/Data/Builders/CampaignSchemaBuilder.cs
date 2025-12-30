using Campaign = VttTools.Data.Library.Campaigns.Entities.Campaign;

namespace VttTools.Data.Builders;

/// <summary>
/// Configures the EF model for the Campaign entity.
/// </summary>
internal static class CampaignSchemaBuilder {
    public static void ConfigureModel(ModelBuilder builder) => builder.Entity<Campaign>(entity => {
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
        entity.HasOne(e => e.Background).WithMany()
              .HasForeignKey(e => e.BackgroundId).IsRequired(false)
              .OnDelete(DeleteBehavior.SetNull);
    });
}