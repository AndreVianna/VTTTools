namespace VttTools.Library.Handlers;

public class SceneHandlersTests {
    private readonly ISceneService _sceneService = Substitute.For<ISceneService>();
    private readonly HttpContext _httpContext = Substitute.For<HttpContext>();
    private readonly ClaimsPrincipal _user = Substitute.For<ClaimsPrincipal>();
    private static readonly Guid _userId = Guid.NewGuid();

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
            new Scene { Id = Guid.NewGuid(), Name = "Scene 1", OwnerId = _userId },
            new Scene { Id = Guid.NewGuid(), Name = "Scene 2", OwnerId = _userId },
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
        var sceneId = Guid.NewGuid();
        var scene = new Scene { Id = sceneId, Name = "Test Scene", ParentId = sceneId };

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
        var sceneId = Guid.NewGuid();

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
        var sceneId = Guid.NewGuid();
        var request = new UpdateSceneRequest { Name = "Updated Scene" };
        var scene = new Scene { Id = sceneId, Name = "Updated Scene", ParentId = sceneId };

        _sceneService.UpdateSceneAsync(_userId, sceneId, request, Arg.Any<CancellationToken>())
            .Returns(scene);

        // Act
        var result = await SceneHandlers.UpdateSceneHandler(_httpContext, sceneId, request, _sceneService);

        // Assert
        var response = result.Should().BeOfType<Ok<Scene>>().Subject;
        response.Value.Should().BeEquivalentTo(scene);
    }

    [Fact]
    public async Task UpdateSceneHandler_WithNonExistingId_ReturnsNotFound() {
        // Arrange
        var sceneId = Guid.NewGuid();
        var request = new UpdateSceneRequest { Name = "Updated Scene" };

        _sceneService.UpdateSceneAsync(_userId, sceneId, request, Arg.Any<CancellationToken>())
            .Returns((Scene?)null);

        // Act
        var result = await SceneHandlers.UpdateSceneHandler(_httpContext, sceneId, request, _sceneService);

        // Assert
        result.Should().BeOfType<NotFound>();
    }

    [Fact]
    public async Task GetAssetsHandler_ReturnsOkResult() {
        // Arrange
        var sceneId = Guid.NewGuid();
        var assets = new[] {
            new SceneAsset { SceneId = sceneId, AssetId = Guid.NewGuid(), Name = "Asset 1" },
            new SceneAsset { SceneId = sceneId, AssetId = Guid.NewGuid(), Name = "Asset 2" },
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
    public async Task AddAssetHandler_WithValidRequest_ReturnsCreatedResult() {
        // Arrange
        var sceneId = Guid.NewGuid();
        var assetId = Guid.NewGuid();
        var request = new AddSceneAssetRequest {
            Id = assetId,
            Name = "Asset Name",
            Position = new() { Left = 20, Top = 30 },
            Scale = 1,
        };

        _sceneService.AddAssetAsync(_userId, sceneId, Arg.Any<AddSceneAssetData>(), Arg.Any<CancellationToken>())
            .Returns(true);

        // Act
        var result = await SceneHandlers.AddAssetHandler(_httpContext, sceneId, request, _sceneService);

        // Assert
        result.Should().BeOfType<NoContent>();
    }

    [Fact]
    public async Task AddAssetHandler_WithInvalidAsset_ReturnsBadRequest() {
        // Arrange
        var sceneId = Guid.NewGuid();
        var assetId = Guid.NewGuid();
        var request = new AddSceneAssetRequest {
            Id = assetId,
            Name = "Asset Name",
            Position = new() { Left = 20, Top = 30 },
            Scale = 1,
        };

        _sceneService.AddAssetAsync(_userId, sceneId, Arg.Any<AddSceneAssetData>(), Arg.Any<CancellationToken>())
            .Returns(false);

        // Act
        var result = await SceneHandlers.AddAssetHandler(_httpContext, sceneId, request, _sceneService);

        // Assert
        result.Should().BeOfType<BadRequest>();
    }

    [Fact]
    public async Task UpdateAssetHandler_WithValidRequest_ReturnsCreatedResult() {
        // Arrange
        var sceneId = Guid.NewGuid();
        var assetId = Guid.NewGuid();
        var request = new UpdateSceneAssetRequest {
            Position = new Position { Left = 20, Top = 30 },
        };

        _sceneService.UpdateAssetAsync(_userId, sceneId, assetId, Arg.Any<UpdateSceneAssetData>(), Arg.Any<CancellationToken>())
            .Returns(true);

        // Act
        var result = await SceneHandlers.UpdateAssetHandler(_httpContext, sceneId, assetId, request, _sceneService);

        // Assert
        result.Should().BeOfType<NoContent>();
    }

    [Fact]
    public async Task UpdateAssetHandler_WithInvalidAsset_ReturnsBadRequest() {
        // Arrange
        var sceneId = Guid.NewGuid();
        var assetId = Guid.NewGuid();
        var request = new UpdateSceneAssetRequest {
            Position = new Position { Left = 20, Top = 30 },
        };

        _sceneService.UpdateAssetAsync(_userId, sceneId, assetId, Arg.Any<UpdateSceneAssetData>(), Arg.Any<CancellationToken>())
            .Returns(false);

        // Act
        var result = await SceneHandlers.UpdateAssetHandler(_httpContext, sceneId, assetId, request, _sceneService);

        // Assert
        result.Should().BeOfType<BadRequest>();
    }

    [Fact]
    public async Task RemoveAssetHandler_WithValidRequest_ReturnsCreatedResult() {
        // Arrange
        var sceneId = Guid.NewGuid();
        var assetId = Guid.NewGuid();

        _sceneService.RemoveAssetAsync(_userId, sceneId, assetId, Arg.Any<CancellationToken>())
            .Returns(true);

        // Act
        var result = await SceneHandlers.RemoveAssetHandler(_httpContext, sceneId, assetId, _sceneService);

        // Assert
        result.Should().BeOfType<NoContent>();
    }

    [Fact]
    public async Task RemoveAssetHandler_WithInvalidAsset_ReturnsBadRequest() {
        // Arrange
        var sceneId = Guid.NewGuid();
        var assetId = Guid.NewGuid();

        _sceneService.RemoveAssetAsync(_userId, sceneId, assetId, Arg.Any<CancellationToken>())
            .Returns(false);

        // Act
        var result = await SceneHandlers.RemoveAssetHandler(_httpContext, sceneId, assetId, _sceneService);

        // Assert
        result.Should().BeOfType<NotFound>();
    }
}