using Encounter = VttTools.Data.Library.Encounters.Entities.Encounter;
using EncounterActor = VttTools.Data.Library.Encounters.Entities.EncounterActor;
using EncounterEffect = VttTools.Data.Library.Encounters.Entities.EncounterEffect;
using EncounterObject = VttTools.Data.Library.Encounters.Entities.EncounterObject;
using Shape = VttTools.Data.Common.Entities.Shape;
using ShapeVertex = VttTools.Data.Common.Entities.ShapeVertex;

namespace VttTools.Data.Builders;

internal static class EncounterSchemaBuilder {
    public static void ConfigureModel(ModelBuilder builder) {
        ConfigureEncounter(builder);
        ConfigureEncounterActors(builder);
        ConfigureEncounterObjects(builder);
        ConfigureEncounterEffects(builder);
        ConfigureShapes(builder);
    }

    private static void ConfigureEncounter(ModelBuilder builder) => builder.Entity<Encounter>(entity => {
        entity.ToTable("Encounters");
        entity.HasKey(e => e.Id);
        entity.Property(e => e.AdventureId).IsRequired();
        entity.Property(e => e.Name).IsRequired(false).HasMaxLength(128);
        entity.Property(e => e.Description).IsRequired(false).HasMaxLength(4096);
        entity.Property(e => e.IsPublished).IsRequired().HasDefaultValue(false);
        entity.Property(e => e.IsPublic).IsRequired().HasDefaultValue(false);

        // Stage FK - structural elements are now on Stage
        entity.Property(e => e.StageId).IsRequired();
        entity.HasOne(e => e.Stage)
              .WithMany()
              .HasForeignKey(e => e.StageId)
              .OnDelete(DeleteBehavior.Restrict);
    });

    private static void ConfigureEncounterActors(ModelBuilder builder) => builder.Entity<EncounterActor>(entity => {
        entity.ToTable("EncounterActors");
        entity.HasKey(e => new { e.EncounterId, e.Index });
        entity.Property(e => e.EncounterId).IsRequired();
        entity.Property(e => e.Index).IsRequired();
        entity.Property(e => e.AssetId).IsRequired();
        entity.Property(e => e.Name).IsRequired().HasMaxLength(128);

        entity.ComplexProperty(e => e.Position, positionBuilder => {
            positionBuilder.IsRequired();
            positionBuilder.Property(p => p.X).IsRequired().HasDefaultValue(0.0).HasColumnName("X");
            positionBuilder.Property(p => p.Y).IsRequired().HasDefaultValue(0.0).HasColumnName("Y");
        });

        entity.Property(e => e.Rotation).IsRequired().HasDefaultValue(0f);
        entity.Property(e => e.Elevation).IsRequired().HasDefaultValue(0f);

        entity.ComplexProperty(e => e.Size, sizeBuilder => {
            sizeBuilder.IsRequired();
            sizeBuilder.Property(s => s.Width).IsRequired().HasDefaultValue(1.0).HasColumnName("Width");
            sizeBuilder.Property(s => s.Height).IsRequired().HasDefaultValue(1.0).HasColumnName("Height");
            sizeBuilder.Ignore(s => s.Name);
        });

        entity.HasOne(e => e.Display)
              .WithMany()
              .HasForeignKey(e => e.DisplayId)
              .OnDelete(DeleteBehavior.Restrict);

        entity.ComplexProperty(e => e.Frame, frameBuilder => {
            frameBuilder.IsRequired();
            frameBuilder.Property(s => s.Shape).IsRequired().HasConversion<string>().HasDefaultValue(FrameShape.Square).HasColumnName("FrameShape");
            frameBuilder.Property(s => s.BorderThickness).IsRequired().HasDefaultValue(1).HasColumnName("FrameBorderThickness");
            frameBuilder.Property(s => s.BorderColor).IsRequired().HasDefaultValue("white").HasColumnName("FrameBorderColor");
            frameBuilder.Property(s => s.Background).IsRequired().HasDefaultValue(string.Empty).HasColumnName("FrameBackground");
        });

        entity.Property(e => e.ControlledBy);
        entity.Property(e => e.IsHidden).IsRequired().HasDefaultValue(false);
        entity.Property(e => e.IsLocked).IsRequired().HasDefaultValue(false);

        entity.HasOne(e => e.Encounter)
              .WithMany(s => s.Actors)
              .HasForeignKey(e => e.EncounterId)
              .OnDelete(DeleteBehavior.Cascade);

        entity.HasOne(e => e.Asset)
              .WithMany()
              .HasForeignKey(e => e.AssetId)
              .OnDelete(DeleteBehavior.Cascade);

        entity.HasIndex(e => e.EncounterId);
    });

