using Asset = VttTools.Data.Assets.Entities.Asset;
using AssetToken = VttTools.Data.Assets.Entities.AssetToken;
using CreatureAsset = VttTools.Data.Assets.Entities.CreatureAsset;
using ObjectAsset = VttTools.Data.Assets.Entities.ObjectAsset;

namespace VttTools.Data.Builders;

internal static class AssetSchemaBuilder {
    public static void ConfigureModel(ModelBuilder builder) {
        builder.Entity<Asset>(entity => {
            entity.ToTable("Assets");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.OwnerId).IsRequired();
            entity.Property(e => e.Kind).IsRequired().HasConversion<string>();
            entity.Property(e => e.Name).IsRequired().HasMaxLength(128);
            entity.Property(e => e.Description).IsRequired().HasMaxLength(4096);
            entity.Property(e => e.IsPublished).IsRequired().HasDefaultValue(false);
            entity.Property(e => e.IsPublic).IsRequired().HasDefaultValue(false);
            entity.ComplexProperty(ea => ea.Size, sizeBuilder => {
                sizeBuilder.IsRequired();
                sizeBuilder.Property(s => s.Width).IsRequired().HasDefaultValue(1.0);
                sizeBuilder.Property(s => s.Height).IsRequired().HasDefaultValue(1.0);
            });
            entity.HasMany(e => e.Tokens)
                .WithOne(ar => ar.Asset)
                .HasForeignKey(e => e.AssetId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasDiscriminator<AssetKind>("Kind")
                .HasValue<ObjectAsset>(AssetKind.Object)
                .HasValue<CreatureAsset>(AssetKind.Creature);
        });

        builder.Entity<AssetToken>(entity => {
            entity.ToTable("AssetTokens");
            entity.HasKey(ar => new { ar.AssetId, ar.TokenId });  // Composite primary key
            entity.Property(ar => ar.IsDefault).IsRequired().HasConversion<int>();
            entity.HasOne(ar => ar.Token)
                .WithMany()
                .HasForeignKey(ar => ar.TokenId)
                .OnDelete(DeleteBehavior.Restrict);  // Don't cascade delete resources when asset deleted
        });

        builder.Entity<ObjectAsset>(entity => {
            entity.Property(p => p.IsMovable).IsRequired();
            entity.Property(p => p.IsOpaque).IsRequired();
            entity.Property(p => p.TriggerEffectId);
        });

        builder.Entity<CreatureAsset>(entity => {
            entity.Property(p => p.StatBlockId);
            entity.Property(p => p.Category).IsRequired().HasConversion<string>();
            entity.OwnsOne(p => p.TokenStyle, style => {
                style.Property(s => s.BorderColor);
                style.Property(s => s.BackgroundColor);
                style.Property(s => s.Shape).IsRequired().HasConversion<string>();
           });
        });
    }
}