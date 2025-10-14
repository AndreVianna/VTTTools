using AssetEntity = VttTools.Data.Assets.Entities.Asset;
using CreatureAssetEntity = VttTools.Data.Assets.Entities.CreatureAsset;
using DomainAsset = VttTools.Assets.Model.Asset;
using DomainAssetResource = VttTools.Assets.Model.AssetResource;
using DomainCreatureAsset = VttTools.Assets.Model.CreatureAsset;
using DomainCreatureProperties = VttTools.Assets.Model.CreatureProperties;
using DomainObjectAsset = VttTools.Assets.Model.ObjectAsset;
using DomainObjectProperties = VttTools.Assets.Model.ObjectProperties;
using DomainTokenStyle = VttTools.Assets.Model.TokenStyle;
using NamedSize = VttTools.Common.Model.NamedSize;
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
                Resources = [.. obj.Resources.Select(r => new DomainAssetResource {
                    ResourceId = r.ResourceId,
                    Resource = r.Resource?.ToModel(),
                    Role = r.Role
                })],
                Properties = new DomainObjectProperties {
                    Size = new NamedSize {
                        Width = obj.Properties.CellWidth,
                        Height = obj.Properties.CellHeight,
                        IsSquare = obj.Properties.CellWidth == obj.Properties.CellHeight
                    },
                    IsMovable = obj.Properties.IsMovable,
                    IsOpaque = obj.Properties.IsOpaque,
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
                Resources = [.. creature.Resources.Select(r => new DomainAssetResource {
                    ResourceId = r.ResourceId,
                    Resource = r.Resource?.ToModel(),
                    Role = r.Role
                })],
                Properties = new DomainCreatureProperties {
                    Size = new NamedSize {
                        Width = creature.Properties.CellSize,
                        Height = creature.Properties.CellSize,
                        IsSquare = true
                    },
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
                Resources = [.. obj.Resources.Select(r => new Entities.AssetResource {
                    AssetId = obj.Id,
                    ResourceId = r.ResourceId,
                    Role = r.Role
                })],
                IsPublic = obj.IsPublic,
                IsPublished = obj.IsPublished,
                CreatedAt = obj.CreatedAt,
                UpdatedAt = obj.UpdatedAt,
                Properties = new Entities.ObjectProperties {
                    CellWidth = (int)obj.Properties.Size.Width,
                    CellHeight = (int)obj.Properties.Size.Height,
                    IsMovable = obj.Properties.IsMovable,
                    IsOpaque = obj.Properties.IsOpaque,
                    TriggerEffectId = obj.Properties.TriggerEffectId
                }
            },
            DomainCreatureAsset creature => new CreatureAssetEntity {
                Id = creature.Id,
                OwnerId = creature.OwnerId,
                Kind = AssetKind.Creature,
                Name = creature.Name,
                Description = creature.Description,
                Resources = [.. creature.Resources.Select(r => new Entities.AssetResource {
                    AssetId = creature.Id,
                    ResourceId = r.ResourceId,
                    Role = r.Role
                })],
                IsPublic = creature.IsPublic,
                IsPublished = creature.IsPublished,
                CreatedAt = creature.CreatedAt,
                UpdatedAt = creature.UpdatedAt,
                Properties = new Entities.CreatureProperties {
                    CellSize = (int)creature.Properties.Size.Width,
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

        // Update Resources collection (join table entries)
        entity.Resources.Clear();
        foreach (var resource in model.Resources) {
            entity.Resources.Add(new Entities.AssetResource {
                AssetId = entity.Id,
                ResourceId = resource.ResourceId,
                Role = resource.Role
            });
        }

        entity.IsPublic = model.IsPublic;
        entity.IsPublished = model.IsPublished;
        entity.UpdatedAt = DateTime.UtcNow;

        // Update polymorphic properties
        switch (entity, model) {
            case (ObjectAssetEntity objEntity, DomainObjectAsset objModel):
                objEntity.Properties.CellWidth = (int)objModel.Properties.Size.Width;
                objEntity.Properties.CellHeight = (int)objModel.Properties.Size.Height;
                objEntity.Properties.IsMovable = objModel.Properties.IsMovable;
                objEntity.Properties.IsOpaque = objModel.Properties.IsOpaque;
                objEntity.Properties.TriggerEffectId = objModel.Properties.TriggerEffectId;
                break;
            case (CreatureAssetEntity creatureEntity, DomainCreatureAsset creatureModel):
                creatureEntity.Properties.CellSize = (int)creatureModel.Properties.Size.Width;
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