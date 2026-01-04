using Stage = VttTools.Data.Library.Stages.Entities.Stage;
using StageElement = VttTools.Data.Library.Stages.Entities.StageElement;
using StageLight = VttTools.Data.Library.Stages.Entities.StageLight;
using StageRegion = VttTools.Data.Library.Stages.Entities.StageRegion;
using StageRegionVertex = VttTools.Data.Library.Stages.Entities.StageRegionVertex;
using StageSound = VttTools.Data.Library.Stages.Entities.StageSound;
using StageWall = VttTools.Data.Library.Stages.Entities.StageWall;
using StageWallSegment = VttTools.Data.Library.Stages.Entities.StageWallSegment;

namespace VttTools.Data.Builders;

internal static class StageSchemaBuilder {
    public static void ConfigureModel(ModelBuilder builder) {
        ConfigureStage(builder);
        ConfigureStageWalls(builder);
        ConfigureStageRegions(builder);
        ConfigureStageLights(builder);
        ConfigureStageElements(builder);
        ConfigureStageSounds(builder);
    }

    private static void ConfigureStage(ModelBuilder builder) => builder.Entity<Stage>(entity => {
        entity.ToTable("Stages");
        entity.HasKey(e => e.Id);
        entity.Property(e => e.OwnerId).IsRequired();
        entity.Property(e => e.Name).IsRequired().HasMaxLength(128);
        entity.Property(e => e.Description).IsRequired().HasMaxLength(4096);
        entity.Property(e => e.IsPublished).IsRequired().HasDefaultValue(false);
        entity.Property(e => e.IsPublic).IsRequired().HasDefaultValue(false);

        entity.Property(s => s.ZoomLevel).IsRequired().HasDefaultValue(1);
        entity.ComplexProperty(s => s.Panning, panningBuilder => {
            panningBuilder.IsRequired();
            panningBuilder.Property(s => s.X).IsRequired().HasDefaultValue(0f).HasColumnName("PanningX");
            panningBuilder.Property(s => s.Y).IsRequired().HasDefaultValue(0f).HasColumnName("PanningY");
        });

        entity.Property(e => e.AmbientLight).IsRequired().HasConversion<string>().HasDefaultValue(AmbientLight.Default);
        entity.Property(e => e.Weather).IsRequired().HasConversion<string>().HasDefaultValue(Weather.Clear);
        entity.Property(e => e.AmbientSoundVolume).IsRequired().HasDefaultValue(1f);
        entity.Property(e => e.AmbientSoundLoop).IsRequired().HasDefaultValue(false);
        entity.Property(e => e.AmbientSoundIsPlaying).IsRequired().HasDefaultValue(false);

        entity.Property(g => g.GridType).IsRequired().HasConversion<string>().HasDefaultValue(GridType.NoGrid).HasColumnName("GridType");
        entity.Property(g => g.GridScale).IsRequired().HasDefaultValue(5.0).HasColumnName("GridScale");
        entity.ComplexProperty(s => s.GridOffset, offsetBuilder => {
            offsetBuilder.IsRequired();
            offsetBuilder.Property(s => s.Left).IsRequired().HasDefaultValue(0f).HasColumnName("GridOffsetLeft");
            offsetBuilder.Property(s => s.Top).IsRequired().HasDefaultValue(0f).HasColumnName("GridOffsetTop");
        });
        entity.ComplexProperty(s => s.GridCellSize, cellSizeBuilder => {
            cellSizeBuilder.IsRequired();
            cellSizeBuilder.Property(s => s.Width).IsRequired().HasDefaultValue(50f).HasColumnName("GridCellWidth");
            cellSizeBuilder.Property(s => s.Height).IsRequired().HasDefaultValue(50f).HasColumnName("GridCellHeight");
        });

        entity.HasOne(e => e.MainBackground).WithMany().IsRequired(false)
              .HasForeignKey(e => e.MainBackgroundId).OnDelete(DeleteBehavior.SetNull);
        entity.HasOne(e => e.AlternateBackground).WithMany().IsRequired(false)
              .HasForeignKey(e => e.AlternateBackgroundId).OnDelete(DeleteBehavior.SetNull);
        entity.HasOne(e => e.AmbientSound).WithMany().IsRequired(false)
              .HasForeignKey(e => e.AmbientSoundId).OnDelete(DeleteBehavior.SetNull);
    });

