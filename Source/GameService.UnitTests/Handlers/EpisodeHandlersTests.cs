namespace VttTools.GameService.Handlers;

public class EpisodeHandlersTests {
    private readonly IEpisodeService _episodeService = Substitute.For<IEpisodeService>();
    private readonly HttpContext _httpContext = Substitute.For<HttpContext>();
    private readonly ClaimsPrincipal _user = Substitute.For<ClaimsPrincipal>();
    private static readonly Guid _userId = Guid.NewGuid();

    public EpisodeHandlersTests() {
        // Setup user claims
        var claim = new Claim(ClaimTypes.NameIdentifier, _userId.ToString());
        var claims = new List<Claim> { claim };
        _user.Claims.Returns(claims);
        _user.FindFirst(ClaimTypes.NameIdentifier).Returns(claim);
        _httpContext.User.Returns(_user);
    }

    [Fact]
    public async Task GetEpisodesHandler_ReturnsOkResult() {
        // Arrange
        var episodes = new[] {
            new Episode { Id = Guid.NewGuid(), Name = "Episode 1", OwnerId = _userId },
            new Episode { Id = Guid.NewGuid(), Name = "Episode 2", OwnerId = _userId },
        };

        _episodeService.GetEpisodesAsync(Arg.Any<CancellationToken>())
            .Returns(episodes);

        // Act
        var result = await EpisodeHandlers.GetEpisodesHandler(_episodeService);

        // Assert
        var response = result.Should().BeOfType<Ok<Episode[]>>().Subject;
        response.Value.Should().BeEquivalentTo(episodes);
    }

    [Fact]
    public async Task GetEpisodeByIdHandler_WithExistingId_ReturnsOkResult() {
        // Arrange
        var episodeId = Guid.NewGuid();
        var episode = new Episode { Id = episodeId, Name = "Test Episode", ParentId = episodeId };

        _episodeService.GetEpisodeByIdAsync(episodeId, Arg.Any<CancellationToken>())
            .Returns(episode);

        // Act
        var result = await EpisodeHandlers.GetEpisodeByIdHandler(episodeId, _episodeService);

        // Assert
        var response = result.Should().BeOfType<Ok<Episode>>().Subject;
        response.Value.Should().BeEquivalentTo(episode);
    }

    [Fact]
    public async Task GetEpisodeByIdHandler_WithNonExistingId_ReturnsNotFound() {
        // Arrange
        var episodeId = Guid.NewGuid();

        _episodeService.GetEpisodeByIdAsync(episodeId, Arg.Any<CancellationToken>())
            .Returns((Episode?)null);

        // Act
        var result = await EpisodeHandlers.GetEpisodeByIdHandler(episodeId, _episodeService);

        // Assert
        result.Should().BeOfType<NotFound>();
    }

    [Fact]
    public async Task UpdateEpisodeHandler_WithValidRequest_ReturnsOkResult() {
        // Arrange
        var episodeId = Guid.NewGuid();
        var request = new UpdateEpisodeRequest { Name = "Updated Episode" };
        var episode = new Episode { Id = episodeId, Name = "Updated Episode", ParentId = episodeId };

        _episodeService.UpdateEpisodeAsync(_userId, episodeId, request, Arg.Any<CancellationToken>())
            .Returns(episode);

        // Act
        var result = await EpisodeHandlers.UpdateEpisodeHandler(_httpContext, episodeId, request, _episodeService);

        // Assert
        var response = result.Should().BeOfType<Ok<Episode>>().Subject;
        response.Value.Should().BeEquivalentTo(episode);
    }

    [Fact]
    public async Task UpdateEpisodeHandler_WithNonExistingId_ReturnsNotFound() {
        // Arrange
        var episodeId = Guid.NewGuid();
        var request = new UpdateEpisodeRequest { Name = "Updated Episode" };

        _episodeService.UpdateEpisodeAsync(_userId, episodeId, request, Arg.Any<CancellationToken>())
            .Returns((Episode?)null);

        // Act
        var result = await EpisodeHandlers.UpdateEpisodeHandler(_httpContext, episodeId, request, _episodeService);

        // Assert
        result.Should().BeOfType<NotFound>();
    }

    [Fact]
    public async Task GetAssetsHandler_ReturnsOkResult() {
        // Arrange
        var episodeId = Guid.NewGuid();
        var assets = new[] {
            new EpisodeAsset { EpisodeId = episodeId, AssetId = Guid.NewGuid(), Name = "Asset 1" },
            new EpisodeAsset { EpisodeId = episodeId, AssetId = Guid.NewGuid(), Name = "Asset 2" },
        };

        _episodeService.GetAssetsAsync(episodeId, Arg.Any<CancellationToken>())
            .Returns(assets);

        // Act
        var result = await EpisodeHandlers.GetAssetsHandler(episodeId, _episodeService);

        // Assert
        var response = result.Should().BeOfType<Ok<EpisodeAsset[]>>().Subject;
        response.Value.Should().BeEquivalentTo(assets);
    }

