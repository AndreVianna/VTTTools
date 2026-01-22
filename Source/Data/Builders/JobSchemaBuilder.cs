using Asset = VttTools.Data.Assets.Entities.Asset;
using Job = VttTools.Data.Jobs.Entities.Job;
using JobItem = VttTools.Data.Jobs.Entities.JobItem;

namespace VttTools.Data.Builders;

internal static class JobSchemaBuilder {
    public static void ConfigureModel(ModelBuilder builder) {
        ConfigureJob(builder);
        ConfigureJobItem(builder);
    }

    private static void ConfigureJob(ModelBuilder builder) => builder.Entity<Job>(entity => {
        entity.ToTable("Jobs");
        entity.HasKey(e => e.Id);

        entity.Property(e => e.OwnerId).IsRequired().HasMaxLength(100);
        entity.Property(e => e.Type).IsRequired().HasMaxLength(100);
        entity.Property(e => e.Status).IsRequired().HasConversion<string>();
        entity.Property(e => e.EstimatedDuration);
        entity.Property(e => e.Result).HasColumnType("text");
        entity.Property(e => e.StartedAt);
        entity.Property(e => e.CompletedAt);

        entity.HasMany(e => e.Items)
            .WithOne(e => e.Job)
            .HasForeignKey(e => e.JobId)
            .OnDelete(DeleteBehavior.Cascade);

        entity.HasIndex(e => e.Type);
        entity.HasIndex(e => e.Status);
    });

    private static void ConfigureJobItem(ModelBuilder builder) => builder.Entity<JobItem>(entity => {
        entity.ToTable("JobItems");
        entity.HasKey(e => new { e.JobId, e.Index });

        entity.Property(e => e.JobId).IsRequired();
        entity.Property(e => e.Index).IsRequired();
        entity.Property(e => e.Status).IsRequired().HasConversion<string>();
        entity.Property(e => e.Data).IsRequired().HasColumnType("text");
        entity.Property(e => e.Result).HasColumnType("text");
        entity.Property(e => e.StartedAt);
        entity.Property(e => e.CompletedAt);
        entity.Property(e => e.AssetId);

        entity.HasOne(e => e.Asset)
            .WithMany()
            .HasForeignKey(e => e.AssetId)
            .OnDelete(DeleteBehavior.SetNull);

        entity.HasIndex(e => e.Status);
        entity.HasIndex(e => e.AssetId).HasDatabaseName("IX_JobItems_AssetId");
    });
}