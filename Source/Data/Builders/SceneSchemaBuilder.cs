using SceneAsset = VttTools.Data.Library.Entities.SceneAsset;
using Scene = VttTools.Data.Library.Entities.Scene;

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
            entity.Property(e => e.IsPublished).IsRequired();
            entity.Property(e => e.IsPublic).IsRequired();
            entity.ComplexProperty(e => e.Stage, stageBuilder => {
                stageBuilder.ComplexProperty(ea => ea.Shape, shapeBuilder => {
                    shapeBuilder.IsRequired();
                    shapeBuilder.Property(s => s.Type).IsRequired().HasConversion<string>().HasDefaultValue(MediaType.Image);
                    shapeBuilder.Property(s => s.SourceId);
                    shapeBuilder.ComplexProperty(s => s.Size, sizeBuilder => {
                        sizeBuilder.IsRequired();
                        sizeBuilder.Property(s => s.X).IsRequired().HasDefaultValue(0);
                        sizeBuilder.Property(s => s.Y).IsRequired().HasDefaultValue(0);
                    });
                });
                stageBuilder.Property(s => s.ZoomLevel).IsRequired().HasDefaultValue(1.0f);
                stageBuilder.ComplexProperty(s => s.Grid, gridBuilder => {
                    gridBuilder.IsRequired();
                    gridBuilder.Property(g => g.Type).IsRequired().HasConversion<string>().HasDefaultValue(GridType.NoGrid);
                    gridBuilder.ComplexProperty(g => g.Cell, cellBuilder => {
                        gridBuilder.IsRequired();
                        cellBuilder.Property(s => s.Size).IsRequired().HasDefaultValue(1.0f);
                        cellBuilder.ComplexProperty(s => s.Offset, offsetBuilder => {
                            offsetBuilder.Property(s => s.X).IsRequired().HasDefaultValue(0);
                            offsetBuilder.Property(s => s.Y).IsRequired().HasDefaultValue(0);
                        });
                        cellBuilder.ComplexProperty(s => s.Scale, scaleBuilder => {
                            scaleBuilder.Property(s => s.X).IsRequired().HasDefaultValue(0);
                            scaleBuilder.Property(s => s.Y).IsRequired().HasDefaultValue(0);
                        });
                    });
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
            entity.ComplexProperty(ea => ea.Scale, scaleBuilder => {
                scaleBuilder.Property(s => s.X).IsRequired().HasDefaultValue(1.0d);
                scaleBuilder.Property(s => s.Y).IsRequired().HasDefaultValue(1.0d);
            });
            entity.ComplexProperty(ea => ea.Position);
            entity.Property(ea => ea.Rotation).IsRequired().HasDefaultValue(0);
            entity.Property(ea => ea.Elevation).IsRequired().HasDefaultValue(0);
            entity.Property(ea => ea.IsLocked).IsRequired().HasDefaultValue(false);
            entity.Property(ea => ea.ControlledBy);

            entity.HasOne<Scene>().WithMany(e => e.SceneAssets).IsRequired()
                  .HasForeignKey(ea => ea.SceneId).OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(ea => ea.Asset).WithMany().IsRequired()
                  .HasForeignKey(ea => ea.SceneId).OnDelete(DeleteBehavior.Cascade);
        });
    }
}