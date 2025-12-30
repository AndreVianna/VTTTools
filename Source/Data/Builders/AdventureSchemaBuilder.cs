using Adventure = VttTools.Data.Library.Adventures.Entities.Adventure;

namespace VttTools.Data.Builders;

internal static class AdventureSchemaBuilder {
    public static void ConfigureModel(ModelBuilder builder) => builder.Entity<Adventure>(entity => {
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
        entity.HasOne(e => e.Background).WithMany()
              .HasForeignKey(e => e.BackgroundId).IsRequired(false)
              .OnDelete(DeleteBehavior.SetNull);
    });
}