namespace VttTools.Data;

internal static class ApplicationDbContextBuilder {
    public static void ConfigureModel(ModelBuilder builder)
        => builder.Entity<Session>(entity => {
            entity.ToTable("Sessions");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
            entity.Property(s => s.OwnerId).IsRequired();
            entity.OwnsMany(e => e.Players, playerBuilder => {
                playerBuilder.ToTable("SessionPlayers");
                playerBuilder.WithOwner().HasForeignKey("SessionId");
                playerBuilder.HasKey("SessionId", "UserId");
                playerBuilder.Property(t => t.UserId).IsRequired();
                playerBuilder.Property(t => t.Type).IsRequired();
            });
            entity.OwnsMany(e => e.Maps, mapBuilder => {
                mapBuilder.ToTable("SessionMaps");
                mapBuilder.WithOwner().HasForeignKey("SessionId");
                mapBuilder.HasKey("SessionId", nameof(SessionMap.Number));
                mapBuilder.Property(m => m.Name).IsRequired().HasMaxLength(100);
                mapBuilder.Property(m => m.ImageUrl).IsRequired().HasMaxLength(256);
                mapBuilder.Property(m => m.MasterImageUrl).HasMaxLength(256);
                mapBuilder.OwnsOne(t => t.Size);
                mapBuilder.OwnsOne(t => t.Grid, gridBuilder => {
                    gridBuilder.OwnsOne(t => t.Offset);
                    gridBuilder.OwnsOne(t => t.Cell);
                });
                mapBuilder.OwnsMany(m => m.Tokens, tokenBuilder => {
                    tokenBuilder.ToTable("SessionMapTokens");
                    tokenBuilder.WithOwner().HasForeignKey("SessionId", "MapNumber");
                    tokenBuilder.HasKey("SessionId", "MapNumber", nameof(SessionMapToken.Number));
                    tokenBuilder.Property(t => t.Name).IsRequired().HasMaxLength(100);
                    tokenBuilder.Property(t => t.ImageUrl).IsRequired().HasMaxLength(256);
                    tokenBuilder.Property(t => t.IsLocked).IsRequired().HasMaxLength(256);
                    tokenBuilder.Property(t => t.ControlledBy);
                    tokenBuilder.OwnsOne(t => t.Position);
                    tokenBuilder.OwnsOne(t => t.Size);
                });
            });
            entity.OwnsMany(e => e.Messages, playerBuilder => {
                playerBuilder.ToTable("SessionMassages");
                playerBuilder.WithOwner().HasForeignKey("SessionId");
                playerBuilder.HasKey("SessionId", "SentAt");
                playerBuilder.Property(t => t.SentBy).IsRequired();
                playerBuilder.Property(t => t.SentTo).IsRequired(false);
                playerBuilder.Property(t => t.Content).IsRequired().HasMaxLength(4096);
            });
        });
}
