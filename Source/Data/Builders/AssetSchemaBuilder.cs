using Asset = VttTools.Data.Assets.Entities.Asset;
using AssetResource = VttTools.Data.Assets.Entities.AssetResource;
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

            // Configure many-to-many relationship through AssetResources join table
            entity.HasMany(e => e.Resources)
                .WithOne(ar => ar.Asset)
                .HasForeignKey(ar => ar.AssetId)
                .OnDelete(DeleteBehavior.Cascade);

            // Configure TPH discriminator
            entity.HasDiscriminator<AssetKind>("Kind")
                .HasValue<ObjectAsset>(AssetKind.Object)
                .HasValue<CreatureAsset>(AssetKind.Creature);
        });

        // Configure AssetResource join table
        builder.Entity<AssetResource>(entity => {
            entity.ToTable("AssetResources");
            entity.HasKey(ar => new { ar.AssetId, ar.ResourceId });  // Composite primary key

            entity.Property(ar => ar.Role).IsRequired().HasConversion<int>();

            // Relationship to Resource (many AssetResources can reference one Resource)
            entity.HasOne(ar => ar.Resource)
                .WithMany()
                .HasForeignKey(ar => ar.ResourceId)
                .OnDelete(DeleteBehavior.Restrict);  // Don't cascade delete resources when asset deleted
        });

        // Configure ObjectAsset with JSON properties
        builder.Entity<ObjectAsset>(entity => entity.OwnsOne(e => e.Properties, props => {
            props.ToJson("ObjectProperties");  // Explicit column name
            props.Property(p => p.CellWidth).IsRequired();
            props.Property(p => p.CellHeight).IsRequired();
            props.Property(p => p.IsMovable).IsRequired();
            props.Property(p => p.IsOpaque).IsRequired();
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