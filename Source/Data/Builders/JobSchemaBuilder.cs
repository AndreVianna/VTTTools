namespace VttTools.Data.Builders;

internal static class JobSchemaBuilder {
    public static void ConfigureModel(ModelBuilder builder) {
        ConfigureJob(builder);
        ConfigureJobItem(builder);
    }

    private static void ConfigureJob(ModelBuilder builder) => builder.Entity<Job>(entity => {
        entity.ToTable("Jobs");
        entity.HasKey(e => e.Id);

        entity.Property(e => e.Type).IsRequired().HasMaxLength(100);
        entity.Property(e => e.Status).IsRequired().HasConversion<string>();
        entity.Property(e => e.TotalItems).IsRequired();
        entity.Property(e => e.CompletedItems).IsRequired();
        entity.Property(e => e.FailedItems).IsRequired();
        entity.Property(e => e.InputJson).IsRequired();
        entity.Property(e => e.EstimatedDurationMs);
        entity.Property(e => e.ActualDurationMs);
        entity.Property(e => e.CreatedAt).IsRequired();
        entity.Property(e => e.StartedAt);
        entity.Property(e => e.CompletedAt);

        entity.HasMany(e => e.Items)
            .WithOne(e => e.Job)
            .HasForeignKey(e => e.JobId)
            .OnDelete(DeleteBehavior.Cascade);

        entity.HasIndex(e => e.Type);
        entity.HasIndex(e => e.Status);
        entity.HasIndex(e => e.CreatedAt).IsDescending();
    });

    private static void ConfigureJobItem(ModelBuilder builder) => builder.Entity<JobItem>(entity => {
        entity.ToTable("JobItems");
        entity.HasKey(e => e.Id);

        entity.Property(e => e.JobId).IsRequired();
        entity.Property(e => e.Index).IsRequired();
        entity.Property(e => e.InputJson).IsRequired();
        entity.Property(e => e.OutputJson);
        entity.Property(e => e.Status).IsRequired().HasConversion<string>();
        entity.Property(e => e.ErrorMessage).HasMaxLength(1024);
        entity.Property(e => e.StartedAt);
        entity.Property(e => e.CompletedAt);

        entity.HasIndex(e => new { e.JobId, e.Index }).IsUnique();
        entity.HasIndex(e => e.Status);
    });
}
