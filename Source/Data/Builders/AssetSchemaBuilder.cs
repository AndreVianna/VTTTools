using Asset = VttTools.Data.Assets.Entities.Asset;
using ObjectAsset = VttTools.Data.Assets.Entities.ObjectAsset;
using CreatureAsset = VttTools.Data.Assets.Entities.CreatureAsset;
using MonsterAsset = VttTools.Data.Assets.Entities.MonsterAsset;
using CharacterAsset = VttTools.Data.Assets.Entities.CharacterAsset;

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
            entity.HasOne(e => e.Portrait)
                .WithMany()
                .HasForeignKey(e => e.PortraitId)
                .OnDelete(DeleteBehavior.Restrict);
            entity.HasOne(e => e.TopDown)
                .WithMany()
                .HasForeignKey(e => e.TopDownId)
                .OnDelete(DeleteBehavior.Restrict);
            entity.HasOne(e => e.Miniature)
                .WithMany()
                .HasForeignKey(e => e.MiniatureId)
                .OnDelete(DeleteBehavior.Restrict);
            entity.HasOne(e => e.Photo)
                .WithMany()
                .HasForeignKey(e => e.PhotoId)
                .OnDelete(DeleteBehavior.Restrict);
            entity.ToTable(t => t.HasCheckConstraint("CK_Asset_Photo_ObjectOnly", "(Kind != 'Object') OR (PhotoId IS NULL)"));

            entity.HasDiscriminator<AssetKind>("Kind")
                .HasValue<ObjectAsset>(AssetKind.Object)
                .HasValue<MonsterAsset>(AssetKind.Monster)
                .HasValue<CharacterAsset>(AssetKind.Character);
        });

        builder.Entity<ObjectAsset>(entity => {
            entity.Property(p => p.IsMovable).IsRequired();
            entity.Property(p => p.IsOpaque).IsRequired();
            entity.Property(p => p.TriggerEffectId);
        });

        builder.Entity<MonsterAsset>(entity => {
            entity.Property(p => p.StatBlockId);
            entity.OwnsOne(p => p.TokenStyle, style => {
                style.Property(s => s.BorderColor).HasColumnName("TokenStyle_BorderColor");
                style.Property(s => s.BackgroundColor).HasColumnName("TokenStyle_BackgroundColor");
                style.Property(s => s.Shape).IsRequired().HasConversion<string>().HasColumnName("TokenStyle_Shape");
            });
        });

        builder.Entity<CharacterAsset>(entity => {
            entity.Property(p => p.StatBlockId);
            entity.OwnsOne(p => p.TokenStyle, style => {
                style.Property(s => s.BorderColor).HasColumnName("TokenStyle_BorderColor");
                style.Property(s => s.BackgroundColor).HasColumnName("TokenStyle_BackgroundColor");
                style.Property(s => s.Shape).IsRequired().HasConversion<string>().HasColumnName("TokenStyle_Shape");
            });
        });
    }
}