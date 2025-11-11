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

        _encounterService.GetEncountersAsync(Arg.Any<CancellationToken>())
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

        _encounterService.GetEncounterByIdAsync(encounterId, Arg.Any<CancellationToken>())
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

        _encounterService.GetEncounterByIdAsync(encounterId, Arg.Any<CancellationToken>())
            .Returns((Encounter?)null);

        // Act
        var result = await EncounterHandlers.GetEncounterByIdHandler(encounterId, _encounterService);

        // Assert
        result.Should().BeOfType<NotFound>();
    }

    [Fact]
    public async Task UpdateEncounterHandler_WithValidRequest_ReturnsOkResult() {
        // Arrange
        var encounterId = Guid.CreateVersion7();
        var request = new EncounterUpdateRequest { Name = "Updated Encounter" };
        var encounter = new Encounter { Id = encounterId, Name = "Updated Encounter" };

        _encounterService.UpdateEncounterAsync(_userId, encounterId, Arg.Any<EncounterUpdateData>(), Arg.Any<CancellationToken>())
            .Returns(Result.Success());

        // Act
        var result = await EncounterHandlers.UpdateEncounterHandler(_httpContext, encounterId, request, _encounterService);

        // Assert
        // NOTE: UpdateEncounterHandler returns NoContent on success, not Ok<Encounter>
        result.Should().BeOfType<NoContent>();
    }

    [Fact]
    public async Task UpdateEncounterHandler_WithNonExistingId_ReturnsNotFound() {
        // Arrange
        var encounterId = Guid.CreateVersion7();
        var request = new EncounterUpdateRequest { Name = "Updated Encounter" };

        _encounterService.UpdateEncounterAsync(_userId, encounterId, Arg.Any<EncounterUpdateData>(), Arg.Any<CancellationToken>())
            .Returns(Result.Failure("NotFound"));

        // Act
        var result = await EncounterHandlers.UpdateEncounterHandler(_httpContext, encounterId, request, _encounterService);

        // Assert
        result.Should().BeOfType<NotFound>();
    }

    [Fact]
    public async Task GetAssetsHandler_ReturnsOkResult() {
        // Arrange
        var encounterId = Guid.CreateVersion7();
        var assets = new[] {
            new EncounterAsset { Index = 1, Name = "Asset 1" },
            new EncounterAsset { Index = 2, Name = "Asset 2" },
        };

        _encounterService.GetAssetsAsync(encounterId, Arg.Any<CancellationToken>())
            .Returns(assets);

        // Act
        var result = await EncounterHandlers.GetAssetsHandler(encounterId, _encounterService);

        // Assert
        var response = result.Should().BeOfType<Ok<EncounterAsset[]>>().Subject;
        response.Value.Should().BeEquivalentTo(assets);
    }

    [Fact]
    public async Task UpdateAssetHandler_WithValidRequest_ReturnsCreatedResult() {
        // Arrange
        var encounterId = Guid.CreateVersion7();
        var assetId = Guid.CreateVersion7();
        const int number = 1;
        var request = new EncounterAssetUpdateRequest {
            Position = new Position(20, 30),
            Size = new NamedSize { Width = 10, Height = 50 },
            Frame = new Frame {
                Shape = FrameShape.Square,
                BorderThickness = 2,
                BorderColor = "black",
                Background = "white",
            },
            Elevation = 10,
            Rotation = 45,
        };

        _encounterService.UpdateAssetAsync(_userId, encounterId, number, Arg.Any<EncounterAssetUpdateData>(), Arg.Any<CancellationToken>())
            .Returns(Result.Success());

        // Act
        var result = await EncounterHandlers.UpdateAssetHandler(_httpContext, encounterId, number, request, _encounterService);

        // Assert
        result.Should().BeOfType<NoContent>();
    }

    [Fact]
    public async Task UpdateAssetHandler_WithInvalidAsset_ReturnsBadRequest() {
        // Arrange
        var encounterId = Guid.CreateVersion7();
        const int number = 1;
        var request = new EncounterAssetUpdateRequest {
            Position = new Position(20, 30),
            Size = new NamedSize { Width = 10, Height = 50 },
            Frame = new Frame {
                Shape = FrameShape.Square,
                BorderThickness = 2,
                BorderColor = "black",
                Background = "white",
            },
            Elevation = 10,
            Rotation = 45,
        };

        _encounterService.UpdateAssetAsync(_userId, encounterId, number, Arg.Any<EncounterAssetUpdateData>(), Arg.Any<CancellationToken>())
            .Returns(Result.Failure("Some error."));

        // Act
        var result = await EncounterHandlers.UpdateAssetHandler(_httpContext, encounterId, number, request, _encounterService);

        // Assert
        // NOTE: Handler returns BadRequest<IReadOnlyList<Error>>, not BadRequest
        result.Should().BeOfType<ProblemHttpResult>();
    }

    [Fact]
    public async Task RemoveAssetHandler_WithValidRequest_ReturnsCreatedResult() {
        // Arrange
        var encounterId = Guid.CreateVersion7();
        const int number = 1;

        _encounterService.RemoveAssetAsync(_userId, encounterId, number, Arg.Any<CancellationToken>())
            .Returns(Result.Success());

        // Act
        var result = await EncounterHandlers.RemoveAssetHandler(_httpContext, encounterId, number, _encounterService);

        // Assert
        result.Should().BeOfType<NoContent>();
    }

    [Fact]
    public async Task RemoveAssetHandler_WithInvalidAsset_ReturnsBadRequest() {
        // Arrange
        var encounterId = Guid.CreateVersion7();
        const int number = 1;

        _encounterService.RemoveAssetAsync(_userId, encounterId, number, Arg.Any<CancellationToken>())
            .Returns(Result.Failure("NotFound"));

        // Act
        var result = await EncounterHandlers.RemoveAssetHandler(_httpContext, encounterId, number, _encounterService);

        // Assert
        result.Should().BeOfType<NotFound>();
    }
}