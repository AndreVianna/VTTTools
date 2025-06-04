namespace VttTools.Data.Builders;

/// <summary>
/// Configures the EF model for the Epic entity.
/// </summary>
internal static class EpicSchemaBuilder {
    public static void ConfigureModel(ModelBuilder builder)
        => builder.Entity<Library.Entities.Epic>(entity => {
            entity.ToTable("Epics");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.OwnerId).IsRequired();
            entity.Property(e => e.Name).IsRequired().HasMaxLength(128);
            entity.Property(e => e.Description).IsRequired().HasMaxLength(4096);
            entity.ComplexProperty(s => s.Display, displayBuilder => {
                displayBuilder.IsRequired();
                displayBuilder.Property(s => s.Id);
                displayBuilder.Property(s => s.Type).IsRequired().HasConversion<string>().HasDefaultValue(ResourceType.Undefined);
                displayBuilder.ComplexProperty(s => s.Size, sizeBuilder => {
                    sizeBuilder.IsRequired();
                    sizeBuilder.Property(s => s.Width).IsRequired().HasDefaultValue(0);
                    sizeBuilder.Property(s => s.Height).IsRequired().HasDefaultValue(0);
                });
            });
            entity.Property(e => e.IsPublished).IsRequired();
            entity.Property(e => e.IsPublic).IsRequired();
            entity.HasMany(e => e.Campaigns).WithOne(e => e.Epic)
                  .HasForeignKey(c => c.EpicId).OnDelete(DeleteBehavior.Cascade);
        });
}