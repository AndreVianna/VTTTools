using Resource = VttTools.Media.Model.Resource;
using Asset = VttTools.Assets.Model.Asset;
using CharacterAsset = VttTools.Assets.Model.CharacterAsset;
using MonsterAsset = VttTools.Assets.Model.MonsterAsset;
using ObjectAsset = VttTools.Assets.Model.ObjectAsset;
using TokenStyle = VttTools.Assets.Model.TokenStyle;

using ResourceEntity = VttTools.Data.Media.Entities.Resource;
using AssetEntity = VttTools.Data.Assets.Entities.Asset;
using MonsterAssetEntity = VttTools.Data.Assets.Entities.MonsterAsset;
using CharacterAssetEntity = VttTools.Data.Assets.Entities.CharacterAsset;
using ObjectAssetEntity = VttTools.Data.Assets.Entities.ObjectAsset;
using TokenStyleEntity = VttTools.Data.Assets.Entities.TokenStyle;

namespace VttTools.Data.Assets;

internal static class Mapper {
    [return: NotNullIfNotNull(nameof(entity))]
    internal static Asset? ToModel(this AssetEntity? entity)
        => entity switch {
            null => null,
            ObjectAssetEntity obj => new ObjectAsset {
                Id = obj.Id,
                OwnerId = obj.OwnerId,
                Name = obj.Name,
                Description = obj.Description,
                IsPublic = obj.IsPublic,
                IsPublished = obj.IsPublished,
                Portrait = obj.Portrait?.ToModel(),
                TopDown = obj.TopDown?.ToModel(),
                Miniature = obj.Miniature?.ToModel(),
                Photo = obj.Photo?.ToModel(),
                Size = new NamedSize {
                    Width = Math.Round(obj.Size.Width, 3),
                    Height = Math.Round(obj.Size.Height, 3),
                },
                IsMovable = obj.IsMovable,
                IsOpaque = obj.IsOpaque,
                TriggerEffectId = obj.TriggerEffectId
            },
            MonsterAssetEntity monster => new MonsterAsset {
                Id = monster.Id,
                OwnerId = monster.OwnerId,
                Name = monster.Name,
                Description = monster.Description,
                IsPublic = monster.IsPublic,
                IsPublished = monster.IsPublished,
                Portrait = monster.Portrait?.ToModel(),
                TopDown = monster.TopDown?.ToModel(),
                Miniature = monster.Miniature?.ToModel(),
                Photo = monster.Photo?.ToModel(),
                Size = new NamedSize {
                    Width = Math.Round(monster.Size.Width, 3),
                    Height = Math.Round(monster.Size.Height, 3),
                },
                StatBlockId = monster.StatBlockId,
                TokenStyle = monster.TokenStyle != null ? new TokenStyle {
                    BorderColor = monster.TokenStyle.BorderColor,
                    BackgroundColor = monster.TokenStyle.BackgroundColor,
                    Shape = monster.TokenStyle.Shape
                } : null
            },
            CharacterAssetEntity character => new CharacterAsset {
                Id = character.Id,
                OwnerId = character.OwnerId,
                Name = character.Name,
                Description = character.Description,
                IsPublic = character.IsPublic,
                IsPublished = character.IsPublished,
                Portrait = character.Portrait?.ToModel(),
                TopDown = character.TopDown?.ToModel(),
                Miniature = character.Miniature?.ToModel(),
                Photo = character.Photo?.ToModel(),
                Size = new NamedSize {
                    Width = Math.Round(character.Size.Width, 3),
                    Height = Math.Round(character.Size.Height, 3),
                },
                StatBlockId = character.StatBlockId,
                TokenStyle = character.TokenStyle != null ? new TokenStyle {
                    BorderColor = character.TokenStyle.BorderColor,
                    BackgroundColor = character.TokenStyle.BackgroundColor,
                    Shape = character.TokenStyle.Shape
                } : null
            },
            _ => throw new InvalidOperationException($"Unknown asset entity type: {entity.GetType()}")
        };

