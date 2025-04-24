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
        _adventureService.Received(1).GetAdventuresAsync(Arg.Any<CancellationToken>());
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
        _adventureService.Received(1).GetAdventureByIdAsync(adventureId, Arg.Any<CancellationToken>());
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
        _adventureService.Received(1).GetAdventureByIdAsync(adventureId, Arg.Any<CancellationToken>());
        result.Should().BeOfType<NotFound>();
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
        _adventureService.Received(1).CreateAdventureAsync(_userId, request, Arg.Any<CancellationToken>());
        var response = result.Should().BeOfType<Created<Adventure>>().Subject;
        response.Location.Should().Be($"/api/adventures/{adventure.Id}");
        response.Value.Should().BeEquivalentTo(adventure);
    }

    [Fact]
    public async Task CreateAdventureHandler_WithInvalidRequest_ReturnsBadRequest() {
        // Arrange
        var request = new CreateAdventureRequest { Name = "New Adventure" };

        _adventureService.CreateAdventureAsync(_userId, request, Arg.Any<CancellationToken>())
            .Returns((Adventure?)null);

        // Act
        var result = await AdventureHandlers.CreateAdventureHandler(_httpContext, request, _adventureService);

        // Assert
        _adventureService.Received(1).CreateAdventureAsync(_userId, request, Arg.Any<CancellationToken>());
        result.Should().BeOfType<BadRequest>();
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
        _adventureService.Received(1).UpdateAdventureAsync(_userId, adventureId, request, Arg.Any<CancellationToken>());
        var response = result.Should().BeOfType<Ok<Adventure>>().Subject;
        response.Value.Should().BeEquivalentTo(adventure);
    }

    [Fact]
    public async Task UpdateAdventureHandler_WithNonExistingId_ReturnsNotFound() {
        // Arrange
        var adventureId = Guid.NewGuid();
        var request = new UpdateAdventureRequest { Name = "Updated Adventure" };

        _adventureService.UpdateAdventureAsync(_userId, adventureId, request, Arg.Any<CancellationToken>())
            .Returns((Adventure?)null);

        // Act
        var result = await AdventureHandlers.UpdateAdventureHandler(_httpContext, adventureId, request, _adventureService);

        // Assert
        _adventureService.Received(1).UpdateAdventureAsync(_userId, adventureId, request, Arg.Any<CancellationToken>());
        result.Should().BeOfType<NotFound>();
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
        _adventureService.Received(1).DeleteAdventureAsync(_userId, adventureId, Arg.Any<CancellationToken>());
        result.Should().BeOfType<NoContent>();
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
        _adventureService.Received(1).DeleteAdventureAsync(_userId, adventureId, Arg.Any<CancellationToken>());
        result.Should().BeOfType<NotFound>();
    }

    [Fact]
    public async Task CloneAdventureHandler_WithExistingId_ReturnsCreatedResult() {
        // Arrange
        var adventureId = Guid.NewGuid();
        var clonedAdventure = new Adventure { Id = Guid.NewGuid(), Name = "Cloned Adventure", OwnerId = _userId };
        var request = new CloneAdventureRequest();

        _adventureService.CloneAdventureAsync(_userId, adventureId, Arg.Any<CloneAdventureRequest>(), Arg.Any<CancellationToken>())
            .Returns(clonedAdventure);

        // Act
        var result = await AdventureHandlers.CloneAdventureHandler(_httpContext, adventureId, request, _adventureService);

        // Assert
        _adventureService.Received(1).CloneAdventureAsync(_userId, adventureId, Arg.Any<CloneAdventureRequest>(), Arg.Any<CancellationToken>());
        var response = result.Should().BeOfType<Created<Adventure>>().Subject;
        response.Location.Should().Be($"/api/adventures/{clonedAdventure.Id}");
        response.Value.Should().Be(clonedAdventure);
    }

    [Fact]
    public async Task CloneAdventureHandler_WithNonExistingId_ReturnsNotFound() {
        // Arrange
        var adventureId = Guid.NewGuid();
        var request = new CloneAdventureRequest();

        _adventureService.CloneAdventureAsync(_userId, adventureId, Arg.Any<CloneAdventureRequest>(), Arg.Any<CancellationToken>())
            .Returns((Adventure?)null);

        // Act
        var result = await AdventureHandlers.CloneAdventureHandler(_httpContext, adventureId, request, _adventureService);

        // Assert
        _adventureService.Received(1).CloneAdventureAsync(_userId, adventureId, Arg.Any<CloneAdventureRequest>(), Arg.Any<CancellationToken>());
        result.Should().BeOfType<NotFound>();
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
        _adventureService.Received(1).GetEpisodesAsync(adventureId, Arg.Any<CancellationToken>());
        var response = result.Should().BeOfType<Ok<Episode[]>>().Subject;
        response.Value.Should().BeEquivalentTo(episodes);
    }

    [Fact]
    public async Task AddEpisodeHandler_WithValidRequest_ReturnsCreatedResult() {
        // Arrange
        var adventureId = Guid.NewGuid();
        var episodeId = Guid.NewGuid();

        _adventureService.AddEpisodeAsync(_userId, adventureId, episodeId, Arg.Any<CancellationToken>())
            .Returns(true);

        // Act
        var result = await AdventureHandlers.AddEpisodeHandler(_httpContext, adventureId, episodeId, _adventureService);

        // Assert
        _adventureService.Received(1).AddEpisodeAsync(_userId, adventureId, episodeId, Arg.Any<CancellationToken>());
        result.Should().BeOfType<NoContent>();
    }

    [Fact]
    public async Task AddEpisodeHandler_WithInvalidEpisode_ReturnsBadRequest() {
        // Arrange
        var adventureId = Guid.NewGuid();
        var episodeId = Guid.NewGuid();

        _adventureService.AddEpisodeAsync(_userId, adventureId, episodeId, Arg.Any<CancellationToken>())
            .Returns(false);

        // Act
        var result = await AdventureHandlers.AddEpisodeHandler(_httpContext, adventureId, episodeId, _adventureService);

        // Assert
        _adventureService.Received(1).AddEpisodeAsync(_userId, adventureId, episodeId, Arg.Any<CancellationToken>());
        result.Should().BeOfType<BadRequest>();
    }

    [Fact]
    public async Task RemoveEpisodeHandler_WithValidRequest_ReturnsCreatedResult() {
        // Arrange
        var adventureId = Guid.NewGuid();
        var episodeId = Guid.NewGuid();

        _adventureService.RemoveEpisodeAsync(_userId, adventureId, episodeId, Arg.Any<CancellationToken>())
            .Returns(true);

        // Act
        var result = await AdventureHandlers.RemoveEpisodeHandler(_httpContext, adventureId, episodeId, _adventureService);

        // Assert
        _adventureService.Received(1).RemoveEpisodeAsync(_userId, adventureId, episodeId, Arg.Any<CancellationToken>());
        result.Should().BeOfType<NoContent>();
    }

    [Fact]
    public async Task RemoveEpisodeHandler_WithInvalidEpisode_ReturnsBadRequest() {
        // Arrange
        var adventureId = Guid.NewGuid();
        var episodeId = Guid.NewGuid();

        _adventureService.RemoveEpisodeAsync(_userId, adventureId, episodeId, Arg.Any<CancellationToken>())
            .Returns(false);

        // Act
        var result = await AdventureHandlers.RemoveEpisodeHandler(_httpContext, adventureId, episodeId, _adventureService);

        // Assert
        _adventureService.Received(1).RemoveEpisodeAsync(_userId, adventureId, episodeId, Arg.Any<CancellationToken>());
        result.Should().BeOfType<NotFound>();
    }
}