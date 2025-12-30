namespace VttTools.Library.Handlers;

public class StageHandlersTests {
    private readonly IStageStorage _stageStorage = Substitute.For<IStageStorage>();
    private readonly StageService _stageService;
    private readonly HttpContext _httpContext = Substitute.For<HttpContext>();
    private readonly ClaimsPrincipal _user = Substitute.For<ClaimsPrincipal>();
    private static readonly Guid _userId = Guid.CreateVersion7();

    public StageHandlersTests() {
        _stageService = new(_stageStorage);

        // Setup user claims
        var claim = new Claim(ClaimTypes.NameIdentifier, _userId.ToString());
        var claims = new List<Claim> { claim };
        _user.Claims.Returns(claims);
        _user.FindFirst(ClaimTypes.NameIdentifier).Returns(claim);
        _httpContext.User.Returns(_user);
    }

    // === GetStagesHandler Tests ===

    [Fact]
    public async Task GetStagesHandler_ReturnsOkResult() {
        // Arrange
        var stages = new[] {
            new Stage { Id = Guid.CreateVersion7(), Name = "Stage 1" },
            new Stage { Id = Guid.CreateVersion7(), Name = "Stage 2" },
        };
        _stageStorage.GetAllAsync(Arg.Any<CancellationToken>())
            .Returns(stages);

        // Act
        var result = await StageHandlers.GetStagesHandler(_stageService);

        // Assert
        var response = result.Should().BeOfType<Ok<Stage[]>>().Subject;
        response.Value.Should().BeEquivalentTo(stages);
    }

    // === GetStageByIdHandler Tests ===

    [Fact]
    public async Task GetStageByIdHandler_WithExistingId_ReturnsOkResult() {
        // Arrange
        var stageId = Guid.CreateVersion7();
        var stage = new Stage { Id = stageId, Name = "Test Stage" };
        _stageStorage.GetByIdAsync(stageId, Arg.Any<CancellationToken>())
            .Returns(stage);

        // Act
        var result = await StageHandlers.GetStageByIdHandler(stageId, _stageService);

        // Assert
        var response = result.Should().BeOfType<Ok<Stage>>().Subject;
        response.Value.Should().BeEquivalentTo(stage);
    }

    [Fact]
    public async Task GetStageByIdHandler_WithNonExistingId_ReturnsNotFound() {
        // Arrange
        var stageId = Guid.CreateVersion7();
        _stageStorage.GetByIdAsync(stageId, Arg.Any<CancellationToken>())
            .Returns((Stage?)null);

        // Act
        var result = await StageHandlers.GetStageByIdHandler(stageId, _stageService);

        // Assert
        result.Should().BeOfType<NotFound>();
    }

    // === CreateStageHandler Tests ===

