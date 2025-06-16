namespace VttTools.Data.Builders;

/// <summary>
/// Configures the EF model for the Epic entity.
/// </summary>
internal static class EpicSchemaBuilder {
    public static void ConfigureModel(ModelBuilder builder)
        => builder.Entity<Library.Entities.Epic>(entity => {
            _ = entity.ToTable("Epics");
            _ = entity.HasKey(e => e.Id);
            _ = entity.Property(e => e.OwnerId).IsRequired();
            _ = entity.Property(e => e.Name).IsRequired().HasMaxLength(128);
            _ = entity.Property(e => e.Description).IsRequired().HasMaxLength(4096);
            _ = entity.HasOne(s => s.Display)
                  .WithMany()
                  .HasForeignKey(s => s.DisplayId)
                  .OnDelete(DeleteBehavior.Restrict);
            _ = entity.Property(e => e.IsPublished).IsRequired();
            _ = entity.Property(e => e.IsPublic).IsRequired();
            _ = entity.HasMany(e => e.Campaigns).WithOne(e => e.Epic)
                  .HasForeignKey(c => c.EpicId).OnDelete(DeleteBehavior.Cascade);
        });
}