namespace VttTools.Data.Library;

public class AssetStorageTests
    : IDisposable {
    private readonly AssetStorage _storage;
    private readonly ApplicationDbContext _context;
    private readonly CancellationToken _ct;

    public AssetStorageTests() {
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
    public async Task GetAllAsync_ReturnsAllAssets() {
        // Act
        var result = await _storage.GetAllAsync(_ct);

        // Assert
        result.Should().HaveCount(4);
        result.Should().Contain(a => a.Name == "Asset 1");
        result.Should().Contain(a => a.Name == "Asset 2");
        result.Should().Contain(a => a.Name == "Asset 3");
        result.Should().Contain(a => a.Name == "Asset 4");
    }

    [Fact]
    public async Task GetByIdAsync_WithExistingId_ReturnsAsset() {
        // Arrange
        var assetId = _context.Assets.First().Id;

        // Act
        var result = await _storage.GetByIdAsync(assetId, _ct);

        // Assert
        result.Should().NotBeNull();
        result.Id.Should().Be(assetId);
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
    public async Task AddAsync_WithValidAsset_AddsToDatabase() {
        // Arrange
        var asset = DbContextHelper.CreateTestAsset("New Asset");

        // Act
        var result = await _storage.AddAsync(asset, _ct);

        // Assert
        result.Should().BeEquivalentTo(asset);
        var dbAsset = await _context.Assets.FindAsync([asset.Id], _ct);
        dbAsset.Should().BeEquivalentTo(asset);
    }

    [Fact]
    public async Task UpdateAsync_WithExistingAsset_UpdatesInDatabase() {
        // Arrange
        var asset = DbContextHelper.CreateTestAsset("Asset To Update");

        await _context.Assets.AddAsync(asset, _ct);
        await _context.SaveChangesAsync(_ct);

        // Modify the asset
        asset.Name = "Updated Asset";
        asset.Type = AssetType.Sound;

        // Act
        var result = await _storage.UpdateAsync(asset, _ct);

        // Assert
        result.Should().BeEquivalentTo(asset);
        var dbAsset = await _context.Assets.FindAsync([asset.Id], _ct);
        dbAsset.Should().BeEquivalentTo(asset);
    }

    [Fact]
    public async Task DeleteAsync_WithExistingAsset_RemovesFromDatabase() {
        // Arrange
        var asset = DbContextHelper.CreateTestAsset("Asset To Delete");
        await _context.Assets.AddAsync(asset, _ct);
        await _context.SaveChangesAsync(_ct);

        // Act
        await _storage.DeleteAsync(asset.Id, _ct);

        // Assert
        var dbAsset = await _context.Assets.FindAsync([asset.Id], _ct);
        dbAsset.Should().BeNull();
    }
}