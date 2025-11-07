
namespace VttTools.Library.Services;

public class AdventureServiceTests {
    private readonly IAdventureStorage _adventureStorage;
    private readonly ISceneStorage _sceneStorage;
    private readonly IMediaStorage _mediaStorage;
    private readonly AdventureService _service;
    private readonly Guid _userId = Guid.CreateVersion7();
    private readonly CancellationToken _ct;

    public AdventureServiceTests() {
        _adventureStorage = Substitute.For<IAdventureStorage>();
        _sceneStorage = Substitute.For<ISceneStorage>();
        _mediaStorage = Substitute.For<IMediaStorage>();
        _service = new(_adventureStorage, _sceneStorage, _mediaStorage);
        _ct = TestContext.Current.CancellationToken;
    }

    [Fact]
    public async Task GetAdventuresAsync_CallsStorage() {
        // Arrange
        var adventures = new Adventure[] {
            new() { Id = Guid.CreateVersion7(), Name = "Test Adventure 1" },
            new() { Id = Guid.CreateVersion7(), Name = "Test Adventure 2" },
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
        var adventureId = Guid.CreateVersion7();
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
        var request = new CreateAdventureData {
            Name = "New Adventure",
            Description = "Adventure description",
            Style = AdventureStyle.Survival,
            CampaignId = Guid.CreateVersion7(),
            IsOneShot = false,
        };

        // Act
        var result = await _service.CreateAdventureAsync(_userId, request, _ct);

        // Assert
        result.IsSuccessful.Should().BeTrue();
        result.Value.Name.Should().Be(request.Name);
        result.Value.Description.Should().Be(request.Description);
        result.Value.Style.Should().Be(request.Style);
        result.Value.IsOneShot.Should().Be(request.IsOneShot);
        result.Value.Background.Should().BeNull();
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
        var request = new CreateAdventureData {
            Name = "",
            Description = "Adventure description",
            Style = AdventureStyle.Survival,
            CampaignId = Guid.CreateVersion7(),
            IsOneShot = false,
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
        var request = new CreateAdventureData {
            Name = "   ",
            Description = "Adventure description",
            Style = AdventureStyle.Survival,
            CampaignId = Guid.CreateVersion7(),
            IsOneShot = false,
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
        var request = new CreateAdventureData {
            Name = null!,
            Description = "Adventure description",
            Style = AdventureStyle.Survival,
            CampaignId = Guid.CreateVersion7(),
            IsOneShot = false,
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
        var adventureId = Guid.CreateVersion7();
        var adventure = new Adventure {
            Id = adventureId,
            Name = "Old Name",
            OwnerId = _userId,
            Description = "Old description",
            Background = new Resource {
                Id = Guid.CreateVersion7(),
                Type = ResourceType.Image,
                Path = "test/background",
                Metadata = new ResourceMetadata {
                    FileName = "background.png",
                    ContentType = "image/png",
                },
            },
        };
        var request = new UpdatedAdventureData {
            CampaignId = Guid.CreateVersion7(),
            Name = "Updated Name",
            Description = "Adventure description",
            Style = AdventureStyle.Survival,
            IsOneShot = false,
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
        result.Value.Style.Should().Be(request.Style.Value);
        result.Value.IsOneShot.Should().Be(request.IsOneShot.Value);
        result.Value.Background.Should().NotBeNull();
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
        var adventureId = Guid.CreateVersion7();
        var adventure = new Adventure {
            Id = adventureId,
            Name = "Old Name",
            OwnerId = _userId,
            Description = "Old description",
            CampaignId = Guid.CreateVersion7(),
            Background = new() {
                Id = Guid.CreateVersion7(),
                Type = ResourceType.Image,
                Path = "test/adventure-background.jpg",
                Metadata = new ResourceMetadata {
                    ContentType = "image/jpeg",
                    ImageSize = new Size(1920, 1080),
                },
            },
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
        result.Value.Style.Should().Be(adventure.Style);
        result.Value.IsOneShot.Should().Be(adventure.IsOneShot);
        result.Value.Background.Should().NotBeNull();
        result.Value.IsPublished.Should().BeFalse();
        result.Value.IsOneShot.Should().BeFalse();
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
        var adventureId = Guid.CreateVersion7();
        var nonOwnerId = Guid.CreateVersion7();
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
        var adventureId = Guid.CreateVersion7();
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
        var adventureId = Guid.CreateVersion7();
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
        var adventureId = Guid.CreateVersion7();
        var nonOwnerId = Guid.CreateVersion7();
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
        var adventureId = Guid.CreateVersion7();
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
        var adventureId = Guid.CreateVersion7();
        var adventure = new Adventure {
            Id = adventureId,
            Name = "Adventure",
            OwnerId = _userId,
            Description = "Adventure description",
            Style = AdventureStyle.Survival,
            IsOneShot = false,
            // NOTE: Service logic prevents cloning if both IsPublished=true AND IsPublic=true, even for owners
            IsPublished = false,
            IsPublic = false,
            CampaignId = Guid.CreateVersion7(),
            // NOTE: Cloner requires Background to be non-null
            Background = new Resource {
                Id = Guid.CreateVersion7(),
                Type = ResourceType.Image,
                Path = "adventures/background.jpg",
                Metadata = new ResourceMetadata {
                    ContentType = "image/jpeg",
                    ImageSize = new Size(1920, 1080),
                },
            },
        };
        var scenes = new[] {
            new Scene {
                Id = Guid.CreateVersion7(),
                Name = "Scene 1",
                Grid = new(),
                Stage = new() {
                    ZoomLevel = 1,
                    Panning = new(10, 20),
                    Background = new() {
                        Id = Guid.CreateVersion7(),
                        Type = ResourceType.Image,
                        Path = "path/to/image.png",
                        Metadata = new() { ImageSize = new Size(100, 200) },
                    },
                },
                Assets = [
                    new SceneAsset {
                        Name = "Asset 1",
                        Position = new(20, 30),
                        Size = new NamedSize { Width = 40, Height = 50 },
                        Frame = new() {
                            Shape = FrameShape.Square,
                            BorderThickness = 1,
                            BorderColor = "white",
                            Background = "transparent",
                        },
                        Elevation = 1,
                        Rotation = 45,
                        IsLocked = false,
                    },
                ],
            },
        };
        _adventureStorage.GetByIdAsync(adventureId, Arg.Any<CancellationToken>()).Returns(adventure);
        _sceneStorage.GetByParentIdAsync(adventureId, Arg.Any<CancellationToken>()).Returns(scenes);

        // Act
        var result = await _service.CloneAdventureAsync(_userId, adventureId, _ct);

        // Assert
        result.IsSuccessful.Should().BeTrue();
        await _adventureStorage.Received(1).AddAsync(Arg.Any<Adventure>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task CloneAdventureAsync_WithNonOwner_ReturnsNull() {
        // Arrange
        var adventureId = Guid.CreateVersion7();
        var nonOwnerId = Guid.CreateVersion7();
        var adventure = new Adventure {
            Id = adventureId,
            Name = "Adventure",
            OwnerId = _userId,
            Description = "Adventure description",
            Style = AdventureStyle.Survival,
            IsOneShot = false,
            IsPublished = true,
            IsPublic = false,
            CampaignId = Guid.CreateVersion7(),
        };

        _adventureStorage.GetByIdAsync(adventureId, Arg.Any<CancellationToken>()).Returns(adventure);

        // Act
        var result = await _service.CloneAdventureAsync(nonOwnerId, adventureId, _ct);

        // Assert
        result.IsSuccessful.Should().BeFalse();
        await _adventureStorage.DidNotReceive().AddAsync(Arg.Any<Adventure>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task CloneAdventureAsync_WithNonExistentAdventure_ReturnsNull() {
        // Arrange
        var adventureId = Guid.CreateVersion7();
        _adventureStorage.GetByIdAsync(adventureId, Arg.Any<CancellationToken>()).Returns((Adventure?)null);

        // Act
        var result = await _service.CloneAdventureAsync(_userId, adventureId, _ct);

        // Assert
        result.IsSuccessful.Should().BeFalse();
        await _adventureStorage.DidNotReceive().AddAsync(Arg.Any<Adventure>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task GetScenesAsync_CallsStorage() {
        // Arrange
        var adventureId = Guid.CreateVersion7();
        var scenes = new Scene[] {
            new() { Id = Guid.CreateVersion7(), Name = "Test Scene 1" },
            new() { Id = Guid.CreateVersion7(), Name = "Test Scene 2" },
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
        var adventureId = Guid.CreateVersion7();
        var sceneId = Guid.CreateVersion7();
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
        var result = await _service.AddClonedSceneAsync(_userId, adventureId, sceneId, _ct);

        // Assert
        result.IsSuccessful.Should().BeTrue();
        result.Value.Should().NotBeNull();
        // NOTE: AddClonedSceneAsync calls sceneStorage.AddAsync, not adventureStorage.UpdateAsync
        await _sceneStorage.Received(1).AddAsync(Arg.Any<Scene>(), adventureId, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task AddSceneAsync_NotOwnedNonPublicScene_ReturnsFalse() {
        // Arrange
        var adventureId = Guid.CreateVersion7();
        var sceneId = Guid.CreateVersion7();
        var nonOwnerId = Guid.CreateVersion7();
        var adventure = new Adventure {
            Id = adventureId,
            Name = "Adventure",
            OwnerId = Guid.CreateVersion7(),
            IsPublic = false,
            IsPublished = false,
            IsOneShot = false,
        };

        _adventureStorage.GetByIdAsync(adventureId, Arg.Any<CancellationToken>()).Returns(adventure);

        // Act
        var result = await _service.AddClonedSceneAsync(nonOwnerId, adventureId, sceneId, _ct);

        // Assert
        result.IsSuccessful.Should().BeFalse();
        await _adventureStorage.DidNotReceive().UpdateAsync(Arg.Any<Adventure>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task AddSceneAsync_WithNonExistentAdventure_ReturnsFalse() {
        // Arrange
        var adventureId = Guid.CreateVersion7();
        var sceneId = Guid.CreateVersion7();

        _adventureStorage.GetByIdAsync(adventureId, Arg.Any<CancellationToken>()).Returns((Adventure?)null);

        // Act
        var result = await _service.AddClonedSceneAsync(_userId, adventureId, sceneId, _ct);

        // Assert
        result.IsSuccessful.Should().BeFalse();
        await _adventureStorage.DidNotReceive().UpdateAsync(Arg.Any<Adventure>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task AddSceneAsync_WithNonExistentScene_ReturnsFalse() {
        // Arrange
        var adventureId = Guid.CreateVersion7();
        var sceneId = Guid.CreateVersion7();
        var adventure = new Adventure {
            Id = adventureId,
            Name = "Adventure",
            OwnerId = _userId,
        };

        _adventureStorage.GetByIdAsync(adventureId, Arg.Any<CancellationToken>()).Returns(adventure);
        _sceneStorage.GetByIdAsync(sceneId, Arg.Any<CancellationToken>()).Returns((Scene?)null);

        // Act
        var result = await _service.AddClonedSceneAsync(_userId, adventureId, sceneId, _ct);

        // Assert
        result.IsSuccessful.Should().BeFalse();
        await _adventureStorage.DidNotReceive().UpdateAsync(Arg.Any<Adventure>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task RemoveSceneAsync_WithOwner_ReturnsTrue() {
        // Arrange
        var adventureId = Guid.CreateVersion7();
        var sceneId = Guid.CreateVersion7();
        var adventure = new Adventure {
            Id = adventureId,
            Name = "Adventure",
            OwnerId = _userId,
            Scenes = [
                new() { Id = Guid.CreateVersion7(), Name = "Scene 1" },
                new() { Id = sceneId, Name = "Scene 2" },
            ],
        };

        _adventureStorage.GetByIdAsync(adventureId, Arg.Any<CancellationToken>()).Returns(adventure);

        // Act
        var result = await _service.RemoveSceneAsync(_userId, adventureId, sceneId, _ct);

        // Assert
        result.IsSuccessful.Should().BeTrue();
        // NOTE: RemoveSceneAsync calls sceneStorage.DeleteAsync, not adventureStorage.UpdateAsync
        await _sceneStorage.Received(1).DeleteAsync(sceneId, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task RemoveSceneAsync_WithNonOwner_ReturnsFalse() {
        // Arrange
        var adventureId = Guid.CreateVersion7();
        var sceneId = Guid.CreateVersion7();
        var nonOwnerId = Guid.CreateVersion7();
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
        var adventureId = Guid.CreateVersion7();
        var sceneId = Guid.CreateVersion7();

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
        var adventureId = Guid.CreateVersion7();
        var sceneId = Guid.CreateVersion7();
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
        // NOTE: RemoveSceneAsync calls sceneStorage.DeleteAsync, not adventureStorage.UpdateAsync
        await _sceneStorage.Received(1).DeleteAsync(sceneId, Arg.Any<CancellationToken>());
    }
}