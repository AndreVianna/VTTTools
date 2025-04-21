namespace VttTools.GameService.Handlers;

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
        await _adventureService.Received(1).GetAdventuresAsync(Arg.Any<CancellationToken>());
        Assert.IsType<Ok<Adventure[]>>(result);
        var okResult = (Ok<Adventure[]>)result;
        Assert.Equal(adventures, okResult.Value);
    }

    [Fact]
    public async Task GetAdventureByIdHandler_WithExistingId_ReturnsOkResult() {
        // Arrange
        var adventureId = Guid.NewGuid();
        var adventure = new Adventure { Id = adventureId, Name = "Test Adventure", OwnerId = _userId };

        _adventureService.GetAdventureAsync(adventureId, Arg.Any<CancellationToken>())
            .Returns(adventure);

        // Act
        var result = await AdventureHandlers.GetAdventureByIdHandler(adventureId, _adventureService);

        // Assert
        await _adventureService.Received(1).GetAdventureAsync(adventureId, Arg.Any<CancellationToken>());
        Assert.IsType<Ok<Adventure>>(result);
        var okResult = (Ok<Adventure>)result;
        Assert.Equal(adventure, okResult.Value);
    }

    [Fact]
    public async Task GetAdventureByIdHandler_WithNonExistingId_ReturnsNotFound() {
        // Arrange
        var adventureId = Guid.NewGuid();

        _adventureService.GetAdventureAsync(adventureId, Arg.Any<CancellationToken>())
            .Returns((Adventure)null!);

        // Act
        var result = await AdventureHandlers.GetAdventureByIdHandler(adventureId, _adventureService);

        // Assert
        await _adventureService.Received(1).GetAdventureAsync(adventureId, Arg.Any<CancellationToken>());
        Assert.IsType<NotFound>(result);
    }

    [Fact]
    public async Task GetEpisodesHandler_ReturnsOkResult() {
        // Arrange
        var adventureId = Guid.NewGuid();
        var episodes = new[] {
            new Episode { Id = Guid.NewGuid(), Name = "Episode 1", ParentId = adventureId },
            new Episode { Id = Guid.NewGuid(), Name = "Episode 2", ParentId = adventureId },
        };

        _adventureService.GetEpisodesAsync(adventureId, Arg.Any<CancellationToken>())
            .Returns(episodes);

        // Act
        var result = await AdventureHandlers.GetEpisodesHandler(adventureId, _adventureService);

        // Assert
        await _adventureService.Received(1).GetEpisodesAsync(adventureId, Arg.Any<CancellationToken>());
        Assert.IsType<Ok<Episode[]>>(result);
        var okResult = (Ok<Episode[]>)result;
        Assert.Equal(episodes, okResult.Value);
    }

    [Fact]
    public async Task CreateEpisodeHandler_WithValidRequest_ReturnsCreatedResult() {
        // Arrange
        var adventureId = Guid.NewGuid();
        var request = new CreateEpisodeRequest { Name = "New Episode" };
        var episode = new Episode { Id = Guid.NewGuid(), Name = "New Episode", ParentId = adventureId };

        _adventureService.CreateEpisodeAsync(_userId, adventureId, request, Arg.Any<CancellationToken>())
            .Returns(episode);

        // Act
        var result = await AdventureHandlers.CreateEpisodeHandler(_httpContext, adventureId, request, _adventureService);

        // Assert
        await _adventureService.Received(1).CreateEpisodeAsync(_userId, adventureId, request, Arg.Any<CancellationToken>());
        Assert.IsType<Created<Episode>>(result);
        var createdResult = (Created<Episode>)result;
        Assert.Equal($"/api/episodes/{episode.Id}", createdResult.Location);
        Assert.Equal(episode, createdResult.Value);
    }

    [Fact]
    public async Task CreateEpisodeHandler_WithInvalidRequest_ReturnsBadRequest() {
        // Arrange
        var adventureId = Guid.NewGuid();
        var request = new CreateEpisodeRequest { Name = "New Episode" };

        _adventureService.CreateEpisodeAsync(_userId, adventureId, request, Arg.Any<CancellationToken>())
            .Returns((Episode)null!);

        // Act
        var result = await AdventureHandlers.CreateEpisodeHandler(_httpContext, adventureId, request, _adventureService);

        // Assert
        await _adventureService.Received(1).CreateEpisodeAsync(_userId, adventureId, request, Arg.Any<CancellationToken>());
        Assert.IsType<BadRequest>(result);
    }

    [Fact]
    public async Task CreateAdventureHandler_WithValidRequest_ReturnsCreatedResult() {
        // Arrange
        var request = new CreateAdventureRequest { Name = "New Adventure" };
        var adventure = new Adventure { Id = Guid.NewGuid(), Name = "New Adventure", OwnerId = _userId };

        _adventureService.CreateAdventureAsync(_userId, request, Arg.Any<CancellationToken>())
            .Returns(adventure);

        // Act
        var result = await AdventureHandlers.CreateAdventureHandler(_httpContext, request, _adventureService);

        // Assert
        await _adventureService.Received(1).CreateAdventureAsync(_userId, request, Arg.Any<CancellationToken>());
        Assert.IsType<Created<Adventure>>(result);
        var createdResult = (Created<Adventure>)result;
        Assert.Equal($"/api/adventures/{adventure.Id}", createdResult.Location);
        Assert.Equal(adventure, createdResult.Value);
    }

    [Fact]
    public async Task CreateAdventureHandler_WithInvalidRequest_ReturnsBadRequest() {
        // Arrange
        var request = new CreateAdventureRequest { Name = "New Adventure" };

        _adventureService.CreateAdventureAsync(_userId, request, Arg.Any<CancellationToken>())
            .Returns((Adventure)null!);

        // Act
        var result = await AdventureHandlers.CreateAdventureHandler(_httpContext, request, _adventureService);

        // Assert
        await _adventureService.Received(1).CreateAdventureAsync(_userId, request, Arg.Any<CancellationToken>());
        Assert.IsType<BadRequest>(result);
    }

    [Fact]
    public async Task UpdateAdventureHandler_WithValidRequest_ReturnsOkResult() {
        // Arrange
        var adventureId = Guid.NewGuid();
        var request = new UpdateAdventureRequest { Name = "Updated Adventure" };
        var adventure = new Adventure { Id = adventureId, Name = "Updated Adventure", OwnerId = _userId };

        _adventureService.UpdateAdventureAsync(_userId, adventureId, request, Arg.Any<CancellationToken>())
            .Returns(adventure);

        // Act
        var result = await AdventureHandlers.UpdateAdventureHandler(_httpContext, adventureId, request, _adventureService);

        // Assert
        await _adventureService.Received(1).UpdateAdventureAsync(_userId, adventureId, request, Arg.Any<CancellationToken>());
        Assert.IsType<Ok<Adventure>>(result);
        var okResult = (Ok<Adventure>)result;
        Assert.Equal(adventure, okResult.Value);
    }

    [Fact]
    public async Task UpdateAdventureHandler_WithNonExistingId_ReturnsNotFound() {
        // Arrange
        var adventureId = Guid.NewGuid();
        var request = new UpdateAdventureRequest { Name = "Updated Adventure" };

        _adventureService.UpdateAdventureAsync(_userId, adventureId, request, Arg.Any<CancellationToken>())
            .Returns((Adventure)null!);

        // Act
        var result = await AdventureHandlers.UpdateAdventureHandler(_httpContext, adventureId, request, _adventureService);

        // Assert
        await _adventureService.Received(1).UpdateAdventureAsync(_userId, adventureId, request, Arg.Any<CancellationToken>());
        Assert.IsType<NotFound>(result);
    }

    [Fact]
    public async Task DeleteAdventureHandler_WithExistingId_ReturnsNoContent() {
        // Arrange
        var adventureId = Guid.NewGuid();

        _adventureService.DeleteAdventureAsync(_userId, adventureId, Arg.Any<CancellationToken>())
            .Returns(true);

        // Act
        var result = await AdventureHandlers.DeleteAdventureHandler(_httpContext, adventureId, _adventureService);

        // Assert
        await _adventureService.Received(1).DeleteAdventureAsync(_userId, adventureId, Arg.Any<CancellationToken>());
        Assert.IsType<NoContent>(result);
    }

    [Fact]
    public async Task DeleteAdventureHandler_WithNonExistingId_ReturnsNotFound() {
        // Arrange
        var adventureId = Guid.NewGuid();

        _adventureService.DeleteAdventureAsync(_userId, adventureId, Arg.Any<CancellationToken>())
            .Returns(false);

        // Act
        var result = await AdventureHandlers.DeleteAdventureHandler(_httpContext, adventureId, _adventureService);

        // Assert
        await _adventureService.Received(1).DeleteAdventureAsync(_userId, adventureId, Arg.Any<CancellationToken>());
        Assert.IsType<NotFound>(result);
    }

    [Fact]
    public async Task CloneAdventureHandler_WithExistingId_ReturnsCreatedResult() {
        // Arrange
        var adventureId = Guid.NewGuid();
        var clonedAdventure = new Adventure { Id = Guid.NewGuid(), Name = "Cloned Adventure", OwnerId = _userId };

        _adventureService.CloneAdventureAsync(_userId, adventureId, Arg.Any<CancellationToken>())
            .Returns(clonedAdventure);

        // Act
        var result = await AdventureHandlers.CloneAdventureHandler(_httpContext, adventureId, _adventureService);

        // Assert
        await _adventureService.Received(1).CloneAdventureAsync(_userId, adventureId, Arg.Any<CancellationToken>());
        Assert.IsType<Created<Adventure>>(result);
        var createdResult = (Created<Adventure>)result;
        Assert.Equal($"/api/adventures/{clonedAdventure.Id}", createdResult.Location);
        Assert.Equal(clonedAdventure, createdResult.Value);
    }

    [Fact]
    public async Task CloneAdventureHandler_WithNonExistingId_ReturnsNotFound() {
        // Arrange
        var adventureId = Guid.NewGuid();

        _adventureService.CloneAdventureAsync(_userId, adventureId, Arg.Any<CancellationToken>())
            .Returns((Adventure)null!);

        // Act
        var result = await AdventureHandlers.CloneAdventureHandler(_httpContext, adventureId, _adventureService);

        // Assert
        await _adventureService.Received(1).CloneAdventureAsync(_userId, adventureId, Arg.Any<CancellationToken>());
        Assert.IsType<NotFound>(result);
    }
}