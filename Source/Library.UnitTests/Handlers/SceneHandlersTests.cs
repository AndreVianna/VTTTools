namespace VttTools.Library.Handlers;

public class SceneHandlersTests {
    private readonly ISceneService _sceneService = Substitute.For<ISceneService>();
    private readonly HttpContext _httpContext = Substitute.For<HttpContext>();
    private readonly ClaimsPrincipal _user = Substitute.For<ClaimsPrincipal>();
    private static readonly Guid _userId = Guid.CreateVersion7();

    public SceneHandlersTests() {
        // Setup user claims
        var claim = new Claim(ClaimTypes.NameIdentifier, _userId.ToString());
        var claims = new List<Claim> { claim };
        _user.Claims.Returns(claims);
        _user.FindFirst(ClaimTypes.NameIdentifier).Returns(claim);
        _httpContext.User.Returns(_user);
    }

    [Fact]
    public async Task GetScenesHandler_ReturnsOkResult() {
        // Arrange
        var scenes = new[] {
            new Scene { Id = Guid.CreateVersion7(), Name = "Scene 1" },
            new Scene { Id = Guid.CreateVersion7(), Name = "Scene 2" },
        };

        _sceneService.GetScenesAsync(Arg.Any<CancellationToken>())
            .Returns(scenes);

        // Act
        var result = await SceneHandlers.GetScenesHandler(_sceneService);

        // Assert
        var response = result.Should().BeOfType<Ok<Scene[]>>().Subject;
        response.Value.Should().BeEquivalentTo(scenes);
    }

    [Fact]
    public async Task GetSceneByIdHandler_WithExistingId_ReturnsOkResult() {
        // Arrange
        var sceneId = Guid.CreateVersion7();
        var scene = new Scene { Id = sceneId, Name = "Test Scene" };

        _sceneService.GetSceneByIdAsync(sceneId, Arg.Any<CancellationToken>())
            .Returns(scene);

        // Act
        var result = await SceneHandlers.GetSceneByIdHandler(sceneId, _sceneService);

        // Assert
        var response = result.Should().BeOfType<Ok<Scene>>().Subject;
        response.Value.Should().BeEquivalentTo(scene);
    }

    [Fact]
    public async Task GetSceneByIdHandler_WithNonExistingId_ReturnsNotFound() {
        // Arrange
        var sceneId = Guid.CreateVersion7();

        _sceneService.GetSceneByIdAsync(sceneId, Arg.Any<CancellationToken>())
            .Returns((Scene?)null);

        // Act
        var result = await SceneHandlers.GetSceneByIdHandler(sceneId, _sceneService);

        // Assert
        result.Should().BeOfType<NotFound>();
    }

    [Fact]
    public async Task UpdateSceneHandler_WithValidRequest_ReturnsOkResult() {
        // Arrange
        var sceneId = Guid.CreateVersion7();
        var request = new UpdateSceneRequest { Name = "Updated Scene" };
        var scene = new Scene { Id = sceneId, Name = "Updated Scene" };

        _sceneService.UpdateSceneAsync(_userId, sceneId, Arg.Any<UpdateSceneData>(), Arg.Any<CancellationToken>())
            .Returns(Result.Success());

        // Act
        var result = await SceneHandlers.UpdateSceneHandler(_httpContext, sceneId, request, _sceneService);

        // Assert
        // NOTE: UpdateSceneHandler returns NoContent on success, not Ok<Scene>
        result.Should().BeOfType<NoContent>();
    }

    [Fact]
    public async Task UpdateSceneHandler_WithNonExistingId_ReturnsNotFound() {
        // Arrange
        var sceneId = Guid.CreateVersion7();
        var request = new UpdateSceneRequest { Name = "Updated Scene" };

        _sceneService.UpdateSceneAsync(_userId, sceneId, Arg.Any<UpdateSceneData>(), Arg.Any<CancellationToken>())
            .Returns(Result.Failure("NotFound"));

        // Act
        var result = await SceneHandlers.UpdateSceneHandler(_httpContext, sceneId, request, _sceneService);

        // Assert
        result.Should().BeOfType<NotFound>();
    }

