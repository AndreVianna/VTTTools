namespace VttTools.Data.Builders;

/// <summary>
/// Configures the EF model for the Campaign entity.
/// </summary>
internal static class CampaignSchemaBuilder {
    public static void ConfigureModel(ModelBuilder builder)
        => builder.Entity<Campaign>(entity => {
            entity.ToTable("Campaigns");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.OwnerId).IsRequired();
            entity.Property(e => e.ParentId);
            entity.Property(e => e.TemplateId);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(128);
            entity.Property(e => e.Visibility).IsRequired();
            entity.HasMany(e => e.Adventures).WithOne(e => e.Campaign)
                  .HasForeignKey(a => a.ParentId).OnDelete(DeleteBehavior.Cascade);
        });
}