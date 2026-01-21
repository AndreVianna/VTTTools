using GameSystem = VttTools.Data.Common.Entities.GameSystem;

namespace VttTools.Data.Builders;

internal static class GameSystemSchemaBuilder {
    public static void ConfigureModel(ModelBuilder builder)
        => builder.Entity<GameSystem>(entity => {
            entity.ToTable("GameSystems");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Code).IsRequired().HasMaxLength(32);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(128);
            entity.Property(e => e.Description).HasMaxLength(512);
            entity.Property(e => e.IconUrl).HasMaxLength(256);
            entity.HasIndex(e => e.Code).IsUnique();
        });
}