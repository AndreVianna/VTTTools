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
            entity.Property(e => e.AdventureId).IsRequired();
            entity.Property(e => e.Name).IsRequired().HasMaxLength(128);
            entity.Property(e => e.Description).IsRequired().HasMaxLength(4096);
            entity.Property(e => e.IsListed).IsRequired();
            entity.Property(e => e.IsPublic).IsRequired();
            entity.OwnsOne(e => e.Stage, stageBuilder => {
                stageBuilder.Property(s => s.Source).HasMaxLength(512);
                stageBuilder.OwnsOne(s => s.Size);
                stageBuilder.OwnsOne(s => s.Grid, gridBuilder => {
                    gridBuilder.Property(g => g.Type).IsRequired();
                    gridBuilder.OwnsOne(g => g.Offset);
                    gridBuilder.OwnsOne(g => g.CellSize);
                });
            });
        });
        builder.Entity<SceneAsset>(entity => {
            entity.ToTable("SceneAssets");
            entity.HasKey(ea => new { ea.AssetId, ea.SceneId, ea.Number });
            entity.Property(ea => ea.AssetId).IsRequired();
            entity.Property(ea => ea.SceneId).IsRequired();
            entity.Property(ea => ea.Number).IsRequired();
            entity.Property(ea => ea.Name).IsRequired().HasMaxLength(128);
            entity.Property(ea => ea.Scale).HasDefaultValue(1.0d);
            entity.OwnsOne(ea => ea.Position);
            entity.OwnsOne(e => e.Format, formatBuilder => {
                formatBuilder.Property(s => s.Type).IsRequired();
                formatBuilder.Property(s => s.SourceId);
                formatBuilder.OwnsOne(s => s.Size);
            });
            entity.HasOne(ea => ea.Scene).WithMany(e => e.SceneAssets).IsRequired()
                  .HasForeignKey(ea => ea.SceneId).OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(ea => ea.Asset).WithMany().IsRequired()
                  .HasForeignKey(ea => ea.SceneId).OnDelete(DeleteBehavior.Cascade);
            entity.Property(ea => ea.IsLocked);
            entity.Property(ea => ea.ControlledBy);
        });
    }
}