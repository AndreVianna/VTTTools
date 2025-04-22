namespace VttTools.GameService.Handlers;

public class AssetHandlersTests {
    private readonly IAssetService _assetService = Substitute.For<IAssetService>();
    private readonly IStorageService _storageService = Substitute.For<IStorageService>();
    private readonly HttpContext _httpContext = Substitute.For<HttpContext>();
    private readonly ClaimsPrincipal _user = Substitute.For<ClaimsPrincipal>();
    private static readonly Guid _userId = Guid.NewGuid();

    public AssetHandlersTests() {
        // Setup user claims
        var claim = new Claim(ClaimTypes.NameIdentifier, _userId.ToString());
        var claims = new List<Claim> { claim };
        _user.Claims.Returns(claims);
        _user.FindFirst(ClaimTypes.NameIdentifier).Returns(claim);
        _httpContext.User.Returns(_user);
    }

    [Fact]
    public async Task GetAssetsHandler_ReturnsOkResult() {
        // Arrange
        var assets = new[] {
            new Asset { Id = Guid.NewGuid(), Name = "Asset 1", OwnerId = _userId, Type = AssetType.Character },
            new Asset { Id = Guid.NewGuid(), Name = "Asset 2", OwnerId = _userId, Type = AssetType.Object },
        };

        _assetService.GetAssetsAsync(Arg.Any<CancellationToken>())
            .Returns(assets);

        // Act
        var result = await AssetHandlers.GetAssetsHandler(_assetService);

        // Assert
        await _assetService.Received(1).GetAssetsAsync(Arg.Any<CancellationToken>());
        var response = result.Should().BeOfType<Ok<Asset[]>>().Subject;
        response.Value.Should().BeEquivalentTo(assets);
    }

    [Fact]
    public async Task GetAssetByIdHandler_WithExistingId_ReturnsOkResult() {
        // Arrange
        var assetId = Guid.NewGuid();
        var asset = new Asset { Id = assetId, Name = "Test Asset", OwnerId = _userId, Type = AssetType.Character };

        _assetService.GetAssetAsync(assetId, Arg.Any<CancellationToken>())
            .Returns(asset);

        // Act
        var result = await AssetHandlers.GetAssetByIdHandler(assetId, _assetService);

        // Assert
        await _assetService.Received(1).GetAssetAsync(assetId, Arg.Any<CancellationToken>());
        var response = result.Should().BeOfType<Ok<Asset>>().Subject;
        response.Value.Should().BeEquivalentTo(asset);
    }

    [Fact]
    public async Task GetAssetByIdHandler_WithNonExistingId_ReturnsNotFound() {
        // Arrange
        var assetId = Guid.NewGuid();

        _assetService.GetAssetAsync(assetId, Arg.Any<CancellationToken>())
            .Returns((Asset?)null);

        // Act
        var result = await AssetHandlers.GetAssetByIdHandler(assetId, _assetService);

        // Assert
        await _assetService.Received(1).GetAssetAsync(assetId, Arg.Any<CancellationToken>());
        result.Should().BeOfType<NotFound>();
    }

    [Fact]
    public async Task CreateAssetHandler_WithValidRequest_ReturnsCreatedResult() {
        // Arrange
        var request = new CreateAssetRequest { Name = "New Asset", Type = AssetType.Character };
        var asset = new Asset { Id = Guid.NewGuid(), Name = "New Asset", OwnerId = _userId, Type = AssetType.Character };

        _assetService.CreateAssetAsync(_userId, request, Arg.Any<CancellationToken>())
            .Returns(asset);

        // Act
        var result = await AssetHandlers.CreateAssetHandler(_httpContext, request, _assetService);

        // Assert
        await _assetService.Received(1).CreateAssetAsync(_userId, request, Arg.Any<CancellationToken>());
        var response = result.Should().BeOfType<Created<Asset>>().Subject;
        response.Location.Should().Be($"/api/assets/{asset.Id}");
        response.Value.Should().BeEquivalentTo(asset);
    }

