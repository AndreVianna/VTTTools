using VttTools.Assets.Model;
using VttTools.Media.Model;

using Adventure = VttTools.Library.Adventures.Model.Adventure;
using AdventureEntity = VttTools.Data.Library.Entities.Adventure;
using Asset = VttTools.Assets.Model.Asset;
using AssetEntity = VttTools.Data.Assets.Entities.Asset;
using CreatureAssetEntity = VttTools.Data.Assets.Entities.CreatureAsset;
using GameSession = VttTools.Game.Sessions.Model.GameSession;
using GameSessionEntity = VttTools.Data.Game.Entities.GameSession;
using ObjectAssetEntity = VttTools.Data.Assets.Entities.ObjectAsset;
using ResourceEntity = VttTools.Data.Media.Entities.Resource;
using Scene = VttTools.Library.Scenes.Model.Scene;
using SceneAssetEntity = VttTools.Data.Library.Entities.SceneAsset;
using SceneEntity = VttTools.Data.Library.Entities.Scene;

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
        // First add Resources that will be referenced by Assets
        var resources = new[] {
            CreateTestResourceEntity("Asset 1 Display"),
            CreateTestResourceEntity("Asset 2 Display"),
            CreateTestResourceEntity("Asset 3 Display"),
            CreateTestResourceEntity("Asset 4 Display"),
        };
        context.Resources.AddRange(resources);
        context.SaveChanges();

        // Then add Assets that reference the Resources
        var assets = new[] {
            CreateTestAssetEntity("Asset 1", AssetKind.Creature, isPublished: true, isPublic: true, ownerId: currentUserId, displayId: resources[0].Id),
            CreateTestAssetEntity("Asset 2", ownerId: currentUserId, displayId: resources[1].Id),
            CreateTestAssetEntity("Asset 3", AssetKind.Creature, isPublished: true, isPublic: true, ownerId: currentUserId, displayId: resources[2].Id),
            CreateTestAssetEntity("Asset 4", AssetKind.Creature, isPublished: true, isPublic: false, ownerId: Guid.NewGuid(), displayId: resources[3].Id),
        };

        context.Assets.AddRange(assets);
        context.SaveChanges();
    }

    private static void SeedLibrary(ApplicationDbContext context, Guid currentUserId) {
        // First add Resources for Adventures and Scenes
        var adventureResources = new[] {
            CreateTestResourceEntity("Adventure 1 Background"),
            CreateTestResourceEntity("Adventure 2 Background"),
            CreateTestResourceEntity("Adventure 3 Background"),
        };
        var sceneResources = new[] {
            CreateTestResourceEntity("Scene 1.1 Stage"),
            CreateTestResourceEntity("Scene 1.2 Stage"),
            CreateTestResourceEntity("Scene 3.1 Stage"),
        };
        context.Resources.AddRange(adventureResources);
        context.Resources.AddRange(sceneResources);
        context.SaveChanges();

        // Then add Adventures that reference the Resources
        var adventures = new[] {
            CreateTestAdventureEntity("Adventure 1", isPublished: true, isPublic: true, ownerId: currentUserId, backgroundId: adventureResources[0].Id),
            CreateTestAdventureEntity("Adventure 2", ownerId: currentUserId, backgroundId: adventureResources[1].Id),
            CreateTestAdventureEntity("Adventure 3", isPublished: true, isPublic: false, ownerId: Guid.NewGuid(), backgroundId: adventureResources[2].Id),
        };
        var scenes = new[] {
            CreateTestSceneEntity(adventures[0].Id, "Scene 1.1", stageId: sceneResources[0].Id),
            CreateTestSceneEntity(adventures[0].Id, "Scene 1.2", stageId: sceneResources[1].Id),
            CreateTestSceneEntity(adventures[2].Id, "Scene 3.1", stageId: sceneResources[2].Id),
        };
        // Note: SceneAssets are added separately to avoid EF tracking conflicts during seeding

        context.Adventures.AddRange(adventures);
        context.Scenes.AddRange(scenes);
        context.SaveChanges();
    }

    private static void SeedGameSessions(ApplicationDbContext context, Guid currentUserId) {
        var masterId = Guid.NewGuid();
        var playerId = Guid.NewGuid();

        // Get scene IDs without complex Include operations to avoid EF In-Memory issues
        var sceneIds = context.Scenes.Select(s => s.Id).ToArray();
        var firstAdventureOwnerId = context.Adventures.First().OwnerId;

        var sessions = new[] {
            CreateTestGameSessionEntity("Session 1", sceneIds.Length > 0 ? sceneIds[0] : null, GameSessionStatus.InProgress),
            CreateTestGameSessionEntity("Session 2", sceneIds.Length > 1 ? sceneIds[1] : null, GameSessionStatus.Scheduled, ownerId: currentUserId),
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

    public static AdventureEntity CreateTestAdventureEntity(Guid id, string name, bool isPublished = false, bool isPublic = false, AdventureType type = AdventureType.OpenWorld, Guid? ownerId = null, Guid? backgroundId = null) => new() {
        Id = id,
        Name = name,
        Description = $"Description for {name}",
        Type = type,
        IsPublished = isPublished,
        IsPublic = isPublic,
        OwnerId = ownerId ?? Guid.NewGuid(),
        BackgroundId = backgroundId ?? Guid.NewGuid(),
    };

    public static AdventureEntity CreateTestAdventureEntity(string name, bool isPublished = false, bool isPublic = false, AdventureType type = AdventureType.OpenWorld, Guid? ownerId = null, Guid? backgroundId = null)
        => CreateTestAdventureEntity(Guid.CreateVersion7(), name, isPublished, isPublic, type, ownerId, backgroundId);

    public static SceneEntity CreateTestSceneEntity(Guid adventureId, string name, Guid? stageId = null)
        => new() {
            AdventureId = adventureId,
            Name = name,
            Description = $"Description for {name}",
            ZoomLevel = 1.0f,
            Panning = new(0, 0),
            StageId = stageId ?? Guid.NewGuid(),
            Grid = new() {
                Type = GridType.Square,
                CellSize = new(1, 1),
                Offset = new(0, 0),
                Snap = false,
            },
        };

    public static CreatureAssetEntity CreateTestAssetEntity(Guid id, string name, AssetKind kind = AssetKind.Creature, bool isPublished = false, bool isPublic = false, Guid? ownerId = null, Guid? displayId = null) {
        var resourceId = displayId ?? Guid.NewGuid();
        return new() {
            Id = id,
            Name = name,
            Kind = kind,
            Description = $"Description for {name}",
            IsPublic = isPublic,
            IsPublished = isPublished,
            OwnerId = ownerId ?? Guid.NewGuid(),
            Resources = [
                new() {
                    ResourceId = resourceId,
                    Role = ResourceRole.Token | ResourceRole.Portrait,
                    IsDefault = true,
                },
            ],
        };
    }

    public static CreatureAssetEntity CreateTestAssetEntity(string name, AssetKind kind = AssetKind.Creature, bool isPublished = false, bool isPublic = false, Guid? ownerId = null, Guid? displayId = null)
        => CreateTestAssetEntity(Guid.CreateVersion7(), name, kind, isPublished, isPublic, ownerId, displayId);

    public static GameSessionEntity CreateTestGameSessionEntity(Guid id, string title, Guid? sceneId = null, GameSessionStatus status = GameSessionStatus.Draft, Guid? ownerId = null)
        => new() {
            Id = id,
            Title = title,
            SceneId = sceneId,
            Status = status,
            OwnerId = ownerId ?? Guid.NewGuid(),
        };

    public static GameSessionEntity CreateTestGameSessionEntity(string title, Guid? sceneId = null, GameSessionStatus status = GameSessionStatus.Draft, Guid? ownerId = null)
        => CreateTestGameSessionEntity(Guid.CreateVersion7(), title, sceneId, status, ownerId);

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

    public static Adventure CreateTestAdventure(Guid id, string name, bool isPublished = false, bool isPublic = false, AdventureType type = AdventureType.OpenWorld, Guid? ownerId = null) => new() {
        Id = id,
        Name = name,
        Description = $"Description for {name}",
        Type = type,
        IsPublished = isPublished,
        IsPublic = isPublic,
        OwnerId = ownerId ?? Guid.NewGuid(),
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
        Scenes = [],
    };

    public static Adventure CreateTestAdventure(string name, bool isPublished = false, bool isPublic = false, AdventureType type = AdventureType.OpenWorld, Guid? ownerId = null)
        => CreateTestAdventure(Guid.CreateVersion7(), name, isPublished, isPublic, type, ownerId);

    public static Scene CreateTestScene(Guid id, string name)
        => new() {
            Id = id,
            Name = name,
            Description = $"Description for {name}",
            Stage = new() {
                Background = new() {
                    Id = Guid.NewGuid(),
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
            },
            Grid = new() {
                Type = GridType.Square,
                CellSize = new(1, 1),
                Offset = new(0, 0),
                Snap = false,
            },
        };

    public static CreatureAsset CreateTestAsset(Guid id, string name, AssetKind kind = AssetKind.Creature, bool isPublished = false, bool isPublic = false, Guid? ownerId = null) {
        var resourceId = Guid.CreateVersion7();
        return new() {
            Id = id,
            Name = name,
            Kind = kind,
            Description = $"Description for {name}",
            IsPublic = isPublic,
            IsPublished = isPublished,
            OwnerId = ownerId ?? Guid.NewGuid(),
            Resources = [
                new() {
                    ResourceId = resourceId,
                    Role = ResourceRole.Token | ResourceRole.Portrait,
                    IsDefault = true,
                    Resource = new() {
                        Id = resourceId,
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

    public static CreatureAsset CreateTestAsset(string name, AssetKind kind = AssetKind.Creature, bool isPublished = false, bool isPublic = false, Guid? ownerId = null)
        => CreateTestAsset(Guid.CreateVersion7(), name, kind, isPublished, isPublic, ownerId);

    public static GameSession CreateTestGameSession(Guid id, string title, Guid? sceneId = null, GameSessionStatus status = GameSessionStatus.Draft, Guid? ownerId = null)
        => new() {
            Id = id,
            Title = title,
            SceneId = sceneId,
            Status = status,
            OwnerId = ownerId ?? Guid.NewGuid(),
        };

    public static GameSession CreateTestGameSession(string title, Guid? sceneId = null, GameSessionStatus status = GameSessionStatus.Draft, Guid? ownerId = null)
        => CreateTestGameSession(Guid.CreateVersion7(), title, sceneId, status, ownerId);
}