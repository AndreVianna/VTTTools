namespace VttTools.Data.Library;

public class SceneStorageTests
    : IDisposable {
    private readonly SceneStorage _storage;
    private readonly ApplicationDbContext _context;
    private readonly CancellationToken _ct;

    public SceneStorageTests() {
        _context = DbContextHelper.CreateInMemoryContext(Guid.NewGuid());
        _storage = new(_context);
#if XUNITV3
        _ct = TestContext.Current.CancellationToken;
#else
        _ct = CancellationToken.None;
#endif
    }

    public void Dispose() {
        DbContextHelper.Dispose(_context);
        GC.SuppressFinalize(this);
    }

    [Fact]
    public async Task GetAllAsync_ReturnsAllScenes() {
        // Act
        var result = await _storage.GetAllAsync(_ct);

        // Assert
        result.Should().HaveCount(3);
        result.Should().Contain(a => a.Name == "Scene 1.1");
        result.Should().Contain(a => a.Name == "Scene 1.2");
        result.Should().Contain(a => a.Name == "Scene 3.1");
    }

    [Fact]
    public async Task GetByParentIdAsync_WithNoScenes_ReturnsEmptyArray() {
        // Arrange
        var adventureId = Guid.NewGuid();

        // Act
        var result = await _storage.GetByParentIdAsync(adventureId, _ct);

        // Assert
        result.Should().BeEmpty();
    }

    [Fact]
    public async Task GetByParentIdAsync_WithScenes_ReturnsAllScenes() {
        // Arrange
        var adventureId = _context.Adventures.First(p => p.Name == "Adventure 1").Id;

        // Act
        var result = await _storage.GetByParentIdAsync(adventureId, _ct);

        // Assert
        result.Should().HaveCount(2);
        result.Should().Contain(e => e.Name == "Scene 1.1");
        result.Should().Contain(e => e.Name == "Scene 1.2");
        result.Should().NotContain(e => e.Name == "Scene 3.1");
    }

    [Fact]
    public async Task GetByIdAsync_WithExistingId_ReturnsScene() {
        // Arrange
        var sceneId = _context.Scenes.First().Id;

        // Act
        var result = await _storage.GetByIdAsync(sceneId, _ct);

        // Assert
        result.Should().NotBeNull();
        result.Id.Should().Be(sceneId);
    }

    [Fact]
    public async Task GetByIdAsync_WithNonExistingId_ReturnsNull() {
        // Arrange
        var nonExistingId = Guid.NewGuid();

        // Act
        var result = await _storage.GetByIdAsync(nonExistingId, _ct);

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task AddAsync_WithValidScene_AddsToDatabase() {
        // Arrange
        var adventure = _context.Adventures.First(p => p.Name == "Adventure 1");
        var scene = DbContextHelper.CreateTestScene(_context.Scenes.Skip(1).First().Id, "New Scene");

        // Act
        await _storage.AddAsync(scene, adventure.Id, _ct);

        // Assert
        var dbScene = await _context.Scenes.FindAsync([scene.Id], _ct);
        dbScene.Should().BeEquivalentTo(scene);
    }

    [Fact]
    public async Task UpdateAsync_WithExistingScene_UpdatesInDatabase() {
        // Arrange
        var entity = DbContextHelper.CreateTestSceneEntity(_context.Scenes.Skip(1).First().Id, "Scene To Update");

        await _context.Scenes.AddAsync(entity, _ct);
        await _context.SaveChangesAsync(_ct);

        // Modify the scene
        var scene = new Scene {
            Id = entity.Id,
            Name = "Updated Scene",
            Description = "Updated Description",
            Stage = entity.Stage,
        };
        // Act
        var result = await _storage.UpdateAsync(scene, _ct);

        // Assert
        result.Should().BeTrue();
        var dbScene = await _context.Scenes.FindAsync([scene.Id], _ct);
        dbScene.Should().BeEquivalentTo(scene);
    }

    [Fact]
    public async Task DeleteAsync_WithExistingScene_RemovesFromDatabase() {
        // Arrange
        var scene = DbContextHelper.CreateTestSceneEntity(_context.Scenes.Skip(1).First().Id, "Scene To Delete");
        await _context.Scenes.AddAsync(scene, _ct);
        await _context.SaveChangesAsync(_ct);

        // Act
        await _storage.DeleteAsync(scene.Id, _ct);

        // Assert
        var dbScene = await _context.Scenes.FindAsync([scene.Id], _ct);
        dbScene.Should().BeNull();
    }
}