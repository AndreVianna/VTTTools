
namespace VttTools.Assets.Services;

public class AssetServiceTests {
    private readonly IAssetStorage _assetStorage;
    private readonly IMediaStorage _mediaStorage;
    private readonly AssetService _service;
    private readonly Guid _userId = Guid.CreateVersion7();
    private readonly CancellationToken _ct;

    public AssetServiceTests() {
        _assetStorage = Substitute.For<IAssetStorage>();
        _mediaStorage = Substitute.For<IMediaStorage>();
        _service = new(_assetStorage, _mediaStorage);
        _ct = TestContext.Current.CancellationToken;
    }

    [Fact]
    public async Task GetAssetsAsync_CallsStorage() {
        // Arrange
        var assets = new Asset[] {
            new MonsterAsset { Id = Guid.CreateVersion7(), Name = "Test Asset 1" },
            new MonsterAsset { Id = Guid.CreateVersion7(), Name = "Test Asset 2" },
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
        var assetId = Guid.CreateVersion7();
        var asset = new MonsterAsset {
            Id = assetId,
            Name = "Test Asset",
            Description = "Test Description",
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
        var portraitId = Guid.CreateVersion7();
        var data = new CreateAssetData {
            Name = "New Asset",
            Description = "New Description",
            Kind = AssetKind.Monster,
            PortraitId = portraitId,
            Size = NamedSize.FromName(SizeName.Medium),
            MonsterData = new MonsterData(),
        };

        // Act
        var result = await _service.CreateAssetAsync(_userId, data, _ct);

        // Assert
        result.IsSuccessful.Should().BeTrue();
        result.Value.Should().BeOfType<MonsterAsset>();
        result.Value.Name.Should().Be(data.Name);
        result.Value.Description.Should().Be(data.Description);
        result.Value.OwnerId.Should().Be(_userId);
        await _assetStorage.Received(1).AddAsync(Arg.Any<Asset>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task UpdateAssetAsync_WithOwner_UpdatesAsset() {
        // Arrange
        var assetId = Guid.CreateVersion7();
        var asset = new MonsterAsset {
            Id = assetId,
            Name = "Old Name",
            Description = "Old Description",
            OwnerId = _userId,
        };

        var topDownId = Guid.CreateVersion7();
        var data = new UpdateAssetData {
            Name = "Updated Name",
            Description = "Updated Description",
            TopDownId = Optional<Guid?>.Some(topDownId),
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
        result.Value.OwnerId.Should().Be(_userId);
        await _assetStorage.Received(1).UpdateAsync(Arg.Any<Asset>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task UpdateAssetAsync_WithNonOwner_ReturnsNotAllowed() {
        // Arrange
        var assetId = Guid.CreateVersion7();
        var nonOwnerId = Guid.CreateVersion7();
        var asset = new ObjectAsset {
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
        result.IsSuccessful.Should().BeFalse();
        result.Errors[0].Message.Should().Be("NotAllowed");
        await _assetStorage.DidNotReceive().UpdateAsync(Arg.Any<Asset>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task UpdateAssetAsync_WithPartialUpdate_OnlyUpdatesProvidedFields() {
        // Arrange
        var assetId = Guid.CreateVersion7();
        var asset = new MonsterAsset {
            Id = assetId,
            Name = "Original Name",
            Description = "Original Description",
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
        result.Value.Should().BeOfType<MonsterAsset>();
        result.Value.Name.Should().Be(data.Name.Value);
        result.Value.Description.Should().Be(asset.Description);
        await _assetStorage.Received(1).UpdateAsync(Arg.Any<Asset>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task DeleteAssetAsync_WithOwner_DeletesAsset() {
        // Arrange
        var assetId = Guid.CreateVersion7();
        var asset = new ObjectAsset {
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
        var assetId = Guid.CreateVersion7();
        var nonOwnerId = Guid.CreateVersion7();
        var asset = new ObjectAsset {
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
        var assetId = Guid.CreateVersion7();
        _assetStorage.GetByIdAsync(assetId, Arg.Any<CancellationToken>()).Returns((Asset?)null);

        // Act
        var result = await _service.DeleteAssetAsync(_userId, assetId, _ct);

        // Assert
        result.IsSuccessful.Should().BeFalse();
        await _assetStorage.DidNotReceive().DeleteAsync(Arg.Any<Guid>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task UpdateAssetAsync_WithNonExistentAsset_ReturnsNotFound() {
        // Arrange
        var assetId = Guid.CreateVersion7();
        var data = new UpdateAssetData {
            Name = "Updated Name",
        };

        _assetStorage.GetByIdAsync(assetId, Arg.Any<CancellationToken>()).Returns((Asset?)null);

        // Act
        var result = await _service.UpdateAssetAsync(_userId, assetId, data, _ct);

        // Assert
        result.IsSuccessful.Should().BeFalse();
        result.Errors[0].Message.Should().Be("NotFound");
        await _assetStorage.DidNotReceive().UpdateAsync(Arg.Any<Asset>(), Arg.Any<CancellationToken>());
    }
}