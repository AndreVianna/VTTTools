using Asset = VttTools.Data.Assets.Entities.Asset;
using AssetStatEntry = VttTools.Data.Assets.Entities.AssetStatEntry;
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
            entity.OwnsOne(ea => ea.Size, sizeBuilder => {
                sizeBuilder.Property(s => s.Width).IsRequired().HasDefaultValue(0).HasColumnName(nameof(Size.Width));
                sizeBuilder.Property(s => s.Height).IsRequired().HasDefaultValue(0).HasColumnName(nameof(Size.Height));
            });
            entity.Property(e => e.OwnerId).IsRequired();
            entity.Property(e => e.IsPublished).IsRequired().HasDefaultValue(false);
            entity.Property(e => e.IsPublic).IsRequired().HasDefaultValue(false);
            entity.Property(e => e.IsDeleted).IsRequired().HasDefaultValue(false);
            entity.Property(e => e.Tags)
                .HasConversion(
                    v => JsonSerializer.Serialize(v, (JsonSerializerOptions?)null),
                    v => JsonSerializer.Deserialize<string[]>(v, (JsonSerializerOptions?)null) ?? Array.Empty<string>())
                .HasColumnType("nvarchar(max)");

            entity.HasOne(e => e.Thumbnail)
                .WithMany().IsRequired()
                .HasForeignKey(e => e.ThumbnailId)
                .OnDelete(DeleteBehavior.Restrict);
            entity.HasOne(e => e.Portrait)
                .WithMany()
                .HasForeignKey(e => e.PortraitId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasIndex(e => e.OwnerId).HasDatabaseName("IX_Assets_OwnerId");
            entity.HasIndex(e => new { e.IsPublic, e.IsPublished }).HasDatabaseName("IX_Assets_IsPublic_IsPublished");
            entity.HasIndex(e => new { e.Kind, e.Category, e.Type }).HasDatabaseName("IX_Assets_Taxonomy");
            entity.HasQueryFilter(e => !e.IsDeleted);
        });

        builder.Entity<AssetToken>(entity => {
            entity.ToTable("AssetTokens");
            entity.HasKey(e => new { e.AssetId, e.TokenId });
            entity.Property(e => e.Index).IsRequired();
            entity.HasIndex(e => new { e.AssetId, e.Index }).IsUnique();
            entity.HasOne(e => e.Token)
                .WithMany()
                .HasForeignKey(e => e.TokenId)
                .OnDelete(DeleteBehavior.Restrict);
            entity.HasOne(e => e.Asset)
                .WithMany(e => e.Tokens)
                .HasForeignKey(e => e.AssetId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        builder.Entity<AssetStatEntry>(entity => {
            entity.ToTable("AssetStatEntries");

            // 4-column composite primary key
            entity.HasKey(e => new { e.AssetId, e.GameSystemId, e.Level, e.Key });

            entity.Property(e => e.Level).IsRequired();
            entity.Property(e => e.Key).IsRequired().HasMaxLength(64);
            entity.Property(e => e.Type).IsRequired().HasConversion<string>();
            entity.Property(e => e.Value).HasMaxLength(8192);
            entity.Property(e => e.Description).HasMaxLength(2048);
            entity.Property(e => e.Modifiers).HasMaxLength(1024);

            // FK to Asset (Cascade)
            entity.HasOne(e => e.Asset)
                  .WithMany(a => a.StatBlockEntries)
                  .HasForeignKey(e => e.AssetId)
                  .OnDelete(DeleteBehavior.Cascade);

            // FK to GameSystem (Restrict - don't delete game systems with stats)
            entity.HasOne(e => e.GameSystem)
                  .WithMany()
                  .HasForeignKey(e => e.GameSystemId)
                  .OnDelete(DeleteBehavior.Restrict);

            // Indexes
            entity.HasIndex(e => e.GameSystemId);
            entity.HasIndex(e => new { e.AssetId, e.GameSystemId });
        });
    }
}