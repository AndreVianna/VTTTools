using AssetEntity = VttTools.Data.Assets.Entities.Asset;
using CreatureAssetEntity = VttTools.Data.Assets.Entities.CreatureAsset;
using DomainAsset = VttTools.Assets.Model.Asset;
using DomainCreatureAsset = VttTools.Assets.Model.CreatureAsset;
using DomainCreatureProperties = VttTools.Assets.Model.CreatureProperties;
using DomainObjectAsset = VttTools.Assets.Model.ObjectAsset;
using DomainObjectProperties = VttTools.Assets.Model.ObjectProperties;
using DomainTokenStyle = VttTools.Assets.Model.TokenStyle;
using ObjectAssetEntity = VttTools.Data.Assets.Entities.ObjectAsset;
using Resource = VttTools.Media.Model.Resource;
using ResourceEntity = VttTools.Data.Media.Entities.Resource;

namespace VttTools.Data.Assets;

internal static class Mapper {
    [return: NotNullIfNotNull(nameof(entity))]
    internal static DomainAsset? ToModel(this AssetEntity? entity)
        => entity switch {
            null => null,
            ObjectAssetEntity obj => new DomainObjectAsset {
                Id = obj.Id,
                OwnerId = obj.OwnerId,
                Name = obj.Name,
                Description = obj.Description,
                IsPublic = obj.IsPublic,
                IsPublished = obj.IsPublished,
                CreatedAt = obj.CreatedAt,
                UpdatedAt = obj.UpdatedAt,
                Resource = obj.Resource?.ToModel(),
                Properties = new DomainObjectProperties {
                    CellWidth = obj.Properties.CellWidth,
                    CellHeight = obj.Properties.CellHeight,
                    IsMovable = obj.Properties.IsMovable,
                    IsOpaque = obj.Properties.IsOpaque,
                    IsVisible = obj.Properties.IsVisible,
                    TriggerEffectId = obj.Properties.TriggerEffectId
                }
            },
            CreatureAssetEntity creature => new DomainCreatureAsset {
                Id = creature.Id,
                OwnerId = creature.OwnerId,
                Name = creature.Name,
                Description = creature.Description,
                IsPublic = creature.IsPublic,
                IsPublished = creature.IsPublished,
                CreatedAt = creature.CreatedAt,
                UpdatedAt = creature.UpdatedAt,
                Resource = creature.Resource?.ToModel(),
                Properties = new DomainCreatureProperties {
                    CellSize = creature.Properties.CellSize,
                    StatBlockId = creature.Properties.StatBlockId,
                    Category = creature.Properties.Category,
                    TokenStyle = creature.Properties.TokenStyle != null ? new DomainTokenStyle {
                        BorderColor = creature.Properties.TokenStyle.BorderColor,
                        BackgroundColor = creature.Properties.TokenStyle.BackgroundColor,
                        Shape = creature.Properties.TokenStyle.Shape
                    } : null
                }
            },
            _ => throw new InvalidOperationException($"Unknown asset entity type: {entity.GetType()}")
        };

    internal static AssetEntity ToEntity(this DomainAsset model)
        => model switch {
            DomainObjectAsset obj => new ObjectAssetEntity {
                Id = obj.Id,
                OwnerId = obj.OwnerId,
                Kind = AssetKind.Object,
                Name = obj.Name,
                Description = obj.Description,
                ResourceId = obj.Resource?.Id,
                IsPublic = obj.IsPublic,
                IsPublished = obj.IsPublished,
                CreatedAt = obj.CreatedAt,
                UpdatedAt = obj.UpdatedAt,
                Properties = new Entities.ObjectProperties {
                    CellWidth = obj.Properties.CellWidth,
                    CellHeight = obj.Properties.CellHeight,
                    IsMovable = obj.Properties.IsMovable,
                    IsOpaque = obj.Properties.IsOpaque,
                    IsVisible = obj.Properties.IsVisible,
                    TriggerEffectId = obj.Properties.TriggerEffectId
                }
            },
            DomainCreatureAsset creature => new CreatureAssetEntity {
                Id = creature.Id,
                OwnerId = creature.OwnerId,
                Kind = AssetKind.Creature,
                Name = creature.Name,
                Description = creature.Description,
                ResourceId = creature.Resource?.Id,
                IsPublic = creature.IsPublic,
                IsPublished = creature.IsPublished,
                CreatedAt = creature.CreatedAt,
                UpdatedAt = creature.UpdatedAt,
                Properties = new Entities.CreatureProperties {
                    CellSize = creature.Properties.CellSize,
                    StatBlockId = creature.Properties.StatBlockId,
                    Category = creature.Properties.Category,
                    TokenStyle = creature.Properties.TokenStyle != null ? new Entities.TokenStyle {
                        BorderColor = creature.Properties.TokenStyle.BorderColor,
                        BackgroundColor = creature.Properties.TokenStyle.BackgroundColor,
                        Shape = creature.Properties.TokenStyle.Shape
                    } : null
                }
            },
            _ => throw new InvalidOperationException($"Unknown asset model type: {model.GetType()}")
        };

    internal static void UpdateFrom(this AssetEntity entity, DomainAsset model) {
        entity.Name = model.Name;
        entity.Description = model.Description;
        entity.ResourceId = model.Resource?.Id;
        entity.IsPublic = model.IsPublic;
        entity.IsPublished = model.IsPublished;
        entity.UpdatedAt = DateTime.UtcNow;

        // Update polymorphic properties
        switch (entity, model) {
            case (ObjectAssetEntity objEntity, DomainObjectAsset objModel):
                objEntity.Properties.CellWidth = objModel.Properties.CellWidth;
                objEntity.Properties.CellHeight = objModel.Properties.CellHeight;
                objEntity.Properties.IsMovable = objModel.Properties.IsMovable;
                objEntity.Properties.IsOpaque = objModel.Properties.IsOpaque;
                objEntity.Properties.IsVisible = objModel.Properties.IsVisible;
                objEntity.Properties.TriggerEffectId = objModel.Properties.TriggerEffectId;
                break;
            case (CreatureAssetEntity creatureEntity, DomainCreatureAsset creatureModel):
                creatureEntity.Properties.CellSize = creatureModel.Properties.CellSize;
                creatureEntity.Properties.StatBlockId = creatureModel.Properties.StatBlockId;
                creatureEntity.Properties.Category = creatureModel.Properties.Category;
                creatureEntity.Properties.TokenStyle = creatureModel.Properties.TokenStyle == null
                    ? null
                    : new Entities.TokenStyle {
                        BorderColor = creatureModel.Properties.TokenStyle.BorderColor,
                        BackgroundColor = creatureModel.Properties.TokenStyle.BackgroundColor,
                        Shape = creatureModel.Properties.TokenStyle.Shape
                    };
                break;
            default:
                throw new InvalidOperationException($"Mismatched asset types: entity={entity.GetType()}, model={model.GetType()}");
        }
    }

    [return: NotNullIfNotNull(nameof(entity))]
    internal static Resource? ToModel(this ResourceEntity? entity)
        => entity is null ? null : new() {
            Id = entity.Id,
            Type = entity.Type,
            Path = entity.Path,
            Metadata = new() {
                ContentType = entity.ContentType,
                FileName = entity.FileName,
                FileLength = entity.FileLength,
                ImageSize = entity.ImageSize,
                Duration = entity.Duration,
            },
            Tags = entity.Tags,
        };
}