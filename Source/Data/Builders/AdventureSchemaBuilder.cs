using AdventureEntity = VttTools.Data.Library.Entities.Adventure;

namespace VttTools.Data.Builders;

/// <summary>
/// Configures the EF model for the Adventure entity.
/// </summary>
internal static class AdventureSchemaBuilder {
    public static void ConfigureModel(ModelBuilder builder)
        => builder.Entity<AdventureEntity>(entity => {
            entity.ToTable("Adventures");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.OwnerId).IsRequired();
            entity.Property(e => e.CampaignId);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(128);
            entity.Property(e => e.Description).IsRequired().HasMaxLength(4096);
            entity.Property(e => e.Type).IsRequired().HasConversion<string>();
            entity.HasOne(s => s.Display)
                  .WithMany()
                  .HasForeignKey(s => s.DisplayId)
                  .OnDelete(DeleteBehavior.Cascade);
            entity.Property(e => e.IsPublished).IsRequired();
            entity.Property(e => e.IsPublic).IsRequired();
            entity.HasMany(e => e.Scenes).WithOne(e => e.Adventure)
                  .HasForeignKey(ep => ep.AdventureId).OnDelete(DeleteBehavior.Cascade);
        });
}