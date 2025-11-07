using DomainAsset = VttTools.Assets.Model.Asset;
using DomainAssetToken = VttTools.Assets.Model.AssetToken;
using DomainCreatureAsset = VttTools.Assets.Model.CreatureAsset;
using DomainObjectAsset = VttTools.Assets.Model.ObjectAsset;
using DomainTokenStyle = VttTools.Assets.Model.TokenStyle;

using AssetEntity = VttTools.Data.Assets.Entities.Asset;
using AssetTokenEntity = VttTools.Data.Assets.Entities.AssetToken;
using CreatureAssetEntity = VttTools.Data.Assets.Entities.CreatureAsset;
using ObjectAssetEntity = VttTools.Data.Assets.Entities.ObjectAsset;
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
                Tokens = [.. obj.Tokens.Select(r => new DomainAssetToken {
                    Token = r.Token.ToModel(),
                    IsDefault = r.IsDefault,
                })],
                Portrait = obj.Portrait?.ToModel(),
                Size = new NamedSize {
                    Width = Math.Round(obj.Size.Width, 3),
                    Height = Math.Round(obj.Size.Height, 3),
                },
                IsMovable = obj.IsMovable,
                IsOpaque = obj.IsOpaque,
                TriggerEffectId = obj.TriggerEffectId
            },
            CreatureAssetEntity creature => new DomainCreatureAsset {
                Id = creature.Id,
                OwnerId = creature.OwnerId,
                Name = creature.Name,
                Description = creature.Description,
                IsPublic = creature.IsPublic,
                IsPublished = creature.IsPublished,
                Tokens = [.. creature.Tokens.Select(r => new DomainAssetToken {
                    Token = r.Token.ToModel(),
                    IsDefault = r.IsDefault
                })],
                Portrait = creature.Portrait?.ToModel(),
                Size = new NamedSize {
                    Width = Math.Round(creature.Size.Width, 3),
                    Height = Math.Round(creature.Size.Height, 3),
                },
                StatBlockId = creature.StatBlockId,
                Category = creature.Category,
                TokenStyle = creature.TokenStyle != null ? new DomainTokenStyle {
                    BorderColor = creature.TokenStyle.BorderColor,
                    BackgroundColor = creature.TokenStyle.BackgroundColor,
                    Shape = creature.TokenStyle.Shape
                } : null
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
                Tokens = [.. obj.Tokens.Select(r => new AssetTokenEntity {
                    TokenId = r.Token.Id,
                    Token = r.Token.ToEntity(),
                    IsDefault = r.IsDefault
                })],
                PortraitId = obj.Portrait?.Id,
                IsPublic = obj.IsPublic,
                IsPublished = obj.IsPublished,
                Size = new NamedSize {
                    Width = Math.Round(obj.Size.Width, 3),
                    Height = Math.Round(obj.Size.Height, 3),
                },
                IsMovable = obj.IsMovable,
                IsOpaque = obj.IsOpaque,
                TriggerEffectId = obj.TriggerEffectId
            },
            DomainCreatureAsset creature => new CreatureAssetEntity {
                Id = creature.Id,
                OwnerId = creature.OwnerId,
                Kind = AssetKind.Creature,
                Name = creature.Name,
                Description = creature.Description,
                PortraitId = creature.Portrait?.Id,
                Tokens = [.. creature.Tokens.Select(r => new AssetTokenEntity {
                    TokenId = r.Token.Id,
                    Token = r.Token.ToEntity(),
                    IsDefault = r.IsDefault
                })],
                IsPublic = creature.IsPublic,
                IsPublished = creature.IsPublished,
                Size = new NamedSize {
                    Width = Math.Round(creature.Size.Width, 3),
                    Height = Math.Round(creature.Size.Height, 3),
                },
                StatBlockId = creature.StatBlockId,
                Category = creature.Category,
                TokenStyle = creature.TokenStyle != null ? new Entities.TokenStyle {
                    BorderColor = creature.TokenStyle.BorderColor,
                    BackgroundColor = creature.TokenStyle.BackgroundColor,
                    Shape = creature.TokenStyle.Shape
                } : null
            },
            _ => throw new InvalidOperationException($"Unknown asset model type: {model.GetType()}")
        };

    internal static void UpdateFrom(this AssetEntity entity, DomainAsset model) {
        entity.Name = model.Name;
        entity.Description = model.Description;

        var tokenIds = model.Tokens.Select(r => r.Token.Id).ToHashSet();

        foreach (var existing in entity.Tokens.ToList()) {
            if (!tokenIds.Contains(existing.TokenId)) {
                entity.Tokens.Remove(existing);
            }
        }

        entity.PortraitId = model.Portrait?.Id;

        foreach (var token in model.Tokens) {
            var existing = entity.Tokens.FirstOrDefault(r => r.TokenId == token.Token.Id);
            if (existing != null) {
                existing.IsDefault = token.IsDefault;
            }
            else {
                entity.Tokens.Add(new AssetTokenEntity {
                    TokenId = token.Token.Id,
                    Token = token.Token.ToEntity(),
                    IsDefault = token.IsDefault
                });
            }
        }

        entity.IsPublic = model.IsPublic;
        entity.IsPublished = model.IsPublished;

        switch (entity, model) {
            case (ObjectAssetEntity objEntity, DomainObjectAsset objModel):
                objEntity.Size = new NamedSize {
                    Width = Math.Round(objModel.Size.Width, 3),
                    Height = Math.Round(objModel.Size.Height, 3),
                };
                objEntity.IsMovable = objModel.IsMovable;
                objEntity.IsOpaque = objModel.IsOpaque;
                objEntity.TriggerEffectId = objModel.TriggerEffectId;
                break;
            case (CreatureAssetEntity creatureEntity, DomainCreatureAsset creatureModel):
                creatureEntity.Size = new NamedSize {
                    Width = Math.Round(creatureModel.Size.Width, 3),
                    Height = Math.Round(creatureModel.Size.Height, 3),
                };
                creatureEntity.StatBlockId = creatureModel.StatBlockId;
                creatureEntity.Category = creatureModel.Category;
                creatureEntity.TokenStyle = creatureModel.TokenStyle == null
                    ? null
                    : new Entities.TokenStyle {
                        BorderColor = creatureModel.TokenStyle.BorderColor,
                        BackgroundColor = creatureModel.TokenStyle.BackgroundColor,
                        Shape = creatureModel.TokenStyle.Shape
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