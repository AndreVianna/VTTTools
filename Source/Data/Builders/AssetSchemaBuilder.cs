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
            entity.ComplexProperty(e => e.Shape, shapeBuilder => {
                shapeBuilder.IsRequired();
                shapeBuilder.Property(s => s.Type).IsRequired().HasConversion<string>().HasDefaultValue(MediaType.Image);
                shapeBuilder.Property(s => s.SourceId);
                shapeBuilder.ComplexProperty(s => s.Size, sizeBuilder => {
                    sizeBuilder.IsRequired();
                    sizeBuilder.Property(s => s.X).IsRequired().HasDefaultValue(0);
                    sizeBuilder.Property(s => s.Y).IsRequired().HasDefaultValue(0);
                });
            });
        });
}