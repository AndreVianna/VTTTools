namespace VttTools.Data.Builders;

/// <summary>
/// Configures the EF model for the Epic entity.
/// </summary>
internal static class EpicSchemaBuilder {
    public static void ConfigureModel(ModelBuilder builder)
        => builder.Entity<Epic>(entity => {
            entity.ToTable("Epics");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.OwnerId).IsRequired();
            entity.Property(e => e.TemplateId);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(128);
            entity.Property(e => e.Visibility).IsRequired();
            entity.HasMany(e => e.Campaigns).WithOne(e => e.Epic)
                  .HasForeignKey(c => c.ParentId).OnDelete(DeleteBehavior.Cascade);
        });
}