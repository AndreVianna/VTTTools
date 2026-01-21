namespace VttTools.Library.Handlers;

public class EncounterHandlersTests {
    private readonly IEncounterService _encounterService = Substitute.For<IEncounterService>();
    private readonly HttpContext _httpContext = Substitute.For<HttpContext>();
    private readonly ClaimsPrincipal _user = Substitute.For<ClaimsPrincipal>();
    private static readonly Guid _userId = Guid.CreateVersion7();

    public EncounterHandlersTests() {
        // Setup user claims
        var claim = new Claim(ClaimTypes.NameIdentifier, _userId.ToString());
        var claims = new List<Claim> { claim };
        _user.Claims.Returns(claims);
        _user.FindFirst(ClaimTypes.NameIdentifier).Returns(claim);
        _httpContext.User.Returns(_user);
    }

    [Fact]
    public async Task GetEncountersHandler_ReturnsOkResult() {
        // Arrange
        var encounters = new[] {
            new Encounter { Id = Guid.CreateVersion7(), Name = "Encounter 1" },
            new Encounter { Id = Guid.CreateVersion7(), Name = "Encounter 2" },
        };

        _encounterService.GetAllAsync(Arg.Any<CancellationToken>())
            .Returns(encounters);

        // Act
        var result = await EncounterHandlers.GetEncountersHandler(_encounterService);

        // Assert
        var response = result.Should().BeOfType<Ok<Encounter[]>>().Subject;
        response.Value.Should().BeEquivalentTo(encounters);
    }

    [Fact]
    public async Task GetEncounterByIdHandler_WithExistingId_ReturnsOkResult() {
        // Arrange
        var encounterId = Guid.CreateVersion7();
        var encounter = new Encounter { Id = encounterId, Name = "Test Encounter" };

        _encounterService.GetByIdAsync(encounterId, Arg.Any<CancellationToken>())
            .Returns(encounter);

        // Act
        var result = await EncounterHandlers.GetEncounterByIdHandler(encounterId, _encounterService);

        // Assert
        var response = result.Should().BeOfType<Ok<Encounter>>().Subject;
        response.Value.Should().BeEquivalentTo(encounter);
    }

    [Fact]
    public async Task GetEncounterByIdHandler_WithNonExistingId_ReturnsNotFound() {
        // Arrange
        var encounterId = Guid.CreateVersion7();

        _encounterService.GetByIdAsync(encounterId, Arg.Any<CancellationToken>())
            .Returns((Encounter?)null);

        // Act
        var result = await EncounterHandlers.GetEncounterByIdHandler(encounterId, _encounterService);

        // Assert
        result.Should().BeOfType<NotFound>();
    }

    [Fact]
    public async Task UpdateEncounterHandler_WithValidRequest_ReturnsNoContent() {
        // Arrange
        var encounterId = Guid.CreateVersion7();
        var request = new EncounterUpdateRequest { Name = "Updated Encounter" };

        _encounterService.UpdateAsync(_userId, encounterId, Arg.Any<EncounterUpdateData>(), Arg.Any<CancellationToken>())
            .Returns(Result.Success());

        // Act
        var result = await EncounterHandlers.UpdateEncounterHandler(_httpContext, encounterId, request, _encounterService);

        // Assert
        result.Should().BeOfType<NoContent>();
    }

    [Fact]
    public async Task UpdateEncounterHandler_WithNonExistingId_ReturnsNotFound() {
        // Arrange
        var encounterId = Guid.CreateVersion7();
        var request = new EncounterUpdateRequest { Name = "Updated Encounter" };

        _encounterService.UpdateAsync(_userId, encounterId, Arg.Any<EncounterUpdateData>(), Arg.Any<CancellationToken>())
            .Returns(Result.Failure("NotFound"));

        // Act
        var result = await EncounterHandlers.UpdateEncounterHandler(_httpContext, encounterId, request, _encounterService);

        // Assert
        result.Should().BeOfType<NotFound>();
    }

    // === Actor Handler Tests ===

    [Fact]
    public async Task GetActorsHandler_ReturnsOkResult() {
        // Arrange
        var encounterId = Guid.CreateVersion7();
        var actors = new[] {
            new EncounterActor { Index = 0, Name = "Actor 1" },
            new EncounterActor { Index = 1, Name = "Actor 2" },
        };

        _encounterService.GetActorsAsync(encounterId, Arg.Any<CancellationToken>())
            .Returns(actors);

        // Act
        var result = await EncounterHandlers.GetActorsHandler(encounterId, _encounterService);

        // Assert
        var response = result.Should().BeOfType<Ok<EncounterActor[]>>().Subject;
        response.Value.Should().BeEquivalentTo(actors);
    }

    [Fact]
    public async Task AddActorHandler_WithValidRequest_ReturnsOkResult() {
        // Arrange
        var encounterId = Guid.CreateVersion7();
        var assetId = Guid.CreateVersion7();
        var request = new EncounterActorAddRequest {
            Name = "New Actor",
            Position = new(20, 30),
        };
        var actor = new EncounterActor {
            Asset = new() { Id = assetId },
            Index = 0,
            Name = "New Actor",
            Position = new(20, 30),
        };

        _encounterService.AddActorAsync(_userId, encounterId, assetId, Arg.Any<EncounterActorAddData>(), Arg.Any<CancellationToken>())
            .Returns(Result.Success(actor));

        // Act
        var result = await EncounterHandlers.AddActorHandler(_httpContext, encounterId, assetId, request, _encounterService);

        // Assert
        var response = result.Should().BeOfType<Ok<EncounterActorResponse>>().Subject;
        response.Value!.Name.Should().Be("New Actor");
    }

