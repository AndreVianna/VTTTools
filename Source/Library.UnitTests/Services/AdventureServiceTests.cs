namespace VttTools.Library.Services;

public class AdventureServiceTests {
    private readonly IAdventureStorage _adventureStorage;
    private readonly IEncounterStorage _encounterStorage;
    private readonly IMediaStorage _mediaStorage;
    private readonly AdventureService _service;
    private readonly Guid _userId = Guid.CreateVersion7();
    private readonly CancellationToken _ct;

    public AdventureServiceTests() {
        _adventureStorage = Substitute.For<IAdventureStorage>();
        _encounterStorage = Substitute.For<IEncounterStorage>();
        _mediaStorage = Substitute.For<IMediaStorage>();
        _service = new(_adventureStorage, _encounterStorage, _mediaStorage, NullLogger<AdventureService>.Instance);
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
            WorldId = Guid.CreateVersion7(),
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
        result.Value.World!.Id.Should().Be(request.WorldId.Value);
        result.Value.Campaign!.Id.Should().Be(request.CampaignId.Value);
        result.Value.Id.Should().NotBe(Guid.Empty);
        result.Value.Encounters.Should().BeEmpty();
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
            WorldId = Guid.CreateVersion7(),
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
            WorldId = Guid.CreateVersion7(),
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
            WorldId = Guid.CreateVersion7(),
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
            Background = new ResourceMetadata {
                Id = Guid.CreateVersion7(),
                ResourceType = ResourceType.Background,
                Path = "test/background",
                FileName = "background.png",
                ContentType = "image/png",
            },
        };
        var request = new UpdatedAdventureData {
            WorldId = Guid.CreateVersion7(),
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
        result.Value.World!.Id.Should().Be(request.WorldId.Value!.Value);
        result.Value.Campaign!.Id.Should().Be(request.CampaignId.Value!.Value);
        result.Value.Id.Should().Be(adventureId);
        result.Value.Encounters.Should().BeEmpty();
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
            Style = AdventureStyle.Survival,
            World = new World { Id = Guid.CreateVersion7() },
            Campaign = new Campaign { Id = Guid.CreateVersion7() },
            Background = new() {
                Id = Guid.CreateVersion7(),
                ResourceType = ResourceType.Background,
                Path = "test/adventure-background.jpg",
                ContentType = "image/jpeg",
                Size = new Size(1920, 1080),
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
        result.Value.World.Should().BeEquivalentTo(adventure.World);
        result.Value.Campaign.Should().BeEquivalentTo(adventure.Campaign);
        result.Value.Id.Should().Be(adventureId);
        result.Value.Encounters.Should().BeEmpty();
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
    public async Task CloneAdventureAsync_WithOwner_ClonesAdventureAndEncounters() {
        // Arrange
        var adventureId = Guid.CreateVersion7();
        var adventure = new Adventure {
            Id = adventureId,
            Name = "Adventure",
            OwnerId = _userId,
            Description = "Adventure description",
            Style = AdventureStyle.Survival,
            IsOneShot = false,
            IsPublished = false,
            IsPublic = false,
            World = new World { Id = Guid.CreateVersion7() },
            Campaign = new Campaign { Id = Guid.CreateVersion7() },
            Background = new ResourceMetadata {
                Id = Guid.CreateVersion7(),
                ResourceType = ResourceType.Background,
                Path = "adventures/background.jpg",
                ContentType = "image/jpeg",
                Size = new Size(1920, 1080),
            },
        };
        var encounters = new[] {
            new Encounter {
                Id = Guid.CreateVersion7(),
                Name = "Encounter 1",
                Grid = new(),
                Stage = new() {
                    ZoomLevel = 1,
                    Panning = new(10, 20),
                    Background = new() {
                        Id = Guid.CreateVersion7(),
                        ResourceType = ResourceType.Background,
                        Path = "path/to/image.png",
                        Size = new Size(100, 200),
                    },
                    Light = AmbientLight.Twilight,
                    Weather = Weather.Clear,
                    Elevation = 20.0f,
                    Sound = new ResourceMetadata {
                        Id = Guid.CreateVersion7(),
                        ResourceType = ResourceType.AmbientSound,
                        Path = "path/to/sound.mp3",
                        ContentType = "audio/mpeg",
                        Duration = TimeSpan.FromMinutes(3),
                    },
                },
                Assets = [
                    new EncounterAsset {
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
        _encounterStorage.GetByParentIdAsync(adventureId, Arg.Any<CancellationToken>()).Returns(encounters);

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
            World = new() { Id = Guid.CreateVersion7() },
            Campaign = new() { Id = Guid.CreateVersion7() },
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
    public async Task GetEncountersAsync_CallsStorage() {
        // Arrange
        var adventureId = Guid.CreateVersion7();
        var encounters = new Encounter[] {
            new() { Id = Guid.CreateVersion7(), Name = "Test Encounter 1" },
            new() { Id = Guid.CreateVersion7(), Name = "Test Encounter 2" },
                                     };
        _encounterStorage.GetByParentIdAsync(adventureId, Arg.Any<CancellationToken>()).Returns(encounters);

        // Act
        var result = await _service.GetEncountersAsync(adventureId, _ct);

        // Assert
        result.Should().BeEquivalentTo(encounters);
        await _encounterStorage.Received(1).GetByParentIdAsync(adventureId, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task AddEncounterAsync_WithOwnerAndValidEncounter_ReturnsTrue() {
        // Arrange
        var adventureId = Guid.CreateVersion7();
        var encounterId = Guid.CreateVersion7();
        var adventure = new Adventure {
            Id = adventureId,
            Name = "Adventure",
            OwnerId = _userId,
            Description = "Adventure description",
        };
        var encounter = new Encounter {
            Id = encounterId,
            Name = "Encounter",
            Description = "Encounter description",
            Stage = new(),
        };

        _adventureStorage.GetByIdAsync(adventureId, Arg.Any<CancellationToken>()).Returns(adventure);
        _encounterStorage.GetByIdAsync(encounterId, Arg.Any<CancellationToken>()).Returns(encounter);

        // Act
        var result = await _service.AddClonedEncounterAsync(_userId, adventureId, encounterId, _ct);

        // Assert
        result.IsSuccessful.Should().BeTrue();
        result.Value.Should().NotBeNull();
        // NOTE: AddClonedEncounterAsync calls encounterStorage.AddAsync, not adventureStorage.UpdateAsync
        await _encounterStorage.Received(1).AddAsync(Arg.Any<Encounter>(), adventureId, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task AddEncounterAsync_NotOwnedNonPublicEncounter_ReturnsFalse() {
        // Arrange
        var adventureId = Guid.CreateVersion7();
        var encounterId = Guid.CreateVersion7();
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
        var result = await _service.AddClonedEncounterAsync(nonOwnerId, adventureId, encounterId, _ct);

        // Assert
        result.IsSuccessful.Should().BeFalse();
        await _adventureStorage.DidNotReceive().UpdateAsync(Arg.Any<Adventure>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task AddEncounterAsync_WithNonExistentAdventure_ReturnsFalse() {
        // Arrange
        var adventureId = Guid.CreateVersion7();
        var encounterId = Guid.CreateVersion7();

        _adventureStorage.GetByIdAsync(adventureId, Arg.Any<CancellationToken>()).Returns((Adventure?)null);

        // Act
        var result = await _service.AddClonedEncounterAsync(_userId, adventureId, encounterId, _ct);

        // Assert
        result.IsSuccessful.Should().BeFalse();
        await _adventureStorage.DidNotReceive().UpdateAsync(Arg.Any<Adventure>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task AddEncounterAsync_WithNonExistentEncounter_ReturnsFalse() {
        // Arrange
        var adventureId = Guid.CreateVersion7();
        var encounterId = Guid.CreateVersion7();
        var adventure = new Adventure {
            Id = adventureId,
            Name = "Adventure",
            OwnerId = _userId,
        };

        _adventureStorage.GetByIdAsync(adventureId, Arg.Any<CancellationToken>()).Returns(adventure);
        _encounterStorage.GetByIdAsync(encounterId, Arg.Any<CancellationToken>()).Returns((Encounter?)null);

        // Act
        var result = await _service.AddClonedEncounterAsync(_userId, adventureId, encounterId, _ct);

        // Assert
        result.IsSuccessful.Should().BeFalse();
        await _adventureStorage.DidNotReceive().UpdateAsync(Arg.Any<Adventure>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task RemoveEncounterAsync_WithOwner_ReturnsTrue() {
        // Arrange
        var adventureId = Guid.CreateVersion7();
        var encounterId = Guid.CreateVersion7();
        var adventure = new Adventure {
            Id = adventureId,
            Name = "Adventure",
            OwnerId = _userId,
            Encounters = [
                new() { Id = Guid.CreateVersion7(), Name = "Encounter 1" },
                new() { Id = encounterId, Name = "Encounter 2" },
            ],
        };

        _adventureStorage.GetByIdAsync(adventureId, Arg.Any<CancellationToken>()).Returns(adventure);

        // Act
        var result = await _service.RemoveEncounterAsync(_userId, adventureId, encounterId, _ct);

        // Assert
        result.IsSuccessful.Should().BeTrue();
        // NOTE: RemoveEncounterAsync calls encounterStorage.RemoveAsync, not adventureStorage.UpdateAsync
        await _encounterStorage.Received(1).DeleteAsync(encounterId, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task RemoveEncounterAsync_WithNonOwner_ReturnsFalse() {
        // Arrange
        var adventureId = Guid.CreateVersion7();
        var encounterId = Guid.CreateVersion7();
        var nonOwnerId = Guid.CreateVersion7();
        var adventure = new Adventure {
            Id = adventureId,
            Name = "Adventure",
            OwnerId = _userId,
            Encounters = [
                new() { Id = encounterId, Name = "Encounter" },
            ],
        };

        _adventureStorage.GetByIdAsync(adventureId, Arg.Any<CancellationToken>()).Returns(adventure);

        // Act
        var result = await _service.RemoveEncounterAsync(nonOwnerId, adventureId, encounterId, _ct);

        // Assert
        result.IsSuccessful.Should().BeFalse();
        await _adventureStorage.DidNotReceive().UpdateAsync(Arg.Any<Adventure>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task RemoveEncounterAsync_WithNonExistentAdventure_ReturnsFalse() {
        // Arrange
        var adventureId = Guid.CreateVersion7();
        var encounterId = Guid.CreateVersion7();

        _adventureStorage.GetByIdAsync(adventureId, Arg.Any<CancellationToken>()).Returns((Adventure?)null);

        // Act
        var result = await _service.RemoveEncounterAsync(_userId, adventureId, encounterId, _ct);

        // Assert
        result.IsSuccessful.Should().BeFalse();
        await _adventureStorage.DidNotReceive().UpdateAsync(Arg.Any<Adventure>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task RemoveEncounterAsync_WithNonExistentEncounter_StillReturnsTrue() {
        // Arrange
        var adventureId = Guid.CreateVersion7();
        var encounterId = Guid.CreateVersion7();
        var adventure = new Adventure {
            Id = adventureId,
            Name = "Adventure",
            OwnerId = _userId,
            Encounters = [],
        };

        _adventureStorage.GetByIdAsync(adventureId, Arg.Any<CancellationToken>()).Returns(adventure);

        // Act
        var result = await _service.RemoveEncounterAsync(_userId, adventureId, encounterId, _ct);

        // Assert
        result.IsSuccessful.Should().BeTrue();
        // NOTE: RemoveEncounterAsync calls encounterStorage.RemoveAsync, not adventureStorage.UpdateAsync
        await _encounterStorage.Received(1).DeleteAsync(encounterId, Arg.Any<CancellationToken>());
    }
}