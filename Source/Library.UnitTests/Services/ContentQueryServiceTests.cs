using AdventureEntity = VttTools.Data.Library.Entities.Adventure;
using AdventureStyle = VttTools.Library.Adventures.Model.AdventureStyle;
using ResourceEntity = VttTools.Data.Media.Entities.Resource;
using ResourceType = VttTools.Media.Model.ResourceType;
using EncounterEntity = VttTools.Data.Library.Entities.Encounter;

namespace VttTools.Library.Services;

public class ContentQueryServiceTests : IDisposable {
    private readonly ApplicationDbContext _context;
    private readonly ContentQueryService _service;
    private readonly Guid _userId = Guid.CreateVersion7();
    private readonly Guid _otherUserId = Guid.CreateVersion7();
    private readonly CancellationToken _ct;

    public ContentQueryServiceTests() {
        var databaseName = $"VttToolsTests_{Guid.NewGuid():N}";
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseSqlServer($"Server=(localdb)\\MSSQLLocalDB;Database={databaseName};Trusted_Connection=true;TrustServerCertificate=true")
            .Options;
        _context = new ApplicationDbContext(options);
        _context.Database.EnsureCreated();
        _service = new ContentQueryService(_context);
        _ct = TestContext.Current.CancellationToken;
    }

    public void Dispose() {
        _context.Database.EnsureDeleted();
        _context.Dispose();
        GC.SuppressFinalize(this);
    }

    [Fact]
    public async Task GetContentAsync_WithNullFilters_ReturnsDefaultPage() {
        // Arrange
        await SeedAdventures(25);
        var filters = new ContentFilters();

        // Act
        var result = await _service.GetContentAsync(_userId, filters, _ct);

        // Assert
        result.Data.Should().HaveCount(20);
        result.HasMore.Should().BeTrue();
        result.NextCursor.Should().NotBeNull();
        result.Data.Should().OnlyHaveUniqueItems(x => x.Id);
    }

    [Fact]
    public async Task GetContentAsync_WithAfterCursor_ReturnsNextPage() {
        // Arrange
        await SeedAdventures(30);
        var firstPageFilters = new ContentFilters { Limit = 10 };
        var firstPage = await _service.GetContentAsync(_userId, firstPageFilters, _ct);

        var secondPageFilters = new ContentFilters {
            Limit = 10,
            After = firstPage.NextCursor
        };

        // Act
        var secondPage = await _service.GetContentAsync(_userId, secondPageFilters, _ct);

        // Assert
        secondPage.Data.Should().HaveCount(10);
        secondPage.HasMore.Should().BeTrue();
        var firstPageIds = firstPage.Data.Select(x => x.Id).ToHashSet();
        secondPage.Data.Should().NotContain(x => firstPageIds.Contains(x.Id));
        secondPage.Data.Should().OnlyHaveUniqueItems(x => x.Id);
    }

    [Fact]
    public async Task GetContentAsync_WithIsOneShotTrue_OnlyReturnsOneShotAdventures() {
        // Arrange
        await SeedAdventures(5, isOneShot: true);
        await SeedAdventures(5, isOneShot: false);

        var filters = new ContentFilters { IsOneShot = true };

        // Act
        var result = await _service.GetContentAsync(_userId, filters, _ct);

        // Assert
        result.Data.Should().HaveCount(5);
        result.Data.Should().OnlyContain(x => x.IsOneShot == true);
    }

    [Fact]
    public async Task GetContentAsync_WithMinEncounterCount_FiltersCorrectly() {
        // Arrange
        await SeedAdventureWithEncounters("Adventure 1", 1);
        await SeedAdventureWithEncounters("Adventure 2", 2);
        await SeedAdventureWithEncounters("Adventure 3", 3);

        var filters = new ContentFilters { MinEncounterCount = 2 };

        // Act
        var result = await _service.GetContentAsync(_userId, filters, _ct);

        // Assert
        result.Data.Should().HaveCount(2);
        result.Data.Should().OnlyContain(x => x.EncounterCount >= 2);
    }

    [Fact]
    public async Task GetContentAsync_WithMaxEncounterCount_FiltersCorrectly() {
        // Arrange
        await SeedAdventureWithEncounters("Adventure 1", 1);
        await SeedAdventureWithEncounters("Adventure 2", 2);
        await SeedAdventureWithEncounters("Adventure 3", 3);

        var filters = new ContentFilters { MaxEncounterCount = 1 };

        // Act
        var result = await _service.GetContentAsync(_userId, filters, _ct);

        // Assert
        result.Data.Should().HaveCount(1);
        result.Data.Should().OnlyContain(x => x.EncounterCount <= 1);
    }

    [Fact]
    public async Task GetContentAsync_WithStyleFilter_OnlyReturnsMatchingStyle() {
        // Arrange
        await SeedAdventures(3, style: AdventureStyle.Survival);
        await SeedAdventures(3, style: AdventureStyle.DungeonCrawl);

        var filters = new ContentFilters { Style = AdventureStyle.Survival };

        // Act
        var result = await _service.GetContentAsync(_userId, filters, _ct);

        // Assert
        result.Data.Should().HaveCount(3);
        result.Data.Should().OnlyContain(x => x.Style == AdventureStyle.Survival);
    }

    [Fact]
    public async Task GetContentAsync_WithIsPublishedTrue_OnlyReturnsPublished() {
        // Arrange
        await SeedAdventures(5, isPublished: true);
        await SeedAdventures(5, isPublished: false);

        var filters = new ContentFilters { IsPublished = true };

        // Act
        var result = await _service.GetContentAsync(_userId, filters, _ct);

        // Assert
        result.Data.Should().HaveCount(5);
        result.Data.Should().OnlyContain(x => x.IsPublished);
    }