    private static void ConfigureEncounterObjects(ModelBuilder builder) => builder.Entity<EncounterObject>(entity => {
        entity.ToTable("EncounterObjects");
        entity.HasKey(e => new { e.EncounterId, e.Index });
        entity.Property(e => e.EncounterId).IsRequired();
        entity.Property(e => e.Index).IsRequired();
        entity.Property(e => e.AssetId).IsRequired();
        entity.Property(e => e.Name).IsRequired().HasMaxLength(128);

        entity.ComplexProperty(e => e.Position, positionBuilder => {
            positionBuilder.IsRequired();
            positionBuilder.Property(p => p.X).IsRequired().HasDefaultValue(0.0).HasColumnName("X");
            positionBuilder.Property(p => p.Y).IsRequired().HasDefaultValue(0.0).HasColumnName("Y");
        });

        entity.Property(e => e.Rotation).IsRequired().HasDefaultValue(0f);
        entity.Property(e => e.Elevation).IsRequired().HasDefaultValue(0f);

        entity.ComplexProperty(e => e.Size, sizeBuilder => {
            sizeBuilder.IsRequired();
            sizeBuilder.Property(s => s.Width).IsRequired().HasDefaultValue(1.0).HasColumnName("Width");
            sizeBuilder.Property(s => s.Height).IsRequired().HasDefaultValue(1.0).HasColumnName("Height");
            sizeBuilder.Ignore(s => s.Name);
        });

        entity.HasOne(e => e.Display).WithMany().IsRequired(false)
              .HasForeignKey(e => e.DisplayId).OnDelete(DeleteBehavior.Restrict);
        entity.HasOne(e => e.ClosedDisplay).WithMany().IsRequired(false)
              .HasForeignKey(e => e.ClosedDisplayId).OnDelete(DeleteBehavior.Restrict);
        entity.HasOne(e => e.OpenedDisplay).WithMany().IsRequired(false)
              .HasForeignKey(e => e.OpenedDisplayId).OnDelete(DeleteBehavior.Restrict);
        entity.HasOne(e => e.DestroyedDisplay).WithMany().IsRequired(false)
              .HasForeignKey(e => e.DestroyedDisplayId).OnDelete(DeleteBehavior.Restrict);

        entity.Property(e => e.State).IsRequired().HasConversion<string>().HasDefaultValue(ObjectState.Closed);
        entity.Property(e => e.IsHidden).IsRequired().HasDefaultValue(false);
        entity.Property(e => e.IsLocked).IsRequired().HasDefaultValue(false);

        entity.HasOne(e => e.Encounter)
              .WithMany(s => s.Objects)
              .HasForeignKey(e => e.EncounterId)
              .OnDelete(DeleteBehavior.Cascade);

        entity.HasOne(e => e.Asset)
              .WithMany()
              .HasForeignKey(e => e.AssetId)
              .OnDelete(DeleteBehavior.Cascade);

        entity.HasIndex(e => e.EncounterId);
    });

