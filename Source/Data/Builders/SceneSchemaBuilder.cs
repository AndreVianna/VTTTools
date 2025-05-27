using Scene = VttTools.Data.Library.Entities.Scene;
using SceneAsset = VttTools.Data.Library.Entities.SceneAsset;

namespace VttTools.Data.Builders;

/// <summary>
/// Configures the EF model for the Scene entity.
/// </summary>
internal static class SceneSchemaBuilder {
    public static void ConfigureModel(ModelBuilder builder) {
        builder.Entity<Scene>(entity => {
            entity.ToTable("Scenes");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.AdventureId);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(128);
            entity.Property(e => e.Description).IsRequired().HasMaxLength(4096);
            entity.Property(e => e.IsPublished).IsRequired();
            entity.ComplexProperty(ea => ea.Stage, shapeBuilder => {
                shapeBuilder.IsRequired();
                shapeBuilder.Property(s => s.Type).IsRequired().HasConversion<string>().HasDefaultValue(DisplayType.Image);
                shapeBuilder.Property(s => s.Id);
                shapeBuilder.ComplexProperty(s => s.Size, sizeBuilder => {
                    sizeBuilder.IsRequired();
                    sizeBuilder.Property(s => s.Width).IsRequired().HasDefaultValue(0);
                    sizeBuilder.Property(s => s.Height).IsRequired().HasDefaultValue(0);
                });
            });
            entity.Property(s => s.ZoomLevel).IsRequired().HasDefaultValue(1.0f);
            entity.ComplexProperty(s => s.Grid, gridBuilder => {
                gridBuilder.IsRequired();
                gridBuilder.Property(g => g.Type).IsRequired().HasConversion<string>().HasDefaultValue(GridType.NoGrid);
                gridBuilder.ComplexProperty(s => s.Offset, offsetBuilder => {
                    offsetBuilder.Property(s => s.X).IsRequired().HasDefaultValue(0);
                    offsetBuilder.Property(s => s.Y).IsRequired().HasDefaultValue(0);
                });
                gridBuilder.ComplexProperty(s => s.CellSize, scaleBuilder => {
                    scaleBuilder.Property(s => s.X).IsRequired().HasDefaultValue(0);
                    scaleBuilder.Property(s => s.Y).IsRequired().HasDefaultValue(0);
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
            entity.ComplexProperty(s => s.Display, displayBuilder => {
                displayBuilder.IsRequired();
                displayBuilder.Property(s => s.Id);
                displayBuilder.Property(s => s.Type).IsRequired().HasConversion<string>().HasDefaultValue(DisplayType.Image);
                displayBuilder.ComplexProperty(s => s.Size, sizeBuilder => {
                    sizeBuilder.IsRequired();
                    sizeBuilder.Property(s => s.Width).IsRequired().HasDefaultValue(0);
                    sizeBuilder.Property(s => s.Height).IsRequired().HasDefaultValue(0);
                });
            });
            entity.Property(ea => ea.Scale).IsRequired().HasDefaultValue(1);
            entity.ComplexProperty(ea => ea.Position, sizeBuilder => {
                sizeBuilder.IsRequired();
                sizeBuilder.Property(s => s.X).IsRequired().HasDefaultValue(0);
                sizeBuilder.Property(s => s.Y).IsRequired().HasDefaultValue(0);
            });
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