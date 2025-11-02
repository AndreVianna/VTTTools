using Asset = VttTools.Data.Assets.Entities.Asset;
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
            entity.Property(e => e.CreatedAt).IsRequired();
            entity.Property(e => e.UpdatedAt).IsRequired();
            entity.OwnsMany(e => e.Resources, resources => {
                resources.ToJson("Resources");
                resources.HasKey(r => new { r.ResourceId, r.Role });
                resources.Property(r => r.ResourceId).IsRequired();
                resources.Property(r => r.Role).IsRequired().HasConversion<int>();
                resources.Ignore(r => r.Resource);
            });

            entity.HasDiscriminator<AssetKind>("Kind")
                .HasValue<ObjectAsset>(AssetKind.Object)
                .HasValue<CreatureAsset>(AssetKind.Creature);
        });

        builder.Entity<ObjectAsset>(entity => entity.OwnsOne(e => e.Properties, props => {
            props.ToJson("ObjectProperties");
            props.Property(p => p.CellWidth).IsRequired();
            props.Property(p => p.CellHeight).IsRequired();
            props.Property(p => p.IsMovable).IsRequired();
            props.Property(p => p.IsOpaque).IsRequired();
            props.Property(p => p.TriggerEffectId);
        }));

        builder.Entity<CreatureAsset>(entity => entity.OwnsOne(e => e.Properties, props => {
            props.ToJson("CreatureProperties");
            props.Property(p => p.CellSize).IsRequired();
            props.Property(p => p.StatBlockId);
            props.Property(p => p.Category).IsRequired().HasConversion<string>();
            props.OwnsOne(p => p.TokenStyle, style => {
                style.Property(s => s.BorderColor);
                style.Property(s => s.BackgroundColor);
                style.Property(s => s.Shape).IsRequired().HasConversion<string>();
            });
        }));
    }
}