    private static void ConfigureStageWalls(ModelBuilder builder) {
        builder.Entity<StageWall>(entity => {
            entity.ToTable("StageWalls");
            entity.HasKey(e => new { e.StageId, e.Index });
            entity.Property(e => e.StageId).IsRequired();
            entity.Property(e => e.Index).IsRequired();

            entity.HasOne(e => e.Stage)
                .WithMany(s => s.Walls)
                .HasForeignKey(e => e.StageId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(e => e.StageId);
        });

        builder.Entity<StageWallSegment>(entity => {
            entity.ToTable("StageWallSegments");
            entity.HasKey(e => new { e.StageId, e.WallIndex, e.Index });
            entity.Property(e => e.StageId).IsRequired();
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
            entity.Property(e => e.IsOpaque).IsRequired().HasDefaultValue(true);
            entity.Property(e => e.State).IsRequired().HasConversion<string>().HasDefaultValue(SegmentState.Open);

            entity.HasOne(e => e.Wall)
                .WithMany(s => s.Segments)
                .HasForeignKey(e => new { e.StageId, e.WallIndex })
                .HasPrincipalKey(e => new { e.StageId, e.Index })
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(e => e.StageId);
        });
    }

    private static void ConfigureStageRegions(ModelBuilder builder) {
        builder.Entity<StageRegion>(entity => {
            entity.ToTable("StageRegions");
            entity.HasKey(e => new { e.StageId, e.Index });
            entity.Property(e => e.StageId).IsRequired();
            entity.Property(e => e.Index).IsRequired();

            entity.Property(e => e.Name).IsRequired(false).HasMaxLength(128);
            entity.Property(e => e.Type).IsRequired().HasConversion<string>().HasDefaultValue(RegionType.Elevation);
            entity.Property(e => e.Value).IsRequired();

            entity.HasOne(e => e.Stage)
                .WithMany(s => s.Regions)
                .HasForeignKey(e => e.StageId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(e => e.StageId);
        });

        builder.Entity<StageRegionVertex>(entity => {
            entity.ToTable("StageRegionVertices");
            entity.HasKey(e => new { e.StageId, e.RegionIndex, e.Index });
            entity.Property(e => e.StageId).IsRequired();
            entity.Property(e => e.RegionIndex).IsRequired();
            entity.Property(e => e.Index).IsRequired();

            entity.Property(e => e.X).IsRequired();
            entity.Property(e => e.Y).IsRequired();

            entity.HasOne(e => e.Region)
                .WithMany(r => r.Vertices)
                .HasForeignKey(e => new { e.StageId, e.RegionIndex })
                .HasPrincipalKey(r => new { r.StageId, r.Index })
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(e => new { e.StageId, e.RegionIndex, e.Index });
        });
    }

    private static void ConfigureStageLights(ModelBuilder builder) => builder.Entity<StageLight>(entity => {
        entity.ToTable("StageLights");
        entity.HasKey(e => new { e.StageId, e.Index });
        entity.Property(e => e.StageId).IsRequired();
        entity.Property(e => e.Index).IsRequired();
        entity.Property(e => e.Name).IsRequired(false).HasMaxLength(128);
        entity.Property(e => e.Type).IsRequired().HasConversion<string>().HasDefaultValue(LightSourceType.Natural);
        entity.Property(e => e.Range).IsRequired().HasDefaultValue(0.0);
        entity.Property(e => e.Direction).IsRequired(false);
        entity.Property(e => e.Arc).IsRequired(false);
        entity.Property(e => e.Color).IsRequired(false).HasMaxLength(16);
        entity.Property(e => e.IsOn).IsRequired().HasDefaultValue(true);

        entity.ComplexProperty(e => e.Position, position => {
            position.IsRequired();
            position.Property(p => p.X).IsRequired().HasDefaultValue(0.0).HasColumnName("X");
            position.Property(p => p.Y).IsRequired().HasDefaultValue(0.0).HasColumnName("Y");
        });

        entity.HasOne(e => e.Stage)
            .WithMany(s => s.Lights)
            .HasForeignKey(e => e.StageId)
            .OnDelete(DeleteBehavior.Cascade);

        entity.HasIndex(e => e.StageId);
    });

    private static void ConfigureStageElements(ModelBuilder builder) => builder.Entity<StageElement>(entity => {
        entity.ToTable("StageElements");
        entity.HasKey(e => new { e.StageId, e.Index });
        entity.Property(e => e.StageId).IsRequired();
        entity.Property(e => e.Index).IsRequired();
        entity.Property(e => e.DisplayId).IsRequired();
        entity.Property(e => e.Name).IsRequired(false).HasMaxLength(128);

        entity.ComplexProperty(e => e.Position, positionBuilder => {
            positionBuilder.IsRequired();
            positionBuilder.Property(p => p.X).IsRequired().HasDefaultValue(0.0).HasColumnName("X");
            positionBuilder.Property(p => p.Y).IsRequired().HasDefaultValue(0.0).HasColumnName("Y");
        });

        entity.Property(e => e.Rotation).IsRequired().HasDefaultValue(0f);
        entity.Property(e => e.Elevation).IsRequired().HasDefaultValue(0f);

        entity.ComplexProperty(e => e.DisplaySize, sizeBuilder => {
            sizeBuilder.IsRequired();
            sizeBuilder.Property(s => s.Width).IsRequired().HasDefaultValue(1.0).HasColumnName("Width");
            sizeBuilder.Property(s => s.Height).IsRequired().HasDefaultValue(1.0).HasColumnName("Height");
            sizeBuilder.Ignore(s => s.Name);
        });

        entity.Property(e => e.Opacity).IsRequired().HasDefaultValue(1.0f);

        entity.HasOne(e => e.Stage)
            .WithMany(s => s.Elements)
            .HasForeignKey(e => e.StageId)
            .OnDelete(DeleteBehavior.Cascade);

        entity.HasOne(e => e.Display)
            .WithMany()
            .HasForeignKey(e => e.DisplayId)
            .OnDelete(DeleteBehavior.Restrict);

        entity.HasIndex(e => e.StageId);
    });

    private static void ConfigureStageSounds(ModelBuilder builder) => builder.Entity<StageSound>(entity => {
        entity.ToTable("StageSounds");
        entity.HasKey(e => new { e.StageId, e.Index });
        entity.Property(e => e.StageId).IsRequired();
        entity.Property(e => e.Index).IsRequired();
        entity.Property(e => e.MediaId).IsRequired();
        entity.Property(e => e.Name).HasMaxLength(128);

        entity.ComplexProperty(e => e.Position, positionBuilder => {
            positionBuilder.IsRequired();
            positionBuilder.Property(p => p.X).IsRequired().HasDefaultValue(0.0).HasColumnName("X");
            positionBuilder.Property(p => p.Y).IsRequired().HasDefaultValue(0.0).HasColumnName("Y");
        });

        entity.Property(e => e.Radius).IsRequired().HasDefaultValue(10.0f);
        entity.Property(e => e.Volume).IsRequired().HasDefaultValue(1.0f);
        entity.Property(e => e.Loop).IsRequired().HasDefaultValue(true);
        entity.Property(e => e.IsPlaying).IsRequired().HasDefaultValue(false);

        entity.HasOne(e => e.Stage)
            .WithMany(s => s.Sounds)
            .HasForeignKey(e => e.StageId)
            .OnDelete(DeleteBehavior.Cascade);

        entity.HasOne(e => e.Media)
            .WithMany()
            .HasForeignKey(e => e.MediaId)
            .OnDelete(DeleteBehavior.Restrict);

        entity.HasIndex(e => e.StageId);
    });
}
