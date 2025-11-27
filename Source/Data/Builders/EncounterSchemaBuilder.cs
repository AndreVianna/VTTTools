using Encounter = VttTools.Data.Library.Entities.Encounter;
using EncounterAsset = VttTools.Data.Library.Entities.EncounterAsset;
using EncounterOpening = VttTools.Data.Library.Entities.EncounterOpening;
using EncounterRegion = VttTools.Data.Library.Entities.EncounterRegion;
using EncounterSource = VttTools.Data.Library.Entities.EncounterSource;
using EncounterWall = VttTools.Data.Library.Entities.EncounterWall;

namespace VttTools.Data.Builders;

internal static class EncounterSchemaBuilder {
    public static void ConfigureModel(ModelBuilder builder) {
        builder.Entity<Encounter>(entity => {
            entity.ToTable("Encounters");
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
            entity.Property(e => e.Light).IsRequired().HasConversion<string>().HasDefaultValue(Light.Ambient);
            entity.Property(e => e.Weather).IsRequired().HasConversion<string>().HasDefaultValue(Weather.Clear);
            entity.Property(e => e.Elevation).IsRequired().HasDefaultValue(0.0f);
            entity.HasOne(e => e.Background).WithMany()
                .HasForeignKey(e => e.BackgroundId).IsRequired(false)
                .OnDelete(DeleteBehavior.Restrict);
            entity.HasOne(e => e.Sound).WithMany()
                .HasForeignKey(e => e.SoundId).IsRequired(false)
                .OnDelete(DeleteBehavior.Restrict);
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
        });

        builder.Entity<EncounterAsset>(entity => {
            entity.ToTable("EncounterAssets");
            entity.HasKey(ea => new { ea.EncounterId, ea.Index });
            entity.Property(ea => ea.AssetId).IsRequired();
            entity.Property(ea => ea.EncounterId).IsRequired();
            entity.Property(ea => ea.Index).IsRequired();
            entity.Property(ea => ea.Number).IsRequired();

            entity.Property(ea => ea.Name).IsRequired().HasMaxLength(128);
            entity.Property(ea => ea.Notes).HasMaxLength(4096);
            entity.Property(ea => ea.ImageId);

            entity.HasOne(s => s.Image)
                  .WithMany()
                  .HasForeignKey(s => s.ImageId)
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
                sizeBuilder.Property(s => s.Width).IsRequired().HasDefaultValue(1.0);
                sizeBuilder.Property(s => s.Height).IsRequired().HasDefaultValue(1.0);
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
            entity.HasOne(ea => ea.Encounter).WithMany(e => e.EncounterAssets).IsRequired()
                  .HasForeignKey(ea => ea.EncounterId).OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(ea => ea.Asset).WithMany().IsRequired()
                  .HasForeignKey(ea => ea.AssetId).OnDelete(DeleteBehavior.Cascade);
        });

        builder.Entity<EncounterWall>(entity => {
            entity.ToTable("EncounterWalls");
            entity.HasKey(e => new { e.EncounterId, e.Index });
            entity.Property(e => e.EncounterId).IsRequired();
            entity.Property(e => e.Index).IsRequired();

            entity.Property(e => e.Name).IsRequired().HasMaxLength(128);
            entity.Property(e => e.Visibility).IsRequired().HasDefaultValue(WallVisibility.Normal);
            entity.Property(e => e.IsClosed).IsRequired().HasDefaultValue(false);
            entity.Property(e => e.Color).IsRequired(false).HasMaxLength(32);

            entity.OwnsMany(e => e.Poles, poles => {
                poles.ToJson();
                poles.Property(p => p.X).IsRequired();
                poles.Property(p => p.Y).IsRequired();
                poles.Property(p => p.H).IsRequired();
            });

            entity.HasOne(e => e.Encounter)
                .WithMany(s => s.Walls)
                .HasForeignKey(e => e.EncounterId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(e => e.EncounterId);
        });

        builder.Entity<EncounterOpening>(entity => {
            entity.ToTable("EncounterOpenings");
            entity.HasKey(e => new { e.EncounterId, e.Index });
            entity.Property(e => e.EncounterId).IsRequired();
            entity.Property(e => e.Index).IsRequired();

            entity.Property(e => e.Name).IsRequired().HasMaxLength(128);
            entity.Property(e => e.Description).IsRequired(false).HasMaxLength(512);
            entity.Property(e => e.Type).IsRequired().HasMaxLength(32);

            entity.Property(e => e.WallIndex).IsRequired();
            entity.Property(e => e.StartPoleIndex).IsRequired();
            entity.Property(e => e.EndPoleIndex).IsRequired();

            entity.Property(e => e.Width).IsRequired().HasDefaultValue(0.0);
            entity.Property(e => e.Height).IsRequired().HasDefaultValue(0.0);

            entity.Property(e => e.Visibility).IsRequired().HasDefaultValue(OpeningVisibility.Visible);
            entity.Property(e => e.State).IsRequired().HasDefaultValue(OpeningState.Closed);
            entity.Property(e => e.Opacity).IsRequired().HasDefaultValue(OpeningOpacity.Opaque);

            entity.Property(e => e.Material).IsRequired(false).HasMaxLength(32);
            entity.Property(e => e.Color).IsRequired(false).HasMaxLength(16);

            entity.HasOne(e => e.Encounter)
                .WithMany(s => s.Openings)
                .HasForeignKey(e => e.EncounterId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(e => e.EncounterId);
        });

        builder.Entity<EncounterRegion>(entity => {
            entity.ToTable("EncounterRegions");
            entity.HasKey(e => new { e.EncounterId, e.Index });
            entity.Property(e => e.EncounterId).IsRequired();
            entity.Property(e => e.Index).IsRequired();

            entity.Property(e => e.Name).IsRequired().HasMaxLength(128);
            entity.Property(e => e.Type).IsRequired().HasMaxLength(32);
            entity.Property(e => e.Value).IsRequired(false);
            entity.Property(e => e.Label).IsRequired(false).HasMaxLength(32);
            entity.Property(e => e.Color).IsRequired(false).HasMaxLength(32);

            entity.OwnsMany(e => e.Vertices, vertices => {
                vertices.ToJson();
                vertices.Property(v => v.X).IsRequired();
                vertices.Property(v => v.Y).IsRequired();
            });

            entity.HasOne(e => e.Encounter)
                .WithMany(s => s.Regions)
                .HasForeignKey(e => e.EncounterId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(e => e.EncounterId);
        });

        builder.Entity<EncounterSource>(entity => {
            entity.ToTable("EncounterSources");
            entity.HasKey(e => new { e.EncounterId, e.Index });
            entity.Property(e => e.EncounterId).IsRequired();
            entity.Property(e => e.Index).IsRequired();
            entity.Property(e => e.Name).IsRequired().HasMaxLength(128);
            entity.Property(e => e.Type).IsRequired().HasMaxLength(32);
            entity.Property(e => e.Direction).IsRequired().HasDefaultValue(0.0);
            entity.Property(e => e.IsDirectional).IsRequired();
            entity.Property(e => e.Range).IsRequired().HasDefaultValue(0.0);
            entity.Property(e => e.Spread).IsRequired().HasDefaultValue(0.0);
            entity.Property(e => e.Intensity).IsRequired().HasDefaultValue(100.0);
            entity.Property(e => e.HasGradient).IsRequired();
            entity.Property(e => e.Color).IsRequired(false).HasMaxLength(32);

            entity.ComplexProperty(e => e.Position, position => {
                position.IsRequired();
                position.Property(p => p.X).IsRequired().HasDefaultValue(0.0);
                position.Property(p => p.Y).IsRequired().HasDefaultValue(0.0);
            });

            entity.HasOne(e => e.Encounter)
                .WithMany(s => s.Sources)
                .HasForeignKey(e => e.EncounterId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(e => e.EncounterId);
        });
    }
}