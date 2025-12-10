using System.Text.Json;

using Asset = VttTools.Data.Assets.Entities.Asset;
using AssetStatBlockValue = VttTools.Data.Assets.Entities.AssetStatBlockValue;
using AssetToken = VttTools.Data.Assets.Entities.AssetToken;

namespace VttTools.Data.Builders;

internal static class AssetSchemaBuilder {
    public static void ConfigureModel(ModelBuilder builder) {
        builder.Entity<Asset>(entity => {
            entity.ToTable("Assets");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Kind).IsRequired().HasConversion<string>();
            entity.Property(e => e.Category).IsRequired().HasMaxLength(64);
            entity.Property(e => e.Type).IsRequired().HasMaxLength(64);
            entity.Property(e => e.Subtype).IsRequired(false).HasMaxLength(64);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(128);
            entity.Property(e => e.Description).IsRequired().HasMaxLength(4096);
            entity.OwnsOne(ea => ea.TokenSize, sizeBuilder => {
                sizeBuilder.Property(s => s.Width).IsRequired().HasDefaultValue(0).HasColumnName(nameof(Size.Width));
                sizeBuilder.Property(s => s.Height).IsRequired().HasDefaultValue(0).HasColumnName(nameof(Size.Height));
            });
            entity.HasMany(e => e.StatBlock)
                .WithOne(e => e.Asset)
                .HasForeignKey(e => e.AssetId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.Property(e => e.OwnerId).IsRequired();
            entity.Property(e => e.IsPublished).IsRequired().HasDefaultValue(false);
            entity.Property(e => e.IsPublic).IsRequired().HasDefaultValue(false);
            entity.Property(e => e.IsDeleted).IsRequired().HasDefaultValue(false);
            entity.Property(e => e.Tags)
                .HasConversion(
                    v => JsonSerializer.Serialize(v, (JsonSerializerOptions?)null),
                    v => JsonSerializer.Deserialize<string[]>(v, (JsonSerializerOptions?)null) ?? Array.Empty<string>())
                .HasColumnType("nvarchar(max)");
            entity.HasQueryFilter(e => !e.IsDeleted);
            entity.HasOne(e => e.Portrait)
                .WithMany()
                .HasForeignKey(e => e.PortraitId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasIndex(e => e.OwnerId).HasDatabaseName("IX_Assets_OwnerId");
            entity.HasIndex(e => new { e.IsPublic, e.IsPublished }).HasDatabaseName("IX_Assets_IsPublic_IsPublished");
            entity.HasIndex(e => new { e.Kind, e.Category, e.Type }).HasDatabaseName("IX_Assets_Taxonomy");
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