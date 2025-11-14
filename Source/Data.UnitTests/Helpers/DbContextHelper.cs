using AdventureEntity = VttTools.Data.Library.Entities.Adventure;
using GameSessionEntity = VttTools.Data.Game.Entities.GameSession;
using ResourceEntity = VttTools.Data.Media.Entities.Resource;
using EncounterEntity = VttTools.Data.Library.Entities.Encounter;
using MonsterAssetEntity = VttTools.Data.Assets.Entities.MonsterAsset;

namespace VttTools.Data.Helpers;

internal static class DbContextHelper {
    public static ApplicationDbContext CreateInMemoryContext(Guid currentUserId) {
        var dbName = $"TestDb_{Guid.CreateVersion7()}";
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(dbName)
            .UseSeeding((ctx, _) => {
                SeedAssets(ctx, currentUserId);
                SeedLibrary(ctx, currentUserId);
                SeedGameSessions(ctx, currentUserId);
            })
            .EnableDetailedErrors()
            .EnableSensitiveDataLogging()
            .LogTo(Console.WriteLine)
            .Options;
        var context = new ApplicationDbContext(options);
        context.Database.EnsureDeleted();
        context.Database.EnsureCreated();
        return context;
    }

    public static void Dispose(ApplicationDbContext context)
        => context.Dispose();

    private static void SeedAssets(ApplicationDbContext context, Guid currentUserId) {
        // First add Tokens that will be referenced by Assets
        var resources = new[] {
            CreateTestResourceEntity("Asset 1 Display"),
            CreateTestResourceEntity("Asset 2 Display"),
            CreateTestResourceEntity("Asset 3 Display"),
            CreateTestResourceEntity("Asset 4 Display"),
        };
        context.Resources.AddRange(resources);
        context.SaveChanges();

        // Then add Assets that reference the Tokens
        var assets = new[] {
            CreateTestAssetEntity("Asset 1", AssetKind.Monster, isPublished: true, isPublic: true, ownerId: currentUserId, displayId: resources[0].Id),
            CreateTestAssetEntity("Asset 2", ownerId: currentUserId, displayId: resources[1].Id),
            CreateTestAssetEntity("Asset 3", AssetKind.Monster, isPublished: true, isPublic: true, ownerId: currentUserId, displayId: resources[2].Id),
            CreateTestAssetEntity("Asset 4", AssetKind.Monster, isPublished: true, isPublic: false, ownerId: Guid.CreateVersion7(), displayId: resources[3].Id),
        };

        context.Assets.AddRange(assets);
        context.SaveChanges();
    }

    private static void SeedLibrary(ApplicationDbContext context, Guid currentUserId) {
        // First add Tokens for Adventures and Encounters
        var adventureResources = new[] {
            CreateTestResourceEntity("Adventure 1 Background"),
            CreateTestResourceEntity("Adventure 2 Background"),
            CreateTestResourceEntity("Adventure 3 Background"),
        };
        var encounterResources = new[] {
            CreateTestResourceEntity("Encounter 1.1 Stage"),
            CreateTestResourceEntity("Encounter 1.2 Stage"),
            CreateTestResourceEntity("Encounter 3.1 Stage"),
        };
        context.Resources.AddRange(adventureResources);
        context.Resources.AddRange(encounterResources);
        context.SaveChanges();

        // Then add Adventures that reference the Tokens
        var adventures = new[] {
            CreateTestAdventureEntity("Adventure 1", isPublished: true, isPublic: true, ownerId: currentUserId, backgroundId: adventureResources[0].Id),
            CreateTestAdventureEntity("Adventure 2", ownerId: currentUserId, backgroundId: adventureResources[1].Id),
            CreateTestAdventureEntity("Adventure 3", isPublished: true, isPublic: false, ownerId: Guid.CreateVersion7(), backgroundId: adventureResources[2].Id),
        };
        var encounters = new[] {
            CreateTestEncounterEntity(adventures[0].Id, "Encounter 1.1", stageId: encounterResources[0].Id),
            CreateTestEncounterEntity(adventures[0].Id, "Encounter 1.2", stageId: encounterResources[1].Id),
            CreateTestEncounterEntity(adventures[2].Id, "Encounter 3.1", stageId: encounterResources[2].Id),
        };
        // Note: EncounterAssets are added separately to avoid EF tracking conflicts during seeding

        context.Adventures.AddRange(adventures);
        context.Encounters.AddRange(encounters);
        context.SaveChanges();
    }

