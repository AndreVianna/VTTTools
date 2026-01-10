namespace VttTools.Library.Services;

public class EncounterServiceTests {
    private readonly IEncounterStorage _encounterStorage;
    private readonly IAssetStorage _assetStorage;
    private readonly IStageStorage _stageStorage;
    private readonly IMediaServiceClient _mediaServiceClient;
    private readonly ILogger<EncounterService> _logger;
    private readonly EncounterService _service;
    private readonly Guid _userId = Guid.CreateVersion7();
    private readonly CancellationToken _ct;

    public EncounterServiceTests() {
        _encounterStorage = Substitute.For<IEncounterStorage>();
        _assetStorage = Substitute.For<IAssetStorage>();
        _stageStorage = Substitute.For<IStageStorage>();
        _mediaServiceClient = Substitute.For<IMediaServiceClient>();
        _logger = Substitute.For<ILogger<EncounterService>>();
        _service = new(_encounterStorage, _assetStorage, _stageStorage, _mediaServiceClient, _logger);
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
        var result = await _service.GetAllAsync(_ct);

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
        var result = await _service.GetByIdAsync(encounterId, _ct);

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
        var result = await _service.GetByIdAsync(encounterId, _ct);

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
        var result = await _service.UpdateAsync(_userId, encounterId, data, _ct);

        // Assert
        result.IsSuccessful.Should().BeTrue();
        await _encounterStorage.Received(1).UpdateAsync(Arg.Any<Encounter>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task UpdateEncounterAsync_WithNonOwner_ReturnsForbidden() {
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
        var result = await _service.UpdateAsync(nonOwnerId, encounterId, data, _ct);

        // Assert
        result.IsSuccessful.Should().BeFalse();
        result.Errors.Should().ContainSingle().Which.Message.Should().Be("NotAllowed");
        await _encounterStorage.DidNotReceive().UpdateAsync(Arg.Any<Encounter>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task UpdateEncounterAsync_WhenNotFound_ReturnsNotFound() {
        // Arrange
        var encounterId = Guid.CreateVersion7();
        var data = new EncounterUpdateData {
            Name = "Updated Name",
        };

        _encounterStorage.GetByIdAsync(encounterId, Arg.Any<CancellationToken>()).Returns((Encounter?)null);

        // Act
        var result = await _service.UpdateAsync(_userId, encounterId, data, _ct);

        // Assert
        result.IsSuccessful.Should().BeFalse();
        result.Errors.Should().ContainSingle().Which.Message.Should().Be("NotFound");
        await _encounterStorage.DidNotReceive().UpdateAsync(Arg.Any<Encounter>(), Arg.Any<CancellationToken>());
    }

    // === Actor Tests ===

    [Fact]
    public async Task GetActorsAsync_ReturnsActorsFromEncounter() {
        // Arrange
        var encounterId = Guid.CreateVersion7();
        var encounter = new Encounter {
            Id = encounterId,
            Name = "Test Encounter",
            Actors = [
                new() { Index = 0, Name = "Actor 1" },
                new() { Index = 1, Name = "Actor 2" },
            ],
        };
        _encounterStorage.GetByIdAsync(encounterId, Arg.Any<CancellationToken>()).Returns(encounter);

        // Act
        var result = await _service.GetActorsAsync(encounterId, _ct);

        // Assert
        result.Should().HaveCount(2);
        result[0].Name.Should().Be("Actor 1");
        result[1].Name.Should().Be("Actor 2");
    }

    [Fact]
    public async Task GetActorsAsync_WhenEncounterNotFound_ReturnsEmptyArray() {
        // Arrange
        var encounterId = Guid.CreateVersion7();
        _encounterStorage.GetByIdAsync(encounterId, Arg.Any<CancellationToken>()).Returns((Encounter?)null);

        // Act
        var result = await _service.GetActorsAsync(encounterId, _ct);

        // Assert
        result.Should().BeEmpty();
    }

    [Fact]
    public async Task AddActorAsync_WithOwner_AddsActorAndReturnsSuccess() {
        // Arrange
        var encounterId = Guid.CreateVersion7();
        var assetId = Guid.CreateVersion7();
        var encounter = new Encounter {
            Id = encounterId,
            Name = "Test Encounter",
            Adventure = new() {
                OwnerId = _userId,
                Id = Guid.CreateVersion7(),
                Name = "Adventure",
            },
            Actors = [],
        };
        var asset = new Asset {
            Id = assetId,
            OwnerId = _userId,
            Name = "Test Character",
            Classification = new(AssetKind.Character, "Player", "Hero", null),
        };
        var data = new EncounterActorAddData {
            Name = "Hero Character",
            Position = new(10, 20),
            Size = new() { Width = 1, Height = 1 },
        };

        _encounterStorage.GetByIdAsync(encounterId, Arg.Any<CancellationToken>()).Returns(encounter);
        _assetStorage.FindByIdAsync(_userId, assetId, Arg.Any<CancellationToken>()).Returns(asset);

        // Act
        var result = await _service.AddActorAsync(_userId, encounterId, assetId, data, _ct);

        // Assert
        result.IsSuccessful.Should().BeTrue();
        result.Value.Name.Should().Be("Hero Character");
        result.Value.Asset.Id.Should().Be(assetId);
        await _encounterStorage.Received(1).AddActorAsync(encounterId, Arg.Any<EncounterActor>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task UpdateActorAsync_WithOwner_UpdatesActorAndReturnsSuccess() {
        // Arrange
        var encounterId = Guid.CreateVersion7();
        const ushort actorIndex = 0;
        var encounter = new Encounter {
            Id = encounterId,
            Name = "Test Encounter",
            Adventure = new() {
                OwnerId = _userId,
                Id = Guid.CreateVersion7(),
                Name = "Adventure",
            },
            Actors = [
                new() { Index = actorIndex, Name = "Original Name", Position = new(0, 0) },
            ],
        };
        var data = new EncounterActorUpdateData {
            Name = "Updated Name",
            Position = new Position(50, 100),
        };

        _encounterStorage.GetByIdAsync(encounterId, Arg.Any<CancellationToken>()).Returns(encounter);

        // Act
        var result = await _service.UpdateActorAsync(_userId, encounterId, actorIndex, data, _ct);

        // Assert
        result.IsSuccessful.Should().BeTrue();
        await _encounterStorage.Received(1).UpdateActorAsync(encounterId, Arg.Any<EncounterActor>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task UpdateActorAsync_WhenActorNotFound_ReturnsNotFound() {
        // Arrange
        var encounterId = Guid.CreateVersion7();
        const ushort existingIndex = 0;
        const ushort nonExistentIndex = 99;
        var encounter = new Encounter {
            Id = encounterId,
            Name = "Test Encounter",
            Adventure = new() {
                OwnerId = _userId,
                Id = Guid.CreateVersion7(),
                Name = "Adventure",
            },
            Actors = [
                new() { Index = existingIndex, Name = "Existing Actor" },
            ],
        };
        var data = new EncounterActorUpdateData {
            Name = "Updated Name",
        };

        _encounterStorage.GetByIdAsync(encounterId, Arg.Any<CancellationToken>()).Returns(encounter);

        // Act
        var result = await _service.UpdateActorAsync(_userId, encounterId, nonExistentIndex, data, _ct);

        // Assert
        result.IsSuccessful.Should().BeFalse();
        result.Errors.Should().ContainSingle().Which.Message.Should().Be("NotFound");
    }

    [Fact]
    public async Task RemoveActorAsync_WithOwner_RemovesActorAndReturnsSuccess() {
        // Arrange
        var encounterId = Guid.CreateVersion7();
        const ushort actorIndex = 0;
        var encounter = new Encounter {
            Id = encounterId,
            Name = "Test Encounter",
            Adventure = new() {
                OwnerId = _userId,
                Id = Guid.CreateVersion7(),
                Name = "Adventure",
            },
            Actors = [
                new() { Index = actorIndex, Name = "Actor to Remove" },
            ],
        };

        _encounterStorage.GetByIdAsync(encounterId, Arg.Any<CancellationToken>()).Returns(encounter);

        // Act
        var result = await _service.RemoveActorAsync(_userId, encounterId, actorIndex, _ct);

        // Assert
        result.IsSuccessful.Should().BeTrue();
        await _encounterStorage.Received(1).DeleteActorAsync(encounterId, actorIndex, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task RemoveActorAsync_WhenActorNotFound_ReturnsNotFound() {
        // Arrange
        var encounterId = Guid.CreateVersion7();
        const ushort existingIndex = 0;
        const ushort nonExistentIndex = 99;
        var encounter = new Encounter {
            Id = encounterId,
            Name = "Test Encounter",
            Adventure = new() {
                OwnerId = _userId,
                Id = Guid.CreateVersion7(),
                Name = "Adventure",
            },
            Actors = [
                new() { Index = existingIndex, Name = "Existing Actor" },
            ],
        };

        _encounterStorage.GetByIdAsync(encounterId, Arg.Any<CancellationToken>()).Returns(encounter);

        // Act
        var result = await _service.RemoveActorAsync(_userId, encounterId, nonExistentIndex, _ct);

        // Assert
        result.IsSuccessful.Should().BeFalse();
        result.Errors.Should().ContainSingle().Which.Message.Should().Be("NotFound");
    }

    // === Effect Tests ===

    [Fact]
    public async Task GetEffectsAsync_ReturnsEffectsFromEncounter() {
        // Arrange
        var encounterId = Guid.CreateVersion7();
        var encounter = new Encounter {
            Id = encounterId,
            Name = "Test Encounter",
            Effects = [
                new() { Index = 0, Name = "Fireball Zone" },
                new() { Index = 1, Name = "Web Spell" },
            ],
        };
        _encounterStorage.GetByIdAsync(encounterId, Arg.Any<CancellationToken>()).Returns(encounter);

        // Act
        var result = await _service.GetEffectsAsync(encounterId, _ct);

        // Assert
        result.Should().HaveCount(2);
        result[0].Name.Should().Be("Fireball Zone");
        result[1].Name.Should().Be("Web Spell");
    }

    [Fact]
    public async Task AddEffectAsync_WithOwner_AddsEffectAndReturnsSuccess() {
        // Arrange
        var encounterId = Guid.CreateVersion7();
        var assetId = Guid.CreateVersion7();
        var encounter = new Encounter {
            Id = encounterId,
            Name = "Test Encounter",
            Adventure = new() {
                OwnerId = _userId,
                Id = Guid.CreateVersion7(),
                Name = "Adventure",
            },
            Effects = [],
        };
        var asset = new Asset {
            Id = assetId,
            OwnerId = _userId,
            Name = "Fire Effect",
            Classification = new(AssetKind.Effect, "Spell", "Fire", null),
        };
        var data = new EncounterEffectAddData {
            Name = "Wall of Fire",
            Position = new(10, 20),
            EnabledDisplayId = Guid.CreateVersion7(),
        };

        _encounterStorage.GetByIdAsync(encounterId, Arg.Any<CancellationToken>()).Returns(encounter);
        _assetStorage.FindByIdAsync(_userId, assetId, Arg.Any<CancellationToken>()).Returns(asset);

        // Act
        var result = await _service.AddEffectAsync(_userId, encounterId, assetId, data, _ct);

        // Assert
        result.IsSuccessful.Should().BeTrue();
        result.Value.Name.Should().Be("Wall of Fire");
        await _encounterStorage.Received(1).AddEffectAsync(encounterId, Arg.Any<EncounterEffect>(), Arg.Any<CancellationToken>());
    }

    // NOTE: Decoration and Audio tests removed - structural elements are now on Stage
}
