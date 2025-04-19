namespace VttTools.Data.Builders;

internal static class MeetingSchemaBuilder {
    public static void ConfigureModel(ModelBuilder builder)
        => builder.Entity<Meeting>(entity => {
            entity.ToTable("Meetings");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Subject).IsRequired().HasMaxLength(100);
            entity.Property(s => s.OwnerId).IsRequired();
            entity.Property(s => s.EpisodeId);
            entity.OwnsMany(e => e.Players, playerBuilder => {
                playerBuilder.ToTable("MeetingPlayers");
                playerBuilder.WithOwner().HasForeignKey("MeetingId");
                playerBuilder.HasKey("MeetingId", "UserId");
                playerBuilder.Property(t => t.UserId).IsRequired();
                playerBuilder.Property(t => t.Type).IsRequired();
            });
            entity.OwnsMany(e => e.Messages, playerBuilder => {
                playerBuilder.ToTable("MeetingMessages");
                playerBuilder.WithOwner().HasForeignKey("MeetingId");
                playerBuilder.HasKey("MeetingId", "SentAt");
                playerBuilder.Property(t => t.SentBy).IsRequired();
                playerBuilder.Property(t => t.SentTo).IsRequired(false);
                playerBuilder.Property(t => t.Content).IsRequired().HasMaxLength(4096);
            });
            entity.OwnsMany(e => e.Events, playerBuilder => {
                playerBuilder.ToTable("MeetingEvents");
                playerBuilder.WithOwner().HasForeignKey("MeetingId");
                playerBuilder.HasKey("MeetingId", "Timestamp");
                playerBuilder.Property(t => t.Timestamp).IsRequired();
                playerBuilder.Property(t => t.Description).IsRequired().HasMaxLength(1024);
            });
        });
}