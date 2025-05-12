namespace VttTools.Data.Builders;

/// <summary>
/// Configures the EF model for the Adventure entity.
/// </summary>
internal static class AdventureSchemaBuilder {
    public static void ConfigureModel(ModelBuilder builder)
        => builder.Entity<Adventure>(entity => {
            entity.ToTable("Adventures");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.OwnerId).IsRequired();
            entity.Property(e => e.Name).IsRequired().HasMaxLength(128);
            entity.Property(e => e.Description).IsRequired().HasMaxLength(1024);
            entity.Property(e => e.Type).IsRequired().HasConversion<string>();
            entity.Property(e => e.ImagePath).HasMaxLength(512);
            entity.Property(e => e.IsVisible).IsRequired().HasDefaultValue(false);
            entity.Property(e => e.IsPublic).IsRequired().HasDefaultValue(false);
            entity.Property(e => e.ParentId);
            entity.Property(e => e.TemplateId);
            entity.HasMany(e => e.Scenes).WithOne(e => e.Adventure).IsRequired()
                                           .HasForeignKey(ep => ep.ParentId)
                                           .OnDelete(DeleteBehavior.Cascade);
        });
}