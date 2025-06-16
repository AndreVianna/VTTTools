namespace VttTools.Data.Builders;

/// <summary>
/// Configures the EF model for the Campaign entity.
/// </summary>
internal static class CampaignSchemaBuilder {
    public static void ConfigureModel(ModelBuilder builder)
        => builder.Entity<Library.Entities.Campaign>(entity => {
            _ = entity.ToTable("Campaigns");
            _ = entity.HasKey(e => e.Id);
            _ = entity.Property(e => e.OwnerId).IsRequired();
            _ = entity.Property(e => e.EpicId);
            _ = entity.Property(e => e.Name).IsRequired().HasMaxLength(128);
            _ = entity.Property(e => e.Description).IsRequired().HasMaxLength(4096);
            _ = entity.HasOne(s => s.Display)
                  .WithMany()
                  .HasForeignKey(s => s.DisplayId)
                  .OnDelete(DeleteBehavior.Restrict);
            _ = entity.Property(e => e.IsPublished).IsRequired();
            _ = entity.Property(e => e.IsPublic).IsRequired();
            _ = entity.HasMany(e => e.Adventures).WithOne(e => e.Campaign)
                  .HasForeignKey(a => a.CampaignId).OnDelete(DeleteBehavior.Cascade);
        });
}