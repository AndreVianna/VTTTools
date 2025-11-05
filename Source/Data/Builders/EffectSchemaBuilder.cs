using Effect = VttTools.Data.Assets.Entities.Effect;

namespace VttTools.Data.Builders;

internal static class EffectSchemaBuilder {
    public static void ConfigureModel(ModelBuilder builder)
        => builder.Entity<Effect>(entity => {
            entity.ToTable("Effects");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.OwnerId).IsRequired();
            entity.Property(e => e.Name).IsRequired().HasMaxLength(128);
            entity.Property(e => e.Description).HasMaxLength(4096);
            entity.Property(e => e.Shape).IsRequired().HasConversion<string>();
            entity.Property(e => e.Size).IsRequired();
            entity.Property(e => e.Direction);
            entity.Property(e => e.BoundedByStructures).IsRequired().HasDefaultValue(true);
            entity.Property(e => e.Category).HasMaxLength(50);
            entity.Property(e => e.CreatedAt).IsRequired();
            entity.HasOne(e => e.Resource)
                .WithMany()
                .HasForeignKey(e => e.ResourceId).IsRequired(false)
                .OnDelete(DeleteBehavior.SetNull);
        });
}