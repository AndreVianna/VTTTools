namespace VttTools.Data.Builders;

internal static class AssetSchemaBuilder {
    public static void ConfigureModel(ModelBuilder builder)
        => builder.Entity<Asset>(entity => {
            entity.ToTable("Assets");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.OwnerId).IsRequired();
            entity.Property(e => e.Type).IsRequired().HasConversion<string>();
            entity.Property(e => e.Name).IsRequired().HasMaxLength(128);
            entity.Property(e => e.Description).IsRequired().HasMaxLength(4096);
            entity.Property(e => e.Display).IsRequired();
            entity.Property(e => e.IsListed).IsRequired();
            entity.Property(e => e.IsPublic).IsRequired();
            entity.OwnsOne(e => e.Display, displayBuilder => {
                displayBuilder.Property(s => s.Type).IsRequired();
                displayBuilder.Property(s => s.SourceId);
                displayBuilder.OwnsOne(s => s.Size);
            });
        });
}