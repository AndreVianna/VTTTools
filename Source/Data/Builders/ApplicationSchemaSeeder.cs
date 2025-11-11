using Resource = VttTools.Data.Media.Entities.Resource;
using Asset = VttTools.Data.Assets.Entities.Asset;
using AssetToken = VttTools.Data.Assets.Entities.AssetToken;
using ObjectAsset = VttTools.Data.Assets.Entities.ObjectAsset;
using CreatureAsset = VttTools.Data.Assets.Entities.CreatureAsset;
using Adventure = VttTools.Data.Library.Entities.Adventure;
using Encounter = VttTools.Data.Library.Entities.Encounter;
using Effect = VttTools.Data.Assets.Entities.Effect;

namespace VttTools.Data.Builders;

internal static class ApplicationSchemaSeeder {
    public static void Seed(ModelBuilder builder) {
        builder.Entity<Resource>().HasData([
                new () {
                    Id = new Guid("019A50F8-F3E5-702B-89D3-33D694391F66"),
                    Type = ResourceType.Image,
                    ContentType = "image/png",
                    FileName = "wooden-crate.png",
                    FileLength = 1170,
                    ImageSize = new Size(200, 200),
                    Path = "images/1f66/019a50f8f3e5702b89d333d694391f66",
                },
                new () {
                    Id = new Guid("019A50CE-4B04-7378-8E6E-372BDF798985"),
                    Type = ResourceType.Image,
                    ContentType = "image/png",
                    FileName = "goblin.png",
                    FileLength = 8193,
                    ImageSize = new Size(200, 200),
                    Path = "images/8985/019a50ce4b0473788e6e372bdf798985",
                },
                new () {
                    Id = new Guid("019A50F8-394B-79D2-9660-9B803391DD71"),
                    Type = ResourceType.Image,
                    ContentType = "image/png",
                    FileName = "hero-character.png",
                    FileLength = 6821,
                    ImageSize = new Size(200, 200),
                    Path = "images/dd71/019a50f8394b79d296609b803391dd71",
                },
                new () {
                    Id = new Guid("019A50F8-AF0E-7EDE-BBAB-C1AA0775FA86"),
                    Type = ResourceType.Image,
                    ContentType = "image/png",
                    FileName = "treasure-chest.png",
                    FileLength = 2286,
                    ImageSize = new Size(200, 200),
                    Path = "images/fa86/019a50f8af0e7edebbabc1aa0775fa86",
                }
        ]);

        builder.Entity<ObjectAsset>().HasData([
            new () {
                Id = new Guid("019A07E3-9294-749D-9323-B759664A5436"),
                OwnerId = new Guid("019639EA-C7DE-7A01-8548-41EDFCCDE206"),
                PortraitId = new Guid("019A50F8-F3E5-702B-89D3-33D694391F66"),
                Name = "Wooden Crate",
                Size = NamedSize.FromName(SizeName.Medium),
            },
            new () {
                Id = new Guid("019A07E4-ECBC-7F23-B6C9-26A7D72AC421"),
                OwnerId = new Guid("019639EA-C7DE-7A01-8548-41EDFCCDE206"),
                PortraitId  = new Guid("019A50F8-F3E5-702B-89D3-33D694391F66"),
                Name = "Small Create",
                Size = NamedSize.FromName(SizeName.Small),
            },
            new () {
                Id = new Guid("019A07E5-5550-7993-9B0B-84244F1543DF"),
                OwnerId = new Guid("019639EA-C7DE-7A01-8548-41EDFCCDE206"),
                PortraitId = new Guid("019A50F8-F3E5-702B-89D3-33D694391F66"),
                Name = "Large Crate",
                Size = NamedSize.FromName(SizeName.Large),
            },
            new () {
                Id = new Guid("019A07E6-82A2-7286-ACAB-7CCB6CF652BD"),
                OwnerId = new Guid("019639EA-C7DE-7A01-8548-41EDFCCDE206"),
                PortraitId = new Guid("019A50F8-AF0E-7EDE-BBAB-C1AA0775FA86"),
                Name = "Wide Chest",
                Size = NamedSize.FromSize(2, 1),
            },
        ]);

        builder.Entity<CreatureAsset>().HasData([
            new () {
                Id = new Guid("019A2B1A-E277-7FA4-9A78-654F24400B79"),
                OwnerId = new Guid("019639EA-C7DE-7A01-8548-41EDFCCDE206"),
                PortraitId = new Guid("019A50CE-4B04-7378-8E6E-372BDF798985"),
                Name = "Goblin",
                Category = CreatureCategory.Monster,
                Size = NamedSize.FromName(SizeName.Medium),
            },
            new () {
                Id = new Guid("019A2B1B-25CF-74A7-B1C3-C9F46CBFB9FA"),
                OwnerId = new Guid("019639EA-C7DE-7A01-8548-41EDFCCDE206"),
                PortraitId = new Guid("019A50F8-394B-79D2-9660-9B803391DD71"),
                Name = "Elf Paladin Squire",
                Category = CreatureCategory.Character,
                Size = NamedSize.FromName(SizeName.Medium),
            }
        ]);

        builder.Entity<AssetToken>().HasData([
            new AssetToken() {
                AssetId = new Guid("019A07E3-9294-749D-9323-B759664A5436"),
                TokenId = new Guid("019A50F8-F3E5-702B-89D3-33D694391F66"),
                IsDefault = true,
            },
            new AssetToken() {
                AssetId = new Guid("019A07E4-ECBC-7F23-B6C9-26A7D72AC421"),
                TokenId = new Guid("019A50F8-F3E5-702B-89D3-33D694391F66"),
                IsDefault = true,
            },
            new AssetToken() {
                AssetId = new Guid("019A07E5-5550-7993-9B0B-84244F1543DF"),
                TokenId = new Guid("019A50F8-F3E5-702B-89D3-33D694391F66"),
                IsDefault = true,
            },
            new AssetToken() {
                AssetId = new Guid("019A07E6-82A2-7286-ACAB-7CCB6CF652BD"),
                TokenId = new Guid("019A50F8-AF0E-7EDE-BBAB-C1AA0775FA86"),
                IsDefault = true,
            },
            new AssetToken() {
                AssetId = new Guid("019A2B1A-E277-7FA4-9A78-654F24400B79"),
                TokenId = new Guid("019A50CE-4B04-7378-8E6E-372BDF798985"),
                IsDefault = true,
            },
            new AssetToken() {
                AssetId = new Guid("019A2B1B-25CF-74A7-B1C3-C9F46CBFB9FA"),
                TokenId = new Guid("019A50F8-394B-79D2-9660-9B803391DD71"),
                IsDefault = true,
            },
        ]);

        builder.Entity<Adventure>().HasData([
            new () {
                Id = new Guid("019A1480-D108-7627-8394-1F2A607AB656"),
                CampaignId = null,
                OwnerId = new Guid("019639EA-C7DE-7A01-8548-41EDFCCDE206"),
                Name = "My Adventure",
                Style = AdventureStyle.OpenWorld,
                Description = "My new adventure",
                Background = null,
                IsOneShot = true,
                IsPublished = false,
                IsPublic = false,
            },
            new () {
                Id = new Guid("019A1488-D51D-7B45-A579-FA2D31F118B3"),
                CampaignId = null,
                OwnerId = new Guid("019639EA-C7DE-7A01-8548-41EDFCCDE206"),
                Name = "Untitled Adventure",
                Style = AdventureStyle.Generic,
                Description = "A new adventure.",
                Background = null,
                IsOneShot = false,
                IsPublished = false,
                IsPublic = false
            }
        ]);

        builder.Entity<Encounter>().HasData([
            new Encounter() {
                AdventureId = new Guid("019A1480-D108-7627-8394-1F2A607AB656"),
                Id = new Guid("019A1481-3F2C-7B4C-8D1E-3C4E2F5B6A7B"),
                Name = "The Tavern",
                Description = "The adventure begins in a small tavern.",
            },
        ]);

        builder.Entity<UserRole>().HasData([
            new() {
                UserId = Guid.Parse("019639ea-c7de-7a01-8548-41edfccde206"),
                RoleId = Guid.Parse("019639ea-c7de-7e6f-b549-baf14386ad2f"),
            },
        ]);
    }
}