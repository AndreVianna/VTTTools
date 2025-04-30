namespace VttTools.GameService.Services.Game;

public class AssetServiceTests {
    private readonly IAssetStorage _assetStorage;
    private readonly AssetService _service;
    private readonly Guid _userId = Guid.NewGuid();

    public AssetServiceTests() {
        _assetStorage = Substitute.For<IAssetStorage>();
        _service = new(_assetStorage);
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
        var result = await _service.GetAssetsAsync(TestContext.Current.CancellationToken);

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
            Type = AssetType.Character,
            Source = "path/to/asset",
        };
        _assetStorage.GetByIdAsync(assetId, Arg.Any<CancellationToken>()).Returns(asset);

        // Act
        var result = await _service.GetAssetAsync(assetId, TestContext.Current.CancellationToken);

        // Assert
        result.Should().BeEquivalentTo(asset);
        await _assetStorage.Received(1).GetByIdAsync(assetId, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task CreateAssetAsync_CreatesNewAsset() {
        // Arrange
        var request = new CreateAssetRequest {
            Name = "New Asset",
            Type = AssetType.Creature,
            Source = "path/to/asset",
            Visibility = Visibility.Public,
        };
        _assetStorage.AddAsync(Arg.Any<Asset>(), Arg.Any<CancellationToken>())
            .Returns(x => x.Arg<Asset>());

        // Act
        var result = await _service.CreateAssetAsync(_userId, request, TestContext.Current.CancellationToken);

        // Assert
        result.Should().NotBeNull();
        result.Name.Should().Be(request.Name);
        result.Type.Should().Be(request.Type);
        result.Source.Should().Be(request.Source);
        result.Visibility.Should().Be(request.Visibility);
        result.OwnerId.Should().Be(_userId);
        await _assetStorage.Received(1).AddAsync(Arg.Any<Asset>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task UpdateAssetAsync_WithOwner_UpdatesAsset() {
        // Arrange
        var assetId = Guid.NewGuid();
        var asset = new Asset {
            Id = assetId,
            Name = "Old Name",
            Type = AssetType.Character,
            Source = "old/path",
            OwnerId = _userId,
            Visibility = Visibility.Private,
        };

        var request = new UpdateAssetRequest {
            Name = "Updated Name",
            Type = AssetType.Creature,
            Source = "new/path",
            Visibility = Visibility.Public,
        };

        _assetStorage.GetByIdAsync(assetId, Arg.Any<CancellationToken>()).Returns(asset);
        _assetStorage.UpdateAsync(Arg.Any<Asset>(), Arg.Any<CancellationToken>())
            .Returns(x => x.Arg<Asset>());

        // Act
        var result = await _service.UpdateAssetAsync(_userId, assetId, request, TestContext.Current.CancellationToken);

        // Assert
        result.Should().NotBeNull();
        result.Name.Should().Be(request.Name.Value);
        result.Type.Should().Be(request.Type.Value);
        result.Source.Should().Be(request.Source.Value);
        result.Visibility.Should().Be(request.Visibility.Value);
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

        var request = new UpdateAssetRequest {
            Name = "Updated Name",
        };

        _assetStorage.GetByIdAsync(assetId, Arg.Any<CancellationToken>()).Returns(asset);

        // Act
        var result = await _service.UpdateAssetAsync(nonOwnerId, assetId, request, TestContext.Current.CancellationToken);

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
            Type = AssetType.Character,
            Source = "original/path",
            OwnerId = _userId,
            Visibility = Visibility.Private,
        };

        var request = new UpdateAssetRequest {
            Name = "Updated Name",
            // Not setting other properties
        };

        _assetStorage.GetByIdAsync(assetId, Arg.Any<CancellationToken>()).Returns(asset);
        _assetStorage.UpdateAsync(Arg.Any<Asset>(), Arg.Any<CancellationToken>())
            .Returns(x => x.Arg<Asset>());

        // Act
        var result = await _service.UpdateAssetAsync(_userId, assetId, request, TestContext.Current.CancellationToken);

        // Assert
        result.Should().NotBeNull();
        result.Name.Should().Be(request.Name.Value);
        result.Type.Should().Be(asset.Type); // Unchanged
        result.Source.Should().Be(asset.Source); // Unchanged
        result.Visibility.Should().Be(asset.Visibility); // Unchanged
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
        var result = await _service.DeleteAssetAsync(_userId, assetId, TestContext.Current.CancellationToken);

        // Assert
        result.Should().BeTrue();
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
        var result = await _service.DeleteAssetAsync(nonOwnerId, assetId, TestContext.Current.CancellationToken);

        // Assert
        result.Should().BeFalse();
        await _assetStorage.DidNotReceive().DeleteAsync(Arg.Any<Guid>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task DeleteAssetAsync_WithNonExistentAsset_ReturnsFalse() {
        // Arrange
        var assetId = Guid.NewGuid();
        _assetStorage.GetByIdAsync(assetId, Arg.Any<CancellationToken>()).Returns((Asset?)null);

        // Act
        var result = await _service.DeleteAssetAsync(_userId, assetId, TestContext.Current.CancellationToken);

        // Assert
        result.Should().BeFalse();
        await _assetStorage.DidNotReceive().DeleteAsync(Arg.Any<Guid>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task UpdateAssetAsync_WithNonExistentAsset_ReturnsNull() {
        // Arrange
        var assetId = Guid.NewGuid();
        var request = new UpdateAssetRequest {
            Name = "Updated Name",
        };

        _assetStorage.GetByIdAsync(assetId, Arg.Any<CancellationToken>()).Returns((Asset?)null);

        // Act
        var result = await _service.UpdateAssetAsync(_userId, assetId, request, TestContext.Current.CancellationToken);

        // Assert
        result.Should().BeNull();
        await _assetStorage.DidNotReceive().UpdateAsync(Arg.Any<Asset>(), Arg.Any<CancellationToken>());
    }
}