    internal static AssetEntity ToEntity(this Asset model)
        => model switch {
            ObjectAsset obj => new ObjectAssetEntity {
                Id = obj.Id,
                OwnerId = obj.OwnerId,
                Kind = AssetKind.Object,
                Name = obj.Name,
                Description = obj.Description,
                PortraitId = obj.Portrait?.Id,
                TopDownId = obj.TopDown?.Id,
                MiniatureId = obj.Miniature?.Id,
                PhotoId = obj.Photo?.Id,
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
            MonsterAsset monster => new MonsterAssetEntity {
                Id = monster.Id,
                OwnerId = monster.OwnerId,
                Kind = AssetKind.Monster,
                Name = monster.Name,
                Description = monster.Description,
                PortraitId = monster.Portrait?.Id,
                TopDownId = monster.TopDown?.Id,
                MiniatureId = monster.Miniature?.Id,
                PhotoId = monster.Photo?.Id,
                IsPublic = monster.IsPublic,
                IsPublished = monster.IsPublished,
                Size = new NamedSize {
                    Width = Math.Round(monster.Size.Width, 3),
                    Height = Math.Round(monster.Size.Height, 3),
                },
                StatBlockId = monster.StatBlockId,
                TokenStyle = monster.TokenStyle != null ? new TokenStyleEntity {
                    BorderColor = monster.TokenStyle.BorderColor,
                    BackgroundColor = monster.TokenStyle.BackgroundColor,
                    Shape = monster.TokenStyle.Shape
                } : null
            },
            CharacterAsset character => new CharacterAssetEntity {
                Id = character.Id,
                OwnerId = character.OwnerId,
                Kind = AssetKind.Character,
                Name = character.Name,
                Description = character.Description,
                PortraitId = character.Portrait?.Id,
                TopDownId = character.TopDown?.Id,
                MiniatureId = character.Miniature?.Id,
                PhotoId = character.Photo?.Id,
                IsPublic = character.IsPublic,
                IsPublished = character.IsPublished,
                Size = new NamedSize {
                    Width = Math.Round(character.Size.Width, 3),
                    Height = Math.Round(character.Size.Height, 3),
                },
                StatBlockId = character.StatBlockId,
                TokenStyle = character.TokenStyle != null ? new TokenStyleEntity {
                    BorderColor = character.TokenStyle.BorderColor,
                    BackgroundColor = character.TokenStyle.BackgroundColor,
                    Shape = character.TokenStyle.Shape
                } : null
            },
            _ => throw new InvalidOperationException($"Unknown asset model type: {model.GetType()}")
        };

    internal static void UpdateFrom(this AssetEntity entity, Asset model) {
        entity.Name = model.Name;
        entity.Description = model.Description;
        entity.PortraitId = model.Portrait?.Id;
        entity.TopDownId = model.TopDown?.Id;
        entity.MiniatureId = model.Miniature?.Id;
        entity.PhotoId = model.Photo?.Id;
        entity.IsPublic = model.IsPublic;
        entity.IsPublished = model.IsPublished;

        switch (entity, model) {
            case (ObjectAssetEntity objEntity, ObjectAsset objModel):
                objEntity.Size = new NamedSize {
                    Width = Math.Round(objModel.Size.Width, 3),
                    Height = Math.Round(objModel.Size.Height, 3),
                };
                objEntity.IsMovable = objModel.IsMovable;
                objEntity.IsOpaque = objModel.IsOpaque;
                objEntity.TriggerEffectId = objModel.TriggerEffectId;
                break;
            case (MonsterAssetEntity monsterEntity, MonsterAsset monsterModel):
                monsterEntity.Size = new NamedSize {
                    Width = Math.Round(monsterModel.Size.Width, 3),
                    Height = Math.Round(monsterModel.Size.Height, 3),
                };
                monsterEntity.StatBlockId = monsterModel.StatBlockId;
                monsterEntity.TokenStyle = monsterModel.TokenStyle == null
                    ? null
                    : new TokenStyleEntity {
                        BorderColor = monsterModel.TokenStyle.BorderColor,
                        BackgroundColor = monsterModel.TokenStyle.BackgroundColor,
                        Shape = monsterModel.TokenStyle.Shape
                    };
                break;
            case (CharacterAssetEntity characterEntity, CharacterAsset characterModel):
                characterEntity.Size = new NamedSize {
                    Width = Math.Round(characterModel.Size.Width, 3),
                    Height = Math.Round(characterModel.Size.Height, 3),
                };
                characterEntity.StatBlockId = characterModel.StatBlockId;
                characterEntity.TokenStyle = characterModel.TokenStyle == null
                    ? null
                    : new TokenStyleEntity {
                        BorderColor = characterModel.TokenStyle.BorderColor,
                        BackgroundColor = characterModel.TokenStyle.BackgroundColor,
                        Shape = characterModel.TokenStyle.Shape
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