    [Fact]
    public async Task GetContentAsync_WithOwnerMine_OnlyReturnsUserAdventures() {
        // Arrange
        await SeedAdventures(5, ownerId: _userId);
        await SeedAdventures(5, ownerId: _otherUserId, isPublished: true, isPublic: true);

        var filters = new ContentFilters { Owner = "mine" };

        // Act
        var result = await _service.GetContentAsync(_userId, filters, _ct);

        // Assert
        result.Data.Should().HaveCount(5);
        result.Data.Should().OnlyContain(x => x.OwnerId == _userId);
    }

    [Fact]
    public async Task GetContentAsync_WithOwnerPublic_OnlyReturnsPublicAdventures() {
        // Arrange
        await SeedAdventures(5, ownerId: _userId, isPublic: false);
        await SeedAdventures(5, ownerId: _otherUserId, isPublished: true, isPublic: true);

        var filters = new ContentFilters { Owner = "public" };

        // Act
        var result = await _service.GetContentAsync(_userId, filters, _ct);

        // Assert
        result.Data.Should().HaveCount(5);
        result.Data.Should().OnlyContain(x => x.IsPublished);
        result.Data.Should().OnlyContain(x => x.OwnerId == _otherUserId);
    }

    [Fact]
    public async Task GetContentAsync_WithSearchQuery_FiltersName() {
        // Arrange
        await SeedAdventure("Dragon Quest");
        await SeedAdventure("Dragon Slayer");
        await SeedAdventure("Knight Adventure");

        var filters = new ContentFilters { Search = "Dragon" };

        // Act
        var result = await _service.GetContentAsync(_userId, filters, _ct);

        // Assert
        result.Data.Should().HaveCount(2);
        result.Data.Should().OnlyContain(x => x.Name.Contains("Dragon"));
    }

    [Fact]
    public async Task GetContentAsync_WithMultipleFilters_AppliesAllFilters() {
        // Arrange
        await SeedAdventure("Dragon Quest", isOneShot: true, style: AdventureStyle.Survival, isPublished: true);
        await SeedAdventure("Dragon Slayer", isOneShot: true, style: AdventureStyle.DungeonCrawl, isPublished: true);
        await SeedAdventure("Knight Adventure", isOneShot: false, style: AdventureStyle.Survival, isPublished: true);

        var filters = new ContentFilters {
            Search = "Dragon",
            IsOneShot = true,
            Style = AdventureStyle.Survival,
            IsPublished = true
        };

        // Act
        var result = await _service.GetContentAsync(_userId, filters, _ct);

        // Assert
        result.Data.Should().HaveCount(1);
        result.Data[0].Name.Should().Be("Dragon Quest");
    }

    [Fact]
    public async Task GetContentAsync_WithEmptyResult_ReturnsEmptyArray() {
        // Arrange
        await SeedAdventures(5);
        var filters = new ContentFilters { Search = "NonExistent" };

        // Act
        var result = await _service.GetContentAsync(_userId, filters, _ct);

        // Assert
        result.Data.Should().BeEmpty();
        result.HasMore.Should().BeFalse();
        result.NextCursor.Should().BeNull();
    }

    private async Task SeedAdventures(
        int count,
        Guid? ownerId = null,
        bool isOneShot = false,
        AdventureStyle style = AdventureStyle.Survival,
        bool isPublished = false,
        bool isPublic = false) {
        var owner = ownerId ?? _userId;
        for (var i = 0; i < count; i++) {
            await SeedAdventure(
                $"Adventure {i}",
                owner,
                isOneShot,
                style,
                isPublished,
                isPublic);
            await Task.Delay(TimeSpan.FromMilliseconds(5));
        }
    }

    private async Task SeedAdventure(
        string name,
        Guid? ownerId = null,
        bool isOneShot = false,
        AdventureStyle style = AdventureStyle.Survival,
        bool isPublished = false,
        bool isPublic = false) {
        var owner = ownerId ?? _userId;
        var background = new ResourceEntity {
            Id = Guid.CreateVersion7(),
            Type = ResourceType.Image,
            Path = $"backgrounds/{name}.jpg",
            ContentType = "image/jpeg",
            FileName = $"{name}.jpg",
            FileLength = 1024,
        };

        var adventure = new AdventureEntity {
            Id = Guid.CreateVersion7(),
            Name = name,
            OwnerId = owner,
            IsOneShot = isOneShot,
            Style = style,
            IsPublished = isPublished,
            IsPublic = isPublic,
            Description = $"Description for {name}",
            Background = background
        };

        _context.Adventures.Add(adventure);
        await _context.SaveChangesAsync(_ct);
    }

    private async Task SeedAdventureWithEncounters(string name, int encounterCount) {
        var background = new ResourceEntity {
            Id = Guid.CreateVersion7(),
            Type = ResourceType.Image,
            Path = $"backgrounds/{name}.jpg",
            ContentType = "image/jpeg",
            FileName = $"{name}.jpg",
            FileLength = 1024,
        };

        var adventure = new AdventureEntity {
            Id = Guid.CreateVersion7(),
            Name = name,
            OwnerId = _userId,
            IsPublished = true,
            IsPublic = false,
            Description = $"Description for {name}",
            Background = background
        };

        for (var i = 0; i < encounterCount; i++) {
            adventure.Encounters.Add(new EncounterEntity {
                Id = Guid.CreateVersion7(),
                Name = $"Encounter {i + 1}",
                Description = "Encounter description",
                Grid = new Grid(),
                Panning = Point.Zero,
                ZoomLevel = 1
            });
        }

        _context.Adventures.Add(adventure);
        await _context.SaveChangesAsync(_ct);
    }
}