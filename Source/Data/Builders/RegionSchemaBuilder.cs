using System.Text.Json;
using Region = VttTools.Data.Library.Entities.Region;
using SceneRegion = VttTools.Data.Library.Entities.SceneRegion;

namespace VttTools.Data.Builders;

internal static class RegionSchemaBuilder {
    public static void ConfigureModel(ModelBuilder builder) {
        builder.Entity<Region>(entity => {
            entity.ToTable("Regions");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.OwnerId).IsRequired();
            entity.Property(e => e.Name).IsRequired().HasMaxLength(128);
            entity.Property(e => e.Description).HasMaxLength(4096);
            entity.Property(e => e.RegionType).IsRequired().HasMaxLength(64);
            entity.Property(e => e.LabelMap)
                .IsRequired()
                .HasConversion(
                    v => JsonSerializer.Serialize(v, (JsonSerializerOptions?)null),
                    v => JsonSerializer.Deserialize<Dictionary<int, string>>(v, (JsonSerializerOptions?)null) ?? new Dictionary<int, string>()
                );
            entity.Property(e => e.CreatedAt).IsRequired();
        });

        builder.Entity<SceneRegion>(entity => {
            entity.ToTable("SceneRegions");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.SceneId).IsRequired();
            entity.Property(e => e.RegionId).IsRequired();
            entity.Property(e => e.Value).IsRequired();

            entity.OwnsMany(e => e.Vertices, vertices => {
                vertices.ToJson();
                vertices.Property(v => v.X).IsRequired();
                vertices.Property(v => v.Y).IsRequired();
            });

            entity.HasOne(e => e.Scene)
                .WithMany()
                .HasForeignKey(e => e.SceneId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Region)
                .WithMany()
                .HasForeignKey(e => e.RegionId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasIndex(e => e.SceneId);
            entity.HasIndex(e => e.RegionId);
        });
    }
}
