﻿namespace VttTools.Library.Services;

public class AdventureServiceTests {
    private readonly IAdventureStorage _adventureStorage;
    private readonly ISceneStorage _sceneStorage;
    private readonly AdventureService _service;
    private readonly Guid _userId = Guid.NewGuid();
    private readonly CancellationToken _ct;

    public AdventureServiceTests() {
        _adventureStorage = Substitute.For<IAdventureStorage>();
        _sceneStorage = Substitute.For<ISceneStorage>();
        _service = new(_adventureStorage, _sceneStorage);
#if XUNITV3
        _ct = TestContext.Current.CancellationToken;
#else
        _ct = CancellationToken.None;
#endif
    }

    [Fact]
    public async Task GetAdventuresAsync_CallsStorage() {
        // Arrange
        var adventures = new Adventure[] {
            new() { Id = Guid.NewGuid(), Name = "Test Adventure 1" },
            new() { Id = Guid.NewGuid(), Name = "Test Adventure 2" },
                                         };
        _adventureStorage.GetAllAsync(Arg.Any<CancellationToken>()).Returns(adventures);

        // Act
        var result = await _service.GetAdventuresAsync(_ct);

        // Assert
        result.Should().BeEquivalentTo(adventures);
        await _adventureStorage.Received(1).GetAllAsync(Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task GetAdventureByIdAsync_CallsStorage() {
        // Arrange
        var adventureId = Guid.NewGuid();
        var adventure = new Adventure { Id = adventureId, Name = "Test Adventure" };
        _adventureStorage.GetByIdAsync(adventureId, Arg.Any<CancellationToken>()).Returns(adventure);

        // Act
        var result = await _service.GetAdventureByIdAsync(adventureId, _ct);

        // Assert
        result.Should().BeEquivalentTo(adventure);
        await _adventureStorage.Received(1).GetByIdAsync(adventureId, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task CreateAdventureAsync_CreatesNewAdventure() {
        // Arrange
        var request = new CreateAdventureRequest {
            Name = "New Adventure",
            Visibility = Visibility.Public,
        };
        _adventureStorage.AddAsync(Arg.Any<Adventure>(), Arg.Any<CancellationToken>())
            .Returns(x => x.Arg<Adventure>());

        // Act
        var result = await _service.CreateAdventureAsync(_userId, request, _ct);

        // Assert
        result.Should().NotBeNull();
        result.Name.Should().Be(request.Name);
        result.Visibility.Should().Be(request.Visibility);
        result.OwnerId.Should().Be(_userId);
        await _adventureStorage.Received(1).AddAsync(Arg.Any<Adventure>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task CreateAdventureAsync_WithEmptyName_ReturnsNull() {
        // Arrange
        var request = new CreateAdventureRequest {
            Name = "",
            Visibility = Visibility.Public,
        };

        // Act
        var result = await _service.CreateAdventureAsync(_userId, request, _ct);

        // Assert
        result.Should().BeNull();
        await _adventureStorage.DidNotReceive().AddAsync(Arg.Any<Adventure>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task CreateAdventureAsync_WithWhitespaceName_ReturnsNull() {
        // Arrange
        var request = new CreateAdventureRequest {
            Name = "   ",
            Visibility = Visibility.Public,
        };

        // Act
        var result = await _service.CreateAdventureAsync(_userId, request, _ct);

        // Assert
        result.Should().BeNull();
        await _adventureStorage.DidNotReceive().AddAsync(Arg.Any<Adventure>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task CreateAdventureAsync_WithNullName_ReturnsNull() {
        // Arrange
        var request = new CreateAdventureRequest {
            Name = null!,
            Visibility = Visibility.Public,
        };

        // Act
        var result = await _service.CreateAdventureAsync(_userId, request, _ct);

        // Assert
        result.Should().BeNull();
        await _adventureStorage.DidNotReceive().AddAsync(Arg.Any<Adventure>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task UpdateAdventureAsync_WithOwner_UpdatesAdventure() {
        // Arrange
        var adventureId = Guid.NewGuid();
        var adventure = new Adventure {
            Id = adventureId,
            Name = "Old Name",
            OwnerId = _userId,
            Visibility = Visibility.Private,
        };
        var request = new UpdateAdventureRequest {
            Name = "Updated Name",
            Visibility = Visibility.Public,
        };

        _adventureStorage.GetByIdAsync(adventureId, Arg.Any<CancellationToken>()).Returns(adventure);
        _adventureStorage.UpdateAsync(Arg.Any<Adventure>(), Arg.Any<CancellationToken>())
            .Returns(x => x.Arg<Adventure>());

        // Act
        var result = await _service.UpdateAdventureAsync(_userId, adventureId, request, _ct);

        // Assert
        result.Should().NotBeNull();
        result.Name.Should().Be(request.Name.Value);
        result.Visibility.Should().Be(request.Visibility.Value);
        await _adventureStorage.Received(1).UpdateAsync(Arg.Any<Adventure>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task UpdateAdventureAsync_WithOnlyNameUpdate_OnlyUpdatesName() {
        // Arrange
        var adventureId = Guid.NewGuid();
        var adventure = new Adventure {
            Id = adventureId,
            Name = "Old Name",
            OwnerId = _userId,
            Visibility = Visibility.Private,
        };
        var request = new UpdateAdventureRequest {
            Name = "Updated Name",
            // No Visibility update
        };

        _adventureStorage.GetByIdAsync(adventureId, Arg.Any<CancellationToken>()).Returns(adventure);
        _adventureStorage.UpdateAsync(Arg.Any<Adventure>(), Arg.Any<CancellationToken>())
            .Returns(x => x.Arg<Adventure>());

        // Act
        var result = await _service.UpdateAdventureAsync(_userId, adventureId, request, _ct);

        // Assert
        result.Should().NotBeNull();
        result.Name.Should().Be(request.Name.Value);
        result.Visibility.Should().Be(Visibility.Private); // Unchanged
        await _adventureStorage.Received(1).UpdateAsync(Arg.Any<Adventure>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task UpdateAdventureAsync_WithOnlyVisibilityUpdate_OnlyUpdatesVisibility() {
        // Arrange
        var adventureId = Guid.NewGuid();
        var adventure = new Adventure {
            Id = adventureId,
            Name = "Old Name",
            OwnerId = _userId,
            Visibility = Visibility.Private,
        };
        var request = new UpdateAdventureRequest {
            // No Name update
            Visibility = Visibility.Public,
        };

        _adventureStorage.GetByIdAsync(adventureId, Arg.Any<CancellationToken>()).Returns(adventure);
        _adventureStorage.UpdateAsync(Arg.Any<Adventure>(), Arg.Any<CancellationToken>())
            .Returns(x => x.Arg<Adventure>());

        // Act
        var result = await _service.UpdateAdventureAsync(_userId, adventureId, request, _ct);

        // Assert
        result.Should().NotBeNull();
        result.Name.Should().Be("Old Name"); // Unchanged
        result.Visibility.Should().Be(Visibility.Public);
        await _adventureStorage.Received(1).UpdateAsync(Arg.Any<Adventure>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task UpdateAdventureAsync_WithNonOwner_ReturnsNull() {
        // Arrange
        var adventureId = Guid.NewGuid();
        var nonOwnerId = Guid.NewGuid();
        var adventure = new Adventure {
            Id = adventureId,
            Name = "Adventure",
            OwnerId = _userId,
        };
        var request = new UpdateAdventureRequest {
            Name = "Updated Name",
        };

        _adventureStorage.GetByIdAsync(adventureId, Arg.Any<CancellationToken>()).Returns(adventure);

        // Act
        var result = await _service.UpdateAdventureAsync(nonOwnerId, adventureId, request, _ct);

        // Assert
        result.Should().BeNull();
        await _adventureStorage.DidNotReceive().UpdateAsync(Arg.Any<Adventure>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task UpdateAdventureAsync_WithNonExistentAdventure_ReturnsNull() {
        // Arrange
        var adventureId = Guid.NewGuid();
        var request = new UpdateAdventureRequest {
            Name = "Updated Name",
        };

        _adventureStorage.GetByIdAsync(adventureId, Arg.Any<CancellationToken>()).Returns((Adventure?)null);

        // Act
        var result = await _service.UpdateAdventureAsync(_userId, adventureId, request, _ct);

        // Assert
        result.Should().BeNull();
        await _adventureStorage.DidNotReceive().UpdateAsync(Arg.Any<Adventure>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task DeleteAdventureAsync_WithOwner_DeletesAdventure() {
        // Arrange
        var adventureId = Guid.NewGuid();
        var adventure = new Adventure {
            Id = adventureId,
            Name = "Adventure",
            OwnerId = _userId,
        };

        _adventureStorage.GetByIdAsync(adventureId, Arg.Any<CancellationToken>()).Returns(adventure);
        _adventureStorage.DeleteAsync(adventureId, Arg.Any<CancellationToken>()).Returns(true);

        // Act
        var result = await _service.DeleteAdventureAsync(_userId, adventureId, _ct);

        // Assert
        result.Should().BeTrue();
        await _adventureStorage.Received(1).DeleteAsync(adventureId, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task DeleteAdventureAsync_WithNonOwner_ReturnsFalse() {
        // Arrange
        var adventureId = Guid.NewGuid();
        var nonOwnerId = Guid.NewGuid();
        var adventure = new Adventure {
            Id = adventureId,
            Name = "Adventure",
            OwnerId = _userId,
        };

        _adventureStorage.GetByIdAsync(adventureId, Arg.Any<CancellationToken>()).Returns(adventure);

        // Act
        var result = await _service.DeleteAdventureAsync(nonOwnerId, adventureId, _ct);

        // Assert
        result.Should().BeFalse();
        await _adventureStorage.DidNotReceive().DeleteAsync(Arg.Any<Guid>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task DeleteAdventureAsync_WithNonExistentAdventure_ReturnsFalse() {
        // Arrange
        var adventureId = Guid.NewGuid();
        _adventureStorage.GetByIdAsync(adventureId, Arg.Any<CancellationToken>()).Returns((Adventure?)null);

        // Act
        var result = await _service.DeleteAdventureAsync(_userId, adventureId, _ct);

        // Assert
        result.Should().BeFalse();
        await _adventureStorage.DidNotReceive().DeleteAsync(Arg.Any<Guid>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task CloneAdventureAsync_WithOwner_ClonesAdventureAndScenes() {
        // Arrange
        var adventureId = Guid.NewGuid();
        var adventure = new Adventure {
            Id = adventureId,
            Name = "Adventure",
            OwnerId = _userId,
            Visibility = Visibility.Public,
        };
        var scenes = new[] {
            new Scene {
                Id = Guid.NewGuid(),
                Name = "Scene 1",
                ParentId = adventureId,
                Stage = new() {
                    MapType = StageMapType.Square,
                    Source = "source1",
                    Size = new() { Width = 10, Height = 10 },
                    Grid = new() {
                        Offset = new() { Left = 0, Top = 0 },
                        CellSize = new() { Width = 1, Height = 1 },
                    },
                },
                SceneAssets = [
                    new SceneAsset {
                        AssetId = Guid.NewGuid(),
                        Name = "Asset 1",
                        Position = new() { Left = 1, Top = 1 },
                        Scale = 1.0f,
                        IsLocked = false,
                    },
                ],
            },
        };
        var request = new CloneAdventureRequest();

        _adventureStorage.GetByIdAsync(adventureId, Arg.Any<CancellationToken>()).Returns(adventure);
        _sceneStorage.GetByParentIdAsync(adventureId, Arg.Any<CancellationToken>()).Returns(scenes);
        _adventureStorage.AddAsync(Arg.Any<Adventure>(), Arg.Any<CancellationToken>())
            .Returns(x => x.Arg<Adventure>());

        // Act
        var result = await _service.CloneAdventureAsync(_userId, adventureId, request, _ct);

        // Assert
        result.Should().NotBeNull();
        result.Name.Should().Be(adventure.Name);
        result.Visibility.Should().Be(adventure.Visibility);
        result.OwnerId.Should().Be(_userId);
        result.TemplateId.Should().Be(adventureId);

        await _adventureStorage.Received(1).AddAsync(Arg.Any<Adventure>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task CloneAdventureAsync_WithNonOwner_ReturnsNull() {
        // Arrange
        var adventureId = Guid.NewGuid();
        var nonOwnerId = Guid.NewGuid();
        var adventure = new Adventure {
            Id = adventureId,
            Name = "Adventure",
            OwnerId = _userId,
            Visibility = Visibility.Public,
        };
        var request = new CloneAdventureRequest();

        _adventureStorage.GetByIdAsync(adventureId, Arg.Any<CancellationToken>()).Returns(adventure);

        // Act
        var result = await _service.CloneAdventureAsync(nonOwnerId, adventureId, request, _ct);

        // Assert
        result.Should().BeNull();
        await _adventureStorage.DidNotReceive().AddAsync(Arg.Any<Adventure>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task CloneAdventureAsync_WithNonExistentAdventure_ReturnsNull() {
        // Arrange
        var adventureId = Guid.NewGuid();
        _adventureStorage.GetByIdAsync(adventureId, Arg.Any<CancellationToken>()).Returns((Adventure?)null);
        var request = new CloneAdventureRequest();

        // Act
        var result = await _service.CloneAdventureAsync(_userId, adventureId, request, _ct);

        // Assert
        result.Should().BeNull();
        await _adventureStorage.DidNotReceive().AddAsync(Arg.Any<Adventure>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task GetScenesAsync_CallsStorage() {
        // Arrange
        var adventureId = Guid.NewGuid();
        var scenes = new Scene[] {
            new() { Id = Guid.NewGuid(), Name = "Test Scene 1", ParentId = adventureId },
            new() { Id = Guid.NewGuid(), Name = "Test Scene 2", ParentId = adventureId },
                                     };
        _sceneStorage.GetByParentIdAsync(adventureId, Arg.Any<CancellationToken>()).Returns(scenes);

        // Act
        var result = await _service.GetScenesAsync(adventureId, _ct);

        // Assert
        result.Should().BeEquivalentTo(scenes);
        await _sceneStorage.Received(1).GetByParentIdAsync(adventureId, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task AddSceneAsync_WithOwnerAndValidScene_ReturnsTrue() {
        // Arrange
        var adventureId = Guid.NewGuid();
        var sceneId = Guid.NewGuid();
        var request = new AddClonedSceneRequest {
            Id = sceneId,
            Name = "New Scene",
        };
        var adventure = new Adventure {
            Id = adventureId,
            Name = "Adventure",
            OwnerId = _userId,
            Scenes = [],
        };
        var scene = new Scene {
            Id = sceneId,
            Name = "Scene",
        };

        _adventureStorage.GetByIdAsync(adventureId, Arg.Any<CancellationToken>()).Returns(adventure);
        _sceneStorage.GetByIdAsync(sceneId, Arg.Any<CancellationToken>()).Returns(scene);

        // Act
        var result = await _service.AddClonedSceneAsync(_userId, adventureId, request, _ct);

        // Assert
        result.Should().BeTrue();
        adventure.Scenes.Should().HaveCount(1);
        await _adventureStorage.Received(1).UpdateAsync(adventure, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task AddSceneAsync_WithNonOwner_ReturnsFalse() {
        // Arrange
        var adventureId = Guid.NewGuid();
        var sceneId = Guid.NewGuid();
        var request = new AddClonedSceneRequest {
            Id = sceneId,
            Name = "New Scene",
        };
        var nonOwnerId = Guid.NewGuid();
        var adventure = new Adventure {
            Id = adventureId,
            Name = "Adventure",
            OwnerId = _userId,
        };

        _adventureStorage.GetByIdAsync(adventureId, Arg.Any<CancellationToken>()).Returns(adventure);

        // Act
        var result = await _service.AddClonedSceneAsync(nonOwnerId, adventureId, request, _ct);

        // Assert
        result.Should().BeFalse();
        await _adventureStorage.DidNotReceive().UpdateAsync(Arg.Any<Adventure>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task AddSceneAsync_WithNonExistentAdventure_ReturnsFalse() {
        // Arrange
        var adventureId = Guid.NewGuid();
        var sceneId = Guid.NewGuid();
        var request = new AddClonedSceneRequest {
            Id = sceneId,
            Name = "New Scene",
        };

        _adventureStorage.GetByIdAsync(adventureId, Arg.Any<CancellationToken>()).Returns((Adventure?)null);

        // Act
        var result = await _service.AddClonedSceneAsync(_userId, adventureId, request, _ct);

        // Assert
        result.Should().BeFalse();
        await _adventureStorage.DidNotReceive().UpdateAsync(Arg.Any<Adventure>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task AddSceneAsync_WithNonExistentScene_ReturnsFalse() {
        // Arrange
        var adventureId = Guid.NewGuid();
        var sceneId = Guid.NewGuid();
        var request = new AddClonedSceneRequest {
            Id = sceneId,
            Name = "New Scene",
        };
        var adventure = new Adventure {
            Id = adventureId,
            Name = "Adventure",
            OwnerId = _userId,
        };

        _adventureStorage.GetByIdAsync(adventureId, Arg.Any<CancellationToken>()).Returns(adventure);
        _sceneStorage.GetByIdAsync(sceneId, Arg.Any<CancellationToken>()).Returns((Scene?)null);

        // Act
        var result = await _service.AddClonedSceneAsync(_userId, adventureId, request, _ct);

        // Assert
        result.Should().BeFalse();
        await _adventureStorage.DidNotReceive().UpdateAsync(Arg.Any<Adventure>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task RemoveSceneAsync_WithOwner_ReturnsTrue() {
        // Arrange
        var adventureId = Guid.NewGuid();
        var sceneId = Guid.NewGuid();
        var adventure = new Adventure {
            Id = adventureId,
            Name = "Adventure",
            OwnerId = _userId,
            Scenes = [
                new() { Id = sceneId, Name = "Scene" },
                       ],
        };

        _adventureStorage.GetByIdAsync(adventureId, Arg.Any<CancellationToken>()).Returns(adventure);

        // Act
        var result = await _service.RemoveSceneAsync(_userId, adventureId, sceneId, _ct);

        // Assert
        result.Should().BeTrue();
        adventure.Scenes.Should().BeEmpty();
        await _adventureStorage.Received(1).UpdateAsync(adventure, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task RemoveSceneAsync_WithNonOwner_ReturnsFalse() {
        // Arrange
        var adventureId = Guid.NewGuid();
        var sceneId = Guid.NewGuid();
        var nonOwnerId = Guid.NewGuid();
        var adventure = new Adventure {
            Id = adventureId,
            Name = "Adventure",
            OwnerId = _userId,
            Scenes = [
                new() { Id = sceneId, Name = "Scene" },
                       ],
        };

        _adventureStorage.GetByIdAsync(adventureId, Arg.Any<CancellationToken>()).Returns(adventure);

        // Act
        var result = await _service.RemoveSceneAsync(nonOwnerId, adventureId, sceneId, _ct);

        // Assert
        result.Should().BeFalse();
        adventure.Scenes.Should().HaveCount(1);
        await _adventureStorage.DidNotReceive().UpdateAsync(Arg.Any<Adventure>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task RemoveSceneAsync_WithNonExistentAdventure_ReturnsFalse() {
        // Arrange
        var adventureId = Guid.NewGuid();
        var sceneId = Guid.NewGuid();

        _adventureStorage.GetByIdAsync(adventureId, Arg.Any<CancellationToken>()).Returns((Adventure?)null);

        // Act
        var result = await _service.RemoveSceneAsync(_userId, adventureId, sceneId, _ct);

        // Assert
        result.Should().BeFalse();
        await _adventureStorage.DidNotReceive().UpdateAsync(Arg.Any<Adventure>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task RemoveSceneAsync_WithNonExistentScene_StillReturnsTrue() {
        // Arrange
        var adventureId = Guid.NewGuid();
        var sceneId = Guid.NewGuid();
        var adventure = new Adventure {
            Id = adventureId,
            Name = "Adventure",
            OwnerId = _userId,
            Scenes = [],
        };

        _adventureStorage.GetByIdAsync(adventureId, Arg.Any<CancellationToken>()).Returns(adventure);

        // Act
        var result = await _service.RemoveSceneAsync(_userId, adventureId, sceneId, _ct);

        // Assert
        result.Should().BeTrue();
        await _adventureStorage.Received(1).UpdateAsync(adventure, Arg.Any<CancellationToken>());
    }
}