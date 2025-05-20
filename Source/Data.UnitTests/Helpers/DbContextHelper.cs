using Adventure = VttTools.Library.Adventures.Model.Adventure;
using Asset = VttTools.Assets.Model.Asset;
using GameSession = VttTools.Game.Sessions.Model.GameSession;
using Scene = VttTools.Library.Scenes.Model.Scene;
using AdventureEntity = VttTools.Data.Library.Entities.Adventure;
using AssetEntity = VttTools.Data.Assets.Entities.Asset;
using GameSessionEntity = VttTools.Data.Game.Entities.GameSession;
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
        var assets = new[] {
            CreateTestAssetEntity("Asset 1", AssetType.Creature, isPublished: true, isPublic: true, ownerId: currentUserId),
            CreateTestAssetEntity("Asset 2", ownerId: currentUserId),
            CreateTestAssetEntity("Asset 3", AssetType.Character, isPublished: true, isPublic: true, ownerId: currentUserId),
            CreateTestAssetEntity("Asset 4", AssetType.Character, isPublished: true, isPublic: false, ownerId: Guid.NewGuid()),
        };

        context.Assets.AddRange(assets);
        context.SaveChanges();
    }

    private static void SeedLibrary(ApplicationDbContext context, Guid currentUserId) {
        var adventures = new[] {
            CreateTestAdventureEntity("Adventure 1", isPublished: true, isPublic: true, ownerId: currentUserId),
            CreateTestAdventureEntity("Adventure 2", ownerId: currentUserId),
            CreateTestAdventureEntity("Adventure 3", isPublished: true, isPublic: false, ownerId: Guid.NewGuid()),
        };
        var scenes = new[] {
            CreateTestSceneEntity(adventures[0].Id, "Scene 1.1"),
            CreateTestSceneEntity(adventures[0].Id, "Scene 1.2"),
            CreateTestSceneEntity(adventures[2].Id, "Scene 3.1"),
        };
        var assets = context.Assets.ToArray();
        scenes[0].SceneAssets.AddRange([
            new() { AssetId = assets[0].Id, Name = assets[0].Name },
            new() { AssetId = assets[0].Id, Name = "Other Asset" },
            new() { AssetId = assets[2].Id, Name = "Player Character" },
        ]);
        scenes[2].SceneAssets.AddRange([
            new() { AssetId = assets[0].Id, Name = assets[0].Name },
            new() { AssetId = assets[2].Id, Name = assets[2].Name },
        ]);

        context.Adventures.AddRange(adventures);
        context.Scenes.AddRange(scenes);
        context.SaveChanges();
    }

    private static void SeedGameSessions(ApplicationDbContext context, Guid currentUserId) {
        var masterId = Guid.NewGuid();
        var playerId = Guid.NewGuid();
        var scenes = context.Scenes.Include(s => s.SceneAssets).ToArray();
        var sessions = new[] {
            CreateTestGameSessionEntity("Session 1", scenes[0].Id, GameSessionStatus.InProgress),
            CreateTestGameSessionEntity("Session 2", scenes[1].Id, GameSessionStatus.Scheduled, ownerId: currentUserId),
            CreateTestGameSessionEntity("Session 3", ownerId: scenes[2].OwnerId),
        };
        sessions[0].Players.AddRange([
            new() { UserId = currentUserId, Type = PlayerType.Master },
            new() { UserId = playerId, Type = PlayerType.Player},
        ]);
        sessions[1].Players.AddRange([
            new() { UserId = masterId, Type = PlayerType.Master },
            new() { UserId = playerId, Type = PlayerType.Player },
        ]);
        sessions[2].Players.AddRange([
            new() { UserId = sessions[2].OwnerId, Type = PlayerType.Master,
        }]);
        scenes[0].SceneAssets[2].ControlledBy = playerId;

        context.GameSessions.AddRange(sessions);
        context.SaveChanges();
    }

    public static AdventureEntity CreateTestAdventureEntity(Guid id, string name, bool isPublished = false, bool isPublic = false, AdventureType type = AdventureType.OpenWorld, Guid? ownerId = null) => new() {
        Id = id,
        Name = name,
        Description = $"Description for {name}",
        Type = type,
        IsPublished = isPublished,
        IsPublic = isPublic,
        OwnerId = ownerId ?? Guid.NewGuid(),
    };

    public static AdventureEntity CreateTestAdventureEntity(string name, bool isPublished = false, bool isPublic = false, AdventureType type = AdventureType.OpenWorld, Guid? ownerId = null)
        => CreateTestAdventureEntity(Guid.CreateVersion7(), name, isPublished, isPublic, type, ownerId);

    public static SceneEntity CreateTestSceneEntity(Guid id, string name)
        => new() {
            Id = id,
            Name = name,
            Description = $"Description for {name}",
            Stage = new() {
                ZoomLevel = 1.0f,
                Shape = new() {
                    Type = MediaType.Image,
                    SourceId = Guid.NewGuid(),
                    Size = new() {
                        X = 10.0f,
                        Y = 20.0f,
                    },
                },
                Grid = new() {
                    Type = GridType.Square,
                    Cell = new() {
                        Size = 1.0f,
                        Scale = new() {
                            X = 1.0f,
                            Y = 1.0f,
                        },
                        Offset = new() {
                            X = 0.0f,
                            Y = 0.0f,
                        },
                    },
                },
            },
        };

    public static AssetEntity CreateTestAssetEntity(Guid id, string name, AssetType type = AssetType.Placeholder, bool isPublished = false, bool isPublic = false, Guid? ownerId = null)
        => new() {
            Id = id,
            Name = name,
            Type = type,
            Description = $"Description for {name}",
            IsPublic = isPublic,
            IsPublished = isPublished,
            OwnerId = ownerId ?? Guid.NewGuid(),
            Shape = new() {
                Type = MediaType.Image,
                SourceId = Guid.NewGuid(),
                Size = new() {
                    X = 10,
                    Y = 20,
                },
            },
        };

    public static AssetEntity CreateTestAssetEntity(string name, AssetType type = AssetType.Placeholder, bool isPublished = false, bool isPublic = false, Guid? ownerId = null)
        => CreateTestAssetEntity(Guid.CreateVersion7(), name, type, isPublished, isPublic, ownerId);

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

    public static Adventure CreateTestAdventure(Guid id, string name, bool isPublished = false, bool isPublic = false, AdventureType type = AdventureType.OpenWorld, Guid? ownerId = null) => new() {
        Id = id,
        Name = name,
        Description = $"Description for {name}",
        Type = type,
        IsPublished = isPublished,
        IsPublic = isPublic,
        OwnerId = ownerId ?? Guid.NewGuid(),
    };

    public static Adventure CreateTestAdventure(string name, bool isPublished = false, bool isPublic = false, AdventureType type = AdventureType.OpenWorld, Guid? ownerId = null)
        => CreateTestAdventure(Guid.CreateVersion7(), name, isPublished, isPublic, type, ownerId);

    public static Scene CreateTestScene(Guid id, string name)
        => new() {
            Id = id,
            Name = name,
            Description = $"Description for {name}",
            Stage = new() {
                ZoomLevel = 1.0f,
                Shape = new() {
                    Type = MediaType.Image,
                    SourceId = Guid.NewGuid(),
                    Size = new() {
                        X = 10.0f,
                        Y = 20.0f,
                    },
                },
                Grid = new() {
                    Type = GridType.Square,
                    Cell = new() {
                        Size = 1.0f,
                        Scale = new() {
                            X = 1.0f,
                            Y = 1.0f,
                        },
                        Offset = new() {
                            X = 0.0f,
                            Y = 0.0f,
                        },
                    },
                },
            },
        };

    public static Asset CreateTestAsset(Guid id, string name, AssetType type = AssetType.Placeholder, bool isPublished = false, bool isPublic = false, Guid? ownerId = null)
        => new() {
            Id = id,
            Name = name,
            Type = type,
            Description = $"Description for {name}",
            IsPublic = isPublic,
            IsPublished = isPublished,
            OwnerId = ownerId ?? Guid.NewGuid(),
            Shape = new() {
                Type = MediaType.Image,
                SourceId = Guid.NewGuid(),
                Size = new() {
                    X = 10,
                    Y = 20,
                },
            },
        };

    public static Asset CreateTestAsset(string name, AssetType type = AssetType.Placeholder, bool isPublished = false, bool isPublic = false, Guid? ownerId = null)
        => CreateTestAsset(Guid.CreateVersion7(), name, type, isPublished, isPublic, ownerId);

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