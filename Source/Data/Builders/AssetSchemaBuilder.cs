using Asset = VttTools.Data.Assets.Entities.Asset;

namespace VttTools.Data.Builders;

internal static class AssetSchemaBuilder {
    public static void ConfigureModel(ModelBuilder builder)
        => builder.Entity<Asset>(entity => {
            _ = entity.ToTable("Assets");
            _ = entity.HasKey(e => e.Id);
            _ = entity.Property(e => e.OwnerId).IsRequired();
            _ = entity.Property(e => e.Type).IsRequired().HasDefaultValue(AssetType.Placeholder).HasConversion<string>();
            _ = entity.Property(e => e.Name).IsRequired().HasMaxLength(128);
            _ = entity.Property(e => e.Description).IsRequired().HasMaxLength(4096);
            _ = entity.Property(e => e.IsPublished).IsRequired();
            _ = entity.Property(e => e.IsPublic).IsRequired();
            _ = entity.HasOne(e => e.Display)
                .WithMany()
                .HasForeignKey(e => e.Id)
                .OnDelete(DeleteBehavior.Restrict);
        });
}