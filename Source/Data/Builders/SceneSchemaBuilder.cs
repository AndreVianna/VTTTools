namespace VttTools.Data.Builders;

/// <summary>
/// Configures the EF model for the Scene entity.
/// </summary>
internal static class SceneSchemaBuilder {
    public static void ConfigureModel(ModelBuilder builder) {
        builder.Entity<Scene>(entity => {
            entity.ToTable("Scenes");
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
        builder.Entity<SceneAsset>(entity => {
            entity.ToTable("SceneAssets");
            entity.HasKey(ea => ea.Id);
            entity.Property(ea => ea.Name).IsRequired().HasMaxLength(128);
            entity.Property(ea => ea.IsLocked);
            entity.Property(ea => ea.ControlledBy);
            entity.Property(ea => ea.Scale).HasDefaultValue(1);
            entity.OwnsOne(ea => ea.Position);
            entity.HasOne(ea => ea.Scene).WithMany(e => e.SceneAssets).IsRequired()
                                           .HasForeignKey(ea => ea.SceneId)
                                           .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(ea => ea.Asset).WithMany().IsRequired()
                                         .HasForeignKey(ea => ea.SceneId)
                                         .OnDelete(DeleteBehavior.Cascade);
        });
    }
}