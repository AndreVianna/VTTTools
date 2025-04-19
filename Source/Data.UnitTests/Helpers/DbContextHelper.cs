namespace VttTools.Data.Helpers;

/// <summary>
/// Helper class for creating in-memory database contexts for unit testing.
/// </summary>
public static class DbContextHelper {
    /// <summary>
    /// Creates a new ApplicationDbContext with an in-memory database.
    /// </summary>
    /// <param name="databaseName">Unique name for the in-memory database.</param>
    /// <returns>A new ApplicationDbContext instance.</returns>
    public static ApplicationDbContext CreateInMemoryContext(string databaseName) {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName)
            .Options;

        var context = new ApplicationDbContext(options);
        context.Database.EnsureDeleted();
        context.Database.EnsureCreated();
        return context;
    }

    /// <summary>
    /// Creates a test Adventure entity with a unique identifier.
    /// </summary>
    public static Adventure CreateTestAdventure(
        Guid? id = null,
        string name = "Test Adventure",
        Guid? ownerId = null,
        Visibility visibility = Visibility.Public) => new() {
            Id = id ?? Guid.NewGuid(),
            Name = name,
            OwnerId = ownerId ?? Guid.NewGuid(),
            Visibility = visibility,
        };

    /// <summary>
    /// Creates a test Episode entity with a unique identifier.
    /// </summary>
    public static Episode CreateTestEpisode(
        Guid? id = null,
        string name = "Test Episode",
        Guid? parentId = null) => new() {
            Id = id ?? Guid.NewGuid(),
            Name = name,
            ParentId = parentId ?? Guid.NewGuid(),
        };

    /// <summary>
    /// Creates a test Asset entity with a unique identifier.
    /// </summary>
    public static Asset CreateTestAsset(
        Guid? id = null,
        string name = "Test Asset",
        Guid? ownerId = null,
        AssetType assetType = AssetType.Object) => new() {
            Id = id ?? Guid.NewGuid(),
            Name = name,
            OwnerId = ownerId ?? Guid.NewGuid(),
            Type = assetType,
        };

    /// <summary>
    /// Creates a test Meeting entity with a unique identifier.
    /// </summary>
    public static Meeting CreateTestMeeting(
        Guid? id = null,
        string subject = "Test Meeting",
        Guid? ownerId = null) => new() {
            Id = id ?? Guid.NewGuid(),
            Subject = subject,
            OwnerId = ownerId ?? Guid.NewGuid(),
            Players = [],
        };
}