    [Fact]
    public async Task UpdateAssetHandler_WithValidRequest_ReturnsOkResult() {
        // Arrange
        var assetId = Guid.NewGuid();
        var request = new UpdateAssetRequest { Name = "Updated Asset" };
        var asset = new Asset { Id = assetId, Name = "Updated Asset", OwnerId = _userId, Type = AssetType.Character };

        _assetService.UpdateAssetAsync(_userId, assetId, request, Arg.Any<CancellationToken>())
            .Returns(asset);

        // Act
        var result = await AssetHandlers.UpdateAssetHandler(_httpContext, assetId, request, _assetService);

        // Assert
        await _assetService.Received(1).UpdateAssetAsync(_userId, assetId, request, Arg.Any<CancellationToken>());
        var response = result.Should().BeOfType<Ok<Asset>>().Subject;
        response.Value.Should().BeEquivalentTo(asset);
    }

    [Fact]
    public async Task UpdateAssetHandler_WithNonExistingId_ReturnsNotFound() {
        // Arrange
        var assetId = Guid.NewGuid();
        var request = new UpdateAssetRequest { Name = "Updated Asset" };

        _assetService.UpdateAssetAsync(_userId, assetId, request, Arg.Any<CancellationToken>())
            .Returns((Asset?)null);

        // Act
        var result = await AssetHandlers.UpdateAssetHandler(_httpContext, assetId, request, _assetService);

        // Assert
        await _assetService.Received(1).UpdateAssetAsync(_userId, assetId, request, Arg.Any<CancellationToken>());
        result.Should().BeOfType<NotFound>();
    }

    [Fact]
    public async Task DeleteAssetHandler_WithExistingId_ReturnsNoContent() {
        // Arrange
        var assetId = Guid.NewGuid();

        _assetService.DeleteAssetAsync(_userId, assetId, Arg.Any<CancellationToken>())
            .Returns(true);

        // Act
        var result = await AssetHandlers.DeleteAssetHandler(_httpContext, assetId, _assetService);

        // Assert
        await _assetService.Received(1).DeleteAssetAsync(_userId, assetId, Arg.Any<CancellationToken>());
        result.Should().BeOfType<NoContent>();
    }

    [Fact]
    public async Task DeleteAssetHandler_WithNonExistingId_ReturnsNotFound() {
        // Arrange
        var assetId = Guid.NewGuid();

        _assetService.DeleteAssetAsync(_userId, assetId, Arg.Any<CancellationToken>())
            .Returns(false);

        // Act
        var result = await AssetHandlers.DeleteAssetHandler(_httpContext, assetId, _assetService);

        // Assert
        await _assetService.Received(1).DeleteAssetAsync(_userId, assetId, Arg.Any<CancellationToken>());
        result.Should().BeOfType<NotFound>();
    }

    [Fact]
    public async Task UploadAssetFileHandler_WithValidIdAndFile_ReturnsOkResult() {
        // Arrange
        var assetId = Guid.NewGuid();
        var asset = new Asset { Id = assetId, Name = "Test Asset", OwnerId = _userId, Type = AssetType.Character };
        var updatedAsset = new Asset { Id = assetId, Name = "Test Asset", OwnerId = _userId, Type = AssetType.Character, Source = "https://storage.example.com/image.png" };
        var file = Substitute.For<IFormFile>();
        var stream = new MemoryStream();

        file.FileName.Returns("image.png");
        file.OpenReadStream().Returns(stream);

        _assetService.GetAssetAsync(assetId, Arg.Any<CancellationToken>()).Returns(asset);
        _storageService.UploadImageAsync(Arg.Any<Stream>(), Arg.Any<string>(), Arg.Any<CancellationToken>())
            .Returns("https://storage.example.com/image.png");
        _assetService.UpdateAssetAsync(_userId, assetId, Arg.Any<UpdateAssetRequest>(), Arg.Any<CancellationToken>())
            .Returns(updatedAsset);

        // Act
        var result = await AssetHandlers.UploadAssetFileHandler(_httpContext, assetId, file, _storageService, _assetService);

        // Assert
        await _assetService.Received(1).GetAssetAsync(assetId, Arg.Any<CancellationToken>());
        await _storageService.Received(1).UploadImageAsync(Arg.Any<Stream>(), Arg.Is<string>(s => s == "image.png"), Arg.Any<CancellationToken>());
        await _assetService.Received(1).UpdateAssetAsync(
            _userId,
            assetId,
            Arg.Is<UpdateAssetRequest>(r => r.Source == "https://storage.example.com/image.png"),
            Arg.Any<CancellationToken>());

        var response = result.Should().BeOfType<Ok<Asset>>().Subject;
        response.Value.Should().BeEquivalentTo(updatedAsset);
    }

