using Asset = VttTools.Data.Assets.Entities.Asset;

namespace VttTools.Data.Builders;

internal static class AssetSchemaBuilder {
    public static void ConfigureModel(ModelBuilder builder)
        => builder.Entity<Asset>(entity => {
            entity.ToTable("Assets");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.OwnerId).IsRequired();
            entity.Property(e => e.Type).IsRequired().HasDefaultValue(AssetType.Placeholder).HasConversion<string>();
            entity.Property(e => e.Name).IsRequired().HasMaxLength(128);
            entity.Property(e => e.Description).IsRequired().HasMaxLength(4096);
            entity.Property(e => e.IsPublished).IsRequired();
            entity.Property(e => e.IsPublic).IsRequired();
            entity.HasOne(e => e.Resource)
                .WithMany()
                .HasForeignKey(e => e.ResourceId)
                .OnDelete(DeleteBehavior.Restrict);
        });
}