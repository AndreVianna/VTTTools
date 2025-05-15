namespace VttTools.Library.Handlers;

public class AdventureHandlersTests {
    private readonly IAdventureService _adventureService = Substitute.For<IAdventureService>();
    private readonly HttpContext _httpContext = Substitute.For<HttpContext>();
    private readonly ClaimsPrincipal _user = Substitute.For<ClaimsPrincipal>();
    private static readonly Guid _userId = Guid.NewGuid();

    public AdventureHandlersTests() {
        // Setup user claims
        var claim = new Claim(ClaimTypes.NameIdentifier, _userId.ToString());
        var claims = new List<Claim> { claim };
        _user.Claims.Returns(claims);
        _user.FindFirst(ClaimTypes.NameIdentifier).Returns(claim);
        _httpContext.User.Returns(_user);
    }

    [Fact]
    public async Task GetAdventuresHandler_ReturnsOkResult() {
        // Arrange
        var adventures = new[] {
            new Adventure { Id = Guid.NewGuid(), Name = "Adventure 1", OwnerId = _userId },
            new Adventure { Id = Guid.NewGuid(), Name = "Adventure 2", OwnerId = _userId },
        };

        _adventureService.GetAdventuresAsync(Arg.Any<CancellationToken>())
            .Returns(adventures);

        // Act
        var result = await AdventureHandlers.GetAdventuresHandler(_adventureService);

        // Assert
        var response = result.Should().BeOfType<Ok<Adventure[]>>().Subject;
        response.Value.Should().BeEquivalentTo(adventures);
    }

    [Fact]
    public async Task GetAdventureByIdHandler_WithExistingId_ReturnsOkResult() {
        // Arrange
        var adventureId = Guid.NewGuid();
        var adventure = new Adventure { Id = adventureId, Name = "Test Adventure", OwnerId = _userId };

        _adventureService.GetAdventureByIdAsync(adventureId, Arg.Any<CancellationToken>())
            .Returns(adventure);

        // Act
        var result = await AdventureHandlers.GetAdventureByIdHandler(adventureId, _adventureService);

        // Assert
        var response = result.Should().BeOfType<Ok<Adventure>>().Subject;
        response.Value.Should().BeEquivalentTo(adventure);
    }

    [Fact]
    public async Task GetAdventureByIdHandler_WithNonExistingId_ReturnsNotFound() {
        // Arrange
        var adventureId = Guid.NewGuid();

        _adventureService.GetAdventureByIdAsync(adventureId, Arg.Any<CancellationToken>())
            .Returns((Adventure?)null);

        // Act
        var result = await AdventureHandlers.GetAdventureByIdHandler(adventureId, _adventureService);

        // Assert
        result.Should().BeOfType<NotFound>();
    }

    [Fact]
    public async Task CreateAdventureHandler_WithValidRequest_ReturnsCreatedResult() {
        // Arrange
        var request = new CreateAdventureRequest { Name = "New Adventure" };
        var adventure = new Adventure { Id = Guid.NewGuid(), Name = "New Adventure", OwnerId = _userId };

        _adventureService.CreateAdventureAsync(_userId, Arg.Any<CreateAdventureData>(), Arg.Any<CancellationToken>())
            .Returns(adventure);

        // Act
        var result = await AdventureHandlers.CreateAdventureHandler(_httpContext, request, _adventureService);

        // Assert
        var response = result.Should().BeOfType<Created<Adventure>>().Subject;
        response.Location.Should().Be($"/api/adventures/{adventure.Id}");
        response.Value.Should().BeEquivalentTo(adventure);
    }

    [Fact]
    public async Task CreateAdventureHandler_WithInvalidRequest_ReturnsBadRequest() {
        // Arrange
        var request = new CreateAdventureRequest { Name = "New Adventure" };

        _adventureService.CreateAdventureAsync(_userId, Arg.Any<CreateAdventureData>(), Arg.Any<CancellationToken>())
            .Returns(Result.Failure("Some error."));

        // Act
        var result = await AdventureHandlers.CreateAdventureHandler(_httpContext, request, _adventureService);

        // Assert
        result.Should().BeOfType<BadRequest>();
    }

    [Fact]
    public async Task UpdateAdventureHandler_WithValidRequest_ReturnsOkResult() {
        // Arrange
        var adventureId = Guid.NewGuid();
        var request = new UpdateAdventureRequest { Name = "Updated Adventure" };
        var adventure = new Adventure { Id = adventureId, Name = "Updated Adventure", OwnerId = _userId };

        _adventureService.UpdateAdventureAsync(_userId, adventureId, Arg.Any<UpdateAdventureData>(), Arg.Any<CancellationToken>())
            .Returns(adventure);

        // Act
        var result = await AdventureHandlers.UpdateAdventureHandler(_httpContext, adventureId, request, _adventureService);

        // Assert
        var response = result.Should().BeOfType<Ok<Adventure>>().Subject;
        response.Value.Should().BeEquivalentTo(adventure);
    }

    [Fact]
    public async Task UpdateAdventureHandler_WithNonExistingId_ReturnsNotFound() {
        // Arrange
        var adventureId = Guid.NewGuid();
        var request = new UpdateAdventureRequest { Name = "Updated Adventure" };

        _adventureService.UpdateAdventureAsync(_userId, adventureId, Arg.Any<UpdateAdventureData>(), Arg.Any<CancellationToken>())
            .Returns(Result.Failure("Some error."));

        // Act
        var result = await AdventureHandlers.UpdateAdventureHandler(_httpContext, adventureId, request, _adventureService);

        // Assert
        result.Should().BeOfType<NotFound>();
    }

