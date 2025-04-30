namespace VttTools.Data.Helpers;

internal static class DbContextHelper {
    public static ApplicationDbContext CreateInMemoryContext(Guid currentUserId) {
        var dbName = $"TestDb_{Guid.CreateVersion7()}";
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(dbName)
            .UseSeeding((ctx, _) => Seed(ctx, currentUserId))
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

    private static void Seed(ApplicationDbContext context, Guid currentUserId) {
        var masterId = Guid.NewGuid();
        var playerId = Guid.NewGuid();
        var assets = new[] {
            CreateTestAsset("Asset 1", AssetType.Creature, Visibility.Public, ownerId: currentUserId),
            CreateTestAsset("Asset 2", ownerId: currentUserId),
            CreateTestAsset("Asset 3", AssetType.Character, Visibility.Public, ownerId: currentUserId),
            CreateTestAsset("Asset 4", AssetType.Character, Visibility.Private, ownerId: Guid.NewGuid()),
        };
        var adventures = new[] {
            CreateTestAdventure("Adventure 1", Visibility.Public, ownerId: currentUserId),
            CreateTestAdventure("Adventure 2", ownerId: currentUserId),
            CreateTestAdventure("Adventure 3", Visibility.Private, ownerId: Guid.NewGuid()),
        };
        var episodes = new[] {
            CreateTestEpisode(adventures[0].Id, "Episode 1.1", ownerId: currentUserId),
            CreateTestEpisode(adventures[0].Id, "Episode 1.2", ownerId: currentUserId),
            CreateTestEpisode(adventures[2].Id, "Episode 3.1", Visibility.Private, adventures[2].OwnerId),
        };
        episodes[0].EpisodeAssets.AddRange([
            new() { AssetId = assets[0].Id, Name = assets[0].Name },
            new() { AssetId = assets[0].Id, Name = "Other Asset" },
            new() { AssetId = assets[2].Id, Name = "Player Character" },
        ]);
        episodes[2].EpisodeAssets.AddRange([
            new() { AssetId = assets[0].Id, Name = assets[0].Name },
            new() { AssetId = assets[3].Id, Name = assets[3].Name },
        ]);
        var meetings = new[] {
            CreateTestMeeting("Meeting 1", episodes[0].Id, MeetingStatus.InProgress),
            CreateTestMeeting("Meeting 2", episodes[1].Id, MeetingStatus.Scheduled, ownerId: currentUserId),
            CreateTestMeeting("Meeting 3", ownerId: episodes[2].OwnerId),
        };
        meetings[0].Players.AddRange([
            new() { UserId = currentUserId, Type = PlayerType.Master },
            new() { UserId = playerId, Type = PlayerType.Player},
        ]);
        meetings[1].Players.AddRange([
            new() { UserId = masterId, Type = PlayerType.Master },
            new() { UserId = playerId, Type = PlayerType.Player },
        ]);
        meetings[2].Players.AddRange([
            new() { UserId = meetings[2].OwnerId, Type = PlayerType.Master,
        }]);
        episodes[0].EpisodeAssets[2].ControlledBy = playerId;

        context.Adventures.AddRange(adventures);
        context.Episodes.AddRange(episodes);
        context.Assets.AddRange(assets);
        context.Meetings.AddRange(meetings);
        context.SaveChanges();
    }

    public static Adventure CreateTestAdventure(Guid id, string name, Visibility visibility = Visibility.Hidden, Guid? ownerId = null) => new() {
        Id = id,
        Name = name,
        Visibility = visibility,
        OwnerId = ownerId ?? Guid.NewGuid(),
    };

    public static Adventure CreateTestAdventure(string name, Visibility visibility = Visibility.Hidden, Guid? ownerId = null)
        => CreateTestAdventure(Guid.CreateVersion7(), name, visibility, ownerId);

    public static Episode CreateTestEpisode(Guid id, Guid parentId, string name, Visibility visibility = Visibility.Hidden, Guid? ownerId = null)
        => new() {
            Id = id,
            Name = name,
            ParentId = parentId,
            Visibility = visibility,
            OwnerId = ownerId ?? Guid.NewGuid(),
        };

    public static Episode CreateTestEpisode(Guid parentId, string name, Visibility visibility = Visibility.Hidden, Guid? ownerId = null)
        => CreateTestEpisode(Guid.CreateVersion7(), parentId, name, visibility, ownerId);

    public static Asset CreateTestAsset(Guid id, string name, AssetType type = AssetType.Placeholder, Visibility visibility = Visibility.Hidden, Guid? ownerId = null)
        => new() {
            Id = id,
            Name = name,
            Type = type,
            Visibility = visibility,
            OwnerId = ownerId ?? Guid.NewGuid(),
            Source = $"http://host.com/{name.Trim().Replace(" ", "-").ToLower(CultureInfo.InvariantCulture)}.png",
        };

    public static Asset CreateTestAsset(string name, AssetType type = AssetType.Placeholder, Visibility visibility = Visibility.Hidden, Guid? ownerId = null)
        => CreateTestAsset(Guid.CreateVersion7(), name, type, visibility, ownerId);

    public static Meeting CreateTestMeeting(Guid id, string subject, Guid? episodeId = null, MeetingStatus status = MeetingStatus.Draft, Guid? ownerId = null)
        => new() {
            Id = id,
            Subject = subject,
            EpisodeId = episodeId,
            Status = status,
            OwnerId = ownerId ?? Guid.NewGuid(),
        };

    public static Meeting CreateTestMeeting(string subject, Guid? episodeId = null, MeetingStatus status = MeetingStatus.Draft, Guid? ownerId = null)
        => CreateTestMeeting(Guid.CreateVersion7(), subject, episodeId, status, ownerId);
}