    [Fact]
    public async Task GetAssetsHandler_ReturnsOkResult() {
        // Arrange
        var sceneId = Guid.CreateVersion7();
        var assets = new[] {
            new SceneAsset { Index = 1, Name = "Asset 1" },
            new SceneAsset { Index = 2, Name = "Asset 2" },
        };

        _sceneService.GetAssetsAsync(sceneId, Arg.Any<CancellationToken>())
            .Returns(assets);

        // Act
        var result = await SceneHandlers.GetAssetsHandler(sceneId, _sceneService);

        // Assert
        var response = result.Should().BeOfType<Ok<SceneAsset[]>>().Subject;
        response.Value.Should().BeEquivalentTo(assets);
    }

    [Fact]
    public async Task UpdateAssetHandler_WithValidRequest_ReturnsCreatedResult() {
        // Arrange
        var sceneId = Guid.CreateVersion7();
        var assetId = Guid.CreateVersion7();
        const int number = 1;
        var request = new UpdateSceneAssetRequest {
            Position = new Position(20, 30),
            Size = new NamedSize { Width = 10, Height = 50, IsSquare = false },
            Frame = new Frame {
                Shape = FrameShape.Square,
                BorderThickness = 2,
                BorderColor = "black",
                Background = "white",
            },
            Elevation = 10,
            Rotation = 45,
        };

        _sceneService.UpdateAssetAsync(_userId, sceneId, number, Arg.Any<UpdateSceneAssetData>(), Arg.Any<CancellationToken>())
            .Returns(Result.Success());

        // Act
        var result = await SceneHandlers.UpdateAssetHandler(_httpContext, sceneId, number, request, _sceneService);

        // Assert
        result.Should().BeOfType<NoContent>();
    }

    [Fact]
    public async Task UpdateAssetHandler_WithInvalidAsset_ReturnsBadRequest() {
        // Arrange
        var sceneId = Guid.CreateVersion7();
        const int number = 1;
        var request = new UpdateSceneAssetRequest {
            Position = new Position(20, 30),
            Size = new NamedSize { Width = 10, Height = 50, IsSquare = false },
            Frame = new Frame {
                Shape = FrameShape.Square,
                BorderThickness = 2,
                BorderColor = "black",
                Background = "white",
            },
            Elevation = 10,
            Rotation = 45,
        };

        _sceneService.UpdateAssetAsync(_userId, sceneId, number, Arg.Any<UpdateSceneAssetData>(), Arg.Any<CancellationToken>())
            .Returns(Result.Failure("Some error."));

        // Act
        var result = await SceneHandlers.UpdateAssetHandler(_httpContext, sceneId, number, request, _sceneService);

        // Assert
        // NOTE: Handler returns BadRequest<IReadOnlyList<Error>>, not BadRequest
        result.Should().BeOfType<BadRequest<IReadOnlyList<Error>>>();
    }

    [Fact]
    public async Task RemoveAssetHandler_WithValidRequest_ReturnsCreatedResult() {
        // Arrange
        var sceneId = Guid.CreateVersion7();
        const int number = 1;

        _sceneService.RemoveAssetAsync(_userId, sceneId, number, Arg.Any<CancellationToken>())
            .Returns(Result.Success());

        // Act
        var result = await SceneHandlers.RemoveAssetHandler(_httpContext, sceneId, number, _sceneService);

        // Assert
        result.Should().BeOfType<NoContent>();
    }

    [Fact]
    public async Task RemoveAssetHandler_WithInvalidAsset_ReturnsBadRequest() {
        // Arrange
        var sceneId = Guid.CreateVersion7();
        const int number = 1;

        _sceneService.RemoveAssetAsync(_userId, sceneId, number, Arg.Any<CancellationToken>())
            .Returns(Result.Failure("NotFound"));

        // Act
        var result = await SceneHandlers.RemoveAssetHandler(_httpContext, sceneId, number, _sceneService);

        // Assert
        result.Should().BeOfType<NotFound>();
    }
}