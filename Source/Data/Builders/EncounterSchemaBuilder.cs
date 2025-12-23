using Encounter = VttTools.Data.Library.Entities.Encounter;
using EncounterAsset = VttTools.Data.Library.Entities.EncounterAsset;
using EncounterLight = VttTools.Data.Library.Entities.EncounterLight;
using EncounterRegion = VttTools.Data.Library.Entities.EncounterRegion;
using EncounterRegionVertex = VttTools.Data.Library.Entities.EncounterRegionVertex;
using EncounterResource = VttTools.Data.Library.Entities.EncounterResource;
using EncounterSound = VttTools.Data.Library.Entities.EncounterSound;
using EncounterWall = VttTools.Data.Library.Entities.EncounterWall;
using EncounterWallSegment = VttTools.Data.Library.Entities.EncounterWallSegment;

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
                panningBuilder.Property(s => s.X).IsRequired().HasDefaultValue(0.0).HasColumnName("PanningX");
                panningBuilder.Property(s => s.Y).IsRequired().HasDefaultValue(0.0).HasColumnName("PanningY");
            });
            entity.Property(e => e.AmbientLight).IsRequired().HasConversion<string>().HasDefaultValue(AmbientLight.Default);
            entity.Property(e => e.Weather).IsRequired().HasConversion<string>().HasDefaultValue(Weather.Clear);
            entity.Property(e => e.GroundElevation).IsRequired().HasDefaultValue(0.0f);
            entity.ComplexProperty(s => s.Grid, gridBuilder => {
                gridBuilder.IsRequired();
                gridBuilder.Property(g => g.Type).IsRequired().HasConversion<string>().HasDefaultValue(GridType.NoGrid).HasColumnName("GridType");
                gridBuilder.Property(g => g.Scale).IsRequired().HasDefaultValue(5.0).HasColumnName("GridScale");
                gridBuilder.ComplexProperty(s => s.Offset, offsetBuilder => {
                    offsetBuilder.IsRequired();
                    offsetBuilder.Property(s => s.Left).IsRequired().HasDefaultValue(0.0).HasColumnName("GridOffsetLeft");
                    offsetBuilder.Property(s => s.Top).IsRequired().HasDefaultValue(0.0).HasColumnName("GridOffsetTop");
                });
                gridBuilder.ComplexProperty(s => s.CellSize, cellSizeBuilder => {
                    cellSizeBuilder.IsRequired();
                    cellSizeBuilder.Property(s => s.Width).IsRequired().HasDefaultValue(64.0).HasColumnName("GridCellWidth");
                    cellSizeBuilder.Property(s => s.Height).IsRequired().HasDefaultValue(64.0).HasColumnName("GridCellHeight");
                });
            });
        });

        builder.Entity<EncounterAsset>(entity => {
            entity.ToTable("EncounterAssets");
            entity.HasKey(ea => new { ea.EncounterId, ea.Index });
            entity.Property(ea => ea.AssetId).IsRequired();
            entity.Property(ea => ea.EncounterId).IsRequired();
            entity.Property(ea => ea.Index).IsRequired();

            entity.Property(ea => ea.Name).IsRequired(false).HasMaxLength(128);
            entity.Property(ea => ea.Notes).HasMaxLength(4096);
            entity.Property(ea => ea.ImageId);

            entity.HasOne(s => s.Image)
                  .WithMany()
                  .HasForeignKey(s => s.ImageId)
                  .OnDelete(DeleteBehavior.Restrict);
            entity.ComplexProperty(ea => ea.Frame, frameBuilder => {
                frameBuilder.IsRequired();
                frameBuilder.Property(s => s.Shape).IsRequired().HasConversion<string>().HasDefaultValue(FrameShape.Square).HasColumnName("FrameShape");
                frameBuilder.Property(s => s.BorderThickness).IsRequired().HasDefaultValue(1).HasColumnName("FrameBorderThickness");
                frameBuilder.Property(s => s.BorderColor).IsRequired().HasDefaultValue("white").HasColumnName("FrameBorderColor");
                frameBuilder.Property(s => s.Background).IsRequired().HasDefaultValue(string.Empty).HasColumnName("FrameBackground");
            });
            entity.ComplexProperty(ea => ea.Size, sizeBuilder => {
                sizeBuilder.IsRequired();
                sizeBuilder.Property(s => s.Width).IsRequired().HasDefaultValue(1.0).HasColumnName("Width");
                sizeBuilder.Property(s => s.Height).IsRequired().HasDefaultValue(1.0).HasColumnName("Height");
            });
            entity.ComplexProperty(ea => ea.Position, positionBuilder => {
                positionBuilder.IsRequired();
                positionBuilder.Property(p => p.X).IsRequired().HasDefaultValue(0.0).HasColumnName("X");
                positionBuilder.Property(p => p.Y).IsRequired().HasDefaultValue(0.0).HasColumnName("Y");
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

            entity.HasOne(e => e.Encounter)
                .WithMany(s => s.Walls)
                .HasForeignKey(e => e.EncounterId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(e => e.EncounterId);
        });

        builder.Entity<EncounterWallSegment>(entity => {
            entity.ToTable("EncounterWallSegments");
            entity.HasKey(e => new { e.EncounterId, e.WallIndex, e.Index });
            entity.Property(e => e.EncounterId).IsRequired();
            entity.Property(e => e.WallIndex).IsRequired();
            entity.Property(e => e.Index).IsRequired();

            entity.Property(e => e.Name).IsRequired(false).HasMaxLength(128);

            entity.ComplexProperty(e => e.StartPole, pole => {
                pole.IsRequired();
                pole.Property(p => p.X).IsRequired().HasColumnName("StartX");
                pole.Property(p => p.Y).IsRequired().HasColumnName("StartY");
                pole.Property(p => p.H).IsRequired().HasColumnName("StartH");
            });

            entity.ComplexProperty(e => e.EndPole, pole => {
                pole.IsRequired();
                pole.Property(p => p.X).IsRequired().HasColumnName("EndX");
                pole.Property(p => p.Y).IsRequired().HasColumnName("EndY");
                pole.Property(p => p.H).IsRequired().HasColumnName("EndH");
            });

            entity.Property(e => e.Type).IsRequired().HasConversion<string>().HasDefaultValue(SegmentType.Wall);
            entity.Property(e => e.State).IsRequired().HasConversion<string>().HasDefaultValue(SegmentState.Open);

            entity.HasOne(e => e.Wall)
                .WithMany(s => s.Segments)
                .HasForeignKey(e => new { e.EncounterId, e.WallIndex })
                .HasPrincipalKey(e => new { e.EncounterId, e.Index })
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(e => e.EncounterId);
        });

        builder.Entity<EncounterRegion>(entity => {
            entity.ToTable("EncounterRegions");
            entity.HasKey(e => new { e.EncounterId, e.Index });
            entity.Property(e => e.EncounterId).IsRequired();
            entity.Property(e => e.Index).IsRequired();

            entity.Property(e => e.Name).IsRequired(false).HasMaxLength(128);
            entity.Property(e => e.Type).IsRequired().HasConversion<string>().HasDefaultValue(RegionType.Elevation);
            entity.Property(e => e.Value).IsRequired();

            entity.HasOne(e => e.Encounter)
                .WithMany(s => s.Regions)
                .HasForeignKey(e => e.EncounterId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(e => e.EncounterId);
        });

        builder.Entity<EncounterRegionVertex>(entity => {
            entity.ToTable("EncounterRegionVertices");
            entity.HasKey(e => new { e.EncounterId, e.RegionIndex, e.Index });
            entity.Property(e => e.EncounterId).IsRequired();
            entity.Property(e => e.RegionIndex).IsRequired();
            entity.Property(e => e.Index).IsRequired();

            entity.Property(e => e.X).IsRequired();
            entity.Property(e => e.Y).IsRequired();

            entity.HasOne(e => e.Region)
                .WithMany(r => r.Vertices)
                .HasForeignKey(e => new { e.EncounterId, e.RegionIndex })
                .HasPrincipalKey(r => new { r.EncounterId, r.Index })
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(e => new { e.EncounterId, e.RegionIndex, e.Index });
        });

        builder.Entity<EncounterLight>(entity => {
            entity.ToTable("EncounterLights");
            entity.HasKey(e => new { e.EncounterId, e.Index });
            entity.Property(e => e.EncounterId).IsRequired();
            entity.Property(e => e.Index).IsRequired();
            entity.Property(e => e.Name).IsRequired(false).HasMaxLength(128);
            entity.Property(e => e.Type).IsRequired().HasConversion<string>().HasDefaultValue(LightSourceType.Natural);
            entity.Property(e => e.Range).IsRequired().HasDefaultValue(0.0);
            entity.Property(e => e.Direction).IsRequired(false);
            entity.Property(e => e.Arc).IsRequired(false);
            entity.Property(e => e.Color).IsRequired(false).HasMaxLength(16);
            entity.Property(e => e.IsOn).IsRequired();

            entity.ComplexProperty(e => e.Position, position => {
                position.IsRequired();
                position.Property(p => p.X).IsRequired().HasDefaultValue(0.0).HasColumnName("X");
                position.Property(p => p.Y).IsRequired().HasDefaultValue(0.0).HasColumnName("Y");
            });

            entity.HasOne(e => e.Encounter)
                .WithMany(s => s.LightSources)
                .HasForeignKey(e => e.EncounterId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(e => e.EncounterId);
        });

        builder.Entity<EncounterSound>(entity => {
            entity.ToTable("EncounterSounds");
            entity.HasKey(e => new { e.EncounterId, e.Index });
            entity.Property(e => e.EncounterId).IsRequired();
            entity.Property(e => e.Index).IsRequired();
            entity.Property(e => e.Name).IsRequired(false).HasMaxLength(128);
            entity.Property(e => e.Range).IsRequired().HasDefaultValue(0.0);
            entity.Property(e => e.IsPlaying).IsRequired();
            entity.Property(e => e.Loop).IsRequired();

            entity.ComplexProperty(e => e.Position, position => {
                position.IsRequired();
                position.Property(p => p.X).IsRequired().HasDefaultValue(0.0).HasColumnName("X");
                position.Property(p => p.Y).IsRequired().HasDefaultValue(0.0).HasColumnName("Y");
            });

            entity.HasOne(e => e.Resource).WithMany()
                .HasForeignKey(e => e.ResourceId).IsRequired(false)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.Encounter)
                .WithMany(s => s.SoundSources)
                .HasForeignKey(e => e.EncounterId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(e => e.EncounterId);
        });

        builder.Entity<EncounterResource>(entity => {
            entity.ToTable("EncounterResources");
            entity.HasKey(e => new { e.EncounterId, e.ResourceId });
            entity.Property(e => e.Role).IsRequired().HasConversion<string>();
            entity.Property(e => e.Index).IsRequired();
            entity.HasIndex(e => new { e.EncounterId, e.Role, e.Index }).IsUnique();
            entity.HasOne(e => e.Resource)
                .WithMany()
                .HasForeignKey(e => e.ResourceId)
                .OnDelete(DeleteBehavior.Restrict);
            entity.HasOne(e => e.Encounter)
                .WithMany(e => e.Resources)
                .HasForeignKey(e => e.EncounterId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
}