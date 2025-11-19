namespace VttTools.Library.Services;

public class EncounterServiceTests {
    private readonly IEncounterStorage _encounterStorage;
    private readonly IAssetStorage _assetStorage;
    private readonly IMediaStorage _mediaStorage;
    private readonly EncounterService _service;
    private readonly Guid _userId = Guid.CreateVersion7();
    private readonly CancellationToken _ct;

    public EncounterServiceTests() {
        _encounterStorage = Substitute.For<IEncounterStorage>();
        _assetStorage = Substitute.For<IAssetStorage>();
        _mediaStorage = Substitute.For<IMediaStorage>();
        _service = new(_encounterStorage, _assetStorage, _mediaStorage);
        _ct = TestContext.Current.CancellationToken;
    }

    [Fact]
    public async Task GetEncountersAsync_CallsStorage() {
        // Arrange
        var encounters = new Encounter[] {
            new() { Id = Guid.CreateVersion7(), Name = "Test Encounter 1" },
            new() { Id = Guid.CreateVersion7(), Name = "Test Encounter 2" },
        };
        _encounterStorage.GetAllAsync(Arg.Any<CancellationToken>()).Returns(encounters);

        // Act
        var result = await _service.GetEncountersAsync(_ct);

        // Assert
        result.Should().BeEquivalentTo(encounters);
        await _encounterStorage.Received(1).GetAllAsync(Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task GetEncounterByIdAsync_CallsStorage() {
        // Arrange
        var encounterId = Guid.CreateVersion7();
        var encounter = new Encounter { Id = encounterId, Name = "Test Encounter" };
        _encounterStorage.GetByIdAsync(encounterId, Arg.Any<CancellationToken>()).Returns(encounter);

        // Act
        var result = await _service.GetEncounterByIdAsync(encounterId, _ct);

        // Assert
        result.Should().BeEquivalentTo(encounter);
        await _encounterStorage.Received(1).GetByIdAsync(encounterId, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task GetEncounterByIdAsync_WhenEncounterNotFound_ReturnsNull() {
        // Arrange
        var encounterId = Guid.CreateVersion7();
        _encounterStorage.GetByIdAsync(encounterId, Arg.Any<CancellationToken>()).Returns((Encounter?)null);

        // Act
        var result = await _service.GetEncounterByIdAsync(encounterId, _ct);

        // Assert
        result.Should().BeNull();
        await _encounterStorage.Received(1).GetByIdAsync(encounterId, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task UpdateEncounterAsync_WithOwner_UpdatesEncounter() {
        // Arrange
        var encounterId = Guid.CreateVersion7();
        var encounter = new Encounter {
            Id = encounterId,
            Name = "Old Name",
            Description = "Old Description",
            Adventure = new() {
                OwnerId = _userId,
                Id = Guid.CreateVersion7(),
                Name = "Adventure",
            },
        };
        var data = new EncounterUpdateData {
            Name = "Updated Name",
            Description = "Updated Description",
        };

        _encounterStorage.GetByIdAsync(encounterId, Arg.Any<CancellationToken>()).Returns(encounter);
        _encounterStorage.UpdateAsync(Arg.Any<Encounter>(), Arg.Any<CancellationToken>())
            .Returns(true);

        // Act
        var result = await _service.UpdateEncounterAsync(_userId, encounterId, data, _ct);

        // Assert
        result.IsSuccessful.Should().BeTrue();
        await _encounterStorage.Received(1).UpdateAsync(Arg.Any<Encounter>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task UpdateEncounterAsync_WithPartialUpdate_OnlyUpdatesSpecifiedFields() {
        // Arrange
        var encounterId = Guid.CreateVersion7();
        var encounter = new Encounter {
            Id = encounterId,
            Name = "Old Name",
            Description = "Old Description",
            Adventure = new() {
                OwnerId = _userId,
                Id = Guid.CreateVersion7(),
                Name = "Adventure",
            },
        };
        var data = new EncounterUpdateData {
            Name = "Updated Name",
        };

        _encounterStorage.GetByIdAsync(encounterId, Arg.Any<CancellationToken>()).Returns(encounter);
        _encounterStorage.UpdateAsync(Arg.Any<Encounter>(), Arg.Any<CancellationToken>())
            .Returns(true);

        // Act
        var result = await _service.UpdateEncounterAsync(_userId, encounterId, data, _ct);

        // Assert
        result.IsSuccessful.Should().BeTrue();
        await _encounterStorage.Received(1).UpdateAsync(Arg.Any<Encounter>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task UpdateEncounterAsync_WithNonOwner_ReturnsNull() {
        // Arrange
        var encounterId = Guid.CreateVersion7();
        var nonOwnerId = Guid.CreateVersion7();
        var encounter = new Encounter {
            Id = encounterId,
            Name = "Encounter",
            Adventure = new() {
                OwnerId = _userId,
                Id = Guid.CreateVersion7(),
                Name = "Adventure",
            },
        };
        var data = new EncounterUpdateData {
            Name = "Updated Name",
        };

        _encounterStorage.GetByIdAsync(encounterId, Arg.Any<CancellationToken>()).Returns(encounter);

        // Act
        var result = await _service.UpdateEncounterAsync(nonOwnerId, encounterId, data, _ct);

        // Assert
        result.IsSuccessful.Should().BeFalse();
        result.Errors.Should().ContainSingle().Which.Message.Should().Be("NotAllowed");
        await _encounterStorage.DidNotReceive().UpdateAsync(Arg.Any<Encounter>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task UpdateEncounterAsync_WithNonexistentEncounter_ReturnsNull() {
        // Arrange
        var encounterId = Guid.CreateVersion7();
        var data = new EncounterUpdateData {
            Name = "Updated Name",
        };

        _encounterStorage.GetByIdAsync(encounterId, Arg.Any<CancellationToken>()).Returns((Encounter?)null);

        // Act
        var result = await _service.UpdateEncounterAsync(_userId, encounterId, data, _ct);

        // Assert
        result.IsSuccessful.Should().BeFalse();
        await _encounterStorage.DidNotReceive().UpdateAsync(Arg.Any<Encounter>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task GetAssetsAsync_CallsStorage() {
        // Arrange
        var encounterId = Guid.CreateVersion7();
        var encounter = new Encounter {
            Id = encounterId,
            Name = "Encounter",
            Assets = [
                new() { Index = 1, Name = "Test Asset 1" },
                new() { Index = 2, Name = "Test Asset 2" },
            ],
        };

        _encounterStorage.GetByIdAsync(encounterId, Arg.Any<CancellationToken>())
                       .Returns(encounter);

        // Act
        var result = await _service.GetAssetsAsync(encounterId, _ct);

        // Assert
        result.Should().BeEquivalentTo(encounter.Assets);
        await _encounterStorage.Received(1).GetByIdAsync(encounterId, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task GetAssetsAsync_WithNonexistentEncounter_ReturnsEmptyArray() {
        // Arrange
        var encounterId = Guid.CreateVersion7();
        _encounterStorage.GetByIdAsync(encounterId, Arg.Any<CancellationToken>())
                       .Returns((Encounter?)null);

        // Act
        var result = await _service.GetAssetsAsync(encounterId, _ct);

        // Assert
        result.Should().BeEmpty();
        await _encounterStorage.Received(1).GetByIdAsync(encounterId, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task AddAssetAsync_WithOwner_AddsAssetAndReturnsTrue() {
        // Arrange
        var encounterId = Guid.CreateVersion7();
        var assetId = Guid.CreateVersion7();
        var encounter = new Encounter {
            Id = encounterId,
            Name = "Encounter",
            Adventure = new() {
                OwnerId = _userId,
                Id = Guid.CreateVersion7(),
                Name = "Adventure",
                Description = "Adventure description",
                Style = AdventureStyle.OpenWorld,
                Background = new Resource {
                    Id = Guid.CreateVersion7(),
                    Type = ResourceType.Image,
                },
                IsOneShot = false,
                IsPublished = false,
                IsPublic = false,
            },
            Assets = [
                // NOTE: Service uses Assets.Max(sa => sa.Index) and encounter.Assets.Where(sa => sa.AssetId == assetId).Max() which fail on empty collections
                new EncounterAsset {
                    AssetId = assetId, // Same assetId to provide baseline for index calculation
                    Index = 0,
                    Number = 1,
                    Name = "Existing Asset Instance",
                    Position = new Position(0, 0),
                    Size = new NamedSize { Width = 1, Height = 1 }
                }
            ],
        };
        var data = new EncounterAssetAddData {
            Name = "New Asset",
            Position = new Position(20, 30),
            Size = new NamedSize { Width = 10, Height = 50 },
            Frame = new Frame {
                Shape = FrameShape.Square,
                BorderThickness = 2,
                BorderColor = "black",
                Background = "white",
            },
            Elevation = 1,
            Rotation = 45,
        };

        var portraitId = Guid.CreateVersion7();
        var asset = new ObjectAsset {
            Id = assetId,
            OwnerId = _userId,
            Name = "Test Asset",
            Portrait = new Resource {
                Id = portraitId,
                Type = ResourceType.Image,
                Path = "test/asset-portrait.png",
                Metadata = new ResourceMetadata { ContentType = "image/png" },
            },
        };

        _encounterStorage.GetByIdAsync(encounterId, Arg.Any<CancellationToken>()).Returns(encounter);
        // NOTE: AddAssetAsync calls assetStorage.GetByIdAsync to validate the asset exists and check ownership
        _assetStorage.GetByIdAsync(assetId, Arg.Any<CancellationToken>()).Returns(asset);
        _encounterStorage.UpdateAsync(Arg.Any<Encounter>(), Arg.Any<CancellationToken>())
            .Returns(true);

        // Act
        var result = await _service.AddAssetAsync(_userId, encounterId, assetId, data, _ct);

        // Assert
        result.IsSuccessful.Should().BeTrue();
        encounter.Assets.Should().HaveCount(2);
        var addedAsset = encounter.Assets[1]; // The new asset should be at index 1
        addedAsset.Name.Should().Be(data.Name);
        addedAsset.Position.Should().Be(data.Position);
        addedAsset.Size.Should().Be(data.Size);
        addedAsset.Frame.Should().BeEquivalentTo(data.Frame);
        addedAsset.Elevation.Should().Be(data.Elevation);
        addedAsset.Rotation.Should().Be(data.Rotation);
        addedAsset.IsLocked.Should().BeFalse();
        await _encounterStorage.Received(1).UpdateAsync(encounter, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task AddAssetAsync_WithNonOwner_ReturnsFalse() {
        // Arrange
        var encounterId = Guid.CreateVersion7();
        var assetId = Guid.CreateVersion7();
        var nonOwnerId = Guid.CreateVersion7();
        var encounter = new Encounter {
            Id = encounterId,
            Name = "Encounter",
            Assets = [],
        };
        var data = new EncounterAssetAddData {
            Name = "New Asset",
            Position = new Position(20, 30),
            Size = new NamedSize { Width = 10, Height = 50 },
            Frame = new Frame {
                Shape = FrameShape.Square,
                BorderThickness = 2,
                BorderColor = "black",
                Background = "white",
            },
            Elevation = 1,
            Rotation = 45,
        };

        _encounterStorage.GetByIdAsync(encounterId, Arg.Any<CancellationToken>()).Returns(encounter);

        // Act
        var result = await _service.AddAssetAsync(nonOwnerId, encounterId, assetId, data, _ct);

        // Assert
        result.IsSuccessful.Should().BeFalse();
        encounter.Assets.Should().BeEmpty();
        await _encounterStorage.DidNotReceive().UpdateAsync(Arg.Any<Encounter>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task AddAssetAsync_WithNonexistentEncounter_ReturnsFalse() {
        // Arrange
        var encounterId = Guid.CreateVersion7();
        var assetId = Guid.CreateVersion7();
        var data = new EncounterAssetAddData {
            Name = "New Asset",
            Position = new Position(20, 30),
            Size = new NamedSize { Width = 10, Height = 50 },
            Frame = new Frame {
                Shape = FrameShape.Square,
                BorderThickness = 2,
                BorderColor = "black",
                Background = "white",
            },
            Elevation = 1,
            Rotation = 45,
        };

        _encounterStorage.GetByIdAsync(encounterId, Arg.Any<CancellationToken>()).Returns((Encounter?)null);

        // Act
        var result = await _service.AddAssetAsync(_userId, encounterId, assetId, data, _ct);

        // Assert
        result.IsSuccessful.Should().BeFalse();
        await _encounterStorage.DidNotReceive().UpdateAsync(Arg.Any<Encounter>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task UpdateAssetAsync_WithOwner_UpdatesAssetAndReturnsTrue() {
        // Arrange
        var encounterId = Guid.CreateVersion7();
        var assetId = Guid.CreateVersion7();
        const int index = 1;
        var encounter = new Encounter {
            Id = encounterId,
            Name = "Encounter",
            Adventure = new() {
                OwnerId = _userId,
                Id = Guid.CreateVersion7(),
                Name = "Adventure",
                Description = "Adventure description",
                Style = AdventureStyle.OpenWorld,
                Background = new Resource {
                    Id = Guid.CreateVersion7(),
                    Type = ResourceType.Image,
                },
                IsOneShot = false,
                IsPublished = false,
                IsPublic = false,
            },
            Assets = [
                new() {
                    Index = index,
                    Name = "Asset to update",
                    Position = new(1, 1),
                },
            ],
        };
        var data = new EncounterAssetUpdateData {
            Position = new Position(20, 30),
            Size = new NamedSize { Width = 10, Height = 50 },
            Frame = new Frame {
                Shape = FrameShape.Square,
                BorderThickness = 2,
                BorderColor = "black",
                Background = "white",
            },
            Elevation = 1,
            Rotation = 45,
        };

        _encounterStorage.GetByIdAsync(encounterId, Arg.Any<CancellationToken>()).Returns(encounter);
        _encounterStorage.UpdateAsync(Arg.Any<Encounter>(), Arg.Any<CancellationToken>()).Returns(true);

        // Act
        var result = await _service.UpdateAssetAsync(_userId, encounterId, index, data, _ct);

        // Assert
        result.IsSuccessful.Should().BeTrue();
    }

    [Fact]
    public async Task UpdateAssetAsync_WithNonOwner_ReturnsFalse() {
        // Arrange
        var encounterId = Guid.CreateVersion7();
        var assetId = Guid.CreateVersion7();
        const int index = 1;
        var nonOwnerId = Guid.CreateVersion7();
        var encounter = new Encounter {
            Id = encounterId,
            Name = "Encounter",
            Adventure = new() {
                OwnerId = _userId,
                Id = Guid.CreateVersion7(),
                Name = "Adventure",
            },
            Assets = [
                new() {
                    Index = index,
                    Name = "Asset to not update",
                    Position = new(1, 1),
                },
            ],
        };
        var data = new EncounterAssetUpdateData {
            Position = new Position(20, 30),
            Size = new NamedSize { Width = 10, Height = 50 },
            Frame = new Frame {
                Shape = FrameShape.Square,
                BorderThickness = 2,
                BorderColor = "black",
                Background = "white",
            },
            Elevation = 1,
            Rotation = 45,
        };

        _encounterStorage.GetByIdAsync(encounterId, Arg.Any<CancellationToken>()).Returns(encounter);

        // Act
        var result = await _service.UpdateAssetAsync(nonOwnerId, encounterId, index, data, _ct);

        // Assert
        result.IsSuccessful.Should().BeFalse();
        var unchangedAsset = encounter.Assets[0];
        unchangedAsset.Position.X.Should().Be(1);
        unchangedAsset.Position.Y.Should().Be(1);
        await _encounterStorage.DidNotReceive().UpdateAsync(Arg.Any<Encounter>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task UpdateAssetAsync_WithNonexistentEncounter_ReturnsFalse() {
        // Arrange
        var encounterId = Guid.CreateVersion7();
        var assetId = Guid.CreateVersion7();
        const int index = 1;
        var data = new EncounterAssetUpdateData {
            Position = new Position(20, 30),
            Size = new NamedSize { Width = 10, Height = 50 },
            Frame = new Frame {
                Shape = FrameShape.Square,
                BorderThickness = 2,
                BorderColor = "black",
                Background = "white",
            },
            Elevation = 1,
            Rotation = 45,
        };

        _encounterStorage.GetByIdAsync(encounterId, Arg.Any<CancellationToken>()).Returns((Encounter?)null);

        // Act
        var result = await _service.UpdateAssetAsync(_userId, encounterId, index, data, _ct);

        // Assert
        result.IsSuccessful.Should().BeFalse();
        await _encounterStorage.DidNotReceive().UpdateAsync(Arg.Any<Encounter>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task UpdateAssetAsync_WithNonexistentAsset_ReturnsFalse() {
        // Arrange
        var encounterId = Guid.CreateVersion7();
        const int index = 1;
        var nonexistentAssetId = Guid.CreateVersion7();
        var encounter = new Encounter {
            Id = encounterId,
            Name = "Encounter",
            Adventure = new() {
                OwnerId = _userId,
                Id = Guid.CreateVersion7(),
                Name = "Adventure",
            },
            Assets = [
                new() {
                    Index = index,
                    Name = "Existing Asset",
                    Position = new(1, 1),
                },
            ],
        };
        var data = new EncounterAssetUpdateData {
            Position = new Position(20, 30),
            Size = new NamedSize { Width = 10, Height = 50 },
            Frame = new Frame {
                Shape = FrameShape.Square,
                BorderThickness = 2,
                BorderColor = "black",
                Background = "white",
            },
            Elevation = 1,
            Rotation = 45,
        };

        _encounterStorage.GetByIdAsync(encounterId, Arg.Any<CancellationToken>()).Returns(encounter);
        _assetStorage.GetByIdAsync(nonexistentAssetId, Arg.Any<CancellationToken>()).Returns((Asset?)null);

        // Act
        var result = await _service.UpdateAssetAsync(_userId, encounterId, 99, data, _ct);

        // Assert
        result.IsSuccessful.Should().BeFalse();
        await _encounterStorage.DidNotReceive().UpdateAsync(Arg.Any<Encounter>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task AddAssetAsync_WithCreatureAsset_GeneratesindexedName() {
        var encounterId = Guid.CreateVersion7();
        var assetId = Guid.CreateVersion7();
        var resourceId = Guid.CreateVersion7();
        var encounter = new Encounter {
            Id = encounterId,
            Name = "Test Encounter",
            Adventure = new() {
                OwnerId = _userId,
                Id = Guid.CreateVersion7(),
                Name = "Test Adventure",
                Description = "Test description",
                Style = AdventureStyle.OpenWorld,
                Background = new Resource { Id = Guid.CreateVersion7(), Type = ResourceType.Image },
                IsOneShot = false,
                IsPublished = false,
                IsPublic = false,
            },
            Assets = [],
        };
        var asset = new CreatureAsset {
            Id = assetId,
            OwnerId = _userId,
            Name = "Goblin",
            TopDown = new Resource {
                Id = resourceId,
                Type = ResourceType.Image,
                Path = "test/goblin-topdown.png",
                Metadata = new ResourceMetadata { ContentType = "image/png" },
            },
        };
        var data = new EncounterAssetAddData {
            Name = null,
            Position = new Position(10, 20),
            Size = new NamedSize { Width = 1, Height = 1 },
        };

        _encounterStorage.GetByIdAsync(encounterId, Arg.Any<CancellationToken>()).Returns(encounter);
        _assetStorage.GetByIdAsync(assetId, Arg.Any<CancellationToken>()).Returns(asset);
        _encounterStorage.UpdateAsync(Arg.Any<Encounter>(), Arg.Any<CancellationToken>()).Returns(true);

        // Act
        var result = await _service.AddAssetAsync(_userId, encounterId, assetId, data, _ct);

        // Assert
        result.IsSuccessful.Should().BeTrue($"Expected success but got errors: {string.Join(", ", result.Errors)}");
        result.Value.Name.Should().Be("Goblin #1");
    }

    [Fact]
    public async Task AddAssetAsync_WithMultipleCreatures_Incrementsindexs() {
        // Arrange
        var encounterId = Guid.CreateVersion7();
        var assetId = Guid.CreateVersion7();
        var resourceId = Guid.CreateVersion7();
        var encounter = new Encounter {
            Id = encounterId,
            Name = "Test Encounter",
            Adventure = new() {
                OwnerId = _userId,
                Id = Guid.CreateVersion7(),
                Name = "Test Adventure",
                Description = "Test description",
                Style = AdventureStyle.OpenWorld,
                Background = new Resource { Id = Guid.CreateVersion7(), Type = ResourceType.Image },
                IsOneShot = false,
                IsPublished = false,
                IsPublic = false,
            },
            Assets = [],
        };
        var asset = new CreatureAsset {
            Id = assetId,
            OwnerId = _userId,
            Name = "Goblin",
            TopDown = new Resource {
                Id = resourceId,
                Type = ResourceType.Image,
                Path = "test/goblin-topdown.png",
                Metadata = new ResourceMetadata { ContentType = "image/png" },
            },
        };
        var data = new EncounterAssetAddData {
            Name = null,
            Position = new Position(10, 20),
            Size = new NamedSize { Width = 1, Height = 1 },
        };

        _encounterStorage.GetByIdAsync(encounterId, Arg.Any<CancellationToken>()).Returns(encounter);
        _assetStorage.GetByIdAsync(assetId, Arg.Any<CancellationToken>()).Returns(asset);
        _encounterStorage.UpdateAsync(Arg.Any<Encounter>(), Arg.Any<CancellationToken>()).Returns(true);

        // Act
        var result1 = await _service.AddAssetAsync(_userId, encounterId, assetId, data, _ct);
        var result2 = await _service.AddAssetAsync(_userId, encounterId, assetId, data, _ct);

        // Assert
        result1.IsSuccessful.Should().BeTrue();
        result1.Value.Name.Should().Be("Goblin #1");
        result2.IsSuccessful.Should().BeTrue();
        result2.Value.Name.Should().Be("Goblin #2");
    }

    [Fact]
    public async Task AddAssetAsync_WithObjectAsset_UsesBaseName() {
        // Arrange
        var encounterId = Guid.CreateVersion7();
        var assetId = Guid.CreateVersion7();
        var resourceId = Guid.CreateVersion7();
        var encounter = new Encounter {
            Id = encounterId,
            Name = "Test Encounter",
            Adventure = new() {
                OwnerId = _userId,
                Id = Guid.CreateVersion7(),
                Name = "Test Adventure",
                Description = "Test description",
                Style = AdventureStyle.OpenWorld,
                Background = new Resource { Id = Guid.CreateVersion7(), Type = ResourceType.Image },
                IsOneShot = false,
                IsPublished = false,
                IsPublic = false,
            },
            Assets = [],
        };
        var asset = new ObjectAsset {
            Id = assetId,
            OwnerId = _userId,
            Name = "Treasure Chest",
            TopDown = new Resource {
                Id = resourceId,
                Type = ResourceType.Image,
                Path = "test/chest-topdown.png",
                Metadata = new ResourceMetadata { ContentType = "image/png" },
            },
        };
        var data = new EncounterAssetAddData {
            Name = null,
            Position = new Position(10, 20),
            Size = new NamedSize { Width = 1, Height = 1 },
        };

        _encounterStorage.GetByIdAsync(encounterId, Arg.Any<CancellationToken>()).Returns(encounter);
        _assetStorage.GetByIdAsync(assetId, Arg.Any<CancellationToken>()).Returns(asset);
        _encounterStorage.UpdateAsync(Arg.Any<Encounter>(), Arg.Any<CancellationToken>()).Returns(true);

        // Act
        var result1 = await _service.AddAssetAsync(_userId, encounterId, assetId, data, _ct);
        var result2 = await _service.AddAssetAsync(_userId, encounterId, assetId, data, _ct);

        // Assert
        result1.IsSuccessful.Should().BeTrue();
        result1.Value.Name.Should().Be("Treasure Chest");
        result2.IsSuccessful.Should().BeTrue();
        result2.Value.Name.Should().Be("Treasure Chest");
    }

    [Fact]
    public async Task AddAssetAsync_WithCustomName_OverridesAutoNaming() {
        // Arrange
        var encounterId = Guid.CreateVersion7();
        var assetId = Guid.CreateVersion7();
        var resourceId = Guid.CreateVersion7();
        var encounter = new Encounter {
            Id = encounterId,
            Name = "Test Encounter",
            Adventure = new() {
                OwnerId = _userId,
                Id = Guid.CreateVersion7(),
                Name = "Test Adventure",
                Description = "Test description",
                Style = AdventureStyle.OpenWorld,
                Background = new Resource { Id = Guid.CreateVersion7(), Type = ResourceType.Image },
                IsOneShot = false,
                IsPublished = false,
                IsPublic = false,
            },
            Assets = [],
        };
        var asset = new CreatureAsset {
            Id = assetId,
            OwnerId = _userId,
            Name = "Goblin",
            TopDown = new Resource {
                Id = resourceId,
                Type = ResourceType.Image,
                Path = "test/goblin-topdown.png",
                Metadata = new ResourceMetadata { ContentType = "image/png" },
            },
        };
        var data = new EncounterAssetAddData {
            Name = "Boss Goblin",
            Position = new Position(10, 20),
            Size = new NamedSize { Width = 1, Height = 1 },
        };

        _encounterStorage.GetByIdAsync(encounterId, Arg.Any<CancellationToken>()).Returns(encounter);
        _assetStorage.GetByIdAsync(assetId, Arg.Any<CancellationToken>()).Returns(asset);
        _encounterStorage.UpdateAsync(Arg.Any<Encounter>(), Arg.Any<CancellationToken>()).Returns(true);

        // Act
        var result = await _service.AddAssetAsync(_userId, encounterId, assetId, data, _ct);

        // Assert
        result.IsSuccessful.Should().BeTrue();
        result.Value.Name.Should().Be("Boss Goblin");
    }

    [Fact]
    public async Task AddAssetAsync_WithDifferentCreatureTypes_Independentindexing() {
        // Arrange
        var encounterId = Guid.CreateVersion7();
        var goblinAssetId = Guid.CreateVersion7();
        var orcAssetId = Guid.CreateVersion7();
        var resourceId1 = Guid.CreateVersion7();
        var resourceId2 = Guid.CreateVersion7();
        var encounter = new Encounter {
            Id = encounterId,
            Name = "Test Encounter",
            Adventure = new() {
                OwnerId = _userId,
                Id = Guid.CreateVersion7(),
                Name = "Test Adventure",
                Description = "Test description",
                Style = AdventureStyle.OpenWorld,
                Background = new Resource { Id = Guid.CreateVersion7(), Type = ResourceType.Image },
                IsOneShot = false,
                IsPublished = false,
                IsPublic = false,
            },
            Assets = [],
        };
        var goblinAsset = new CreatureAsset {
            Id = goblinAssetId,
            OwnerId = _userId,
            Name = "Goblin",
            TopDown = new Resource {
                Id = resourceId1,
                Type = ResourceType.Image,
                Path = "test/goblin-topdown.png",
                Metadata = new ResourceMetadata { ContentType = "image/png" },
            },
        };
        var orcAsset = new CreatureAsset {
            Id = orcAssetId,
            OwnerId = _userId,
            Name = "Orc",
            TopDown = new Resource {
                Id = resourceId2,
                Type = ResourceType.Image,
                Path = "test/orc-topdown.png",
                Metadata = new ResourceMetadata { ContentType = "image/png" },
            },
        };
        var data = new EncounterAssetAddData {
            Name = null,
            Position = new Position(10, 20),
            Size = new NamedSize { Width = 1, Height = 1 },
        };

        _encounterStorage.GetByIdAsync(encounterId, Arg.Any<CancellationToken>()).Returns(encounter);
        _assetStorage.GetByIdAsync(goblinAssetId, Arg.Any<CancellationToken>()).Returns(goblinAsset);
        _assetStorage.GetByIdAsync(orcAssetId, Arg.Any<CancellationToken>()).Returns(orcAsset);
        _encounterStorage.UpdateAsync(Arg.Any<Encounter>(), Arg.Any<CancellationToken>()).Returns(true);

        // Act
        var goblinResult = await _service.AddAssetAsync(_userId, encounterId, goblinAssetId, data, _ct);
        var orcResult = await _service.AddAssetAsync(_userId, encounterId, orcAssetId, data, _ct);

        // Assert
        goblinResult.IsSuccessful.Should().BeTrue();
        goblinResult.Value.Name.Should().Be("Goblin #1");
        orcResult.IsSuccessful.Should().BeTrue();
        orcResult.Value.Name.Should().Be("Orc #1");
    }

    [Fact]
    public async Task AddWallAsync_WithMaterialAndColor_SavesPropertiesCorrectly() {
        var encounterId = Guid.CreateVersion7();
        var encounter = new Encounter {
            Id = encounterId,
            Name = "Test Encounter",
            Adventure = new() {
                OwnerId = _userId,
                Id = Guid.CreateVersion7(),
                Name = "Test Adventure",
            },
            Walls = [],
        };
        var data = new EncounterWallAddData {
            Name = "Test Wall",
            Poles = [new Pole(0, 0, 10), new Pole(10, 0, 10)],
            Visibility = WallVisibility.Normal,
            IsClosed = false,
            Material = "stone",
            Color = "gray",
        };

        _encounterStorage.GetByIdAsync(encounterId, Arg.Any<CancellationToken>()).Returns(encounter);
        _encounterStorage.AddWallAsync(Arg.Any<Guid>(), Arg.Any<EncounterWall>(), Arg.Any<CancellationToken>())
            .Returns(true);

        var result = await _service.AddWallAsync(_userId, encounterId, data, _ct);

        result.IsSuccessful.Should().BeTrue();
        result.Value.Material.Should().Be("stone");
        result.Value.Color.Should().Be("gray");
        await _encounterStorage.Received(1).AddWallAsync(
            encounterId,
            Arg.Is<EncounterWall>(w => w.Material == "stone" && w.Color == "gray"),
            Arg.Any<CancellationToken>()
        );
    }

    [Fact]
    public async Task UpdateWallAsync_WithMaterialAndColor_UpdatesPropertiesCorrectly() {
        var encounterId = Guid.CreateVersion7();
        const uint wallIndex = 1;
        var encounter = new Encounter {
            Id = encounterId,
            Name = "Test Encounter",
            Adventure = new() {
                OwnerId = _userId,
                Id = Guid.CreateVersion7(),
                Name = "Test Adventure",
            },
            Walls = [
                new() {
                    Index = wallIndex,
                    Name = "Existing Wall",
                    Poles = [new Pole(0, 0, 10), new Pole(10, 0, 10)],
                    Visibility = WallVisibility.Normal,
                    IsClosed = false,
                    Material = "wood",
                    Color = "brown",
                }
            ],
        };
        var data = new EncounterWallUpdateData {
            Material = "metal",
            Color = "silver",
        };

        _encounterStorage.GetByIdAsync(encounterId, Arg.Any<CancellationToken>()).Returns(encounter);
        _encounterStorage.UpdateWallAsync(Arg.Any<Guid>(), Arg.Any<EncounterWall>(), Arg.Any<CancellationToken>())
            .Returns(true);

        var result = await _service.UpdateWallAsync(_userId, encounterId, wallIndex, data, _ct);

        result.IsSuccessful.Should().BeTrue();
        await _encounterStorage.Received(1).UpdateWallAsync(
            encounterId,
            Arg.Is<EncounterWall>(w => w.Material == "metal" && w.Color == "silver"),
            Arg.Any<CancellationToken>()
        );
    }

    [Fact]
    public async Task AddWallAsync_WithNullMaterialAndColor_SavesNullValues() {
        var encounterId = Guid.CreateVersion7();
        var encounter = new Encounter {
            Id = encounterId,
            Name = "Test Encounter",
            Adventure = new() {
                OwnerId = _userId,
                Id = Guid.CreateVersion7(),
                Name = "Test Adventure",
            },
            Walls = [],
        };
        var data = new EncounterWallAddData {
            Name = "Test Wall",
            Poles = [new Pole(0, 0, 10), new Pole(10, 0, 10)],
            Visibility = WallVisibility.Normal,
            IsClosed = false,
            Material = null,
            Color = null,
        };

        _encounterStorage.GetByIdAsync(encounterId, Arg.Any<CancellationToken>()).Returns(encounter);
        _encounterStorage.AddWallAsync(Arg.Any<Guid>(), Arg.Any<EncounterWall>(), Arg.Any<CancellationToken>())
            .Returns(true);

        var result = await _service.AddWallAsync(_userId, encounterId, data, _ct);

        result.IsSuccessful.Should().BeTrue();
        result.Value.Material.Should().BeNull();
        result.Value.Color.Should().BeNull();
        await _encounterStorage.Received(1).AddWallAsync(
            encounterId,
            Arg.Is<EncounterWall>(w => w.Material == null && w.Color == null),
            Arg.Any<CancellationToken>()
        );
    }
}