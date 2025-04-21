namespace VttTools.GameService.Handlers;

public class EpisodeHandlersTests {
    private readonly IAdventureService _adventureService = Substitute.For<IAdventureService>();
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
    public async Task GetEpisodeByIdHandler_WithExistingId_ReturnsOkResult() {
        // Arrange
        var episodeId = Guid.NewGuid();
        var adventureId = Guid.NewGuid();
        var episode = new Episode { Id = episodeId, Name = "Test Episode", ParentId = adventureId };

        _adventureService.GetEpisodeAsync(episodeId, Arg.Any<CancellationToken>())
            .Returns(episode);

        // Act
        var result = await EpisodeHandlers.GetEpisodeByIdHandler(episodeId, _adventureService);

        // Assert
        await _adventureService.Received(1).GetEpisodeAsync(episodeId, Arg.Any<CancellationToken>());
        Assert.IsType<Ok<Episode>>(result);
        var okResult = (Ok<Episode>)result;
        Assert.Equal(episode, okResult.Value);
    }

    [Fact]
    public async Task GetEpisodeByIdHandler_WithNonExistingId_ReturnsNotFound() {
        // Arrange
        var episodeId = Guid.NewGuid();

        _adventureService.GetEpisodeAsync(episodeId, Arg.Any<CancellationToken>())
            .Returns((Episode?)null);

        // Act
        var result = await EpisodeHandlers.GetEpisodeByIdHandler(episodeId, _adventureService);

        // Assert
        await _adventureService.Received(1).GetEpisodeAsync(episodeId, Arg.Any<CancellationToken>());
        Assert.IsType<NotFound>(result);
    }

    [Fact]
    public async Task UpdateEpisodeHandler_WithValidRequest_ReturnsOkResult() {
        // Arrange
        var episodeId = Guid.NewGuid();
        var adventureId = Guid.NewGuid();
        var request = new UpdateEpisodeRequest { Name = "Updated Episode" };
        var episode = new Episode { Id = episodeId, Name = "Updated Episode", ParentId = adventureId };

        _adventureService.UpdateEpisodeAsync(_userId, episodeId, request, Arg.Any<CancellationToken>())
            .Returns(episode);

        // Act
        var result = await EpisodeHandlers.UpdateEpisodeHandler(_httpContext, episodeId, request, _adventureService);

        // Assert
        await _adventureService.Received(1).UpdateEpisodeAsync(_userId, episodeId, request, Arg.Any<CancellationToken>());
        Assert.IsType<Ok<Episode>>(result);
        var okResult = (Ok<Episode>)result;
        Assert.Equal(episode, okResult.Value);
    }

    [Fact]
    public async Task UpdateEpisodeHandler_WithNonExistingId_ReturnsNotFound() {
        // Arrange
        var episodeId = Guid.NewGuid();
        var request = new UpdateEpisodeRequest { Name = "Updated Episode" };

        _adventureService.UpdateEpisodeAsync(_userId, episodeId, request, Arg.Any<CancellationToken>())
            .Returns((Episode?)null);

        // Act
        var result = await EpisodeHandlers.UpdateEpisodeHandler(_httpContext, episodeId, request, _adventureService);

        // Assert
        await _adventureService.Received(1).UpdateEpisodeAsync(_userId, episodeId, request, Arg.Any<CancellationToken>());
        Assert.IsType<NotFound>(result);
    }

    [Fact]
    public async Task DeleteEpisodeHandler_WithExistingId_ReturnsNoContent() {
        // Arrange
        var episodeId = Guid.NewGuid();

        _adventureService.DeleteEpisodeAsync(_userId, episodeId, Arg.Any<CancellationToken>())
            .Returns(true);

        // Act
        var result = await EpisodeHandlers.DeleteEpisodeHandler(_httpContext, episodeId, _adventureService);

        // Assert
        await _adventureService.Received(1).DeleteEpisodeAsync(_userId, episodeId, Arg.Any<CancellationToken>());
        Assert.IsType<NoContent>(result);
    }

    [Fact]
    public async Task DeleteEpisodeHandler_WithNonExistingId_ReturnsNotFound() {
        // Arrange
        var episodeId = Guid.NewGuid();

        _adventureService.DeleteEpisodeAsync(_userId, episodeId, Arg.Any<CancellationToken>())
            .Returns(false);

        // Act
        var result = await EpisodeHandlers.DeleteEpisodeHandler(_httpContext, episodeId, _adventureService);

        // Assert
        await _adventureService.Received(1).DeleteEpisodeAsync(_userId, episodeId, Arg.Any<CancellationToken>());
        Assert.IsType<NotFound>(result);
    }

    [Fact]
    public async Task CloneEpisodeHandler_WithExistingId_ReturnsCreatedResult() {
        // Arrange
        var episodeId = Guid.NewGuid();
        var adventureId = Guid.NewGuid();
        var clonedEpisode = new Episode { Id = Guid.NewGuid(), Name = "Cloned Episode", ParentId = adventureId };

        _adventureService.CloneEpisodeAsync(_userId, episodeId, Arg.Any<CancellationToken>())
            .Returns(clonedEpisode);

        // Act
        var result = await EpisodeHandlers.CloneEpisodeHandler(_httpContext, episodeId, _adventureService);

        // Assert
        await _adventureService.Received(1).CloneEpisodeAsync(_userId, episodeId, Arg.Any<CancellationToken>());
        Assert.IsType<Created<Episode>>(result);
        var createdResult = (Created<Episode>)result;
        Assert.Equal($"/api/episodes/{clonedEpisode.Id}", createdResult.Location);
        Assert.Equal(clonedEpisode, createdResult.Value);
    }

    [Fact]
    public async Task CloneEpisodeHandler_WithNonExistingId_ReturnsNotFound() {
        // Arrange
        var episodeId = Guid.NewGuid();

        _adventureService.CloneEpisodeAsync(_userId, episodeId, Arg.Any<CancellationToken>())
            .Returns((Episode?)null);

        // Act
        var result = await EpisodeHandlers.CloneEpisodeHandler(_httpContext, episodeId, _adventureService);

        // Assert
        await _adventureService.Received(1).CloneEpisodeAsync(_userId, episodeId, Arg.Any<CancellationToken>());
        Assert.IsType<NotFound>(result);
    }
}