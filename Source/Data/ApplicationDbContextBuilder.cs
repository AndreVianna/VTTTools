namespace VttTools.Data;

internal static class ApplicationDbContextBuilder {
    public static void ConfigureModel(ModelBuilder builder)
        => builder.Entity<Session>(entity => {
            entity.ToTable("Sessions");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
            entity.HasOne(s => s.Owner).WithMany().IsRequired().HasForeignKey("UserId");
            entity.OwnsMany(e => e.Players, playerBuilder => {
                playerBuilder.WithOwner(t => t.Session).HasForeignKey("SessionId");
                playerBuilder.HasKey("SessionId", "UserId");
                playerBuilder.HasOne(t => t.User).WithMany().HasForeignKey("UserId");
                playerBuilder.Property(t => t.Type).IsRequired();
            });
            entity.OwnsMany(e => e.Maps, mapBuilder => {
                mapBuilder.WithOwner(t => t.Session).HasForeignKey("SessionId");
                mapBuilder.HasKey("SessionId", nameof(Map.Number));
                mapBuilder.Property(m => m.Name).IsRequired().HasMaxLength(100);
                mapBuilder.Property(m => m.ImageUrl).IsRequired().HasMaxLength(256);
                mapBuilder.Property(m => m.MasterImageUrl).HasMaxLength(256);
                mapBuilder.OwnsOne(t => t.Size);
                mapBuilder.OwnsOne(t => t.OffSet);
                mapBuilder.OwnsOne(t => t.CellSize);
                mapBuilder.OwnsMany(m => m.Tokens, tokenBuilder => {
                    tokenBuilder.WithOwner(t => t.Map).HasForeignKey("SessionId", "Map");
                    tokenBuilder.HasKey("SessionId", "Map", nameof(Token.Number));
                    tokenBuilder.Property(t => t.Name).IsRequired().HasMaxLength(100);
                    tokenBuilder.OwnsOne(t => t.Position);
                    tokenBuilder.OwnsOne(t => t.Size);
                });
            });
            entity.OwnsMany(e => e.Messages, playerBuilder => {
                playerBuilder.WithOwner(t => t.Session).HasForeignKey("SessionId");
                playerBuilder.HasKey("SessionId", "SentAt");
                playerBuilder.Property(t => t.SentBy).IsRequired();
                playerBuilder.Property(t => t.SentTo).IsRequired(false);
                playerBuilder.Property(t => t.Content).IsRequired().HasMaxLength(4096);
            });
        });
}
