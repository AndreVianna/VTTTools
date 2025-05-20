namespace VttTools.Library.Services;

public class SceneServiceTests {
    private readonly ISceneStorage _sceneStorage;
    private readonly IAssetStorage _assetStorage;
    private readonly SceneService _service;
    private readonly Guid _userId = Guid.NewGuid();
    private readonly CancellationToken _ct;

    public SceneServiceTests() {
        _sceneStorage = Substitute.For<ISceneStorage>();
        _assetStorage = Substitute.For<IAssetStorage>();
        _service = new(_sceneStorage, _assetStorage);
#if XUNITV3
        _ct = TestContext.Current.CancellationToken;
#else
        _ct = CancellationToken.None;
#endif
    }

    [Fact]
    public async Task GetScenesAsync_CallsStorage() {
        // Arrange
        var scenes = new Scene[] {
            new() { Id = Guid.NewGuid(), Name = "Test Scene 1" },
            new() { Id = Guid.NewGuid(), Name = "Test Scene 2" },
        };
        _sceneStorage.GetAllAsync(Arg.Any<CancellationToken>()).Returns(scenes);

        // Act
        var result = await _service.GetScenesAsync(_ct);

        // Assert
        result.Should().BeEquivalentTo(scenes);
        await _sceneStorage.Received(1).GetAllAsync(Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task GetSceneByIdAsync_CallsStorage() {
        // Arrange
        var sceneId = Guid.NewGuid();
        var scene = new Scene { Id = sceneId, Name = "Test Scene" };
        _sceneStorage.GetByIdAsync(sceneId, Arg.Any<CancellationToken>()).Returns(scene);

        // Act
        var result = await _service.GetSceneByIdAsync(sceneId, _ct);

        // Assert
        result.Should().BeEquivalentTo(scene);
        await _sceneStorage.Received(1).GetByIdAsync(sceneId, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task GetSceneByIdAsync_WhenSceneNotFound_ReturnsNull() {
        // Arrange
        var sceneId = Guid.NewGuid();
        _sceneStorage.GetByIdAsync(sceneId, Arg.Any<CancellationToken>()).Returns((Scene?)null);

        // Act
        var result = await _service.GetSceneByIdAsync(sceneId, _ct);

        // Assert
        result.Should().BeNull();
        await _sceneStorage.Received(1).GetByIdAsync(sceneId, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task UpdateSceneAsync_WithOwner_UpdatesScene() {
        // Arrange
        var sceneId = Guid.NewGuid();
        var scene = new Scene {
            Id = sceneId,
            Name = "Old Name",
            Description = "Old Description",
        };
        var data = new UpdateSceneData {
            Name = "Updated Name",
            Description = "Updated Description",
        };

        _sceneStorage.GetByIdAsync(sceneId, Arg.Any<CancellationToken>()).Returns(scene);
        _sceneStorage.UpdateAsync(Arg.Any<Scene>(), Arg.Any<CancellationToken>())
            .Returns(x => x.Arg<Scene>());

        // Act
        var result = await _service.UpdateSceneAsync(_userId, sceneId, data, _ct);

        // Assert
        result.IsSuccessful.Should().BeTrue();
        result.Value.Name.Should().Be(data.Name.Value);
        result.Value.Description.Should().Be(data.Description.Value);
        await _sceneStorage.Received(1).UpdateAsync(Arg.Any<Scene>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task UpdateSceneAsync_WithPartialUpdate_OnlyUpdatesSpecifiedFields() {
        // Arrange
        var sceneId = Guid.NewGuid();
        var scene = new Scene {
            Id = sceneId,
            Name = "Old Name",
            Description = "Old Description",
        };
        var data = new UpdateSceneData {
            Name = "Updated Name",
        };

        _sceneStorage.GetByIdAsync(sceneId, Arg.Any<CancellationToken>()).Returns(scene);
        _sceneStorage.UpdateAsync(Arg.Any<Scene>(), Arg.Any<CancellationToken>())
            .Returns(x => x.Arg<Scene>());

        // Act
        var result = await _service.UpdateSceneAsync(_userId, sceneId, data, _ct);

        // Assert
        result.IsSuccessful.Should().BeTrue();
        result.Value.Name.Should().Be(data.Name.Value);
        result.Value.Description.Should().Be(scene.Description);
        await _sceneStorage.Received(1).UpdateAsync(Arg.Any<Scene>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task UpdateSceneAsync_WithNonOwner_ReturnsNull() {
        // Arrange
        var sceneId = Guid.NewGuid();
        var nonOwnerId = Guid.NewGuid();
        var scene = new Scene {
            Id = sceneId,
            Name = "Scene",
        };
        var data = new UpdateSceneData {
            Name = "Updated Name",
        };

        _sceneStorage.GetByIdAsync(sceneId, Arg.Any<CancellationToken>()).Returns(scene);

        // Act
        var result = await _service.UpdateSceneAsync(nonOwnerId, sceneId, data, _ct);

        // Assert
        result.IsSuccessful.Should().BeFalse();
        await _sceneStorage.DidNotReceive().UpdateAsync(Arg.Any<Scene>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task UpdateSceneAsync_WithNonexistentScene_ReturnsNull() {
        // Arrange
        var sceneId = Guid.NewGuid();
        var data = new UpdateSceneData {
            Name = "Updated Name",
        };

        _sceneStorage.GetByIdAsync(sceneId, Arg.Any<CancellationToken>()).Returns((Scene?)null);

        // Act
        var result = await _service.UpdateSceneAsync(_userId, sceneId, data, _ct);

        // Assert
        result.IsSuccessful.Should().BeFalse();
        await _sceneStorage.DidNotReceive().UpdateAsync(Arg.Any<Scene>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task GetAssetsAsync_CallsStorage() {
        // Arrange
        var sceneId = Guid.NewGuid();
        var scene = new Scene {
            Id = sceneId,
            Name = "Scene",
            SceneAssets = [
                new() { Number = 1, Name = "Test Asset 1" },
                new() { Number = 2, Name = "Test Asset 2" },
            ],
        };

        _sceneStorage.GetByIdAsync(sceneId, Arg.Any<CancellationToken>())
                       .Returns(scene);

        // Act
        var result = await _service.GetAssetsAsync(sceneId, _ct);

        // Assert
        result.Should().BeEquivalentTo(scene.SceneAssets);
        await _sceneStorage.Received(1).GetByIdAsync(sceneId, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task GetAssetsAsync_WithNonexistentScene_ReturnsEmptyArray() {
        // Arrange
        var sceneId = Guid.NewGuid();
        _sceneStorage.GetByIdAsync(sceneId, Arg.Any<CancellationToken>())
                       .Returns((Scene?)null);

        // Act
        var result = await _service.GetAssetsAsync(sceneId, _ct);

        // Assert
        result.Should().BeEmpty();
        await _sceneStorage.Received(1).GetByIdAsync(sceneId, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task AddAssetAsync_WithOwner_AddsAssetAndReturnsTrue() {
        // Arrange
        var sceneId = Guid.NewGuid();
        var assetId = Guid.NewGuid();
        var scene = new Scene {
            Id = sceneId,
            Name = "Scene",
            SceneAssets = [],
        };
        var data = new AddNewAssetData {
            Name = "New Asset",
            Position = new() { X = 20, Y = 30 },
            Scale = new() { X = 0.5f, Y = 0.5f },
            Elevation = 1f,
            Rotation = 45f,
        };

        _sceneStorage.GetByIdAsync(sceneId, Arg.Any<CancellationToken>()).Returns(scene);
        _sceneStorage.UpdateAsync(Arg.Any<Scene>(), Arg.Any<CancellationToken>())
            .Returns(x => x.Arg<Scene>());

        // Act
        var result = await _service.AddNewAssetAsync(_userId, sceneId, data, _ct);

        // Assert
        result.IsSuccessful.Should().BeTrue();
        scene.SceneAssets.Should().ContainSingle();
        var addedAsset = scene.SceneAssets[0];
        addedAsset.Name.Should().Be(data.Name);
        addedAsset.Position.Should().BeEquivalentTo(data.Position);
        addedAsset.Scale.Should().Be(data.Scale);
        addedAsset.IsLocked.Should().BeFalse();
        await _sceneStorage.Received(1).UpdateAsync(scene, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task AddAssetAsync_WithNonOwner_ReturnsFalse() {
        // Arrange
        var sceneId = Guid.NewGuid();
        var nonOwnerId = Guid.NewGuid();
        var scene = new Scene {
            Id = sceneId,
            Name = "Scene",
            SceneAssets = [],
        };
        var data = new AddNewAssetData {
            Name = "New Asset",
            Position = new() { X = 20, Y = 30 },
            Scale = new() { X = 0.5f, Y = 0.5f },
            Elevation = 1f,
            Rotation = 45f,
        };

        _sceneStorage.GetByIdAsync(sceneId, Arg.Any<CancellationToken>()).Returns(scene);

        // Act
        var result = await _service.AddNewAssetAsync(nonOwnerId, sceneId, data, _ct);

        // Assert
        result.IsSuccessful.Should().BeFalse();
        scene.SceneAssets.Should().BeEmpty();
        await _sceneStorage.DidNotReceive().UpdateAsync(Arg.Any<Scene>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task AddAssetAsync_WithNonexistentScene_ReturnsFalse() {
        // Arrange
        var sceneId = Guid.NewGuid();
        var data = new AddNewAssetData {
            Name = "New Asset",
            Position = new() { X = 20, Y = 30 },
            Scale = new() { X = 0.5f, Y = 0.5f },
            Elevation = 1f,
            Rotation = 45f,
        };

        _sceneStorage.GetByIdAsync(sceneId, Arg.Any<CancellationToken>()).Returns((Scene?)null);

        // Act
        var result = await _service.AddNewAssetAsync(_userId, sceneId, data, _ct);

        // Assert
        result.IsSuccessful.Should().BeFalse();
        await _sceneStorage.DidNotReceive().UpdateAsync(Arg.Any<Scene>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task RemoveAssetAsync_WithOwner_RemovesAssetAndReturnsTrue() {
        // Arrange
        var sceneId = Guid.NewGuid();
        var assetId = Guid.NewGuid();
        const int number = 1;
        var scene = new Scene {
            Id = sceneId,
            Name = "Scene",
            SceneAssets = [
                new() {
                    Number = number,
                    Name = "Asset to remove",
                    Position = new() { X = 1, Y = 1 },
                },
            ],
        };

        _sceneStorage.GetByIdAsync(sceneId, Arg.Any<CancellationToken>()).Returns(scene);

        // Act
        var result = await _service.RemoveAssetAsync(_userId, sceneId, assetId, number, _ct);

        // Assert
        result.IsSuccessful.Should().BeTrue();
        scene.SceneAssets.Should().BeEmpty();
        await _sceneStorage.Received(1).UpdateAsync(scene, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task RemoveAssetAsync_WithNonOwner_ReturnsFalse() {
        // Arrange
        var sceneId = Guid.NewGuid();
        var assetId = Guid.NewGuid();
        const int number = 1;
        var nonOwnerId = Guid.NewGuid();
        var scene = new Scene {
            Id = sceneId,
            Name = "Scene",
            SceneAssets = [
                new() {
                    Number = number,
                    Name = "Asset to keep",
                    Position = new() { X = 1, Y = 1 },
                },
            ],
        };

        _sceneStorage.GetByIdAsync(sceneId, Arg.Any<CancellationToken>()).Returns(scene);

        // Act
        var result = await _service.RemoveAssetAsync(nonOwnerId, sceneId, assetId, number, _ct);

        // Assert
        result.IsSuccessful.Should().BeFalse();
        scene.SceneAssets.Should().ContainSingle();
        await _sceneStorage.DidNotReceive().UpdateAsync(Arg.Any<Scene>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task RemoveAssetAsync_WithNonexistentScene_ReturnsFalse() {
        // Arrange
        var sceneId = Guid.NewGuid();
        var assetId = Guid.NewGuid();
        const int number = 1;

        _sceneStorage.GetByIdAsync(sceneId, Arg.Any<CancellationToken>()).Returns((Scene?)null);

        // Act
        var result = await _service.RemoveAssetAsync(_userId, sceneId, assetId, number, _ct);

        // Assert
        result.IsSuccessful.Should().BeFalse();
        await _sceneStorage.DidNotReceive().UpdateAsync(Arg.Any<Scene>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task UpdateAssetAsync_WithOwner_UpdatesAssetAndReturnsTrue() {
        // Arrange
        var sceneId = Guid.NewGuid();
        var assetId = Guid.NewGuid();
        const uint number = 1u;
        var scene = new Scene {
            Id = sceneId,
            Name = "Scene",
            SceneAssets = [
                new() {
                    Name = "Asset to update",
                    Position = new() { X = 1, Y = 1 },
                },
            ],
        };
        var data = new UpdateAssetData {
            AssetId = assetId,
            Number = number,
            Position = new Vector2 { X = 20, Y = 30 },
            Scale = new Vector2 { X = 0.5f, Y = 0.5f },
            Elevation = 1f,
            Rotation = 45f,
        };

        _sceneStorage.GetByIdAsync(sceneId, Arg.Any<CancellationToken>()).Returns(scene);

        // Act
        var result = await _service.UpdateAssetAsync(_userId, sceneId, data, _ct);

        // Assert
        result.IsSuccessful.Should().BeTrue();
        var updatedAsset = scene.SceneAssets[0];
        updatedAsset.Position.Should().BeEquivalentTo(data.Position.Value);
        await _sceneStorage.Received(1).UpdateAsync(scene, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task UpdateAssetAsync_WithNonOwner_ReturnsFalse() {
        // Arrange
        var sceneId = Guid.NewGuid();
        var assetId = Guid.NewGuid();
        const uint number = 1u;
        var nonOwnerId = Guid.NewGuid();
        var scene = new Scene {
            Id = sceneId,
            Name = "Scene",
            SceneAssets = [
                new() {
                    Number = number,
                    Name = "Asset to not update",
                    Position = new() { X = 1, Y = 1 },
                },
            ],
        };
        var data = new UpdateAssetData {
            AssetId = assetId,
            Number = number,
            Position = new Vector2 { X = 20, Y = 30 },
            Scale = new Vector2 { X = 0.5f, Y = 0.5f },
            Elevation = 1f,
            Rotation = 45f,
        };

        _sceneStorage.GetByIdAsync(sceneId, Arg.Any<CancellationToken>()).Returns(scene);

        // Act
        var result = await _service.UpdateAssetAsync(nonOwnerId, sceneId, data, _ct);

        // Assert
        result.IsSuccessful.Should().BeFalse();
        var unchangedAsset = scene.SceneAssets[0];
        unchangedAsset.Position.X.Should().Be(1);
        unchangedAsset.Position.Y.Should().Be(1);
        await _sceneStorage.DidNotReceive().UpdateAsync(Arg.Any<Scene>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task UpdateAssetAsync_WithNonexistentScene_ReturnsFalse() {
        // Arrange
        var sceneId = Guid.NewGuid();
        var assetId = Guid.NewGuid();
        const uint number = 1u;
        var data = new UpdateAssetData {
            AssetId = assetId,
            Number = number,
            Position = new Vector2 { X = 20, Y = 30 },
            Scale = new Vector2 { X = 0.5f, Y = 0.5f },
            Elevation = 1f,
            Rotation = 45f,
        };

        _sceneStorage.GetByIdAsync(sceneId, Arg.Any<CancellationToken>()).Returns((Scene?)null);

        // Act
        var result = await _service.UpdateAssetAsync(_userId, sceneId, data, _ct);

        // Assert
        result.IsSuccessful.Should().BeFalse();
        await _sceneStorage.DidNotReceive().UpdateAsync(Arg.Any<Scene>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task UpdateAssetAsync_WithNonexistentAsset_ReturnsFalse() {
        // Arrange
        var sceneId = Guid.NewGuid();
        const uint number = 1u;
        var nonexistentAssetId = Guid.NewGuid();
        var scene = new Scene {
            Id = sceneId,
            Name = "Scene",
            SceneAssets = [
                new() {
                    Number = number,
                    Name = "Existing Asset",
                    Position = new() { X = 1, Y = 1 },
                },
            ],
        };
        var data = new UpdateAssetData {
            AssetId = nonexistentAssetId,
            Number = number,
            Position = new Vector2 { X = 20, Y = 30 },
            Scale = new Vector2 { X = 0.5f, Y = 0.5f },
            Elevation = 1f,
            Rotation = 45f,
        };

        _sceneStorage.GetByIdAsync(sceneId, Arg.Any<CancellationToken>()).Returns(scene);
        _assetStorage.GetByIdAsync(nonexistentAssetId, Arg.Any<CancellationToken>()).Returns((Asset?)null);

        // Act
        var result = await _service.UpdateAssetAsync(_userId, sceneId, data, _ct);

        // Assert
        result.IsSuccessful.Should().BeFalse();
        await _sceneStorage.DidNotReceive().UpdateAsync(Arg.Any<Scene>(), Arg.Any<CancellationToken>());
    }
}