    [Fact]
    public async Task CreateStageHandler_WithValidRequest_ReturnsCreatedResult() {
        // Arrange
        var request = new CreateStageRequest {
            Name = "New Stage",
            Description = "Stage Description",
        };

        // Act
        var result = await StageHandlers.CreateStageHandler(_httpContext, request, _stageService);

        // Assert
        var response = result.Should().BeOfType<Created<Stage>>().Subject;
        response.Value!.Name.Should().Be("New Stage");
        response.Value.OwnerId.Should().Be(_userId);
        await _stageStorage.Received(1).AddAsync(Arg.Any<Stage>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task CreateStageHandler_WithInvalidRequest_ReturnsValidationProblem() {
        // Arrange
        var request = new CreateStageRequest {
            Name = "",
            Description = "",
        };

        // Act
        var result = await StageHandlers.CreateStageHandler(_httpContext, request, _stageService);

        // Assert
        result.Should().BeOfType<ProblemHttpResult>();
        await _stageStorage.DidNotReceive().AddAsync(Arg.Any<Stage>(), Arg.Any<CancellationToken>());
    }

    // === CloneStageHandler Tests ===

    [Fact]
    public async Task CloneStageHandler_WithValidId_ReturnsCreatedResult() {
        // Arrange
        var templateId = Guid.CreateVersion7();
        var template = new Stage {
            Id = templateId,
            OwnerId = _userId,
            Name = "Template Stage",
            Description = "Template Description",
        };
        _stageStorage.GetByIdAsync(templateId, Arg.Any<CancellationToken>())
            .Returns(template);

        // Act
        var result = await StageHandlers.CloneStageHandler(_httpContext, templateId, _stageService);

        // Assert
        var response = result.Should().BeOfType<Created<Stage>>().Subject;
        response.Value!.Name.Should().Be("Template Stage (Copy)");
        response.Value.OwnerId.Should().Be(_userId);
        await _stageStorage.Received(1).AddAsync(Arg.Any<Stage>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task CloneStageHandler_WhenNotFound_ReturnsNotFound() {
        // Arrange
        var templateId = Guid.CreateVersion7();
        _stageStorage.GetByIdAsync(templateId, Arg.Any<CancellationToken>())
            .Returns((Stage?)null);

        // Act
        var result = await StageHandlers.CloneStageHandler(_httpContext, templateId, _stageService);

        // Assert
        result.Should().BeOfType<NotFound>();
    }

    [Fact]
    public async Task CloneStageHandler_WhenNotAllowed_ReturnsForbid() {
        // Arrange
        var templateId = Guid.CreateVersion7();
        var otherUserId = Guid.CreateVersion7();
        var template = new Stage {
            Id = templateId,
            OwnerId = otherUserId,
            Name = "Private Template",
            IsPublished = false,
            IsPublic = false,
        };
        _stageStorage.GetByIdAsync(templateId, Arg.Any<CancellationToken>())
            .Returns(template);

        // Act
        var result = await StageHandlers.CloneStageHandler(_httpContext, templateId, _stageService);

        // Assert
        result.Should().BeOfType<ForbidHttpResult>();
    }

    // === UpdateStageHandler Tests ===

    [Fact]
    public async Task UpdateStageHandler_WithValidRequest_ReturnsNoContent() {
        // Arrange
        var stageId = Guid.CreateVersion7();
        var existingStage = new Stage {
            Id = stageId,
            OwnerId = _userId,
            Name = "Old Name",
            Description = "Old Description",
        };
        var request = new UpdateStageRequest {
            Name = "Updated Stage",
        };
        _stageStorage.GetByIdAsync(stageId, Arg.Any<CancellationToken>())
            .Returns(existingStage);

        // Act
        var result = await StageHandlers.UpdateStageHandler(_httpContext, stageId, request, _stageService);

        // Assert
        result.Should().BeOfType<NoContent>();
        await _stageStorage.Received(1).UpdateAsync(Arg.Any<Stage>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task UpdateStageHandler_WhenNotFound_ReturnsNotFound() {
        // Arrange
        var stageId = Guid.CreateVersion7();
        var request = new UpdateStageRequest {
            Name = "Updated Stage",
        };
        _stageStorage.GetByIdAsync(stageId, Arg.Any<CancellationToken>())
            .Returns((Stage?)null);

        // Act
        var result = await StageHandlers.UpdateStageHandler(_httpContext, stageId, request, _stageService);

        // Assert
        result.Should().BeOfType<NotFound>();
    }

    [Fact]
    public async Task UpdateStageHandler_WhenNotAllowed_ReturnsForbid() {
        // Arrange
        var stageId = Guid.CreateVersion7();
        var otherUserId = Guid.CreateVersion7();
        var existingStage = new Stage {
            Id = stageId,
            OwnerId = otherUserId,
            Name = "Stage",
        };
        var request = new UpdateStageRequest {
            Name = "Updated Stage",
        };
        _stageStorage.GetByIdAsync(stageId, Arg.Any<CancellationToken>())
            .Returns(existingStage);

        // Act
        var result = await StageHandlers.UpdateStageHandler(_httpContext, stageId, request, _stageService);

        // Assert
        result.Should().BeOfType<ForbidHttpResult>();
    }

    // === DeleteStageHandler Tests ===

    [Fact]
    public async Task DeleteStageHandler_WithValidRequest_ReturnsNoContent() {
        // Arrange
        var stageId = Guid.CreateVersion7();
        var existingStage = new Stage {
            Id = stageId,
            OwnerId = _userId,
            Name = "Stage",
        };
        _stageStorage.GetByIdAsync(stageId, Arg.Any<CancellationToken>())
            .Returns(existingStage);

        // Act
        var result = await StageHandlers.DeleteStageHandler(_httpContext, stageId, _stageService);

        // Assert
        result.Should().BeOfType<NoContent>();
        await _stageStorage.Received(1).DeleteAsync(stageId, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task DeleteStageHandler_WhenNotFound_ReturnsNotFound() {
        // Arrange
        var stageId = Guid.CreateVersion7();
        _stageStorage.GetByIdAsync(stageId, Arg.Any<CancellationToken>())
            .Returns((Stage?)null);

        // Act
        var result = await StageHandlers.DeleteStageHandler(_httpContext, stageId, _stageService);

        // Assert
        result.Should().BeOfType<NotFound>();
    }

    [Fact]
    public async Task DeleteStageHandler_WhenNotAllowed_ReturnsForbid() {
        // Arrange
        var stageId = Guid.CreateVersion7();
        var otherUserId = Guid.CreateVersion7();
        var existingStage = new Stage {
            Id = stageId,
            OwnerId = otherUserId,
            Name = "Stage",
        };
        _stageStorage.GetByIdAsync(stageId, Arg.Any<CancellationToken>())
            .Returns(existingStage);

        // Act
        var result = await StageHandlers.DeleteStageHandler(_httpContext, stageId, _stageService);

        // Assert
        result.Should().BeOfType<ForbidHttpResult>();
    }

    // === Wall Handler Tests ===

    [Fact]
    public async Task AddWallHandler_WithValidRequest_ReturnsOkResult() {
        // Arrange
        var stageId = Guid.CreateVersion7();
        var existingStage = new Stage {
            Id = stageId,
            OwnerId = _userId,
            Name = "Stage",
            Walls = [],
        };
        var wall = new StageWall { Name = "New Wall" };
        _stageStorage.GetByIdAsync(stageId, Arg.Any<CancellationToken>())
            .Returns(existingStage);

        // Act
        var result = await StageHandlers.AddWallHandler(_httpContext, stageId, wall, _stageService);

        // Assert
        var response = result.Should().BeOfType<Created<StageWall>>().Subject;
        response.Value!.Name.Should().Be("New Wall");
        response.Value.Index.Should().Be(0);
        await _stageStorage.Received(1).UpdateAsync(Arg.Any<Stage>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task AddWallHandler_WhenNotFound_ReturnsNotFound() {
        // Arrange
        var stageId = Guid.CreateVersion7();
        var wall = new StageWall { Name = "New Wall" };
        _stageStorage.GetByIdAsync(stageId, Arg.Any<CancellationToken>())
            .Returns((Stage?)null);

        // Act
        var result = await StageHandlers.AddWallHandler(_httpContext, stageId, wall, _stageService);

        // Assert
        result.Should().BeOfType<NotFound>();
    }

    [Fact]
    public async Task UpdateWallHandler_WithValidRequest_ReturnsNoContent() {
        // Arrange
        var stageId = Guid.CreateVersion7();
        const int index = 0;
        var existingStage = new Stage {
            Id = stageId,
            OwnerId = _userId,
            Name = "Stage",
            Walls = [new() { Index = 0, Name = "Original Wall" }],
        };
        var wall = new StageWall { Name = "Updated Wall" };
        _stageStorage.GetByIdAsync(stageId, Arg.Any<CancellationToken>())
            .Returns(existingStage);

        // Act
        var result = await StageHandlers.UpdateWallHandler(_httpContext, stageId, index, wall, _stageService);

        // Assert
        result.Should().BeOfType<NoContent>();
        await _stageStorage.Received(1).UpdateAsync(Arg.Any<Stage>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task RemoveWallHandler_WithValidRequest_ReturnsNoContent() {
        // Arrange
        var stageId = Guid.CreateVersion7();
        const int index = 0;
        var existingStage = new Stage {
            Id = stageId,
            OwnerId = _userId,
            Name = "Stage",
            Walls = [new() { Index = 0, Name = "Wall to Remove" }],
        };
        _stageStorage.GetByIdAsync(stageId, Arg.Any<CancellationToken>())
            .Returns(existingStage);

        // Act
        var result = await StageHandlers.RemoveWallHandler(_httpContext, stageId, index, _stageService);

        // Assert
        result.Should().BeOfType<NoContent>();
        await _stageStorage.Received(1).UpdateAsync(Arg.Any<Stage>(), Arg.Any<CancellationToken>());
    }

    // === Region Handler Tests ===

    [Fact]
    public async Task AddRegionHandler_WithValidRequest_ReturnsOkResult() {
        // Arrange
        var stageId = Guid.CreateVersion7();
        var existingStage = new Stage {
            Id = stageId,
            OwnerId = _userId,
            Name = "Stage",
            Regions = [],
        };
        var region = new StageRegion { Name = "New Region" };
        _stageStorage.GetByIdAsync(stageId, Arg.Any<CancellationToken>())
            .Returns(existingStage);

        // Act
        var result = await StageHandlers.AddRegionHandler(_httpContext, stageId, region, _stageService);

        // Assert
        var response = result.Should().BeOfType<Created<StageRegion>>().Subject;
        response.Value!.Name.Should().Be("New Region");
    }

    [Fact]
    public async Task UpdateRegionHandler_WithValidRequest_ReturnsNoContent() {
        // Arrange
        var stageId = Guid.CreateVersion7();
        const int index = 0;
        var existingStage = new Stage {
            Id = stageId,
            OwnerId = _userId,
            Name = "Stage",
            Regions = [new() { Index = 0, Name = "Original Region" }],
        };
        var region = new StageRegion { Name = "Updated Region" };
        _stageStorage.GetByIdAsync(stageId, Arg.Any<CancellationToken>())
            .Returns(existingStage);

        // Act
        var result = await StageHandlers.UpdateRegionHandler(_httpContext, stageId, index, region, _stageService);

        // Assert
        result.Should().BeOfType<NoContent>();
    }

    [Fact]
    public async Task RemoveRegionHandler_WithValidRequest_ReturnsNoContent() {
        // Arrange
        var stageId = Guid.CreateVersion7();
        const int index = 0;
        var existingStage = new Stage {
            Id = stageId,
            OwnerId = _userId,
            Name = "Stage",
            Regions = [new() { Index = 0, Name = "Region to Remove" }],
        };
        _stageStorage.GetByIdAsync(stageId, Arg.Any<CancellationToken>())
            .Returns(existingStage);

        // Act
        var result = await StageHandlers.RemoveRegionHandler(_httpContext, stageId, index, _stageService);

        // Assert
        result.Should().BeOfType<NoContent>();
    }

    // === AmbientLight Handler Tests ===

    [Fact]
    public async Task AddLightHandler_WithValidRequest_ReturnsOkResult() {
        // Arrange
        var stageId = Guid.CreateVersion7();
        var existingStage = new Stage {
            Id = stageId,
            OwnerId = _userId,
            Name = "Stage",
            Lights = [],
        };
        var light = new StageLight { Name = "New AmbientLight" };
        _stageStorage.GetByIdAsync(stageId, Arg.Any<CancellationToken>())
            .Returns(existingStage);

        // Act
        var result = await StageHandlers.AddLightHandler(_httpContext, stageId, light, _stageService);

        // Assert
        var response = result.Should().BeOfType<Created<StageLight>>().Subject;
        response.Value!.Name.Should().Be("New AmbientLight");
    }

    [Fact]
    public async Task UpdateLightHandler_WithValidRequest_ReturnsNoContent() {
        // Arrange
        var stageId = Guid.CreateVersion7();
        const int index = 0;
        var existingStage = new Stage {
            Id = stageId,
            OwnerId = _userId,
            Name = "Stage",
            Lights = [new() { Index = 0, Name = "Original AmbientLight" }],
        };
        var light = new StageLight { Name = "Updated AmbientLight" };
        _stageStorage.GetByIdAsync(stageId, Arg.Any<CancellationToken>())
            .Returns(existingStage);

        // Act
        var result = await StageHandlers.UpdateLightHandler(_httpContext, stageId, index, light, _stageService);

        // Assert
        result.Should().BeOfType<NoContent>();
    }

    [Fact]
    public async Task RemoveLightHandler_WithValidRequest_ReturnsNoContent() {
        // Arrange
        var stageId = Guid.CreateVersion7();
        const int index = 0;
        var existingStage = new Stage {
            Id = stageId,
            OwnerId = _userId,
            Name = "Stage",
            Lights = [new() { Index = 0, Name = "AmbientLight to Remove" }],
        };
        _stageStorage.GetByIdAsync(stageId, Arg.Any<CancellationToken>())
            .Returns(existingStage);

        // Act
        var result = await StageHandlers.RemoveLightHandler(_httpContext, stageId, index, _stageService);

        // Assert
        result.Should().BeOfType<NoContent>();
    }

    // === Decoration Handler Tests ===

    [Fact]
    public async Task AddDecorationHandler_WithValidRequest_ReturnsOkResult() {
        // Arrange
        var stageId = Guid.CreateVersion7();
        var existingStage = new Stage {
            Id = stageId,
            OwnerId = _userId,
            Name = "Stage",
            Elements = [],
        };
        var decoration = new StageElement { Name = "New Decoration" };
        _stageStorage.GetByIdAsync(stageId, Arg.Any<CancellationToken>())
            .Returns(existingStage);

        // Act
        var result = await StageHandlers.AddDecorationHandler(_httpContext, stageId, decoration, _stageService);

        // Assert
        var response = result.Should().BeOfType<Created<StageElement>>().Subject;
        response.Value!.Name.Should().Be("New Decoration");
    }

    [Fact]
    public async Task UpdateDecorationHandler_WithValidRequest_ReturnsNoContent() {
        // Arrange
        var stageId = Guid.CreateVersion7();
        const int index = 0;
        var existingStage = new Stage {
            Id = stageId,
            OwnerId = _userId,
            Name = "Stage",
            Elements = [new() { Index = 0, Name = "Original Decoration" }],
        };
        var decoration = new StageElement { Name = "Updated Decoration" };
        _stageStorage.GetByIdAsync(stageId, Arg.Any<CancellationToken>())
            .Returns(existingStage);

        // Act
        var result = await StageHandlers.UpdateDecorationHandler(_httpContext, stageId, index, decoration, _stageService);

        // Assert
        result.Should().BeOfType<NoContent>();
    }

    [Fact]
    public async Task RemoveDecorationHandler_WithValidRequest_ReturnsNoContent() {
        // Arrange
        var stageId = Guid.CreateVersion7();
        const int index = 0;
        var existingStage = new Stage {
            Id = stageId,
            OwnerId = _userId,
            Name = "Stage",
            Elements = [new() { Index = 0, Name = "Decoration to Remove" }],
        };
        _stageStorage.GetByIdAsync(stageId, Arg.Any<CancellationToken>())
            .Returns(existingStage);

        // Act
        var result = await StageHandlers.RemoveDecorationHandler(_httpContext, stageId, index, _stageService);

        // Assert
        result.Should().BeOfType<NoContent>();
    }

    // === Sound Handler Tests ===

    [Fact]
    public async Task AddSoundHandler_WithValidRequest_ReturnsOkResult() {
        // Arrange
        var stageId = Guid.CreateVersion7();
        var existingStage = new Stage {
            Id = stageId,
            OwnerId = _userId,
            Name = "Stage",
            Sounds = [],
        };
        var sound = new StageSound { Name = "New Sound" };
        _stageStorage.GetByIdAsync(stageId, Arg.Any<CancellationToken>())
            .Returns(existingStage);

        // Act
        var result = await StageHandlers.AddSoundHandler(_httpContext, stageId, sound, _stageService);

        // Assert
        var response = result.Should().BeOfType<Created<StageSound>>().Subject;
        response.Value!.Name.Should().Be("New Sound");
    }

    [Fact]
    public async Task UpdateSoundHandler_WithValidRequest_ReturnsNoContent() {
        // Arrange
        var stageId = Guid.CreateVersion7();
        const int index = 0;
        var existingStage = new Stage {
            Id = stageId,
            OwnerId = _userId,
            Name = "Stage",
            Sounds = [new() { Index = 0, Name = "Original Sound" }],
        };
        var sound = new StageSound { Name = "Updated Sound" };
        _stageStorage.GetByIdAsync(stageId, Arg.Any<CancellationToken>())
            .Returns(existingStage);

        // Act
        var result = await StageHandlers.UpdateSoundHandler(_httpContext, stageId, index, sound, _stageService);

        // Assert
        result.Should().BeOfType<NoContent>();
    }

    [Fact]
    public async Task RemoveSoundHandler_WithValidRequest_ReturnsNoContent() {
        // Arrange
        var stageId = Guid.CreateVersion7();
        const int index = 0;
        var existingStage = new Stage {
            Id = stageId,
            OwnerId = _userId,
            Name = "Stage",
            Sounds = [new() { Index = 0, Name = "Sound to Remove" }],
        };
        _stageStorage.GetByIdAsync(stageId, Arg.Any<CancellationToken>())
            .Returns(existingStage);

        // Act
        var result = await StageHandlers.RemoveSoundHandler(_httpContext, stageId, index, _stageService);

        // Assert
        result.Should().BeOfType<NoContent>();
    }
}
