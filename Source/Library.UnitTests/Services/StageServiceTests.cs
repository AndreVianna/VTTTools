namespace VttTools.Library.Services;

public class StageServiceTests {
    private readonly IStageStorage _stageStorage;
    private readonly StageService _service;
    private readonly Guid _userId = Guid.CreateVersion7();
    private readonly CancellationToken _ct;

    public StageServiceTests() {
        _stageStorage = Substitute.For<IStageStorage>();
        _service = new(_stageStorage);
        _ct = TestContext.Current.CancellationToken;
    }

    // === SearchAsync Tests ===

    [Fact]
    public async Task GetStagesAsync_CallsStorage() {
        // Arrange
        var stages = new Stage[] {
            new() { Id = Guid.CreateVersion7(), Name = "Test Stage 1" },
            new() { Id = Guid.CreateVersion7(), Name = "Test Stage 2" },
        };
        _stageStorage.GetAllAsync(Arg.Any<CancellationToken>()).Returns(stages);

        // Act
        var result = await _service.GetAllAsync(_ct);

        // Assert
        result.Should().BeEquivalentTo(stages);
        await _stageStorage.Received(1).GetAllAsync(Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task GetStagesAsync_WithFilterDefinition_CallsStorage() {
        // Arrange
        var stages = new Stage[] {
            new() { Id = Guid.CreateVersion7(), Name = "Filtered Stage" },
        };
        const string filter = "OwnerId = @userId";
        _stageStorage.GetManyAsync(filter, Arg.Any<CancellationToken>()).Returns(stages);

        // Act
        var result = await _service.SearchAsync(filter, _ct);

        // Assert
        result.Should().BeEquivalentTo(stages);
        await _stageStorage.Received(1).GetManyAsync(filter, Arg.Any<CancellationToken>());
    }

    // === GetByIdAsync Tests ===

    [Fact]
    public async Task GetStageByIdAsync_CallsStorage() {
        // Arrange
        var stageId = Guid.CreateVersion7();
        var stage = new Stage { Id = stageId, Name = "Test Stage" };
        _stageStorage.GetByIdAsync(stageId, Arg.Any<CancellationToken>()).Returns(stage);

        // Act
        var result = await _service.GetByIdAsync(stageId, _ct);

        // Assert
        result.Should().BeEquivalentTo(stage);
        await _stageStorage.Received(1).GetByIdAsync(stageId, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task GetStageByIdAsync_WhenStageNotFound_ReturnsNull() {
        // Arrange
        var stageId = Guid.CreateVersion7();
        _stageStorage.GetByIdAsync(stageId, Arg.Any<CancellationToken>()).Returns((Stage?)null);

        // Act
        var result = await _service.GetByIdAsync(stageId, _ct);

        // Assert
        result.Should().BeNull();
        await _stageStorage.Received(1).GetByIdAsync(stageId, Arg.Any<CancellationToken>());
    }

    // === CreateAsync Tests ===

    [Fact]
    public async Task CreateStageAsync_WithValidData_CreatesStage() {
        // Arrange
        var data = new CreateStageData {
            Name = "Test Stage",
            Description = "Test Description",
        };

        // Act
        var result = await _service.CreateAsync(_userId, data, _ct);

        // Assert
        result.IsSuccessful.Should().BeTrue();
        result.Value.Name.Should().Be("Test Stage");
        result.Value.OwnerId.Should().Be(_userId);
        await _stageStorage.Received(1).AddAsync(Arg.Any<Stage>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task CreateStageAsync_WithValidData_CreatesStageWithDefaultSettings() {
        // Arrange
        var data = new CreateStageData {
            Name = "Test Stage",
            Description = "Test Description",
        };

        // Act
        var result = await _service.CreateAsync(_userId, data, _ct);

        // Assert
        result.IsSuccessful.Should().BeTrue();
        result.Value.Settings.Should().NotBeNull();
        result.Value.Name.Should().Be("Test Stage");
    }

    [Fact]
    public async Task CreateStageAsync_WithInvalidData_ReturnsValidationError() {
        // Arrange
        var data = new CreateStageData {
            Name = "",
            Description = "",
        };

        // Act
        var result = await _service.CreateAsync(_userId, data, _ct);

        // Assert
        result.IsSuccessful.Should().BeFalse();
        result.Errors.Should().NotBeEmpty();
        await _stageStorage.DidNotReceive().AddAsync(Arg.Any<Stage>(), Arg.Any<CancellationToken>());
    }

    // === CloneAsync Tests ===

    [Fact]
    public async Task CloneStageAsync_WithOwner_ClonesStage() {
        // Arrange
        var templateId = Guid.CreateVersion7();
        var template = new Stage {
            Id = templateId,
            OwnerId = _userId,
            Name = "Template Stage",
            Description = "Template Description",
            Walls = [new() { Index = 0, Name = "Wall 1" }],
            Regions = [new() { Index = 0, Name = "Region 1" }],
        };
        _stageStorage.GetByIdAsync(templateId, Arg.Any<CancellationToken>()).Returns(template);

        // Act
        var result = await _service.CloneAsync(_userId, templateId, _ct);

        // Assert
        result.IsSuccessful.Should().BeTrue();
        result.Value.Id.Should().NotBe(templateId);
        result.Value.Name.Should().Be("Template Stage (Copy)");
        result.Value.OwnerId.Should().Be(_userId);
        result.Value.IsPublished.Should().BeFalse();
        result.Value.IsPublic.Should().BeFalse();
        result.Value.Walls.Should().HaveCount(1);
        result.Value.Regions.Should().HaveCount(1);
        await _stageStorage.Received(1).AddAsync(Arg.Any<Stage>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task CloneStageAsync_WithPublicPublishedStage_ClonesForOtherUser() {
        // Arrange
        var templateId = Guid.CreateVersion7();
        var templateOwnerId = Guid.CreateVersion7();
        var template = new Stage {
            Id = templateId,
            OwnerId = templateOwnerId,
            Name = "Public Template",
            IsPublished = true,
            IsPublic = true,
        };
        _stageStorage.GetByIdAsync(templateId, Arg.Any<CancellationToken>()).Returns(template);

        // Act
        var result = await _service.CloneAsync(_userId, templateId, _ct);

        // Assert
        result.IsSuccessful.Should().BeTrue();
        result.Value.OwnerId.Should().Be(_userId);
    }

    [Fact]
    public async Task CloneStageAsync_WithPrivateStage_ReturnsForbidden() {
        // Arrange
        var templateId = Guid.CreateVersion7();
        var templateOwnerId = Guid.CreateVersion7();
        var template = new Stage {
            Id = templateId,
            OwnerId = templateOwnerId,
            Name = "Private Template",
            IsPublished = false,
            IsPublic = false,
        };
        _stageStorage.GetByIdAsync(templateId, Arg.Any<CancellationToken>()).Returns(template);

        // Act
        var result = await _service.CloneAsync(_userId, templateId, _ct);

        // Assert
        result.IsSuccessful.Should().BeFalse();
        result.Errors.Should().ContainSingle().Which.Message.Should().Be("NotAllowed");
    }

    [Fact]
    public async Task CloneStageAsync_WhenNotFound_ReturnsNotFound() {
        // Arrange
        var templateId = Guid.CreateVersion7();
        _stageStorage.GetByIdAsync(templateId, Arg.Any<CancellationToken>()).Returns((Stage?)null);

        // Act
        var result = await _service.CloneAsync(_userId, templateId, _ct);

        // Assert
        result.IsSuccessful.Should().BeFalse();
        result.Errors.Should().ContainSingle().Which.Message.Should().Be("NotFound");
    }

    // === UpdateAsync Tests ===

    [Fact]
    public async Task UpdateStageAsync_WithOwner_UpdatesStage() {
        // Arrange
        var stageId = Guid.CreateVersion7();
        var stage = new Stage {
            Id = stageId,
            OwnerId = _userId,
            Name = "Old Name",
            Description = "Old Description",
        };
        var data = new UpdateStageData {
            Name = "Updated Name",
            Description = "Updated Description",
        };
        _stageStorage.GetByIdAsync(stageId, Arg.Any<CancellationToken>()).Returns(stage);

        // Act
        var result = await _service.UpdateAsync(_userId, stageId, data, _ct);

        // Assert
        result.IsSuccessful.Should().BeTrue();
        await _stageStorage.Received(1).UpdateAsync(Arg.Any<Stage>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task UpdateStageAsync_WithNonOwner_ReturnsForbidden() {
        // Arrange
        var stageId = Guid.CreateVersion7();
        var nonOwnerId = Guid.CreateVersion7();
        var stage = new Stage {
            Id = stageId,
            OwnerId = _userId,
            Name = "Stage",
        };
        var data = new UpdateStageData {
            Name = "Updated Name",
        };
        _stageStorage.GetByIdAsync(stageId, Arg.Any<CancellationToken>()).Returns(stage);

        // Act
        var result = await _service.UpdateAsync(nonOwnerId, stageId, data, _ct);

        // Assert
        result.IsSuccessful.Should().BeFalse();
        result.Errors.Should().ContainSingle().Which.Message.Should().Be("NotAllowed");
        await _stageStorage.DidNotReceive().UpdateAsync(Arg.Any<Stage>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task UpdateStageAsync_WhenNotFound_ReturnsNotFound() {
        // Arrange
        var stageId = Guid.CreateVersion7();
        var data = new UpdateStageData {
            Name = "Updated Name",
        };
        _stageStorage.GetByIdAsync(stageId, Arg.Any<CancellationToken>()).Returns((Stage?)null);

        // Act
        var result = await _service.UpdateAsync(_userId, stageId, data, _ct);

        // Assert
        result.IsSuccessful.Should().BeFalse();
        result.Errors.Should().ContainSingle().Which.Message.Should().Be("NotFound");
        await _stageStorage.DidNotReceive().UpdateAsync(Arg.Any<Stage>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task UpdateStageAsync_WithInvalidData_ReturnsValidationError() {
        // Arrange
        var stageId = Guid.CreateVersion7();
        var stage = new Stage {
            Id = stageId,
            OwnerId = _userId,
            Name = "Stage",
        };
        var data = new UpdateStageData {
            Name = "",
        };
        _stageStorage.GetByIdAsync(stageId, Arg.Any<CancellationToken>()).Returns(stage);

        // Act
        var result = await _service.UpdateAsync(_userId, stageId, data, _ct);

        // Assert
        result.IsSuccessful.Should().BeFalse();
        result.Errors.Should().NotBeEmpty();
        await _stageStorage.DidNotReceive().UpdateAsync(Arg.Any<Stage>(), Arg.Any<CancellationToken>());
    }

    // === DeleteAsync Tests ===

    [Fact]
    public async Task DeleteStageAsync_WithOwner_DeletesStage() {
        // Arrange
        var stageId = Guid.CreateVersion7();
        var stage = new Stage {
            Id = stageId,
            OwnerId = _userId,
            Name = "Stage",
        };
        _stageStorage.GetByIdAsync(stageId, Arg.Any<CancellationToken>()).Returns(stage);

        // Act
        var result = await _service.DeleteAsync(_userId, stageId, _ct);

        // Assert
        result.IsSuccessful.Should().BeTrue();
        await _stageStorage.Received(1).DeleteAsync(stageId, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task DeleteStageAsync_WithNonOwner_ReturnsForbidden() {
        // Arrange
        var stageId = Guid.CreateVersion7();
        var nonOwnerId = Guid.CreateVersion7();
        var stage = new Stage {
            Id = stageId,
            OwnerId = _userId,
            Name = "Stage",
        };
        _stageStorage.GetByIdAsync(stageId, Arg.Any<CancellationToken>()).Returns(stage);

        // Act
        var result = await _service.DeleteAsync(nonOwnerId, stageId, _ct);

        // Assert
        result.IsSuccessful.Should().BeFalse();
        result.Errors.Should().ContainSingle().Which.Message.Should().Be("NotAllowed");
        await _stageStorage.DidNotReceive().DeleteAsync(Arg.Any<Guid>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task DeleteStageAsync_WhenNotFound_ReturnsNotFound() {
        // Arrange
        var stageId = Guid.CreateVersion7();
        _stageStorage.GetByIdAsync(stageId, Arg.Any<CancellationToken>()).Returns((Stage?)null);

        // Act
        var result = await _service.DeleteAsync(_userId, stageId, _ct);

        // Assert
        result.IsSuccessful.Should().BeFalse();
        result.Errors.Should().ContainSingle().Which.Message.Should().Be("NotFound");
        await _stageStorage.DidNotReceive().DeleteAsync(Arg.Any<Guid>(), Arg.Any<CancellationToken>());
    }

    // === Wall Tests ===

    [Fact]
    public async Task AddWallAsync_WithOwner_AddsWall() {
        // Arrange
        var stageId = Guid.CreateVersion7();
        var stage = new Stage {
            Id = stageId,
            OwnerId = _userId,
            Name = "Stage",
            Walls = [],
        };
        var wall = new StageWall { Name = "New Wall" };
        _stageStorage.GetByIdAsync(stageId, Arg.Any<CancellationToken>()).Returns(stage);

        // Act
        var result = await _service.AddWallAsync(_userId, stageId, wall, _ct);

        // Assert
        result.IsSuccessful.Should().BeTrue();
        result.Value.Name.Should().Be("New Wall");
        result.Value.Index.Should().Be(0);
        await _stageStorage.Received(1).UpdateAsync(Arg.Is<Stage>(s => s.Walls.Count == 1), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task AddWallAsync_WithExistingWalls_AssignsNextIndex() {
        // Arrange
        var stageId = Guid.CreateVersion7();
        var stage = new Stage {
            Id = stageId,
            OwnerId = _userId,
            Name = "Stage",
            Walls = [new() { Index = 0, Name = "Existing Wall" }],
        };
        var wall = new StageWall { Name = "New Wall" };
        _stageStorage.GetByIdAsync(stageId, Arg.Any<CancellationToken>()).Returns(stage);

        // Act
        var result = await _service.AddWallAsync(_userId, stageId, wall, _ct);

        // Assert
        result.IsSuccessful.Should().BeTrue();
        result.Value.Index.Should().Be(1);
    }

    [Fact]
    public async Task AddWallAsync_WithNonOwner_ReturnsForbidden() {
        // Arrange
        var stageId = Guid.CreateVersion7();
        var nonOwnerId = Guid.CreateVersion7();
        var stage = new Stage {
            Id = stageId,
            OwnerId = _userId,
            Name = "Stage",
        };
        var wall = new StageWall { Name = "New Wall" };
        _stageStorage.GetByIdAsync(stageId, Arg.Any<CancellationToken>()).Returns(stage);

        // Act
        var result = await _service.AddWallAsync(nonOwnerId, stageId, wall, _ct);

        // Assert
        result.IsSuccessful.Should().BeFalse();
        result.Errors.Should().ContainSingle().Which.Message.Should().Be("NotAllowed");
    }

    [Fact]
    public async Task UpdateWallAsync_WithOwner_UpdatesWall() {
        // Arrange
        var stageId = Guid.CreateVersion7();
        const ushort wallIndex = 0;
        var stage = new Stage {
            Id = stageId,
            OwnerId = _userId,
            Name = "Stage",
            Walls = [new() { Index = wallIndex, Name = "Original Wall" }],
        };
        var updatedWall = new StageWall { Name = "Updated Wall" };
        _stageStorage.GetByIdAsync(stageId, Arg.Any<CancellationToken>()).Returns(stage);

        // Act
        var result = await _service.UpdateWallAsync(_userId, stageId, wallIndex, updatedWall, _ct);

        // Assert
        result.IsSuccessful.Should().BeTrue();
        await _stageStorage.Received(1).UpdateAsync(Arg.Is<Stage>(s => s.Walls[0].Name == "Updated Wall"), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task UpdateWallAsync_WhenWallNotFound_ReturnsNotFound() {
        // Arrange
        var stageId = Guid.CreateVersion7();
        const ushort nonExistentIndex = 99;
        var stage = new Stage {
            Id = stageId,
            OwnerId = _userId,
            Name = "Stage",
            Walls = [new() { Index = 0, Name = "Existing Wall" }],
        };
        var updatedWall = new StageWall { Name = "Updated Wall" };
        _stageStorage.GetByIdAsync(stageId, Arg.Any<CancellationToken>()).Returns(stage);

        // Act
        var result = await _service.UpdateWallAsync(_userId, stageId, nonExistentIndex, updatedWall, _ct);

        // Assert
        result.IsSuccessful.Should().BeFalse();
        result.Errors.Should().ContainSingle().Which.Message.Should().Be("NotFound");
    }

    [Fact]
    public async Task RemoveWallAsync_WithOwner_RemovesWall() {
        // Arrange
        var stageId = Guid.CreateVersion7();
        const ushort wallIndex = 0;
        var stage = new Stage {
            Id = stageId,
            OwnerId = _userId,
            Name = "Stage",
            Walls = [new() { Index = wallIndex, Name = "Wall to Remove" }],
        };
        _stageStorage.GetByIdAsync(stageId, Arg.Any<CancellationToken>()).Returns(stage);

        // Act
        var result = await _service.RemoveWallAsync(_userId, stageId, wallIndex, _ct);

        // Assert
        result.IsSuccessful.Should().BeTrue();
        await _stageStorage.Received(1).UpdateAsync(Arg.Is<Stage>(s => s.Walls.Count == 0), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task RemoveWallAsync_WhenWallNotFound_ReturnsNotFound() {
        // Arrange
        var stageId = Guid.CreateVersion7();
        const ushort nonExistentIndex = 99;
        var stage = new Stage {
            Id = stageId,
            OwnerId = _userId,
            Name = "Stage",
            Walls = [new() { Index = 0, Name = "Existing Wall" }],
        };
        _stageStorage.GetByIdAsync(stageId, Arg.Any<CancellationToken>()).Returns(stage);

        // Act
        var result = await _service.RemoveWallAsync(_userId, stageId, nonExistentIndex, _ct);

        // Assert
        result.IsSuccessful.Should().BeFalse();
        result.Errors.Should().ContainSingle().Which.Message.Should().Be("NotFound");
    }

    // === Region Tests ===

    [Fact]
    public async Task AddRegionAsync_WithOwner_AddsRegion() {
        // Arrange
        var stageId = Guid.CreateVersion7();
        var stage = new Stage {
            Id = stageId,
            OwnerId = _userId,
            Name = "Stage",
            Regions = [],
        };
        var region = new StageRegion { Name = "New Region", Type = RegionType.Terrain };
        _stageStorage.GetByIdAsync(stageId, Arg.Any<CancellationToken>()).Returns(stage);

        // Act
        var result = await _service.AddRegionAsync(_userId, stageId, region, _ct);

        // Assert
        result.IsSuccessful.Should().BeTrue();
        result.Value.Name.Should().Be("New Region");
        result.Value.Index.Should().Be(0);
        await _stageStorage.Received(1).UpdateAsync(Arg.Is<Stage>(s => s.Regions.Count == 1), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task UpdateRegionAsync_WithOwner_UpdatesRegion() {
        // Arrange
        var stageId = Guid.CreateVersion7();
        const ushort regionIndex = 0;
        var stage = new Stage {
            Id = stageId,
            OwnerId = _userId,
            Name = "Stage",
            Regions = [new() { Index = regionIndex, Name = "Original Region" }],
        };
        var updatedRegion = new StageRegion { Name = "Updated Region" };
        _stageStorage.GetByIdAsync(stageId, Arg.Any<CancellationToken>()).Returns(stage);

        // Act
        var result = await _service.UpdateRegionAsync(_userId, stageId, regionIndex, updatedRegion, _ct);

        // Assert
        result.IsSuccessful.Should().BeTrue();
        await _stageStorage.Received(1).UpdateAsync(Arg.Is<Stage>(s => s.Regions[0].Name == "Updated Region"), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task RemoveRegionAsync_WithOwner_RemovesRegion() {
        // Arrange
        var stageId = Guid.CreateVersion7();
        const ushort regionIndex = 0;
        var stage = new Stage {
            Id = stageId,
            OwnerId = _userId,
            Name = "Stage",
            Regions = [new() { Index = regionIndex, Name = "Region to Remove" }],
        };
        _stageStorage.GetByIdAsync(stageId, Arg.Any<CancellationToken>()).Returns(stage);

        // Act
        var result = await _service.RemoveRegionAsync(_userId, stageId, regionIndex, _ct);

        // Assert
        result.IsSuccessful.Should().BeTrue();
        await _stageStorage.Received(1).UpdateAsync(Arg.Is<Stage>(s => s.Regions.Count == 0), Arg.Any<CancellationToken>());
    }

    // === AmbientLight Tests ===

    [Fact]
    public async Task AddLightAsync_WithOwner_AddsLight() {
        // Arrange
        var stageId = Guid.CreateVersion7();
        var stage = new Stage {
            Id = stageId,
            OwnerId = _userId,
            Name = "Stage",
            Lights = [],
        };
        var light = new StageLight { Name = "New AmbientLight", Type = LightSourceType.Artificial };
        _stageStorage.GetByIdAsync(stageId, Arg.Any<CancellationToken>()).Returns(stage);

        // Act
        var result = await _service.AddLightAsync(_userId, stageId, light, _ct);

        // Assert
        result.IsSuccessful.Should().BeTrue();
        result.Value.Name.Should().Be("New AmbientLight");
        result.Value.Index.Should().Be(0);
        await _stageStorage.Received(1).UpdateAsync(Arg.Is<Stage>(s => s.Lights.Count == 1), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task UpdateLightAsync_WithOwner_UpdatesLight() {
        // Arrange
        var stageId = Guid.CreateVersion7();
        const ushort lightIndex = 0;
        var stage = new Stage {
            Id = stageId,
            OwnerId = _userId,
            Name = "Stage",
            Lights = [new() { Index = lightIndex, Name = "Original AmbientLight" }],
        };
        var updatedLight = new StageLight { Name = "Updated AmbientLight" };
        _stageStorage.GetByIdAsync(stageId, Arg.Any<CancellationToken>()).Returns(stage);

        // Act
        var result = await _service.UpdateLightAsync(_userId, stageId, lightIndex, updatedLight, _ct);

        // Assert
        result.IsSuccessful.Should().BeTrue();
        await _stageStorage.Received(1).UpdateAsync(Arg.Is<Stage>(s => s.Lights[0].Name == "Updated AmbientLight"), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task RemoveLightAsync_WithOwner_RemovesLight() {
        // Arrange
        var stageId = Guid.CreateVersion7();
        const ushort lightIndex = 0;
        var stage = new Stage {
            Id = stageId,
            OwnerId = _userId,
            Name = "Stage",
            Lights = [new() { Index = lightIndex, Name = "AmbientLight to Remove" }],
        };
        _stageStorage.GetByIdAsync(stageId, Arg.Any<CancellationToken>()).Returns(stage);

        // Act
        var result = await _service.RemoveLightAsync(_userId, stageId, lightIndex, _ct);

        // Assert
        result.IsSuccessful.Should().BeTrue();
        await _stageStorage.Received(1).UpdateAsync(Arg.Is<Stage>(s => s.Lights.Count == 0), Arg.Any<CancellationToken>());
    }

    // === Decoration Tests ===

    [Fact]
    public async Task AddDecorationAsync_WithOwner_AddsDecoration() {
        // Arrange
        var stageId = Guid.CreateVersion7();
        var stage = new Stage {
            Id = stageId,
            OwnerId = _userId,
            Name = "Stage",
            Elements = [],
        };
        var decoration = new StageElement { Name = "New Decoration" };
        _stageStorage.GetByIdAsync(stageId, Arg.Any<CancellationToken>()).Returns(stage);

        // Act
        var result = await _service.AddDecorationAsync(_userId, stageId, decoration, _ct);

        // Assert
        result.IsSuccessful.Should().BeTrue();
        result.Value.Name.Should().Be("New Decoration");
        result.Value.Index.Should().Be(0);
        await _stageStorage.Received(1).UpdateAsync(Arg.Is<Stage>(s => s.Elements.Count == 1), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task UpdateDecorationAsync_WithOwner_UpdatesDecoration() {
        // Arrange
        var stageId = Guid.CreateVersion7();
        const ushort decorationIndex = 0;
        var stage = new Stage {
            Id = stageId,
            OwnerId = _userId,
            Name = "Stage",
            Elements = [new() { Index = decorationIndex, Name = "Original Decoration" }],
        };
        var updatedDecoration = new StageElement { Name = "Updated Decoration" };
        _stageStorage.GetByIdAsync(stageId, Arg.Any<CancellationToken>()).Returns(stage);

        // Act
        var result = await _service.UpdateDecorationAsync(_userId, stageId, decorationIndex, updatedDecoration, _ct);

        // Assert
        result.IsSuccessful.Should().BeTrue();
        await _stageStorage.Received(1).UpdateAsync(Arg.Is<Stage>(s => s.Elements[0].Name == "Updated Decoration"), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task RemoveDecorationAsync_WithOwner_RemovesDecoration() {
        // Arrange
        var stageId = Guid.CreateVersion7();
        const ushort decorationIndex = 0;
        var stage = new Stage {
            Id = stageId,
            OwnerId = _userId,
            Name = "Stage",
            Elements = [new() { Index = decorationIndex, Name = "Decoration to Remove" }],
        };
        _stageStorage.GetByIdAsync(stageId, Arg.Any<CancellationToken>()).Returns(stage);

        // Act
        var result = await _service.RemoveDecorationAsync(_userId, stageId, decorationIndex, _ct);

        // Assert
        result.IsSuccessful.Should().BeTrue();
        await _stageStorage.Received(1).UpdateAsync(Arg.Is<Stage>(s => s.Elements.Count == 0), Arg.Any<CancellationToken>());
    }

    // === Sound Tests ===

    [Fact]
    public async Task AddSoundAsync_WithOwner_AddsSound() {
        // Arrange
        var stageId = Guid.CreateVersion7();
        var stage = new Stage {
            Id = stageId,
            OwnerId = _userId,
            Name = "Stage",
            Sounds = [],
        };
        var sound = new StageSound { Name = "New Sound", Media = new() { Id = Guid.CreateVersion7(), Path = "test", FileName = "test.mp3", ContentType = "audio/mpeg", FileSize = 1000 } };
        _stageStorage.GetByIdAsync(stageId, Arg.Any<CancellationToken>()).Returns(stage);

        // Act
        var result = await _service.AddSoundAsync(_userId, stageId, sound, _ct);

        // Assert
        result.IsSuccessful.Should().BeTrue();
        result.Value.Name.Should().Be("New Sound");
        result.Value.Index.Should().Be(0);
        await _stageStorage.Received(1).UpdateAsync(Arg.Is<Stage>(s => s.Sounds.Count == 1), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task UpdateSoundAsync_WithOwner_UpdatesSound() {
        // Arrange
        var stageId = Guid.CreateVersion7();
        const ushort soundIndex = 0;
        var stage = new Stage {
            Id = stageId,
            OwnerId = _userId,
            Name = "Stage",
            Sounds = [new() { Index = soundIndex, Name = "Original Sound" }],
        };
        var updatedSound = new StageSound { Name = "Updated Sound" };
        _stageStorage.GetByIdAsync(stageId, Arg.Any<CancellationToken>()).Returns(stage);

        // Act
        var result = await _service.UpdateSoundAsync(_userId, stageId, soundIndex, updatedSound, _ct);

        // Assert
        result.IsSuccessful.Should().BeTrue();
        await _stageStorage.Received(1).UpdateAsync(Arg.Is<Stage>(s => s.Sounds[0].Name == "Updated Sound"), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task RemoveSoundAsync_WithOwner_RemovesSound() {
        // Arrange
        var stageId = Guid.CreateVersion7();
        const ushort soundIndex = 0;
        var stage = new Stage {
            Id = stageId,
            OwnerId = _userId,
            Name = "Stage",
            Sounds = [new() { Index = soundIndex, Name = "Sound to Remove" }],
        };
        _stageStorage.GetByIdAsync(stageId, Arg.Any<CancellationToken>()).Returns(stage);

        // Act
        var result = await _service.RemoveSoundAsync(_userId, stageId, soundIndex, _ct);

        // Assert
        result.IsSuccessful.Should().BeTrue();
        await _stageStorage.Received(1).UpdateAsync(Arg.Is<Stage>(s => s.Sounds.Count == 0), Arg.Any<CancellationToken>());
    }
}