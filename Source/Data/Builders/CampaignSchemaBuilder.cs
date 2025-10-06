namespace VttTools.Data.Builders;

/// <summary>
/// Configures the EF model for the Campaign entity.
/// </summary>
internal static class CampaignSchemaBuilder {
    public static void ConfigureModel(ModelBuilder builder)
        => builder.Entity<Library.Entities.Campaign>(entity => {
            entity.ToTable("Campaigns");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.OwnerId).IsRequired();
            entity.Property(e => e.EpicId);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(128);
            entity.Property(e => e.Description).IsRequired().HasMaxLength(4096);
            entity.HasOne(s => s.Resource)
                  .WithMany()
                  .HasForeignKey(s => s.ResourceId)
                  .OnDelete(DeleteBehavior.Restrict);
            entity.Property(e => e.IsPublished).IsRequired();
            entity.Property(e => e.IsPublic).IsRequired();
            entity.HasMany(e => e.Adventures).WithOne(e => e.Campaign)
                  .HasForeignKey(a => a.CampaignId).OnDelete(DeleteBehavior.Cascade);
        });
}