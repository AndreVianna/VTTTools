namespace VttTools.Assets.Services;

public class AssetServiceTests {
    private readonly IAssetStorage _assetStorage;
    private readonly IMediaStorage _mediaStorage;
    private readonly AssetService _service;
    private readonly Guid _userId = Guid.NewGuid();
    private readonly CancellationToken _ct;

    public AssetServiceTests() {
        _assetStorage = Substitute.For<IAssetStorage>();
        _mediaStorage = Substitute.For<IMediaStorage>();
        _service = new(_assetStorage, _mediaStorage);
#if XUNITV3
        _ct = TestContext.Current.CancellationToken;
#else
        _ct = CancellationToken.None;
#endif
    }

    [Fact]
    public async Task GetAssetsAsync_CallsStorage() {
        // Arrange
        var assets = new Asset[] {
            new() { Id = Guid.NewGuid(), Name = "Test Asset 1", Type = AssetType.Character },
            new() { Id = Guid.NewGuid(), Name = "Test Asset 2", Type = AssetType.Creature },
                                 };
        _assetStorage.GetAllAsync(Arg.Any<CancellationToken>()).Returns(assets);

        // Act
        var result = await _service.GetAssetsAsync(_ct);

        // Assert
        result.Should().BeEquivalentTo(assets);
        await _assetStorage.Received(1).GetAllAsync(Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task GetAssetAsync_CallsStorage() {
        // Arrange
        var assetId = Guid.NewGuid();
        var asset = new Asset {
            Id = assetId,
            Name = "Test Asset",
            Description = "Test Description",
            Type = AssetType.Character,
            Display = new(),
        };
        _assetStorage.GetByIdAsync(assetId, Arg.Any<CancellationToken>()).Returns(asset);

        // Act
        var result = await _service.GetAssetByIdAsync(assetId, _ct);

        // Assert
        result.Should().BeEquivalentTo(asset);
        await _assetStorage.Received(1).GetByIdAsync(assetId, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task CreateAssetAsync_CreatesNewAsset() {
        // Arrange
        var data = new CreateAssetData {
            Name = "New Asset",
            Description = "New Description",
            Type = AssetType.Creature,
            DisplayId = Guid.NewGuid(),
        };

        // Act
        var result = await _service.CreateAssetAsync(_userId, data, _ct);

        // Assert
        result.IsSuccessful.Should().BeTrue();
        result.Value.Name.Should().Be(data.Name);
        result.Value.Description.Should().Be(data.Description);
        result.Value.Type.Should().Be(data.Type);
        result.Value.OwnerId.Should().Be(_userId);
        await _assetStorage.Received(1).AddAsync(Arg.Any<Asset>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task UpdateAssetAsync_WithOwner_UpdatesAsset() {
        // Arrange
        var assetId = Guid.NewGuid();
        var asset = new Asset {
            Id = assetId,
            Name = "Old Name",
            Description = "Old Description",
            Type = AssetType.Character,
            OwnerId = _userId,
            Display = new(),
        };

        var data = new UpdateAssetData {
            Name = "Updated Name",
            Description = "Updated Description",
            Type = AssetType.Creature,
            DisplayId = Guid.NewGuid(),
            IsPublished = true,
            IsPublic = true,
        };

        _assetStorage.GetByIdAsync(assetId, Arg.Any<CancellationToken>()).Returns(asset);
        _assetStorage.UpdateAsync(Arg.Any<Asset>(), Arg.Any<CancellationToken>())
            .Returns(true);

        // Act
        var result = await _service.UpdateAssetAsync(_userId, assetId, data, _ct);

        // Assert
        result.IsSuccessful.Should().BeTrue();
        result.Value.Name.Should().Be(data.Name.Value);
        result.Value.Description.Should().Be(data.Description.Value);
        result.Value.Type.Should().Be(data.Type.Value);
        result.Value.OwnerId.Should().Be(_userId);
        await _assetStorage.Received(1).UpdateAsync(Arg.Any<Asset>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task UpdateAssetAsync_WithNonOwner_ReturnsNull() {
        // Arrange
        var assetId = Guid.NewGuid();
        var nonOwnerId = Guid.NewGuid();
        var asset = new Asset {
            Id = assetId,
            Name = "Asset",
            OwnerId = _userId,
        };

        var data = new UpdateAssetData {
            Name = "Updated Name",
        };

        _assetStorage.GetByIdAsync(assetId, Arg.Any<CancellationToken>()).Returns(asset);

        // Act
        var result = await _service.UpdateAssetAsync(nonOwnerId, assetId, data, _ct);

        // Assert
        result.Should().BeNull();
        await _assetStorage.DidNotReceive().UpdateAsync(Arg.Any<Asset>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task UpdateAssetAsync_WithPartialUpdate_OnlyUpdatesProvidedFields() {
        // Arrange
        var assetId = Guid.NewGuid();
        var asset = new Asset {
            Id = assetId,
            Name = "Original Name",
            Description = "Original Description",
            Type = AssetType.Character,
            OwnerId = _userId,
        };

        var data = new UpdateAssetData {
            Name = "Updated Name",
        };

        _assetStorage.GetByIdAsync(assetId, Arg.Any<CancellationToken>()).Returns(asset);
        _assetStorage.UpdateAsync(Arg.Any<Asset>(), Arg.Any<CancellationToken>())
            .Returns(true);

        // Act
        var result = await _service.UpdateAssetAsync(_userId, assetId, data, _ct);

        // Assert
        result.IsSuccessful.Should().BeTrue();
        result.Value.Name.Should().Be(data.Name.Value);
        result.Value.Description.Should().Be(asset.Description);
        result.Value.Type.Should().Be(asset.Type);
        await _assetStorage.Received(1).UpdateAsync(Arg.Any<Asset>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task DeleteAssetAsync_WithOwner_DeletesAsset() {
        // Arrange
        var assetId = Guid.NewGuid();
        var asset = new Asset {
            Id = assetId,
            Name = "Asset",
            OwnerId = _userId,
        };

        _assetStorage.GetByIdAsync(assetId, Arg.Any<CancellationToken>()).Returns(asset);
        _assetStorage.DeleteAsync(assetId, Arg.Any<CancellationToken>()).Returns(true);

        // Act
        var result = await _service.DeleteAssetAsync(_userId, assetId, _ct);

        // Assert
        result.IsSuccessful.Should().BeTrue();
        await _assetStorage.Received(1).DeleteAsync(assetId, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task DeleteAssetAsync_WithNonOwner_ReturnsFalse() {
        // Arrange
        var assetId = Guid.NewGuid();
        var nonOwnerId = Guid.NewGuid();
        var asset = new Asset {
            Id = assetId,
            Name = "Asset",
            OwnerId = _userId,
        };

        _assetStorage.GetByIdAsync(assetId, Arg.Any<CancellationToken>()).Returns(asset);

        // Act
        var result = await _service.DeleteAssetAsync(nonOwnerId, assetId, _ct);

        // Assert
        result.IsSuccessful.Should().BeFalse();
        await _assetStorage.DidNotReceive().DeleteAsync(Arg.Any<Guid>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task DeleteAssetAsync_WithNonExistentAsset_ReturnsFalse() {
        // Arrange
        var assetId = Guid.NewGuid();
        _assetStorage.GetByIdAsync(assetId, Arg.Any<CancellationToken>()).Returns((Asset?)null);

        // Act
        var result = await _service.DeleteAssetAsync(_userId, assetId, _ct);

        // Assert
        result.IsSuccessful.Should().BeFalse();
        await _assetStorage.DidNotReceive().DeleteAsync(Arg.Any<Guid>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task UpdateAssetAsync_WithNonExistentAsset_ReturnsNull() {
        // Arrange
        var assetId = Guid.NewGuid();
        var data = new UpdateAssetData {
            Name = "Updated Name",
        };

        _assetStorage.GetByIdAsync(assetId, Arg.Any<CancellationToken>()).Returns((Asset?)null);

        // Act
        var result = await _service.UpdateAssetAsync(_userId, assetId, data, _ct);

        // Assert
        result.Should().BeNull();
        await _assetStorage.DidNotReceive().UpdateAsync(Arg.Any<Asset>(), Arg.Any<CancellationToken>());
    }
}