    private static void SeedGameSessions(ApplicationDbContext context, Guid currentUserId) {
        var masterId = Guid.CreateVersion7();
        var playerId = Guid.CreateVersion7();

        // Get encounter IDs without complex Include operations to avoid EF In-Memory issues
        var encounterIds = context.Encounters.Select(s => s.Id).ToArray();
        var firstAdventureOwnerId = context.Adventures.First().OwnerId;

        var sessions = new[] {
            CreateTestGameSessionEntity("Session 1", encounterIds.Length > 0 ? encounterIds[0] : null, GameSessionStatus.InProgress),
            CreateTestGameSessionEntity("Session 2", encounterIds.Length > 1 ? encounterIds[1] : null, GameSessionStatus.Scheduled, ownerId: currentUserId),
            CreateTestGameSessionEntity("Session 3", ownerId: firstAdventureOwnerId),
        };

        // Add players to sessions using the proper collection interface
        sessions[0].Players.Add(new() { UserId = currentUserId, Type = PlayerType.Master });
        sessions[0].Players.Add(new() { UserId = playerId, Type = PlayerType.Player });

        sessions[1].Players.Add(new() { UserId = masterId, Type = PlayerType.Master });
        sessions[1].Players.Add(new() { UserId = playerId, Type = PlayerType.Player });

        sessions[2].Players.Add(new() { UserId = sessions[2].OwnerId, Type = PlayerType.Master });

        context.GameSessions.AddRange(sessions);
        context.SaveChanges();
    }

    public static AdventureEntity CreateTestAdventureEntity(Guid id, string name, bool isOneShot = false, bool isPublished = false, bool isPublic = false, AdventureStyle style = AdventureStyle.OpenWorld, Guid? ownerId = null, Guid? backgroundId = null) => new() {
        Id = id,
        Name = name,
        Description = $"Description for {name}",
        Style = style,
        IsOneShot = isOneShot,
        IsPublished = isPublished,
        IsPublic = isPublic,
        OwnerId = ownerId ?? Guid.CreateVersion7(),
        BackgroundId = backgroundId,
    };

    public static AdventureEntity CreateTestAdventureEntity(string name, bool isPublished = false, bool isPublic = false, bool isOneShot = false, AdventureStyle style = AdventureStyle.OpenWorld, Guid? ownerId = null, Guid? backgroundId = null)
        => CreateTestAdventureEntity(Guid.CreateVersion7(), name, isPublished, isPublic, isOneShot, style, ownerId, backgroundId);

    public static EncounterEntity CreateTestEncounterEntity(Guid adventureId, string name, Guid? stageId = null, Guid? soundId = null)
        => new() {
            AdventureId = adventureId,
            Name = name,
            Description = $"Description for {name}",
            ZoomLevel = 1.0f,
            Panning = new(0, 0),
            BackgroundId = stageId ?? Guid.CreateVersion7(),
            SoundId = soundId ?? Guid.CreateVersion7(),
            Light = Light.Nighttime,
            Weather = Weather.Fog,
            Elevation = 20.0f,
            Grid = new() {
                Type = GridType.Square,
                CellSize = new(1, 1),
                Offset = new(0, 0),
                Snap = false,
            },
        };

    public static MonsterAssetEntity CreateTestAssetEntity(Guid id, string name, AssetKind kind = AssetKind.Monster, bool isPublished = false, bool isPublic = false, Guid? ownerId = null, Guid? displayId = null) {
        var tokenId = displayId ?? Guid.CreateVersion7();
        return new() {
            Id = id,
            Name = name,
            Kind = kind,
            Description = $"Description for {name}",
            IsPublic = isPublic,
            IsPublished = isPublished,
            OwnerId = ownerId ?? Guid.CreateVersion7(),
            Tokens = [
                new() {
                    TokenId = tokenId,
                    IsDefault = true,
                },
            ],
        };
    }

    public static MonsterAssetEntity CreateTestAssetEntity(string name, AssetKind kind = AssetKind.Monster, bool isPublished = false, bool isPublic = false, Guid? ownerId = null, Guid? displayId = null)
        => CreateTestAssetEntity(Guid.CreateVersion7(), name, kind, isPublished, isPublic, ownerId, displayId);

    public static GameSessionEntity CreateTestGameSessionEntity(Guid id, string title, Guid? encounterId = null, GameSessionStatus status = GameSessionStatus.Draft, Guid? ownerId = null)
        => new() {
            Id = id,
            Title = title,
            EncounterId = encounterId,
            Status = status,
            OwnerId = ownerId ?? Guid.CreateVersion7(),
        };

    public static GameSessionEntity CreateTestGameSessionEntity(string title, Guid? encounterId = null, GameSessionStatus status = GameSessionStatus.Draft, Guid? ownerId = null)
        => CreateTestGameSessionEntity(Guid.CreateVersion7(), title, encounterId, status, ownerId);

