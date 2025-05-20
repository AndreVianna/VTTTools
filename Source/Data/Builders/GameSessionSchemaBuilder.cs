using GameSession = VttTools.Data.Game.Entities.GameSession;

namespace VttTools.Data.Builders;

internal static class GameSessionSchemaBuilder {
    public static void ConfigureModel(ModelBuilder builder)
        => builder.Entity<GameSession>(entity => {
            entity.ToTable("GameSessions");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Title).IsRequired().HasMaxLength(100);
            entity.Property(s => s.OwnerId).IsRequired();
            entity.Property(s => s.SceneId);
            entity.OwnsMany(e => e.Players, playerBuilder => {
                playerBuilder.ToTable("Players");
                playerBuilder.WithOwner().HasForeignKey("GameSessionId");
                playerBuilder.HasKey("GameSessionId", "UserId");
                playerBuilder.Property(t => t.UserId).IsRequired();
                playerBuilder.Property(t => t.Type).IsRequired();
            });
            entity.OwnsMany(e => e.Messages, playerBuilder => {
                playerBuilder.ToTable("Messages");
                playerBuilder.WithOwner().HasForeignKey("GameSessionId");
                playerBuilder.HasKey("GameSessionId", "SentAt");
                playerBuilder.Property(t => t.SentBy).IsRequired();
                playerBuilder.Property(t => t.SentTo).IsRequired(false);
                playerBuilder.Property(t => t.Content).IsRequired().HasMaxLength(4096);
            });
            entity.OwnsMany(e => e.Events, playerBuilder => {
                playerBuilder.ToTable("Events");
                playerBuilder.WithOwner().HasForeignKey("GameSessionId");
                playerBuilder.HasKey("GameSessionId", "Timestamp");
                playerBuilder.Property(t => t.Timestamp).IsRequired();
                playerBuilder.Property(t => t.Description).IsRequired().HasMaxLength(1024);
            });
        });
}