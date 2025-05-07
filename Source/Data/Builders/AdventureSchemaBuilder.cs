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
            entity.Property(e => e.Visibility).IsRequired();
            entity.Property(e => e.Name).IsRequired().HasMaxLength(128);
            entity.Property(e => e.ParentId);
            entity.Property(e => e.TemplateId);
            entity.HasMany(e => e.Scenes).WithOne(e => e.Adventure).IsRequired()
                                           .HasForeignKey(ep => ep.ParentId)
                                           .OnDelete(DeleteBehavior.Cascade);
        });
}