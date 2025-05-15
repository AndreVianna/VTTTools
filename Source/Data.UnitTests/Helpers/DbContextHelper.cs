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
            CreateTestAsset("Asset 1", AssetType.Creature, isListed: true, isPublic: true, ownerId: currentUserId),
            CreateTestAsset("Asset 2", ownerId: currentUserId),
            CreateTestAsset("Asset 3", AssetType.Character, isListed: true, isPublic: true, ownerId: currentUserId),
            CreateTestAsset("Asset 4", AssetType.Character, isListed: true, isPublic: false, ownerId: Guid.NewGuid()),
        };

        context.Assets.AddRange(assets);
        context.SaveChanges();
    }

    private static void SeedLibrary(ApplicationDbContext context, Guid currentUserId) {
        var adventures = new[] {
            CreateTestAdventure("Adventure 1", isListed: true, isPublic: true, ownerId: currentUserId),
            CreateTestAdventure("Adventure 2", ownerId: currentUserId),
            CreateTestAdventure("Adventure 3", isListed: true, isPublic: false, ownerId: Guid.NewGuid()),
        };
        var scenes = new[] {
            CreateTestScene(adventures[0].Id, "Scene 1.1", ownerId: currentUserId),
            CreateTestScene(adventures[0].Id, "Scene 1.2", ownerId: currentUserId),
            CreateTestScene(adventures[2].Id, "Scene 3.1", isPublic: false, ownerId: adventures[2].OwnerId),
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
            CreateTestGameSession("Session 1", scenes[0].Id, GameSessionStatus.InProgress),
            CreateTestGameSession("Session 2", scenes[1].Id, GameSessionStatus.Scheduled, ownerId: currentUserId),
            CreateTestGameSession("Session 3", ownerId: scenes[2].OwnerId),
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

    public static Adventure CreateTestAdventure(Guid id, string name, bool isListed = false, bool isPublic = false, AdventureType type = AdventureType.OpenWorld, Guid? ownerId = null) => new() {
        Id = id,
        Name = name,
        Description = $"Description for {name}",
        Type = type,
        IsListed = isListed,
        IsPublic = isPublic,
        OwnerId = ownerId ?? Guid.NewGuid(),
    };

    public static Adventure CreateTestAdventure(string name, bool isListed = false, bool isPublic = false, AdventureType type = AdventureType.OpenWorld, Guid? ownerId = null)
        => CreateTestAdventure(Guid.CreateVersion7(), name, isListed, isPublic, type, ownerId);

    public static Scene CreateTestScene(Guid id, Guid parentId, string name, bool isListed = false, bool isPublic = false, Guid? ownerId = null)
        => new() {
            Id = id,
            Name = name,
            AdventureId = parentId,
            Description = $"Description for {name}",
            IsPublic = isPublic,
            IsListed = isListed,
            Stage = new() {
                Source = "https://example.com/image.png",
                Size = new() {
                    Width = 100,
                    Height = 200,
                },
                Grid = new() {
                    Type = GridType.Square,
                    CellSize = new() {
                        Width = 1.0f,
                        Height = 1.0f,
                    },
                    Offset = new() {
                        Left = 0.0f,
                        Top = 0.0f,
                    },
                },
            },
            OwnerId = ownerId ?? Guid.NewGuid(),
        };

    public static Scene CreateTestScene(Guid parentId, string name, bool isListed = false, bool isPublic = false, Guid? ownerId = null)
        => CreateTestScene(Guid.CreateVersion7(), parentId, name, isListed, isPublic, ownerId);

    public static Asset CreateTestAsset(Guid id, string name, AssetType type = AssetType.Placeholder, bool isListed = false, bool isPublic = false, Guid? ownerId = null)
        => new() {
            Id = id,
            Name = name,
            Type = type,
            Description = $"Description for {name}",
            IsPublic = isPublic,
            IsListed = isListed,
            OwnerId = ownerId ?? Guid.NewGuid(),
            Format = new() {
                Type = FormatType.Image,
                SourceId = Guid.NewGuid(),
                Size = new() {
                    Width = 10,
                    Height = 20,
                },
            },
        };

    public static Asset CreateTestAsset(string name, AssetType type = AssetType.Placeholder, bool isListed = false, bool isPublic = false, Guid? ownerId = null)
        => CreateTestAsset(Guid.CreateVersion7(), name, type, isListed, isPublic, ownerId);

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