    [Fact]
    public async Task AddActorHandler_WhenNotFound_ReturnsNotFound() {
        // Arrange
        var encounterId = Guid.CreateVersion7();
        var assetId = Guid.CreateVersion7();
        var request = new EncounterActorAddRequest {
            Name = "New Actor",
            Position = new(20, 30),
        };

        _encounterService.AddActorAsync(_userId, encounterId, assetId, Arg.Any<EncounterActorAddData>(), Arg.Any<CancellationToken>())
            .Returns(Result.Failure<EncounterActor>(null!, new Error("NotFound")));

        // Act
        var result = await EncounterHandlers.AddActorHandler(_httpContext, encounterId, assetId, request, _encounterService);

        // Assert
        result.Should().BeOfType<NotFound>();
    }

    [Fact]
    public async Task UpdateActorHandler_WithValidRequest_ReturnsNoContent() {
        // Arrange
        var encounterId = Guid.CreateVersion7();
        const int actorIndex = 0;
        var request = new EncounterActorUpdateRequest {
            Name = "Updated Actor",
            Position = new Position(50, 100),
        };

        _encounterService.UpdateActorAsync(_userId, encounterId, actorIndex, Arg.Any<EncounterActorUpdateData>(), Arg.Any<CancellationToken>())
            .Returns(Result.Success());

        // Act
        var result = await EncounterHandlers.UpdateActorHandler(_httpContext, encounterId, actorIndex, request, _encounterService);

        // Assert
        result.Should().BeOfType<NoContent>();
    }

    [Fact]
    public async Task UpdateActorHandler_WhenNotFound_ReturnsNotFound() {
        // Arrange
        var encounterId = Guid.CreateVersion7();
        const int actorIndex = 0;
        var request = new EncounterActorUpdateRequest {
            Name = "Updated Actor",
        };

        _encounterService.UpdateActorAsync(_userId, encounterId, actorIndex, Arg.Any<EncounterActorUpdateData>(), Arg.Any<CancellationToken>())
            .Returns(Result.Failure("NotFound"));

        // Act
        var result = await EncounterHandlers.UpdateActorHandler(_httpContext, encounterId, actorIndex, request, _encounterService);

        // Assert
        result.Should().BeOfType<NotFound>();
    }

    [Fact]
    public async Task RemoveActorHandler_WithValidRequest_ReturnsNoContent() {
        // Arrange
        var encounterId = Guid.CreateVersion7();
        const int actorIndex = 0;

        _encounterService.RemoveActorAsync(_userId, encounterId, actorIndex, Arg.Any<CancellationToken>())
            .Returns(Result.Success());

        // Act
        var result = await EncounterHandlers.RemoveActorHandler(_httpContext, encounterId, actorIndex, _encounterService);

        // Assert
        result.Should().BeOfType<NoContent>();
    }

    [Fact]
    public async Task RemoveActorHandler_WhenNotFound_ReturnsNotFound() {
        // Arrange
        var encounterId = Guid.CreateVersion7();
        const int actorIndex = 0;

        _encounterService.RemoveActorAsync(_userId, encounterId, actorIndex, Arg.Any<CancellationToken>())
            .Returns(Result.Failure("NotFound"));

        // Act
        var result = await EncounterHandlers.RemoveActorHandler(_httpContext, encounterId, actorIndex, _encounterService);

        // Assert
        result.Should().BeOfType<NotFound>();
    }

    // === Effect Handler Tests ===

    [Fact]
    public async Task GetEffectsHandler_ReturnsOkResult() {
        // Arrange
        var encounterId = Guid.CreateVersion7();
        var effects = new[] {
            new EncounterEffect { Index = 0, Name = "Effect 1" },
            new EncounterEffect { Index = 1, Name = "Effect 2" },
        };

        _encounterService.GetEffectsAsync(encounterId, Arg.Any<CancellationToken>())
            .Returns(effects);

        // Act
        var result = await EncounterHandlers.GetEffectsHandler(encounterId, _encounterService);

        // Assert
        var response = result.Should().BeOfType<Ok<EncounterEffect[]>>().Subject;
        response.Value.Should().BeEquivalentTo(effects);
    }

    [Fact]
    public async Task AddEffectHandler_WithValidRequest_ReturnsOkResult() {
        // Arrange
        var encounterId = Guid.CreateVersion7();
        var assetId = Guid.CreateVersion7();
        var request = new EncounterEffectAddRequest {
            Name = "Wall of Fire",
            Position = new(10, 20),
        };
        var effect = new EncounterEffect {
            Asset = new() { Id = assetId },
            Index = 0,
            Name = "Wall of Fire",
            Position = new(10, 20),
            EnabledDisplay = new() { Id = Guid.CreateVersion7() },
        };

        _encounterService.AddEffectAsync(_userId, encounterId, assetId, Arg.Any<EncounterEffectAddData>(), Arg.Any<CancellationToken>())
            .Returns(Result.Success(effect));

        // Act
        var result = await EncounterHandlers.AddEffectHandler(_httpContext, encounterId, assetId, request, _encounterService);

        // Assert
        var response = result.Should().BeOfType<Ok<EncounterEffectResponse>>().Subject;
        response.Value!.Name.Should().Be("Wall of Fire");
    }

    // NOTE: Decoration and Audio handler tests removed - structural elements are now on Stage
}