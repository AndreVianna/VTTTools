using StatBlock = VttTools.Data.Game.Entities.StatBlock;

namespace VttTools.Data.Builders;

internal static class StatBlockSchemaBuilder {
    public static void ConfigureModel(ModelBuilder builder) => builder.Entity<StatBlock>(entity => {
        entity.ToTable("StatBlocks");
        entity.HasKey(e => e.Id);
        entity.Property(e => e.Name).IsRequired().HasMaxLength(128);
        entity.Property(e => e.CreatedAt).IsRequired();
    });
}