namespace VttTools.Data.Library;

public class WorldStorageTests
    : IDisposable {
    private readonly WorldStorage _storage;
    private readonly ApplicationDbContext _context;
    private readonly Guid _currentUserId = Guid.CreateVersion7();
    private readonly Guid _otherUserId = Guid.CreateVersion7();
    private readonly CancellationToken _ct;

    public WorldStorageTests() {
        _context = DbContextHelper.CreateInMemoryContext(_currentUserId);
        _storage = new(_context);
        _ct = TestContext.Current.CancellationToken;
        SeedWorlds();
    }

    public void Dispose() {
        DbContextHelper.Dispose(_context);
        GC.SuppressFinalize(this);
    }

    private void SeedWorlds() {
        var backgroundResource1 = new Media.Entities.Resource {
            Id = Guid.CreateVersion7(),
            ResourceType = ResourceType.Background,
            Path = "worlds/bg1.jpg",
            FileName = "bg1.jpg",
            ContentType = "image/jpeg",
            FileLength = 2000,
            Size = new(1920, 1080),
            Duration = TimeSpan.Zero,
        };
        var backgroundResource2 = new Media.Entities.Resource {
            Id = Guid.CreateVersion7(),
            ResourceType = ResourceType.Background,
            Path = "worlds/bg2.jpg",
            FileName = "bg2.jpg",
            ContentType = "image/jpeg",
            FileLength = 2000,
            Size = new(1920, 1080),
            Duration = TimeSpan.Zero,
        };
        _context.Resources.AddRange(backgroundResource1, backgroundResource2);

        var worlds = new[] {
            new Entities.World {
                Id = Guid.CreateVersion7(),
                Name = "My World",
                Description = "My personal world",
                IsPublished = true,
                IsPublic = false,
                OwnerId = _currentUserId,
                BackgroundId = backgroundResource1.Id,
            },
            new Entities.World {
                Id = Guid.CreateVersion7(),
                Name = "Public World",
                Description = "Public world for all",
                IsPublished = true,
                IsPublic = true,
                OwnerId = _otherUserId,
                BackgroundId = backgroundResource2.Id,
            },
            new Entities.World {
                Id = Guid.CreateVersion7(),
                Name = "Draft World",
                Description = "Unpublished world",
                IsPublished = false,
                IsPublic = false,
                OwnerId = _currentUserId,
            },
            new Entities.World {
                Id = Guid.CreateVersion7(),
                Name = "Other User World",
                Description = "Private world by other user",
                IsPublished = true,
                IsPublic = false,
                OwnerId = _otherUserId,
            },
        };
        _context.Worlds.AddRange(worlds);
        _context.SaveChanges();
    }

    [Fact]
    public async Task GetAllAsync_ReturnsAllWorlds() {
        var result = await _storage.GetAllAsync(_ct);

        result.Should().HaveCount(4);
        result.Should().Contain(w => w.Name == "My World");
        result.Should().Contain(w => w.Name == "Public World");
        result.Should().Contain(w => w.Name == "Draft World");
        result.Should().Contain(w => w.Name == "Other User World");
    }

    [Fact]
    public async Task GetManyAsync_WithOwnedByFilter_ReturnsOwnedWorlds() {
        var result = await _storage.GetManyAsync($"OwnedBy:{_currentUserId}", _ct);

        result.Should().HaveCount(2);
        result.Should().Contain(w => w.Name == "My World");
        result.Should().Contain(w => w.Name == "Draft World");
        result.Should().OnlyContain(w => w.OwnerId == _currentUserId);
    }

    [Fact]
    public async Task GetManyAsync_WithAvailableToFilter_ReturnsAccessibleWorlds() {
        var result = await _storage.GetManyAsync($"AvailableTo:{_currentUserId}", _ct);

        result.Should().HaveCount(3);
        result.Should().Contain(w => w.Name == "My World");
        result.Should().Contain(w => w.Name == "Public World");
        result.Should().Contain(w => w.Name == "Draft World");
        result.Should().NotContain(w => w.Name == "Other User World");
    }

    [Fact]
    public async Task GetManyAsync_WithPublicFilter_ReturnsPublicWorlds() {
        var result = await _storage.GetManyAsync("Public", _ct);

        result.Should().HaveCount(1);
        result.Should().Contain(w => w.Name == "Public World");
        result.Should().OnlyContain(w => w.IsPublic && w.IsPublished);
    }

    [Fact]
    public async Task GetManyAsync_WithInvalidFilter_ReturnsAllWorlds() {
        var result = await _storage.GetManyAsync("InvalidFilter", _ct);

        result.Should().HaveCount(4);
    }

    [Fact]
    public async Task GetByIdAsync_WithExistingId_ReturnsWorld() {
        var entity = await _context.Worlds.FirstAsync(_ct);

        var result = await _storage.GetByIdAsync(entity.Id, _ct);

        result.Should().NotBeNull();
        result.Id.Should().Be(entity.Id);
        result.Name.Should().Be(entity.Name);
        result.Description.Should().Be(entity.Description);
        result.IsPublished.Should().Be(entity.IsPublished);
        result.IsPublic.Should().Be(entity.IsPublic);
        result.OwnerId.Should().Be(entity.OwnerId);
    }

    [Fact]
    public async Task GetByIdAsync_WithNonExistingId_ReturnsNull() {
        var nonExistingId = Guid.CreateVersion7();

        var result = await _storage.GetByIdAsync(nonExistingId, _ct);

        result.Should().BeNull();
    }

    [Fact]
    public async Task GetByIdAsync_IncludesBackground_WhenWorldHasBackground() {
        var entity = await _context.Worlds
            .FirstAsync(w => w.BackgroundId != null, _ct);

        var result = await _storage.GetByIdAsync(entity.Id, _ct);

        result.Should().NotBeNull();
        result.Background.Should().NotBeNull();
        result.Background!.Id.Should().Be(entity.BackgroundId!.Value);
    }

    [Fact]
    public async Task AddAsync_WithValidWorld_AddsToDatabase() {
        var world = new World {
            Id = Guid.CreateVersion7(),
            Name = "New World",
            Description = "A new world",
            IsPublished = false,
            IsPublic = false,
            OwnerId = _currentUserId,
            Campaigns = [],
        };

        await _storage.AddAsync(world, _ct);

        var dbWorld = await _context.Worlds.FindAsync([world.Id], _ct);
        dbWorld.Should().NotBeNull();
        dbWorld.Id.Should().Be(world.Id);
        dbWorld.Name.Should().Be(world.Name);
        dbWorld.Description.Should().Be(world.Description);
        dbWorld.IsPublished.Should().Be(world.IsPublished);
        dbWorld.IsPublic.Should().Be(world.IsPublic);
        dbWorld.OwnerId.Should().Be(world.OwnerId);
    }

    [Fact]
    public async Task AddAsync_WithBackground_SavesBackgroundReference() {
        var backgroundId = Guid.CreateVersion7();
        var world = new World {
            Id = Guid.CreateVersion7(),
            Name = "World with Background",
            Description = "Test world",
            IsPublished = false,
            IsPublic = false,
            OwnerId = _currentUserId,
            Background = new ResourceMetadata {
                Id = backgroundId,
                ResourceType = ResourceType.Background,
                Path = "test/background.jpg",
                FileName = "background.jpg",
                ContentType = "image/jpeg",
                FileLength = 2000,
                Size = new(1920, 1080),
                Duration = TimeSpan.Zero,
            },
            Campaigns = [],
        };

        await _storage.AddAsync(world, _ct);

        var dbWorld = await _context.Worlds.FindAsync([world.Id], _ct);
        dbWorld.Should().NotBeNull();
        dbWorld.BackgroundId.Should().Be(backgroundId);
    }

    [Fact]
    public async Task UpdateAsync_WithExistingWorld_UpdatesInDatabase() {
        var entity = await _context.Worlds.FirstAsync(_ct);
        var world = new World {
            Id = entity.Id,
            Name = "Updated World",
            Description = "Updated description",
            IsPublished = true,
            IsPublic = true,
            OwnerId = entity.OwnerId,
            Campaigns = [],
        };

        var result = await _storage.UpdateAsync(world, _ct);

        result.Should().BeTrue();
        var dbWorld = await _context.Worlds.FindAsync([world.Id], _ct);
        dbWorld.Should().NotBeNull();
        dbWorld.Name.Should().Be("Updated World");
        dbWorld.Description.Should().Be("Updated description");
        dbWorld.IsPublished.Should().BeTrue();
        dbWorld.IsPublic.Should().BeTrue();
    }

    [Fact]
    public async Task UpdateAsync_WithNonExistingWorld_ReturnsFalse() {
        var world = new World {
            Id = Guid.CreateVersion7(),
            Name = "Non-existing World",
            Description = "Test",
            IsPublished = false,
            IsPublic = false,
            OwnerId = _currentUserId,
            Campaigns = [],
        };

        var result = await _storage.UpdateAsync(world, _ct);

        result.Should().BeFalse();
    }

    [Fact]
    public async Task DeleteAsync_WithExistingWorld_RemovesFromDatabase() {
        var entity = await _context.Worlds.FirstAsync(_ct);

        var result = await _storage.DeleteAsync(entity.Id, _ct);

        result.Should().BeTrue();
        var dbWorld = await _context.Worlds.FindAsync([entity.Id], _ct);
        dbWorld.Should().BeNull();
    }

    [Fact]
    public async Task DeleteAsync_WithNonExistingWorld_ReturnsFalse() {
        var nonExistingId = Guid.CreateVersion7();

        var result = await _storage.DeleteAsync(nonExistingId, _ct);

        result.Should().BeFalse();
    }
}