    [Fact]
    public async Task AddAssetHandler_WithValidRequest_ReturnsCreatedResult() {
        // Arrange
        var episodeId = Guid.NewGuid();
        var assetId = Guid.NewGuid();
        var request = new AddEpisodeAssetRequest {
            Id = assetId,
            Name = "Asset Name",
            Position = new() { Left = 20, Top = 30 },
            Scale = 1,
        };

        _episodeService.AddAssetAsync(_userId, episodeId, Arg.Any<AddEpisodeAssetData>(), Arg.Any<CancellationToken>())
            .Returns(true);

        // Act
        var result = await EpisodeHandlers.AddAssetHandler(_httpContext, episodeId, request, _episodeService);

        // Assert
        result.Should().BeOfType<NoContent>();
    }

    [Fact]
    public async Task AddAssetHandler_WithInvalidAsset_ReturnsBadRequest() {
        // Arrange
        var episodeId = Guid.NewGuid();
        var assetId = Guid.NewGuid();
        var request = new AddEpisodeAssetRequest {
            Id = assetId,
            Name = "Asset Name",
            Position = new() { Left = 20, Top = 30 },
            Scale = 1,
        };

        _episodeService.AddAssetAsync(_userId, episodeId, Arg.Any<AddEpisodeAssetData>(), Arg.Any<CancellationToken>())
            .Returns(false);

        // Act
        var result = await EpisodeHandlers.AddAssetHandler(_httpContext, episodeId, request, _episodeService);

        // Assert
        result.Should().BeOfType<BadRequest>();
    }

    [Fact]
    public async Task UpdateAssetHandler_WithValidRequest_ReturnsCreatedResult() {
        // Arrange
        var episodeId = Guid.NewGuid();
        var assetId = Guid.NewGuid();
        var request = new UpdateEpisodeAssetRequest {
            Position = new Position { Left = 20, Top = 30 },
        };

        _episodeService.UpdateAssetAsync(_userId, episodeId, assetId, Arg.Any<UpdateEpisodeAssetData>(), Arg.Any<CancellationToken>())
            .Returns(true);

        // Act
        var result = await EpisodeHandlers.UpdateAssetHandler(_httpContext, episodeId, assetId, request, _episodeService);

        // Assert
        result.Should().BeOfType<NoContent>();
    }

    [Fact]
    public async Task UpdateAssetHandler_WithInvalidAsset_ReturnsBadRequest() {
        // Arrange
        var episodeId = Guid.NewGuid();
        var assetId = Guid.NewGuid();
        var request = new UpdateEpisodeAssetRequest {
            Position = new Position { Left = 20, Top = 30 },
        };

        _episodeService.UpdateAssetAsync(_userId, episodeId, assetId, Arg.Any<UpdateEpisodeAssetData>(), Arg.Any<CancellationToken>())
            .Returns(false);

        // Act
        var result = await EpisodeHandlers.UpdateAssetHandler(_httpContext, episodeId, assetId, request, _episodeService);

        // Assert
        result.Should().BeOfType<BadRequest>();
    }

    [Fact]
    public async Task RemoveAssetHandler_WithValidRequest_ReturnsCreatedResult() {
        // Arrange
        var episodeId = Guid.NewGuid();
        var assetId = Guid.NewGuid();

        _episodeService.RemoveAssetAsync(_userId, episodeId, assetId, Arg.Any<CancellationToken>())
            .Returns(true);

        // Act
        var result = await EpisodeHandlers.RemoveAssetHandler(_httpContext, episodeId, assetId, _episodeService);

        // Assert
        result.Should().BeOfType<NoContent>();
    }

    [Fact]
    public async Task RemoveAssetHandler_WithInvalidAsset_ReturnsBadRequest() {
        // Arrange
        var episodeId = Guid.NewGuid();
        var assetId = Guid.NewGuid();

        _episodeService.RemoveAssetAsync(_userId, episodeId, assetId, Arg.Any<CancellationToken>())
            .Returns(false);

        // Act
        var result = await EpisodeHandlers.RemoveAssetHandler(_httpContext, episodeId, assetId, _episodeService);

        // Assert
        result.Should().BeOfType<NotFound>();
    }
}