    [Fact]
    public async Task DeleteAdventureHandler_WithExistingId_ReturnsNoContent() {
        // Arrange
        var adventureId = Guid.NewGuid();

        _adventureService.DeleteAdventureAsync(_userId, adventureId, Arg.Any<CancellationToken>())
            .Returns(Result.Success());

        // Act
        var result = await AdventureHandlers.DeleteAdventureHandler(_httpContext, adventureId, _adventureService);

        // Assert
        result.Should().BeOfType<NoContent>();
    }

    [Fact]
    public async Task DeleteAdventureHandler_WithNonExistingId_ReturnsNotFound() {
        // Arrange
        var adventureId = Guid.NewGuid();

        _adventureService.DeleteAdventureAsync(_userId, adventureId, Arg.Any<CancellationToken>())
            .Returns(Result.Failure("NotFound"));

        // Act
        var result = await AdventureHandlers.DeleteAdventureHandler(_httpContext, adventureId, _adventureService);

        // Assert
        result.Should().BeOfType<NotFound>();
    }

    [Fact]
    public async Task CloneAdventureHandler_WithExistingId_ReturnsCreatedResult() {
        // Arrange
        var adventureId = Guid.NewGuid();
        var clonedAdventure = new Adventure {
            Id = Guid.NewGuid(),
            Name = "Cloned Adventure",
            OwnerId = _userId,
        };
        var request = new CloneAdventureRequest();

        _adventureService.CloneAdventureAsync(_userId, Arg.Any<CloneAdventureData>(), Arg.Any<CancellationToken>())
            .Returns(clonedAdventure);

        // Act
        var result = await AdventureHandlers.CloneAdventureHandler(_httpContext, adventureId, request, _adventureService);

        // Assert
        var response = result.Should().BeOfType<Created<Adventure>>().Subject;
        response.Location.Should().Be($"/api/adventures/{clonedAdventure.Id}");
        response.Value.Should().Be(clonedAdventure);
    }

    [Fact]
    public async Task CloneAdventureHandler_WithNonExistingId_ReturnsNotFound() {
        // Arrange
        var adventureId = Guid.NewGuid();
        var request = new CloneAdventureRequest();

        _adventureService.CloneAdventureAsync(_userId, Arg.Any<CloneAdventureData>(), Arg.Any<CancellationToken>())
            .Returns(Result.Failure("Some error."));

        // Act
        var result = await AdventureHandlers.CloneAdventureHandler(_httpContext, adventureId, request, _adventureService);

        // Assert
        result.Should().BeOfType<NotFound>();
    }

    [Fact]
    public async Task GetScenesHandler_ReturnsOkResult() {
        // Arrange
        var adventureId = Guid.NewGuid();
        var scenes = new[] {
            new Scene { Id = Guid.NewGuid(), Name = "Scene 1", AdventureId = adventureId },
            new Scene { Id = Guid.NewGuid(), Name = "Scene 2", AdventureId = adventureId },
        };

        _adventureService.GetScenesAsync(adventureId, Arg.Any<CancellationToken>())
            .Returns(scenes);

        // Act
        var result = await AdventureHandlers.GetScenesHandler(adventureId, _adventureService);

        // Assert
        var response = result.Should().BeOfType<Ok<Scene[]>>().Subject;
        response.Value.Should().BeEquivalentTo(scenes);
    }

    [Fact]
    public async Task AddSceneHandler_WithValidRequest_ReturnsCreatedResult() {
        // Arrange
        var adventureId = Guid.NewGuid();
        var request = new AddClonedSceneRequest();
        var clonedScene = new Scene {
            Id = Guid.NewGuid(),
            Name = "Cloned Adventure",
            OwnerId = _userId,
        };

        _adventureService.AddClonedSceneAsync(_userId, adventureId, Arg.Any<AddClonedSceneData>(), Arg.Any<CancellationToken>())
            .Returns(clonedScene);

        // Act
        var result = await AdventureHandlers.AddClonedSceneHandler(_httpContext, adventureId, request, _adventureService);

        // Assert
        result.Should().BeOfType<NoContent>();
    }

    [Fact]
    public async Task AddSceneHandler_WithInvalidScene_ReturnsBadRequest() {
        // Arrange
        var adventureId = Guid.NewGuid();
        var request = new AddClonedSceneRequest();

        _adventureService.AddClonedSceneAsync(_userId, adventureId, Arg.Any<AddClonedSceneData>(), Arg.Any<CancellationToken>())
            .Returns(Result.Failure("Some error."));

        // Act
        var result = await AdventureHandlers.AddClonedSceneHandler(_httpContext, adventureId, request, _adventureService);

        // Assert
        result.Should().BeOfType<BadRequest>();
    }

    [Fact]
    public async Task RemoveSceneHandler_WithValidRequest_ReturnsCreatedResult() {
        // Arrange
        var adventureId = Guid.NewGuid();
        var sceneId = Guid.NewGuid();

        _adventureService.RemoveSceneAsync(_userId, adventureId, sceneId, Arg.Any<CancellationToken>())
            .Returns(Result.Success());

        // Act
        var result = await AdventureHandlers.RemoveSceneHandler(_httpContext, adventureId, sceneId, _adventureService);

        // Assert
        result.Should().BeOfType<NoContent>();
    }

    [Fact]
    public async Task RemoveSceneHandler_WithInvalidScene_ReturnsBadRequest() {
        // Arrange
        var adventureId = Guid.NewGuid();
        var sceneId = Guid.NewGuid();

        _adventureService.RemoveSceneAsync(_userId, adventureId, sceneId, Arg.Any<CancellationToken>())
            .Returns(Result.Failure("NotFound"));

        // Act
        var result = await AdventureHandlers.RemoveSceneHandler(_httpContext, adventureId, sceneId, _adventureService);

        // Assert
        result.Should().BeOfType<NotFound>();
    }
}