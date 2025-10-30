using Scene = VttTools.Data.Library.Entities.Scene;
using SceneAsset = VttTools.Data.Library.Entities.SceneAsset;

namespace VttTools.Data.Builders;

internal static class SceneSchemaBuilder {
    public static void ConfigureModel(ModelBuilder builder) {
        builder.Entity<Scene>(entity => {
            entity.ToTable("Scenes");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.AdventureId).IsRequired();
            entity.Property(e => e.Name).IsRequired().HasMaxLength(128);
            entity.Property(e => e.Description).IsRequired().HasMaxLength(4096);
            entity.Property(e => e.IsPublished).IsRequired();
            entity.Property(s => s.ZoomLevel).IsRequired().HasDefaultValue(1);
            entity.ComplexProperty(s => s.Panning, panningBuilder => {
                panningBuilder.IsRequired();
                panningBuilder.Property(s => s.X).IsRequired().HasDefaultValue(0.0);
                panningBuilder.Property(s => s.Y).IsRequired().HasDefaultValue(0.0);
            });
            entity.HasOne(e => e.Background).WithMany()
                .HasForeignKey(e => e.BackgroundId).IsRequired(false).OnDelete(DeleteBehavior.Restrict);
            entity.ComplexProperty(s => s.Grid, gridBuilder => {
                gridBuilder.IsRequired();
                gridBuilder.Property(g => g.Type).IsRequired().HasConversion<string>().HasDefaultValue(GridType.NoGrid);
                gridBuilder.Property(g => g.Snap).IsRequired().HasDefaultValue(false);
                gridBuilder.ComplexProperty(s => s.Offset, offsetBuilder => {
                    offsetBuilder.IsRequired();
                    offsetBuilder.Property(s => s.Left).IsRequired().HasDefaultValue(0.0);
                    offsetBuilder.Property(s => s.Top).IsRequired().HasDefaultValue(0.0);
                });
                gridBuilder.ComplexProperty(s => s.CellSize, cellSizeBuilder => {
                    cellSizeBuilder.IsRequired();
                    cellSizeBuilder.Property(s => s.Width).IsRequired().HasDefaultValue(64.0);
                    cellSizeBuilder.Property(s => s.Height).IsRequired().HasDefaultValue(64.0);
                });
            });
            entity.Property(s => s.DefaultDisplayName).IsRequired().HasConversion<string>().HasDefaultValue(DisplayName.Always);
            entity.Property(s => s.DefaultLabelPosition).IsRequired().HasConversion<string>().HasDefaultValue(LabelPosition.Bottom);
        });
        builder.Entity<SceneAsset>(entity => {
            entity.ToTable("SceneAssets");
            entity.HasKey(ea => new { ea.SceneId, ea.Index });
            entity.Property(ea => ea.AssetId).IsRequired();
            entity.Property(ea => ea.SceneId).IsRequired();
            entity.Property(ea => ea.Index).IsRequired();
            entity.Property(ea => ea.Number).IsRequired();

            // Overridable properties
            entity.Property(ea => ea.Name).IsRequired().HasMaxLength(128);
            entity.Property(ea => ea.Description).HasMaxLength(4096);
            entity.Property(ea => ea.ResourceId).IsRequired();  // REQUIRED - must select from Asset.Resources

            // Resource navigation (required - selects which resource from Asset.Resources to display)
            entity.HasOne(s => s.Resource)
                  .WithMany()
                  .HasForeignKey(s => s.ResourceId)
                  .OnDelete(DeleteBehavior.Restrict);
            entity.ComplexProperty(ea => ea.Frame, frameBuilder => {
                frameBuilder.IsRequired();
                frameBuilder.Property(s => s.Shape).IsRequired().HasConversion<string>().HasDefaultValue(FrameShape.Square);
                frameBuilder.Property(s => s.BorderThickness).IsRequired().HasDefaultValue(1);
                frameBuilder.Property(s => s.BorderColor).IsRequired().HasDefaultValue("white");
                frameBuilder.Property(s => s.Background).IsRequired().HasDefaultValue(string.Empty);
            });
            entity.ComplexProperty(ea => ea.Size, sizeBuilder => {
                sizeBuilder.IsRequired();
                sizeBuilder.Property(s => s.Width).IsRequired().HasDefaultValue(0.0);
                sizeBuilder.Property(s => s.Height).IsRequired().HasDefaultValue(0.0);
                sizeBuilder.Property(s => s.IsSquare).IsRequired().HasDefaultValue(true);
            });
            entity.ComplexProperty(ea => ea.Position, positionBuilder => {
                positionBuilder.IsRequired();
                positionBuilder.Property(p => p.X).IsRequired().HasDefaultValue(0.0);
                positionBuilder.Property(p => p.Y).IsRequired().HasDefaultValue(0.0);
            });
            entity.Property(ea => ea.Rotation).IsRequired().HasDefaultValue(0);
            entity.Property(ea => ea.Elevation).IsRequired().HasDefaultValue(0);
            entity.Property(ea => ea.IsLocked).IsRequired().HasDefaultValue(false);
            entity.Property(ea => ea.IsVisible).IsRequired().HasDefaultValue(true);
            entity.Property(ea => ea.ControlledBy);
            entity.Property(ea => ea.DisplayName).IsRequired().HasConversion<string>().HasDefaultValue(DisplayName.Default);
            entity.Property(ea => ea.LabelPosition).IsRequired().HasConversion<string>().HasDefaultValue(LabelPosition.Default);
            entity.HasOne<Scene>().WithMany(e => e.SceneAssets).IsRequired()
                  .HasForeignKey(ea => ea.SceneId).OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(ea => ea.Asset).WithMany().IsRequired()
                  .HasForeignKey(ea => ea.AssetId).OnDelete(DeleteBehavior.Cascade);
        });
    }
}