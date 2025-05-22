namespace VttTools.Library.Services;

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
        var request = new NewAdventureData {
            Name = "New Adventure",
            Description = "Adventure description",
            Type = AdventureType.Survival,
            CampaignId = Guid.NewGuid(),
        };

        // Act
        var result = await _service.CreateAdventureAsync(_userId, request, _ct);

        // Assert
        result.IsSuccessful.Should().BeTrue();
        result.Value.Name.Should().Be(request.Name);
        result.Value.Description.Should().Be(request.Description);
        result.Value.Type.Should().Be(request.Type);
        result.Value.ImageId.Should().BeNull();
        result.Value.IsPublished.Should().BeFalse();
        result.Value.IsPublic.Should().BeFalse();
        result.Value.CampaignId.Should().Be(request.CampaignId);
        result.Value.Id.Should().NotBe(Guid.Empty);
        result.Value.Scenes.Should().BeEmpty();
        result.Value.OwnerId.Should().Be(_userId);
        await _adventureStorage.Received(1).AddAsync(Arg.Any<Adventure>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task CreateAdventureAsync_WithEmptyName_ReturnsNull() {
        // Arrange
        var request = new NewAdventureData {
            Name = "",
            Description = "Adventure description",
            Type = AdventureType.Survival,
            CampaignId = Guid.NewGuid(),
        };

        // Act
        var result = await _service.CreateAdventureAsync(_userId, request, _ct);

        // Assert
        result.IsSuccessful.Should().BeFalse();
        await _adventureStorage.DidNotReceive().AddAsync(Arg.Any<Adventure>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task CreateAdventureAsync_WithWhitespaceName_ReturnsNull() {
        // Arrange
        var request = new NewAdventureData {
            Name = "   ",
            Description = "Adventure description",
            Type = AdventureType.Survival,
            CampaignId = Guid.NewGuid(),
        };

        // Act
        var result = await _service.CreateAdventureAsync(_userId, request, _ct);

        // Assert
        result.IsSuccessful.Should().BeFalse();
        await _adventureStorage.DidNotReceive().AddAsync(Arg.Any<Adventure>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task CreateAdventureAsync_WithNullName_ReturnsNull() {
        // Arrange
        var request = new NewAdventureData {
            Name = null!,
            Description = "Adventure description",
            Type = AdventureType.Survival,
            CampaignId = Guid.NewGuid(),
        };

        // Act
        var result = await _service.CreateAdventureAsync(_userId, request, _ct);

        // Assert
        result.IsSuccessful.Should().BeFalse();
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
            Description = "Old description",
        };
        var request = new UpdatedAdventureData {
            CampaignId = Guid.NewGuid(),
            Name = "Updated Name",
            Description = "Adventure description",
            Type = AdventureType.Survival,
            IsListed = true,
            IsPublic = true,
        };

        _adventureStorage.GetByIdAsync(adventureId, Arg.Any<CancellationToken>()).Returns(adventure);

        // Act
        var result = await _service.UpdateAdventureAsync(_userId, adventureId, request, _ct);

        // Assert
        result.IsSuccessful.Should().BeTrue();
        result.Value.Name.Should().Be(request.Name.Value);
        result.Value.Description.Should().Be(request.Description.Value);
        result.Value.Type.Should().Be(request.Type.Value);
        result.Value.ImageId.Should().BeNull();
        result.Value.IsPublished.Should().BeTrue();
        result.Value.IsPublic.Should().BeTrue();
        result.Value.CampaignId.Should().Be(request.CampaignId.Value);
        result.Value.Id.Should().Be(adventureId);
        result.Value.Scenes.Should().BeEmpty();
        result.Value.OwnerId.Should().Be(_userId);
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
            Description = "Old description",
            CampaignId = Guid.NewGuid(),
        };
        var request = new UpdatedAdventureData {
            Name = "Updated Name",
            // No Visibility update
        };

        _adventureStorage.GetByIdAsync(adventureId, Arg.Any<CancellationToken>()).Returns(adventure);

        // Act
        var result = await _service.UpdateAdventureAsync(_userId, adventureId, request, _ct);

        // Assert
        result.IsSuccessful.Should().BeTrue();
        result.Value.Name.Should().Be(request.Name.Value);
        result.Value.Description.Should().Be(adventure.Description);
        result.Value.Type.Should().Be(adventure.Type);
        result.Value.ImageId.Should().BeNull();
        result.Value.IsPublished.Should().BeFalse();
        result.Value.IsPublic.Should().BeFalse();
        result.Value.CampaignId.Should().Be(adventure.CampaignId);
        result.Value.Id.Should().Be(adventureId);
        result.Value.Scenes.Should().BeEmpty();
        result.Value.OwnerId.Should().Be(_userId);

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
        var request = new UpdatedAdventureData {
            Name = "Updated Name",
        };

        _adventureStorage.GetByIdAsync(adventureId, Arg.Any<CancellationToken>()).Returns(adventure);

        // Act
        var result = await _service.UpdateAdventureAsync(nonOwnerId, adventureId, request, _ct);

        // Assert
        result.IsSuccessful.Should().BeFalse();
        await _adventureStorage.DidNotReceive().UpdateAsync(Arg.Any<Adventure>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task UpdateAdventureAsync_WithNonExistentAdventure_ReturnsNull() {
        // Arrange
        var adventureId = Guid.NewGuid();
        var request = new UpdatedAdventureData {
            Name = "Updated Name",
        };

        _adventureStorage.GetByIdAsync(adventureId, Arg.Any<CancellationToken>()).Returns((Adventure?)null);

        // Act
        var result = await _service.UpdateAdventureAsync(_userId, adventureId, request, _ct);

        // Assert
        result.IsSuccessful.Should().BeFalse();
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

        // Act
        var result = await _service.DeleteAdventureAsync(_userId, adventureId, _ct);

        // Assert
        result.IsSuccessful.Should().BeTrue();
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
        result.IsSuccessful.Should().BeFalse();
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
        result.IsSuccessful.Should().BeFalse();
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
            Description = "Adventure description",
            Type = AdventureType.Survival,
            IsPublished = true,
            IsPublic = true,
            CampaignId = Guid.NewGuid(),
        };
        var scenes = new[] {
            new Scene {
                Id = Guid.NewGuid(),
                Name = "Scene 1",
                Stage = new() {
                    ZoomLevel = 1f,
                    Grid = new() {
                        Type = GridType.Square,
                        Cell = new(),
                    },
                },
                SceneAssets = [
                    new SceneAsset {
                        Name = "Asset 1",
                        Position = new Vector2 { X = 20, Y = 30 },
                        Scale = new Vector2 { X = 0.5f, Y = 0.5f },
                        Elevation = 1f,
                        Rotation = 45f,
                        IsLocked = false,
                    },
                ],
            },
        };
        var request = new ClonedAdventureData();

        _adventureStorage.GetByIdAsync(adventureId, Arg.Any<CancellationToken>()).Returns(adventure);
        _sceneStorage.GetByParentIdAsync(adventureId, Arg.Any<CancellationToken>()).Returns(scenes);

        // Act
        var result = await _service.CloneAdventureAsync(_userId, request, _ct);

        // Assert
        result.IsSuccessful.Should().BeTrue();
        result.Value.Name.Should().Be(request.Name.Value);
        result.Value.Description.Should().Be(request.Description.Value);
        result.Value.Type.Should().Be(request.Type.Value);
        result.Value.ImageId.Should().BeNull();
        result.Value.IsPublished.Should().BeTrue();
        result.Value.IsPublic.Should().BeTrue();
        result.Value.CampaignId.Should().Be(adventure.CampaignId);
        result.Value.Id.Should().NotBe(request.TemplateId);
        result.Value.Scenes.Should().NotBeEmpty();
        result.Value.OwnerId.Should().Be(_userId);
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
            Description = "Adventure description",
            Type = AdventureType.Survival,
            IsPublished = true,
            IsPublic = true,
            CampaignId = Guid.NewGuid(),
        };
        var request = new ClonedAdventureData();

        _adventureStorage.GetByIdAsync(adventureId, Arg.Any<CancellationToken>()).Returns(adventure);

        // Act
        var result = await _service.CloneAdventureAsync(nonOwnerId, request, _ct);

        // Assert
        result.IsSuccessful.Should().BeFalse();
        await _adventureStorage.DidNotReceive().AddAsync(Arg.Any<Adventure>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task CloneAdventureAsync_WithNonExistentAdventure_ReturnsNull() {
        // Arrange
        var adventureId = Guid.NewGuid();
        _adventureStorage.GetByIdAsync(adventureId, Arg.Any<CancellationToken>()).Returns((Adventure?)null);
        var request = new ClonedAdventureData();

        // Act
        var result = await _service.CloneAdventureAsync(_userId, request, _ct);

        // Assert
        result.IsSuccessful.Should().BeFalse();
        await _adventureStorage.DidNotReceive().AddAsync(Arg.Any<Adventure>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task GetScenesAsync_CallsStorage() {
        // Arrange
        var adventureId = Guid.NewGuid();
        var scenes = new Scene[] {
            new() { Id = Guid.NewGuid(), Name = "Test Scene 1" },
            new() { Id = Guid.NewGuid(), Name = "Test Scene 2" },
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
        var request = new ClonedSceneData {
            Name = "New Scene",
            Description = "New scene description",
            Stage = new Stage {
                ZoomLevel = 1f,
                Grid = new() {
                    Type = GridType.Square,
                    Cell = new(),
                },
            },
        };
        var adventure = new Adventure {
            Id = adventureId,
            Name = "Adventure",
            OwnerId = _userId,
            Description = "Adventure description",
        };
        var scene = new Scene {
            Id = sceneId,
            Name = "Scene",
            Description = "Scene description",
            Stage = new(),
        };

        _adventureStorage.GetByIdAsync(adventureId, Arg.Any<CancellationToken>()).Returns(adventure);
        _sceneStorage.GetByIdAsync(sceneId, Arg.Any<CancellationToken>()).Returns(scene);

        // Act
        var result = await _service.AddClonedSceneAsync(_userId, adventureId, sceneId, request, _ct);

        // Assert
        result.IsSuccessful.Should().BeTrue();
        result.Value.Name.Should().Be(request.Name.Value);
        result.Value.Description.Should().Be(request.Description.Value);
        result.Value.Stage.Should().BeEquivalentTo(request.Stage);
        result.Value.Id.Should().NotBe(sceneId);
        adventure.Scenes.Should().HaveCount(1);
        await _adventureStorage.Received(1).UpdateAsync(adventure, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task AddSceneAsync_NotOwnedNonPublicScene_ReturnsFalse() {
        // Arrange
        var adventureId = Guid.NewGuid();
        var sceneId = Guid.NewGuid();
        var request = new ClonedSceneData {
            Name = "New Scene",
        };
        var nonOwnerId = Guid.NewGuid();
        var adventure = new Adventure {
            Id = adventureId,
            Name = "Adventure",
            OwnerId = Guid.NewGuid(),
            IsPublic = false,
            IsPublished = false,
        };

        _adventureStorage.GetByIdAsync(adventureId, Arg.Any<CancellationToken>()).Returns(adventure);

        // Act
        var result = await _service.AddClonedSceneAsync(nonOwnerId, adventureId, sceneId, request, _ct);

        // Assert
        result.IsSuccessful.Should().BeFalse();
        await _adventureStorage.DidNotReceive().UpdateAsync(Arg.Any<Adventure>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task AddSceneAsync_WithNonExistentAdventure_ReturnsFalse() {
        // Arrange
        var adventureId = Guid.NewGuid();
        var sceneId = Guid.NewGuid();
        var request = new ClonedSceneData {
            Name = "New Scene",
        };

        _adventureStorage.GetByIdAsync(adventureId, Arg.Any<CancellationToken>()).Returns((Adventure?)null);

        // Act
        var result = await _service.AddClonedSceneAsync(_userId, adventureId, sceneId, request, _ct);

        // Assert
        result.IsSuccessful.Should().BeFalse();
        await _adventureStorage.DidNotReceive().UpdateAsync(Arg.Any<Adventure>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task AddSceneAsync_WithNonExistentScene_ReturnsFalse() {
        // Arrange
        var adventureId = Guid.NewGuid();
        var sceneId = Guid.NewGuid();
        var request = new ClonedSceneData {
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
        var result = await _service.AddClonedSceneAsync(_userId, adventureId, sceneId, request, _ct);

        // Assert
        result.IsSuccessful.Should().BeFalse();
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
                new() { Id = Guid.NewGuid(), Name = "Scene 1" },
                new() { Id = sceneId, Name = "Scene 2" },
            ],
        };

        _adventureStorage.GetByIdAsync(adventureId, Arg.Any<CancellationToken>()).Returns(adventure);

        // Act
        var result = await _service.RemoveSceneAsync(_userId, adventureId, sceneId, _ct);

        // Assert
        result.IsSuccessful.Should().BeTrue();
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
        result.IsSuccessful.Should().BeFalse();
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
        result.IsSuccessful.Should().BeFalse();
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
        result.IsSuccessful.Should().BeTrue();
        await _adventureStorage.Received(1).UpdateAsync(adventure, Arg.Any<CancellationToken>());
    }
}