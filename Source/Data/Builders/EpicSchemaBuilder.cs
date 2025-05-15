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
            entity.Property(e => e.Name).IsRequired().HasMaxLength(128);
            entity.Property(e => e.Description).IsRequired().HasMaxLength(4096);
            entity.Property(e => e.ImageId);
            entity.Property(e => e.IsListed).IsRequired();
            entity.Property(e => e.IsPublic).IsRequired();
            entity.HasMany(e => e.Campaigns).WithOne(e => e.Epic)
                  .HasForeignKey(c => c.EpicId).OnDelete(DeleteBehavior.Cascade);
        });
}