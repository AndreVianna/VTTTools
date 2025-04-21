namespace VttTools.Data.Game;

public class AssetStorageTests : IDisposable {
    private readonly ApplicationDbContext _context;
    private readonly AssetStorage _storage;

    public AssetStorageTests() {
        var dbName = $"AssetTestDb_{Guid.NewGuid()}";
        _context = DbContextHelper.CreateInMemoryContext(dbName);
        _storage = new(_context);
    }

    public void Dispose() {
        _context.Dispose();
        GC.SuppressFinalize(this);
    }

    [Fact]
    public async Task GetAllAsync_WithNoAssets_ReturnsEmptyArray() {
        // Arrange

        // Act
        var result = await _storage.GetAllAsync(TestContext.Current.CancellationToken);

        // Assert
        result.Should().BeEmpty();
    }

    [Fact]
    public async Task GetAllAsync_WithAssets_ReturnsAllAssets() {
        // Arrange
        var asset1 = DbContextHelper.CreateTestAsset(name: "Asset 1", assetType: AssetType.Object);
        var asset2 = DbContextHelper.CreateTestAsset(name: "Asset 2", assetType: AssetType.Character);

        await _context.Assets.AddRangeAsync(asset1, asset2);
        await _context.SaveChangesAsync(TestContext.Current.CancellationToken);

        // Act
        var result = await _storage.GetAllAsync(TestContext.Current.CancellationToken);

        // Assert
        result.Should().HaveCount(2);
        result.Should().Contain(a => a.Name == "Asset 1" && a.Type == AssetType.Object);
        result.Should().Contain(a => a.Name == "Asset 2" && a.Type == AssetType.Character);
    }

    [Fact]
    public async Task GetByIdAsync_WithExistingId_ReturnsAsset() {
        // Arrange
        var assetId = Guid.NewGuid();
        var asset = DbContextHelper.CreateTestAsset(id: assetId, name: "Test Asset", assetType: AssetType.Sound);

        await _context.Assets.AddAsync(asset, TestContext.Current.CancellationToken);
        await _context.SaveChangesAsync(TestContext.Current.CancellationToken);

        // Act
        var result = await _storage.GetByIdAsync(assetId, TestContext.Current.CancellationToken);

        // Assert
        result.Should().NotBeNull();
        result.Id.Should().Be(assetId);
        result.Name.Should().Be("Test Asset");
        result.Type.Should().Be(AssetType.Sound);
    }

    [Fact]
    public async Task GetByIdAsync_WithNonExistingId_ReturnsNull() {
        // Arrange
        var nonExistingId = Guid.NewGuid();

        // Act
        var result = await _storage.GetByIdAsync(nonExistingId, TestContext.Current.CancellationToken);

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task AddAsync_WithValidAsset_AddsToDatabase() {
        // Arrange
        var asset = DbContextHelper.CreateTestAsset(name: "New Asset");

        // Act
        var result = await _storage.AddAsync(asset, TestContext.Current.CancellationToken);

        // Assert
        result.Should().NotBeNull();
        result.Id.Should().Be(asset.Id);

        // Verify it's in the database
        var dbAsset = await _context.Assets.FindAsync([asset.Id], TestContext.Current.CancellationToken);
        dbAsset.Should().NotBeNull();
        dbAsset.Name.Should().Be("New Asset");
    }

    [Fact]
    public async Task UpdateAsync_WithExistingAsset_UpdatesInDatabase() {
        // Arrange
        var asset = DbContextHelper.CreateTestAsset(name: "Original Name");

        await _context.Assets.AddAsync(asset, TestContext.Current.CancellationToken);
        await _context.SaveChangesAsync(TestContext.Current.CancellationToken);

        // Modify the asset
        asset.Name = "Updated Name";
        asset.Type = AssetType.Sound;

        // Act
        var result = await _storage.UpdateAsync(asset, TestContext.Current.CancellationToken);

        // Assert
        result.Should().NotBeNull();
        result.Name.Should().Be("Updated Name");
        result.Type.Should().Be(AssetType.Sound);

        // Verify it's updated in the database
        var dbAsset = await _context.Assets.FindAsync([asset.Id], TestContext.Current.CancellationToken);
        dbAsset.Should().NotBeNull();
        dbAsset.Name.Should().Be("Updated Name");
        dbAsset.Type.Should().Be(AssetType.Sound);
    }

    [Fact]
    public async Task DeleteAsync_WithExistingAsset_RemovesFromDatabase() {
        // Arrange
        var asset = DbContextHelper.CreateTestAsset();

        await _context.Assets.AddAsync(asset, TestContext.Current.CancellationToken);
        await _context.SaveChangesAsync(TestContext.Current.CancellationToken);

        // Act
        await _storage.DeleteAsync(asset, TestContext.Current.CancellationToken);

        // Assert
        var dbAsset = await _context.Assets.FindAsync([asset.Id], TestContext.Current.CancellationToken);
        dbAsset.Should().BeNull();
    }
}