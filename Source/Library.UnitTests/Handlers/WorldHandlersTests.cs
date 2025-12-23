namespace VttTools.Library.Handlers;

public class WorldHandlersTests {
    private readonly IWorldService _worldService;
    private readonly Guid _userId = Guid.CreateVersion7();
    private readonly CancellationToken _ct;

    public WorldHandlersTests() {
        _worldService = Substitute.For<IWorldService>();
        _ct = TestContext.Current.CancellationToken;
    }

    private static HttpContext CreateHttpContext(Guid userId) {
        var context = new DefaultHttpContext();
        var claims = new[] { new Claim(ClaimTypes.NameIdentifier, userId.ToString()) };
        var identity = new ClaimsIdentity(claims, "TestAuthType");
        context.User = new ClaimsPrincipal(identity);
        return context;
    }

    [Fact]
    public async Task GetWorldsHandler_ReturnsWorlds() {
        var context = CreateHttpContext(_userId);
        var worlds = new[] {
            new World { Id = Guid.CreateVersion7(), Name = "World 1", OwnerId = _userId },
            new World { Id = Guid.CreateVersion7(), Name = "World 2", OwnerId = _userId },
        };
        _worldService.GetWorldsAsync($"AvailableTo:{_userId}", Arg.Any<CancellationToken>())
            .Returns(worlds);

        var result = await WorldHandlers.GetWorldsHandler(context, _worldService);

        var okResult = result.Should().BeOfType<Ok<World[]>>().Subject;
        okResult.Value.Should().BeEquivalentTo(worlds);
        await _worldService.Received(1).GetWorldsAsync($"AvailableTo:{_userId}", Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task GetWorldByIdHandler_WithExistingWorld_ReturnsOk() {
        var worldId = Guid.CreateVersion7();
        var world = new World { Id = worldId, Name = "Test World", OwnerId = _userId };
        _worldService.GetWorldByIdAsync(worldId, Arg.Any<CancellationToken>())
            .Returns(world);

        var result = await WorldHandlers.GetWorldByIdHandler(worldId, _worldService);

        var okResult = result.Should().BeOfType<Ok<World>>().Subject;
        okResult.Value.Should().BeEquivalentTo(world);
        await _worldService.Received(1).GetWorldByIdAsync(worldId, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task GetWorldByIdHandler_WithNonExistentWorld_ReturnsNotFound() {
        var worldId = Guid.CreateVersion7();
        _worldService.GetWorldByIdAsync(worldId, Arg.Any<CancellationToken>())
            .Returns((World?)null);

        var result = await WorldHandlers.GetWorldByIdHandler(worldId, _worldService);

        result.Should().BeOfType<NotFound>();
        await _worldService.Received(1).GetWorldByIdAsync(worldId, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task CreateWorldHandler_WithValidData_ReturnsCreated() {
        var context = CreateHttpContext(_userId);
        var request = new CreateWorldRequest {
            Name = "New World",
            Description = "World description",
            BackgroundId = Guid.CreateVersion7(),
        };
        var world = new World {
            Id = Guid.CreateVersion7(),
            Name = request.Name,
            Description = request.Description,
            OwnerId = _userId,
        };
        _worldService.CreateWorldAsync(_userId, Arg.Any<CreateWorldData>(), Arg.Any<CancellationToken>())
            .Returns(Result.Success(world));

        var result = await WorldHandlers.CreateWorldHandler(context, request, _worldService);

        var createdResult = result.Should().BeOfType<Created<World>>().Subject;
        createdResult.Value.Should().BeEquivalentTo(world);
        createdResult.Location.Should().Be($"/api/worlds/{world.Id}");
        await _worldService.Received(1).CreateWorldAsync(_userId, Arg.Any<CreateWorldData>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task CreateWorldHandler_WithInvalidData_ReturnsValidationProblem() {
        var context = CreateHttpContext(_userId);
        var request = new CreateWorldRequest {
            Name = "",
            Description = "World description",
        };
        var error = new Error("Name", "Name is required");
        _worldService.CreateWorldAsync(_userId, Arg.Any<CreateWorldData>(), Arg.Any<CancellationToken>())
            .Returns(Result.Failure<World>(null!, error));

        var result = await WorldHandlers.CreateWorldHandler(context, request, _worldService);

        result.Should().BeOfType<ProblemHttpResult>();
        await _worldService.Received(1).CreateWorldAsync(_userId, Arg.Any<CreateWorldData>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task CloneWorldHandler_WithValidId_ReturnsCreated() {
        var context = CreateHttpContext(_userId);
        var worldId = Guid.CreateVersion7();
        var clonedWorld = new World {
            Id = Guid.CreateVersion7(),
            Name = "World (Copy)",
            OwnerId = _userId,
        };
        _worldService.CloneWorldAsync(_userId, worldId, Arg.Any<CancellationToken>())
            .Returns(Result.Success(clonedWorld));

        var result = await WorldHandlers.CloneWorldHandler(context, worldId, _worldService);

        var createdResult = result.Should().BeOfType<Created<World>>().Subject;
        createdResult.Value.Should().BeEquivalentTo(clonedWorld);
        createdResult.Location.Should().Be($"/api/worlds/{clonedWorld.Id}");
        await _worldService.Received(1).CloneWorldAsync(_userId, worldId, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task CloneWorldHandler_WithNonExistentWorld_ReturnsNotFound() {
        var context = CreateHttpContext(_userId);
        var worldId = Guid.CreateVersion7();
        var error = new Error("NotFound");
        _worldService.CloneWorldAsync(_userId, worldId, Arg.Any<CancellationToken>())
            .Returns(Result.Failure<World>(null!, error));

        var result = await WorldHandlers.CloneWorldHandler(context, worldId, _worldService);

        result.Should().BeOfType<NotFound>();
        await _worldService.Received(1).CloneWorldAsync(_userId, worldId, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task CloneWorldHandler_WithUnauthorizedAccess_ReturnsForbid() {
        var context = CreateHttpContext(_userId);
        var worldId = Guid.CreateVersion7();
        var error = new Error("NotAllowed");
        _worldService.CloneWorldAsync(_userId, worldId, Arg.Any<CancellationToken>())
            .Returns(Result.Failure<World>(null!, error));

        var result = await WorldHandlers.CloneWorldHandler(context, worldId, _worldService);

        result.Should().BeOfType<ForbidHttpResult>();
        await _worldService.Received(1).CloneWorldAsync(_userId, worldId, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task CloneWorldHandler_WithValidationerror_ReturnsValidationProblem() {
        var context = CreateHttpContext(_userId);
        var worldId = Guid.CreateVersion7();
        var error = new Error("Name", "Name is too long");
        _worldService.CloneWorldAsync(_userId, worldId, Arg.Any<CancellationToken>())
            .Returns(Result.Failure<World>(null!, error));

        var result = await WorldHandlers.CloneWorldHandler(context, worldId, _worldService);

        result.Should().BeOfType<ProblemHttpResult>();
        await _worldService.Received(1).CloneWorldAsync(_userId, worldId, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task UpdateWorldHandler_WithValidData_ReturnsNoContent() {
        var context = CreateHttpContext(_userId);
        var worldId = Guid.CreateVersion7();
        var request = new UpdateWorldRequest {
            Name = "Updated World",
            Description = "Updated description",
            IsPublished = true,
            IsPublic = false,
        };
        var world = new World { Id = worldId, Name = request.Name.Value, OwnerId = _userId };
        _worldService.UpdateWorldAsync(_userId, worldId, Arg.Any<UpdatedWorldData>(), Arg.Any<CancellationToken>())
            .Returns(Result.Success(world));

        var result = await WorldHandlers.UpdateWorldHandler(context, worldId, request, _worldService);

        result.Should().BeOfType<NoContent>();
        await _worldService.Received(1).UpdateWorldAsync(_userId, worldId, Arg.Any<UpdatedWorldData>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task UpdateWorldHandler_WithNonExistentWorld_ReturnsNotFound() {
        var context = CreateHttpContext(_userId);
        var worldId = Guid.CreateVersion7();
        var request = new UpdateWorldRequest { Name = "Updated World" };
        var error = new Error("NotFound");
        _worldService.UpdateWorldAsync(_userId, worldId, Arg.Any<UpdatedWorldData>(), Arg.Any<CancellationToken>())
            .Returns(Result.Failure<World>(null!, error));

        var result = await WorldHandlers.UpdateWorldHandler(context, worldId, request, _worldService);

        result.Should().BeOfType<NotFound>();
        await _worldService.Received(1).UpdateWorldAsync(_userId, worldId, Arg.Any<UpdatedWorldData>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task UpdateWorldHandler_WithUnauthorizedAccess_ReturnsForbid() {
        var context = CreateHttpContext(_userId);
        var worldId = Guid.CreateVersion7();
        var request = new UpdateWorldRequest { Name = "Updated World" };
        var error = new Error("NotAllowed");
        _worldService.UpdateWorldAsync(_userId, worldId, Arg.Any<UpdatedWorldData>(), Arg.Any<CancellationToken>())
            .Returns(Result.Failure<World>(null!, error));

        var result = await WorldHandlers.UpdateWorldHandler(context, worldId, request, _worldService);

        result.Should().BeOfType<ForbidHttpResult>();
        await _worldService.Received(1).UpdateWorldAsync(_userId, worldId, Arg.Any<UpdatedWorldData>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task UpdateWorldHandler_WithValidationerror_ReturnsValidationProblem() {
        var context = CreateHttpContext(_userId);
        var worldId = Guid.CreateVersion7();
        var request = new UpdateWorldRequest { Name = "" };
        var error = new Error("Name", "Name is required");
        _worldService.UpdateWorldAsync(_userId, worldId, Arg.Any<UpdatedWorldData>(), Arg.Any<CancellationToken>())
            .Returns(Result.Failure<World>(null!, error));

        var result = await WorldHandlers.UpdateWorldHandler(context, worldId, request, _worldService);

        result.Should().BeOfType<ProblemHttpResult>();
        await _worldService.Received(1).UpdateWorldAsync(_userId, worldId, Arg.Any<UpdatedWorldData>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task DeleteWorldHandler_WithValidId_ReturnsNoContent() {
        var context = CreateHttpContext(_userId);
        var worldId = Guid.CreateVersion7();
        _worldService.DeleteWorldAsync(_userId, worldId, Arg.Any<CancellationToken>())
            .Returns(Result.Success());

        var result = await WorldHandlers.DeleteWorldHandler(context, worldId, _worldService);

        result.Should().BeOfType<NoContent>();
        await _worldService.Received(1).DeleteWorldAsync(_userId, worldId, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task DeleteWorldHandler_WithNonExistentWorld_ReturnsNotFound() {
        var context = CreateHttpContext(_userId);
        var worldId = Guid.CreateVersion7();
        var error = new Error("NotFound");
        _worldService.DeleteWorldAsync(_userId, worldId, Arg.Any<CancellationToken>())
            .Returns(Result.Failure(error));

        var result = await WorldHandlers.DeleteWorldHandler(context, worldId, _worldService);

        result.Should().BeOfType<NotFound>();
        await _worldService.Received(1).DeleteWorldAsync(_userId, worldId, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task DeleteWorldHandler_WithUnauthorizedAccess_ReturnsForbid() {
        var context = CreateHttpContext(_userId);
        var worldId = Guid.CreateVersion7();
        var error = new Error("NotAllowed");
        _worldService.DeleteWorldAsync(_userId, worldId, Arg.Any<CancellationToken>())
            .Returns(Result.Failure(error));

        var result = await WorldHandlers.DeleteWorldHandler(context, worldId, _worldService);

        result.Should().BeOfType<ForbidHttpResult>();
        await _worldService.Received(1).DeleteWorldAsync(_userId, worldId, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task DeleteWorldHandler_WithValidationerror_ReturnsValidationProblem() {
        var context = CreateHttpContext(_userId);
        var worldId = Guid.CreateVersion7();
        var error = new Error("World", "World has dependencies");
        _worldService.DeleteWorldAsync(_userId, worldId, Arg.Any<CancellationToken>())
            .Returns(Result.Failure(error));

        var result = await WorldHandlers.DeleteWorldHandler(context, worldId, _worldService);

        result.Should().BeOfType<ProblemHttpResult>();
        await _worldService.Received(1).DeleteWorldAsync(_userId, worldId, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task GetCampaignsHandler_WithOwner_ReturnsCampaigns() {
        var context = CreateHttpContext(_userId);
        var worldId = Guid.CreateVersion7();
        var world = new World {
            Id = worldId,
            Name = "World",
            OwnerId = _userId,
            IsPublished = false,
            IsPublic = false,
        };
        var campaigns = new[] {
            new Campaign { Id = Guid.CreateVersion7(), Name = "Campaign 1" },
            new Campaign { Id = Guid.CreateVersion7(), Name = "Campaign 2" },
        };
        _worldService.GetWorldByIdAsync(worldId, Arg.Any<CancellationToken>())
            .Returns(world);
        _worldService.GetCampaignsAsync(worldId, Arg.Any<CancellationToken>())
            .Returns(campaigns);

        var result = await WorldHandlers.GetCampaignsHandler(context, worldId, _worldService);

        var okResult = result.Should().BeOfType<Ok<Campaign[]>>().Subject;
        okResult.Value.Should().BeEquivalentTo(campaigns);
        await _worldService.Received(1).GetWorldByIdAsync(worldId, Arg.Any<CancellationToken>());
        await _worldService.Received(1).GetCampaignsAsync(worldId, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task GetCampaignsHandler_WithPublicWorld_ReturnsCampaigns() {
        var context = CreateHttpContext(_userId);
        var worldId = Guid.CreateVersion7();
        var otherUserId = Guid.CreateVersion7();
        var world = new World {
            Id = worldId,
            Name = "World",
            OwnerId = otherUserId,
            IsPublished = true,
            IsPublic = true,
        };
        var campaigns = new[] {
            new Campaign { Id = Guid.CreateVersion7(), Name = "Campaign 1" },
        };
        _worldService.GetWorldByIdAsync(worldId, Arg.Any<CancellationToken>())
            .Returns(world);
        _worldService.GetCampaignsAsync(worldId, Arg.Any<CancellationToken>())
            .Returns(campaigns);

        var result = await WorldHandlers.GetCampaignsHandler(context, worldId, _worldService);

        var okResult = result.Should().BeOfType<Ok<Campaign[]>>().Subject;
        okResult.Value.Should().BeEquivalentTo(campaigns);
    }

    [Fact]
    public async Task GetCampaignsHandler_WithNonExistentWorld_ReturnsNotFound() {
        var context = CreateHttpContext(_userId);
        var worldId = Guid.CreateVersion7();
        _worldService.GetWorldByIdAsync(worldId, Arg.Any<CancellationToken>())
            .Returns((World?)null);

        var result = await WorldHandlers.GetCampaignsHandler(context, worldId, _worldService);

        result.Should().BeOfType<NotFound>();
        await _worldService.Received(1).GetWorldByIdAsync(worldId, Arg.Any<CancellationToken>());
        await _worldService.DidNotReceive().GetCampaignsAsync(Arg.Any<Guid>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task GetCampaignsHandler_WithUnauthorizedAccess_ReturnsForbid() {
        var context = CreateHttpContext(_userId);
        var worldId = Guid.CreateVersion7();
        var otherUserId = Guid.CreateVersion7();
        var world = new World {
            Id = worldId,
            Name = "World",
            OwnerId = otherUserId,
            IsPublished = false,
            IsPublic = false,
        };
        _worldService.GetWorldByIdAsync(worldId, Arg.Any<CancellationToken>())
            .Returns(world);

        var result = await WorldHandlers.GetCampaignsHandler(context, worldId, _worldService);

        result.Should().BeOfType<ForbidHttpResult>();
        await _worldService.DidNotReceive().GetCampaignsAsync(Arg.Any<Guid>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task AddNewCampaignHandler_WithValidId_ReturnsOk() {
        var context = CreateHttpContext(_userId);
        var worldId = Guid.CreateVersion7();
        var campaign = new Campaign {
            Id = Guid.CreateVersion7(),
            Name = "New Campaign",
            OwnerId = _userId,
        };
        _worldService.AddNewCampaignAsync(_userId, worldId, Arg.Any<CancellationToken>())
            .Returns(Result.Success(campaign));

        var result = await WorldHandlers.AddNewCampaignHandler(context, worldId, _worldService);

        var okResult = result.Should().BeOfType<Ok<Campaign>>().Subject;
        okResult.Value.Should().BeEquivalentTo(campaign);
        await _worldService.Received(1).AddNewCampaignAsync(_userId, worldId, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task AddNewCampaignHandler_WithNonExistentWorld_ReturnsNotFound() {
        var context = CreateHttpContext(_userId);
        var worldId = Guid.CreateVersion7();
        var error = new Error("NotFound");
        _worldService.AddNewCampaignAsync(_userId, worldId, Arg.Any<CancellationToken>())
            .Returns(Result.Failure<Campaign>(null!, error));

        var result = await WorldHandlers.AddNewCampaignHandler(context, worldId, _worldService);

        result.Should().BeOfType<NotFound>();
    }

    [Fact]
    public async Task AddNewCampaignHandler_WithUnauthorizedAccess_ReturnsForbid() {
        var context = CreateHttpContext(_userId);
        var worldId = Guid.CreateVersion7();
        var error = new Error("NotAllowed");
        _worldService.AddNewCampaignAsync(_userId, worldId, Arg.Any<CancellationToken>())
            .Returns(Result.Failure<Campaign>(null!, error));

        var result = await WorldHandlers.AddNewCampaignHandler(context, worldId, _worldService);

        result.Should().BeOfType<ForbidHttpResult>();
    }

    [Fact]
    public async Task AddClonedCampaignHandler_WithValidIds_ReturnsOk() {
        var context = CreateHttpContext(_userId);
        var worldId = Guid.CreateVersion7();
        var campaignId = Guid.CreateVersion7();
        var clonedCampaign = new Campaign {
            Id = Guid.CreateVersion7(),
            Name = "Campaign (Copy)",
            OwnerId = _userId,
        };
        _worldService.AddClonedCampaignAsync(_userId, worldId, campaignId, Arg.Any<CancellationToken>())
            .Returns(Result.Success(clonedCampaign));

        var result = await WorldHandlers.AddClonedCampaignHandler(context, worldId, campaignId, _worldService);

        var okResult = result.Should().BeOfType<Ok<Campaign>>().Subject;
        okResult.Value.Should().BeEquivalentTo(clonedCampaign);
        await _worldService.Received(1).AddClonedCampaignAsync(_userId, worldId, campaignId, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task AddClonedCampaignHandler_WithNonExistentWorld_ReturnsNotFound() {
        var context = CreateHttpContext(_userId);
        var worldId = Guid.CreateVersion7();
        var campaignId = Guid.CreateVersion7();
        var error = new Error("NotFound");
        _worldService.AddClonedCampaignAsync(_userId, worldId, campaignId, Arg.Any<CancellationToken>())
            .Returns(Result.Failure<Campaign>(null!, error));

        var result = await WorldHandlers.AddClonedCampaignHandler(context, worldId, campaignId, _worldService);

        result.Should().BeOfType<NotFound>();
    }

    [Fact]
    public async Task AddClonedCampaignHandler_WithUnauthorizedAccess_ReturnsForbid() {
        var context = CreateHttpContext(_userId);
        var worldId = Guid.CreateVersion7();
        var campaignId = Guid.CreateVersion7();
        var error = new Error("NotAllowed");
        _worldService.AddClonedCampaignAsync(_userId, worldId, campaignId, Arg.Any<CancellationToken>())
            .Returns(Result.Failure<Campaign>(null!, error));

        var result = await WorldHandlers.AddClonedCampaignHandler(context, worldId, campaignId, _worldService);

        result.Should().BeOfType<ForbidHttpResult>();
    }

    [Fact]
    public async Task RemoveCampaignHandler_WithValidIds_ReturnsNoContent() {
        var context = CreateHttpContext(_userId);
        var worldId = Guid.CreateVersion7();
        var campaignId = Guid.CreateVersion7();
        _worldService.RemoveCampaignAsync(_userId, worldId, campaignId, Arg.Any<CancellationToken>())
            .Returns(Result.Success());

        var result = await WorldHandlers.RemoveCampaignHandler(context, worldId, campaignId, _worldService);

        result.Should().BeOfType<NoContent>();
        await _worldService.Received(1).RemoveCampaignAsync(_userId, worldId, campaignId, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task RemoveCampaignHandler_WithNonExistentWorld_ReturnsNotFound() {
        var context = CreateHttpContext(_userId);
        var worldId = Guid.CreateVersion7();
        var campaignId = Guid.CreateVersion7();
        var error = new Error("NotFound");
        _worldService.RemoveCampaignAsync(_userId, worldId, campaignId, Arg.Any<CancellationToken>())
            .Returns(Result.Failure(error));

        var result = await WorldHandlers.RemoveCampaignHandler(context, worldId, campaignId, _worldService);

        result.Should().BeOfType<NotFound>();
    }

    [Fact]
    public async Task RemoveCampaignHandler_WithUnauthorizedAccess_ReturnsForbid() {
        var context = CreateHttpContext(_userId);
        var worldId = Guid.CreateVersion7();
        var campaignId = Guid.CreateVersion7();
        var error = new Error("NotAllowed");
        _worldService.RemoveCampaignAsync(_userId, worldId, campaignId, Arg.Any<CancellationToken>())
            .Returns(Result.Failure(error));

        var result = await WorldHandlers.RemoveCampaignHandler(context, worldId, campaignId, _worldService);

        result.Should().BeOfType<ForbidHttpResult>();
    }
}
