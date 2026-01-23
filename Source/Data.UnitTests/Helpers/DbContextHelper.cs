using AdventureEntity = VttTools.Data.Library.Adventures.Entities.Adventure;
using AdventureModel = VttTools.Library.Adventures.Model.Adventure;
using AssetEntity = VttTools.Data.Assets.Entities.Asset;
using EncounterEntity = VttTools.Data.Library.Encounters.Entities.Encounter;
using EncounterModel = VttTools.Library.Encounters.Model.Encounter;
using GameSessionEntity = VttTools.Data.Game.Entities.GameSession;
using ResourceEntity = VttTools.Data.Media.Entities.Resource;
using StageEntity = VttTools.Data.Library.Stages.Entities.Stage;
using StageModel = VttTools.Library.Stages.Model.Stage;

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
        // Create Assets - portraits and thumbnails are now stored at derived blob paths
        var assets = new[] {
            CreateTestAssetEntity("Asset 1", isPublished: true, isPublic: true, ownerId: currentUserId),
            CreateTestAssetEntity("Asset 2", ownerId: currentUserId),
            CreateTestAssetEntity("Asset 3", isPublished: true, isPublic: true, ownerId: currentUserId),
            CreateTestAssetEntity("Asset 4", isPublished: true, isPublic: false, ownerId: Guid.CreateVersion7()),
        };

        context.Assets.AddRange(assets);
        context.SaveChanges();
    }

    private static void SeedLibrary(ApplicationDbContext context, Guid currentUserId) {
        // First add Resources for Adventures and Stages
        var adventureResources = new[] {
            CreateTestResourceEntity("Adventure 1 Background"),
            CreateTestResourceEntity("Adventure 2 Background"),
            CreateTestResourceEntity("Adventure 3 Background"),
        };
        var stageResources = new[] {
            CreateTestResourceEntity("Stage 1.1"),
            CreateTestResourceEntity("Stage 1.2"),
            CreateTestResourceEntity("Stage 3.1"),
        };
        context.Resources.AddRange(adventureResources);
        context.Resources.AddRange(stageResources);
        context.SaveChanges();

        // Create stages first
        var stage1 = new StageEntity {
            Id = Guid.CreateVersion7(),
            Name = "Stage 1.1",
            Description = "Test stage for encounter 1.1",
            OwnerId = currentUserId,
            MainBackgroundId = stageResources[0].Id,
        };
        var stage2 = new StageEntity {
            Id = Guid.CreateVersion7(),
            Name = "Stage 1.2",
            Description = "Test stage for encounter 1.2",
            OwnerId = currentUserId,
            MainBackgroundId = stageResources[1].Id,
        };
        var stage3 = new StageEntity {
            Id = Guid.CreateVersion7(),
            Name = "Stage 3.1",
            Description = "Test stage for encounter 3.1",
            OwnerId = Guid.CreateVersion7(),
            MainBackgroundId = stageResources[2].Id,
        };
        context.Stages.AddRange(stage1, stage2, stage3);
        context.SaveChanges();

        // Then add Adventures that reference the Resources
        var adventures = new[] {
            CreateTestAdventureEntity("Adventure 1", isPublished: true, isPublic: true, ownerId: currentUserId, backgroundId: adventureResources[0].Id),
            CreateTestAdventureEntity("Adventure 2", ownerId: currentUserId, backgroundId: adventureResources[1].Id),
            CreateTestAdventureEntity("Adventure 3", isPublished: true, isPublic: false, ownerId: Guid.CreateVersion7(), backgroundId: adventureResources[2].Id),
        };
        var encounters = new[] {
            CreateTestEncounterEntity(adventures[0].Id, "Encounter 1.1", stageId: stage1.Id),
            CreateTestEncounterEntity(adventures[0].Id, "Encounter 1.2", stageId: stage2.Id),
            CreateTestEncounterEntity(adventures[2].Id, "Encounter 3.1", stageId: stage3.Id),
        };

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

    public static AdventureEntity CreateTestAdventureEntity(Guid id, string name, bool isOneShot = false, bool isPublished = false, bool isPublic = false, AdventureStyle style = AdventureStyle.OpenWorld, Guid? ownerId = null, Guid? backgroundId = null) {
        var entity = new AdventureEntity {
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

        return entity;
    }

    public static AdventureEntity CreateTestAdventureEntity(string name, bool isPublished = false, bool isPublic = false, bool isOneShot = false, AdventureStyle style = AdventureStyle.OpenWorld, Guid? ownerId = null, Guid? backgroundId = null)
        => CreateTestAdventureEntity(Guid.CreateVersion7(), name, isOneShot, isPublished, isPublic, style, ownerId, backgroundId);

    public static EncounterEntity CreateTestEncounterEntity(Guid adventureId, string name, Guid? stageId = null) {
        var encounterId = Guid.CreateVersion7();
        var entity = new EncounterEntity {
            Id = encounterId,
            AdventureId = adventureId,
            Name = name,
            Description = $"Description for {name}",
            StageId = stageId ?? Guid.CreateVersion7(),
        };

        return entity;
    }

    public static AssetEntity CreateTestAssetEntity(Guid id, string name, bool isPublished = false, bool isPublic = false, Guid? ownerId = null) {
        var entity = new AssetEntity {
            Id = id,
            Name = name,
            Kind = AssetKind.Creature,
            Category = "test-category",
            Type = "test-type",
            Subtype = null,
            Description = $"Description for {name}",
            IsPublic = isPublic,
            IsPublished = isPublished,
            OwnerId = ownerId ?? Guid.CreateVersion7(),
            Tokens = [],
        };

        return entity;
    }

    public static AssetEntity CreateTestAssetEntity(string name, bool isPublished = false, bool isPublic = false, Guid? ownerId = null)
        => CreateTestAssetEntity(Guid.CreateVersion7(), name, isPublished, isPublic, ownerId);

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
            Path = "test/path",
            FileName = fileName,
            ContentType = "image/png",
            FileSize = 1000,
            Dimensions = new(100, 100),
            Duration = TimeSpan.Zero,
        };

    public static AdventureModel CreateTestAdventure(Guid id, string name, bool isPublished = false, bool isPublic = false, AdventureStyle style = AdventureStyle.OpenWorld, Guid? ownerId = null) => new() {
        Id = id,
        Name = name,
        Description = $"Description for {name}",
        Style = style,
        IsPublished = isPublished,
        IsPublic = isPublic,
        OwnerId = ownerId ?? Guid.CreateVersion7(),
        Background = new() {
            Id = Guid.CreateVersion7(),
            Path = "test/adventure-background.jpg",
            FileName = $"{name}_background.jpg",
            ContentType = "image/jpeg",
            FileSize = 2000,
            Dimensions = new(1920, 1080),
            Duration = TimeSpan.Zero,
        },
        Encounters = [],
    };

    public static AdventureModel CreateTestAdventure(string name, bool isPublished = false, bool isPublic = false, AdventureStyle type = AdventureStyle.OpenWorld, Guid? ownerId = null)
        => CreateTestAdventure(Guid.CreateVersion7(), name, isPublished, isPublic, type, ownerId);

    public static Asset CreateTestAsset(Guid id, string name, bool isPublished = false, bool isPublic = false, Guid? ownerId = null) => new() {
        Id = id,
        Name = name,
        Classification = new(AssetKind.Creature, "test-category", "test-type", null),
        Description = $"Description for {name}",
        IsPublic = isPublic,
        IsPublished = isPublished,
        OwnerId = ownerId ?? Guid.CreateVersion7(),
        Tokens = [
            new() {
                Id = Guid.CreateVersion7(),
                Path = "test/token",
                FileName = $"{name}_token.png",
                ContentType = "image/png",
                FileSize = 1000,
                Dimensions = new(100, 100),
                Duration = TimeSpan.Zero,
            },
        ],
    };

    public static Asset CreateTestAsset(string name, bool isPublished = false, bool isPublic = false, Guid? ownerId = null)
        => CreateTestAsset(Guid.CreateVersion7(), name, isPublished, isPublic, ownerId);

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

    public static EncounterModel CreateTestEncounter(Guid id, string name, Guid? ownerId = null) => new() {
        Id = id,
        Name = name,
        Description = $"Description for {name}",
        IsPublished = false,
        Stage = new StageModel {
            Id = Guid.CreateVersion7(),
            OwnerId = ownerId ?? Guid.CreateVersion7(),
            Name = $"Stage for {name}",
            Description = $"Stage description for {name}",
            IsPublished = false,
            IsPublic = false,
        },
        Actors = [],
        Objects = [],
        Effects = [],
    };

    public static EncounterModel CreateTestEncounter(string name, Guid? ownerId = null)
        => CreateTestEncounter(Guid.CreateVersion7(), name, ownerId);
}