using VttTools.Data.Library.Worlds;
using WorldEntity = VttTools.Data.Library.Worlds.Entities.World;
using WorldModel = VttTools.Library.Worlds.Model.World;

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
            Path = "worlds/bg1.jpg",
            FileName = "bg1.jpg",
            ContentType = "image/jpeg",
            FileSize = 2000,
            Dimensions = new(1920, 1080),
            Duration = TimeSpan.Zero,
        };
        var backgroundResource2 = new Media.Entities.Resource {
            Id = Guid.CreateVersion7(),
            Path = "worlds/bg2.jpg",
            FileName = "bg2.jpg",
            ContentType = "image/jpeg",
            FileSize = 2000,
            Dimensions = new(1920, 1080),
            Duration = TimeSpan.Zero,
        };
        _context.Resources.AddRange(backgroundResource1, backgroundResource2);
        _context.SaveChanges();

        var world1Id = Guid.CreateVersion7();
        var world2Id = Guid.CreateVersion7();
        var world3Id = Guid.CreateVersion7();
        var world4Id = Guid.CreateVersion7();

        var worlds = new[] {
            new WorldEntity {
                Id = world1Id,
                Name = "My World",
                Description = "My personal world",
                IsPublished = true,
                IsPublic = false,
                OwnerId = _currentUserId,
                BackgroundId = backgroundResource1.Id,
                Background = backgroundResource1,
            },
            new WorldEntity {
                Id = world2Id,
                Name = "Public World",
                Description = "Public world for all",
                IsPublished = true,
                IsPublic = true,
                OwnerId = _otherUserId,
                BackgroundId = backgroundResource2.Id,
                Background = backgroundResource2,
            },
            new WorldEntity {
                Id = world3Id,
                Name = "Draft World",
                Description = "Unpublished world",
                IsPublished = false,
                IsPublic = false,
                OwnerId = _currentUserId,
            },
            new WorldEntity {
                Id = world4Id,
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
    public async Task AddAsync_WithValidWorld_AddsToDatabase() {
        var world = new WorldModel {
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
        var background = new Media.Entities.Resource {
            Id = backgroundId,
            Path = "test/background.jpg",
            FileName = "background.jpg",
            ContentType = "image/jpeg",
            FileSize = 2000,
            Dimensions = new(1920, 1080),
            Duration = TimeSpan.Zero,
        };
        _context.Resources.Add(background);
        _context.SaveChanges();

        var world = new WorldModel {
            Id = Guid.CreateVersion7(),
            Name = "World with Background",
            Description = "Test world",
            IsPublished = false,
            IsPublic = false,
            OwnerId = _currentUserId,
            Background = new ResourceMetadata {
                Id = backgroundId,
                Path = "test/background.jpg",
                FileName = "background.jpg",
                ContentType = "image/jpeg",
                FileSize = 2000,
                Dimensions = new(1920, 1080),
                Duration = TimeSpan.Zero,
            },
            Campaigns = [],
        };

        await _storage.AddAsync(world, _ct);

        var dbWorld = await _context.Worlds.Include(w => w.Background).FirstAsync(w => w.Id == world.Id, _ct);
        dbWorld.Should().NotBeNull();
        dbWorld.BackgroundId.Should().Be(backgroundId);
    }

    [Fact]
    public async Task UpdateAsync_WithExistingWorld_UpdatesInDatabase() {
        _context.ChangeTracker.Clear();
        var entity = await _context.Worlds.AsNoTracking().FirstAsync(_ct);
        var world = new WorldModel {
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
        _context.ChangeTracker.Clear();
        var dbWorld = await _context.Worlds.AsNoTracking().FirstOrDefaultAsync(w => w.Id == world.Id, _ct);
        dbWorld.Should().NotBeNull();
        dbWorld!.Name.Should().Be("Updated World");
        dbWorld.Description.Should().Be("Updated description");
        dbWorld.IsPublished.Should().BeTrue();
        dbWorld.IsPublic.Should().BeTrue();
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
