using Asset = VttTools.Data.Assets.Entities.Asset;
using AssetStatBlockValue = VttTools.Data.Assets.Entities.AssetStatBlockValue;
using AssetToken = VttTools.Data.Assets.Entities.AssetToken;

namespace VttTools.Data.Builders;

internal static class AssetSchemaBuilder {
    public static void ConfigureModel(ModelBuilder builder) {
        builder.Entity<Asset>(entity => {
            entity.ToTable("Assets");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(128);
            entity.Property(e => e.Description).IsRequired().HasMaxLength(4096);
            entity.OwnsOne(e => e.Classification, classificationBuilder => {
                classificationBuilder.Property(c => c.Kind).IsRequired().HasConversion<string>().HasColumnName("Kind");
                classificationBuilder.Property(c => c.Category).IsRequired().HasColumnName("Category");
                classificationBuilder.Property(c => c.Type).IsRequired().HasColumnName("ResourceType");
                classificationBuilder.Property(c => c.Subtype).IsRequired(false).HasColumnName("Subtype");
            });
            entity.OwnsOne(ea => ea.TokenSize, sizeBuilder => {
                sizeBuilder.Property(s => s.Width).IsRequired().HasDefaultValue(1.0).HasColumnName("Width");
                sizeBuilder.Property(s => s.Height).IsRequired().HasDefaultValue(1.0).HasColumnName("Height");
            });
            entity.HasMany(e => e.StatBlock)
                .WithOne(e => e.Asset)
                .HasForeignKey(e => e.AssetId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.Property(e => e.OwnerId).IsRequired();
            entity.Property(e => e.IsPublished).IsRequired().HasDefaultValue(false);
            entity.Property(e => e.IsPublic).IsRequired().HasDefaultValue(false);
            entity.HasOne(e => e.Portrait)
                .WithMany()
                .HasForeignKey(e => e.PortraitId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        builder.Entity<AssetStatBlockValue>(entity => {
            entity.ToTable("AssetStatBlockValues");
            entity.HasKey(e => new { e.AssetId, e.Level, e.Key });
            entity.Property(e => e.Level).IsRequired();
            entity.Property(e => e.Key).IsRequired().HasMaxLength(32);
            entity.Property(e => e.Value).IsRequired(false).HasMaxLength(4096);
            entity.Property(e => e.Type).IsRequired().HasConversion<string>();
        });

        builder.Entity<AssetToken>(entity => {
            entity.ToTable("AssetTokens");
            entity.HasKey(e => new { e.AssetId, e.TokenId });
            entity.HasIndex(e => new { e.AssetId, e.Index }).IsUnique();
            entity.HasOne(e => e.Token)
                .WithMany()
                .HasForeignKey(e => e.TokenId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(e => e.Asset)
                .WithMany(e => e.AssetTokens)
                .HasForeignKey(e => e.AssetId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
}