    private static void ConfigureEncounterEffects(ModelBuilder builder) => builder.Entity<EncounterEffect>(entity => {
        entity.ToTable("EncounterEffects");
        entity.HasKey(e => new { e.EncounterId, e.Index });
        entity.Property(e => e.EncounterId).IsRequired();
        entity.Property(e => e.Index).IsRequired();
        entity.Property(e => e.Name).IsRequired().HasMaxLength(128);

        entity.ComplexProperty(e => e.Position, positionBuilder => {
            positionBuilder.IsRequired();
            positionBuilder.Property(p => p.X).IsRequired().HasDefaultValue(0.0).HasColumnName("X");
            positionBuilder.Property(p => p.Y).IsRequired().HasDefaultValue(0.0).HasColumnName("Y");
        });

        entity.Property(e => e.Rotation).IsRequired().HasDefaultValue(0f);
        entity.Property(e => e.AssetId).IsRequired();

        entity.Property(e => e.State).IsRequired().HasConversion<string>().HasDefaultValue(EffectState.Enabled);
        entity.Property(e => e.IsHidden).IsRequired().HasDefaultValue(false);

        entity.HasOne(e => e.TriggerShape)
              .WithMany()
              .HasForeignKey(e => e.TriggerShapeId)
              .OnDelete(DeleteBehavior.SetNull);

        entity.HasOne(e => e.Display).WithMany().IsRequired(false)
              .HasForeignKey(e => e.DisplayId).OnDelete(DeleteBehavior.Restrict);
        entity.HasOne(e => e.EnabledDisplay).WithMany().IsRequired(false)
              .HasForeignKey(e => e.EnabledDisplayId).OnDelete(DeleteBehavior.Restrict);
        entity.HasOne(e => e.DisabledDisplay).WithMany().IsRequired(false)
              .HasForeignKey(e => e.DisabledDisplayId).OnDelete(DeleteBehavior.Restrict);
        entity.HasOne(e => e.OnTriggerDisplay).WithMany().IsRequired(false)
              .HasForeignKey(e => e.OnTriggerDisplayId).OnDelete(DeleteBehavior.Restrict);
        entity.HasOne(e => e.TriggeredDisplay).WithMany().IsRequired(false)
              .HasForeignKey(e => e.TriggeredDisplayId).OnDelete(DeleteBehavior.Restrict);

        entity.HasOne(e => e.Encounter)
              .WithMany(s => s.Effects)
              .HasForeignKey(e => e.EncounterId)
              .OnDelete(DeleteBehavior.Cascade);

        entity.HasOne(e => e.Asset)
              .WithMany()
              .HasForeignKey(e => e.AssetId)
              .OnDelete(DeleteBehavior.Cascade);

        entity.HasIndex(e => e.EncounterId);
    });

    private static void ConfigureShapes(ModelBuilder builder) {
        builder.Entity<Shape>(entity => {
            entity.ToTable("Shapes");
            entity.HasKey(e => e.Id);

            entity.Property(e => e.Tags)
                  .IsRequired()
                  .HasMaxLength(512);

            entity.Property(e => e.Preset).IsRequired().HasConversion<string>().HasDefaultValue(ShapeType.Circle);
            entity.Property(e => e.Radius).IsRequired().HasDefaultValue(1.0f);
            entity.Property(e => e.Width).IsRequired().HasDefaultValue(0f);
            entity.Property(e => e.Length).IsRequired().HasDefaultValue(0f);
            entity.Property(e => e.Arc).IsRequired().HasDefaultValue(53.0f);
            entity.Property(e => e.Direction).IsRequired().HasDefaultValue(0f);
        });

        builder.Entity<ShapeVertex>(entity => {
            entity.ToTable("ShapeVertices");
            entity.HasKey(e => new { e.ShapeId, e.Index });
            entity.Property(e => e.ShapeId).IsRequired();
            entity.Property(e => e.Index).IsRequired();
            entity.Property(e => e.X).IsRequired();
            entity.Property(e => e.Y).IsRequired();

            entity.HasOne(e => e.Shape)
                  .WithMany(s => s.Vertices)
                  .HasForeignKey(e => e.ShapeId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(e => new { e.ShapeId, e.Index });
        });
    }
}
