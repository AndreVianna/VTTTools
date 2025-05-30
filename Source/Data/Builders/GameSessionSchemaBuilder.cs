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
            entity.OwnsMany(e => e.Players, pb => {
                pb.ToTable("Players");
                pb.WithOwner().HasForeignKey("GameSessionId");
                pb.HasKey("GameSessionId", "UserId");
                pb.Property(t => t.UserId).IsRequired();
                pb.Property(t => t.IsRequired).IsRequired();
                pb.Property(t => t.Type).IsRequired();
            });
            entity.OwnsMany(e => e.Messages, mb => {
                mb.ToTable("Messages");
                mb.WithOwner().HasForeignKey("GameSessionId");
                mb.HasKey("GameSessionId", "SentAt");
                mb.Property(t => t.SentBy).IsRequired();
                mb.Property(t => t.SentTo).IsRequired(false);
                mb.Property(t => t.Content).IsRequired().HasMaxLength(4096);
            });
            entity.OwnsMany(e => e.Events, eb => {
                eb.ToTable("Events");
                eb.WithOwner().HasForeignKey("GameSessionId");
                eb.HasKey("GameSessionId", "Timestamp");
                eb.Property(t => t.Timestamp).IsRequired();
                eb.Property(t => t.Description).IsRequired().HasMaxLength(1024);
            });
        });
}