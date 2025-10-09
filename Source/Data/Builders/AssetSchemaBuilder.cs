using Asset = VttTools.Data.Assets.Entities.Asset;
using CreatureAsset = VttTools.Data.Assets.Entities.CreatureAsset;
using ObjectAsset = VttTools.Data.Assets.Entities.ObjectAsset;

namespace VttTools.Data.Builders;

internal static class AssetSchemaBuilder {
    public static void ConfigureModel(ModelBuilder builder) {
        // Configure base Asset entity with TPH (Table-Per-Hierarchy) inheritance
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

            // Configure AssetResources collection (owned collection stored as JSON)
            // Note: Resource navigation property must be loaded explicitly in service layer
            // because EF Core doesn't support navigations to regular entities from JSON-owned types
            entity.OwnsMany(e => e.Resources, resources => {
                resources.ToJson("Resources");
                resources.Property(r => r.ResourceId).IsRequired();
                resources.Property(r => r.Role).IsRequired().HasConversion<int>();
                resources.Property(r => r.IsDefault).IsRequired();
                resources.Ignore(r => r.Resource);  // Ignore navigation - loaded separately
            });

            // Configure TPH discriminator
            entity.HasDiscriminator<AssetKind>("Kind")
                .HasValue<ObjectAsset>(AssetKind.Object)
                .HasValue<CreatureAsset>(AssetKind.Creature);
        });

        // Configure ObjectAsset with JSON properties
        builder.Entity<ObjectAsset>(entity => entity.OwnsOne(e => e.Properties, props => {
            props.ToJson("ObjectProperties");  // Explicit column name
            props.Property(p => p.CellWidth).IsRequired();
            props.Property(p => p.CellHeight).IsRequired();
            props.Property(p => p.IsMovable).IsRequired();
            props.Property(p => p.IsOpaque).IsRequired();
            props.Property(p => p.IsVisible).IsRequired();
            props.Property(p => p.TriggerEffectId);
        }));

        // Configure CreatureAsset with JSON properties
        builder.Entity<CreatureAsset>(entity => entity.OwnsOne(e => e.Properties, props => {
            props.ToJson("CreatureProperties");  // Explicit column name
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