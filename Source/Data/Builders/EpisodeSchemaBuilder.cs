namespace VttTools.Data.Builders;

/// <summary>
/// Configures the EF model for the Episode entity.
/// </summary>
internal static class EpisodeSchemaBuilder {
    public static void ConfigureModel(ModelBuilder builder) {
        builder.Entity<Episode>(entity => {
            entity.ToTable("Episodes");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.OwnerId).IsRequired();
            entity.Property(e => e.Visibility).IsRequired();
            entity.Property(e => e.Name).IsRequired().HasMaxLength(128);
            entity.Property(e => e.ParentId).IsRequired();
            entity.Property(e => e.IsTemplate).IsRequired();
            entity.Property(e => e.TemplateId);
            entity.OwnsOne(e => e.Stage, stageBuilder => {
                stageBuilder.Property(s => s.MapType).IsRequired();
                stageBuilder.Property(s => s.Source).HasMaxLength(512);
                stageBuilder.OwnsOne(s => s.Size);
                stageBuilder.OwnsOne(s => s.Grid, gridBuilder => {
                    gridBuilder.OwnsOne(g => g.Offset);
                    gridBuilder.OwnsOne(g => g.CellSize);
                });
            });
        });
        builder.Entity<EpisodeAsset>(entity => {
            entity.ToTable("EpisodeAssets");
            entity.HasKey(ea => ea.Id);
            entity.Property(ea => ea.Name).IsRequired().HasMaxLength(128);
            entity.Property(ea => ea.IsLocked);
            entity.Property(ea => ea.ControlledBy);
            entity.Property(ea => ea.Scale).HasDefaultValue(1);
            entity.OwnsOne(ea => ea.Position);
            entity.HasOne(ea => ea.Episode).WithMany(e => e.EpisodeAssets).IsRequired()
                                           .HasForeignKey(ea => ea.EpisodeId)
                                           .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(ea => ea.Asset).WithMany().IsRequired()
                                         .HasForeignKey(ea => ea.EpisodeId)
                                         .OnDelete(DeleteBehavior.Cascade);
        });
    }
}