    public static ResourceEntity CreateTestResourceEntity(string fileName)
        => new() {
            Id = Guid.CreateVersion7(),
            Type = ResourceType.Image,
            Path = "test/path",
            FileName = fileName,
            ContentType = "image/png",
            FileLength = 1000,
            ImageSize = new(100, 100),
            Duration = TimeSpan.Zero,
            Tags = [],
        };

    public static Adventure CreateTestAdventure(Guid id, string name, bool isPublished = false, bool isPublic = false, AdventureStyle style = AdventureStyle.OpenWorld, Guid? ownerId = null) => new() {
        Id = id,
        Name = name,
        Description = $"Description for {name}",
        Style = style,
        IsPublished = isPublished,
        IsPublic = isPublic,
        OwnerId = ownerId ?? Guid.CreateVersion7(),
        Background = new() {
            Id = Guid.CreateVersion7(),
            Type = ResourceType.Image,
            Path = "test/adventure-background.jpg",
            Metadata = new ResourceMetadata {
                FileName = $"{name}_background.jpg",
                ContentType = "image/jpeg",
                FileLength = 2000,
                ImageSize = new(1920, 1080),
                Duration = TimeSpan.Zero,
            },
            Tags = [],
        },
        Encounters = [],
    };

    public static Adventure CreateTestAdventure(string name, bool isPublished = false, bool isPublic = false, AdventureStyle type = AdventureStyle.OpenWorld, Guid? ownerId = null)
        => CreateTestAdventure(Guid.CreateVersion7(), name, isPublished, isPublic, type, ownerId);

    public static Encounter CreateTestEncounter(Guid id, string name)
        => new() {
            Id = id,
            Name = name,
            Description = $"Description for {name}",
            Stage = new() {
                Background = new() {
                    Id = Guid.CreateVersion7(),
                    Type = ResourceType.Image,
                    Path = "asset/1234",
                    Metadata = new() {
                        FileName = "some_file.png",
                        ImageSize = new(10, 20),
                        ContentType = "image/png",
                        Duration = TimeSpan.Zero,
                        FileLength = 2000,
                    },
                    Tags = [],
                },
                ZoomLevel = 1,
                Panning = new(0, 0),
                Sound = new() {
                    Id = Guid.CreateVersion7(),
                    Type = ResourceType.Audio,
                    Path = "asset/5678",
                    Metadata = new() {
                        FileName = "some_file.mp3",
                        ImageSize = new(0, 0),
                        ContentType = "audio/mpeg",
                        Duration = TimeSpan.FromMinutes(2),
                        FileLength = 2000,
                    },
                    Tags = [],
                },
                Light = Light.Nighttime,
                Weather = Weather.Fog,
                Elevation = 20.0f,
            },
            Grid = new() {
                Type = GridType.Square,
                CellSize = new(1, 1),
                Offset = new(0, 0),
                Snap = false,
            },
        };

    public static MonsterAsset CreateTestAsset(Guid id, string name, AssetKind kind = AssetKind.Monster, bool isPublished = false, bool isPublic = false, Guid? ownerId = null) {
        var tokenId = Guid.CreateVersion7();
        return new() {
            Id = id,
            Name = name,
            Kind = kind,
            Description = $"Description for {name}",
            IsPublic = isPublic,
            IsPublished = isPublished,
            OwnerId = ownerId ?? Guid.CreateVersion7(),
            Tokens = [
                new() {
                    IsDefault = true,
                    Token = new() {
                        Id = tokenId,
                        Type = ResourceType.Image,
                        Path = "test/path",
                        Metadata = new ResourceMetadata {
                            FileName = $"{name}_resource.png",
                            ContentType = "image/png",
                            FileLength = 1000,
                            ImageSize = new(100, 100),
                            Duration = TimeSpan.Zero,
                        },
                        Tags = [],
                    },
                },
            ],
        };
    }

    public static MonsterAsset CreateTestAsset(string name, AssetKind kind = AssetKind.Monster, bool isPublished = false, bool isPublic = false, Guid? ownerId = null)
        => CreateTestAsset(Guid.CreateVersion7(), name, kind, isPublished, isPublic, ownerId);

    public static GameSession CreateTestGameSession(Guid id, string title, Guid? encounterId = null, GameSessionStatus status = GameSessionStatus.Draft, Guid? ownerId = null)
        => new() {
            Id = id,
            Title = title,
            EncounterId = encounterId,
            Status = status,
            OwnerId = ownerId ?? Guid.CreateVersion7(),
        };

    public static GameSession CreateTestGameSession(string title, Guid? encounterId = null, GameSessionStatus status = GameSessionStatus.Draft, Guid? ownerId = null)
        => CreateTestGameSession(Guid.CreateVersion7(), title, encounterId, status, ownerId);
}