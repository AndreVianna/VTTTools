using AdventureEntity = VttTools.Data.Library.Entities.Adventure;

namespace VttTools.Data.Builders;

/// <summary>
/// Configures the EF model for the Adventure entity.
/// </summary>
internal static class AdventureSchemaBuilder {
    public static void ConfigureModel(ModelBuilder builder)
        => builder.Entity<AdventureEntity>(entity => {
            _ = entity.ToTable("Adventures");
            _ = entity.HasKey(e => e.Id);
            _ = entity.Property(e => e.OwnerId).IsRequired();
            _ = entity.Property(e => e.CampaignId);
            _ = entity.Property(e => e.Name).IsRequired().HasMaxLength(128);
            _ = entity.Property(e => e.Description).IsRequired().HasMaxLength(4096);
            _ = entity.Property(e => e.Type).IsRequired().HasConversion<string>();
            _ = entity.HasOne(s => s.Background)
                  .WithMany()
                  .HasForeignKey(s => s.BackgroundId)
                  .OnDelete(DeleteBehavior.Restrict);
            _ = entity.Property(e => e.IsPublished).IsRequired();
            _ = entity.Property(e => e.IsPublic).IsRequired();
            _ = entity.HasMany(e => e.Scenes).WithOne(e => e.Adventure)
                  .HasForeignKey(ep => ep.AdventureId).OnDelete(DeleteBehavior.Cascade);
        });
}