    [Fact]
    public async Task UploadAssetFileHandler_WithNonExistingId_ReturnsNotFound() {
        // Arrange
        var assetId = Guid.NewGuid();
        var file = Substitute.For<IFormFile>();

        _assetService.GetAssetAsync(assetId, Arg.Any<CancellationToken>()).Returns((Asset?)null);

        // Act
        var result = await AssetHandlers.UploadAssetFileHandler(_httpContext, assetId, file, _storageService, _assetService);

        // Assert
        await _assetService.Received(1).GetAssetAsync(assetId, Arg.Any<CancellationToken>());
        await _storageService.DidNotReceive().UploadImageAsync(Arg.Any<Stream>(), Arg.Any<string>(), Arg.Any<CancellationToken>());
        await _assetService.DidNotReceive().UpdateAssetAsync(
            Arg.Any<Guid>(),
            Arg.Any<Guid>(),
            Arg.Any<UpdateAssetRequest>(),
            Arg.Any<CancellationToken>());

        result.Should().BeOfType<NotFound>();
    }

    [Fact]
    public async Task UploadAssetFileHandler_WithAssetOwnedByDifferentUser_ReturnsNotFound() {
        // Arrange
        var assetId = Guid.NewGuid();
        var differentUserId = Guid.NewGuid();
        var asset = new Asset { Id = assetId, Name = "Test Asset", OwnerId = differentUserId, Type = AssetType.Character };
        var file = Substitute.For<IFormFile>();

        _assetService.GetAssetAsync(assetId, Arg.Any<CancellationToken>()).Returns(asset);

        // Act
        var result = await AssetHandlers.UploadAssetFileHandler(_httpContext, assetId, file, _storageService, _assetService);

        // Assert
        await _assetService.Received(1).GetAssetAsync(assetId, Arg.Any<CancellationToken>());
        await _storageService.DidNotReceive().UploadImageAsync(Arg.Any<Stream>(), Arg.Any<string>(), Arg.Any<CancellationToken>());
        await _assetService.DidNotReceive().UpdateAssetAsync(
            Arg.Any<Guid>(),
            Arg.Any<Guid>(),
            Arg.Any<UpdateAssetRequest>(),
            Arg.Any<CancellationToken>());

        result.Should().BeOfType<NotFound>();
    }

    [Fact]
    public async Task UploadAssetFileHandler_WithUpdateFailure_ReturnsBadRequest() {
        // Arrange
        var assetId = Guid.NewGuid();
        var asset = new Asset { Id = assetId, Name = "Test Asset", OwnerId = _userId, Type = AssetType.Character };
        var file = Substitute.For<IFormFile>();
        var stream = new MemoryStream();

        file.FileName.Returns("image.png");
        file.OpenReadStream().Returns(stream);

        _assetService.GetAssetAsync(assetId, Arg.Any<CancellationToken>()).Returns(asset);
        _storageService.UploadImageAsync(Arg.Any<Stream>(), Arg.Any<string>(), Arg.Any<CancellationToken>())
            .Returns("https://storage.example.com/image.png");
        _assetService.UpdateAssetAsync(_userId, assetId, Arg.Any<UpdateAssetRequest>(), Arg.Any<CancellationToken>())
            .Returns((Asset?)null);

        // Act
        var result = await AssetHandlers.UploadAssetFileHandler(_httpContext, assetId, file, _storageService, _assetService);

        // Assert
        await _assetService.Received(1).GetAssetAsync(assetId, Arg.Any<CancellationToken>());
        await _storageService.Received(1).UploadImageAsync(Arg.Any<Stream>(), Arg.Any<string>(), Arg.Any<CancellationToken>());
        await _assetService.Received(1).UpdateAssetAsync(
            _userId,
            assetId,
            Arg.Any<UpdateAssetRequest>(),
            Arg.Any<CancellationToken>());

        result.Should().BeOfType<BadRequest>();
    }
}