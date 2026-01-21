namespace VttTools.Library.Handlers;

public class CampaignHandlersTests {
    private readonly ICampaignService _campaignService = Substitute.For<ICampaignService>();
    private readonly Guid _userId = Guid.CreateVersion7();

    private static HttpContext CreateHttpContext(Guid userId) {
        var context = new DefaultHttpContext();
        var claims = new[] { new Claim(ClaimTypes.NameIdentifier, userId.ToString()) };
        var identity = new ClaimsIdentity(claims, "TestAuthType");
        context.User = new(identity);
        return context;
    }

    [Fact]
    public async Task GetCampaignsHandler_ReturnsCampaigns() {
        var context = CreateHttpContext(_userId);
        var campaigns = new[] {
            new Campaign { Id = Guid.CreateVersion7(), Name = "Campaign 1", OwnerId = _userId },
            new Campaign { Id = Guid.CreateVersion7(), Name = "Campaign 2", OwnerId = _userId },
        };
        _campaignService.GetCampaignsAsync($"AvailableTo:{_userId}", Arg.Any<CancellationToken>())
            .Returns(campaigns);

        var result = await CampaignHandlers.GetCampaignsHandler(context, _campaignService);

        var okResult = result.Should().BeOfType<Ok<Campaign[]>>().Subject;
        okResult.Value.Should().BeEquivalentTo(campaigns);
        await _campaignService.Received(1).GetCampaignsAsync($"AvailableTo:{_userId}", Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task GetCampaignByIdHandler_WithExistingCampaign_ReturnsOk() {
        var campaignId = Guid.CreateVersion7();
        var campaign = new Campaign { Id = campaignId, Name = "Test Campaign", OwnerId = _userId };
        _campaignService.GetCampaignByIdAsync(campaignId, Arg.Any<CancellationToken>())
            .Returns(campaign);

        var result = await CampaignHandlers.GetCampaignByIdHandler(campaignId, _campaignService);

        var okResult = result.Should().BeOfType<Ok<Campaign>>().Subject;
        okResult.Value.Should().BeEquivalentTo(campaign);
        await _campaignService.Received(1).GetCampaignByIdAsync(campaignId, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task GetCampaignByIdHandler_WithNonExistentCampaign_ReturnsNotFound() {
        var campaignId = Guid.CreateVersion7();
        _campaignService.GetCampaignByIdAsync(campaignId, Arg.Any<CancellationToken>())
            .Returns((Campaign?)null);

        var result = await CampaignHandlers.GetCampaignByIdHandler(campaignId, _campaignService);

        result.Should().BeOfType<NotFound>();
        await _campaignService.Received(1).GetCampaignByIdAsync(campaignId, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task CreateCampaignHandler_WithValidData_ReturnsCreated() {
        var context = CreateHttpContext(_userId);
        var request = new CreateCampaignRequest {
            Name = "New Campaign",
            Description = "Campaign description",
            BackgroundId = Guid.CreateVersion7(),
        };
        var campaign = new Campaign {
            Id = Guid.CreateVersion7(),
            Name = request.Name,
            Description = request.Description,
            OwnerId = _userId,
        };
        _campaignService.CreateCampaignAsync(_userId, Arg.Any<CreateCampaignData>(), Arg.Any<CancellationToken>())
            .Returns(Result.Success(campaign));

        var result = await CampaignHandlers.CreateCampaignHandler(context, request, _campaignService);

        var createdResult = result.Should().BeOfType<Created<Campaign>>().Subject;
        createdResult.Value.Should().BeEquivalentTo(campaign);
        createdResult.Location.Should().Be($"/api/campaigns/{campaign.Id}");
        await _campaignService.Received(1).CreateCampaignAsync(_userId, Arg.Any<CreateCampaignData>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task CreateCampaignHandler_WithInvalidData_ReturnsValidationProblem() {
        var context = CreateHttpContext(_userId);
        var request = new CreateCampaignRequest {
            Name = "",
            Description = "Campaign description",
        };
        var error = new Error("Name", "Name is required");
        _campaignService.CreateCampaignAsync(_userId, Arg.Any<CreateCampaignData>(), Arg.Any<CancellationToken>())
            .Returns(Result.Failure<Campaign>(null!, error));

        var result = await CampaignHandlers.CreateCampaignHandler(context, request, _campaignService);

        result.Should().BeOfType<ProblemHttpResult>();
        await _campaignService.Received(1).CreateCampaignAsync(_userId, Arg.Any<CreateCampaignData>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task CloneCampaignHandler_WithValidId_ReturnsCreated() {
        var context = CreateHttpContext(_userId);
        var campaignId = Guid.CreateVersion7();
        var clonedCampaign = new Campaign {
            Id = Guid.CreateVersion7(),
            Name = "Campaign (Copy)",
            OwnerId = _userId,
        };
        _campaignService.CloneCampaignAsync(_userId, campaignId, Arg.Any<CancellationToken>())
            .Returns(Result.Success(clonedCampaign));

        var result = await CampaignHandlers.CloneCampaignHandler(context, campaignId, _campaignService);

        var createdResult = result.Should().BeOfType<Created<Campaign>>().Subject;
        createdResult.Value.Should().BeEquivalentTo(clonedCampaign);
        createdResult.Location.Should().Be($"/api/campaigns/{clonedCampaign.Id}");
        await _campaignService.Received(1).CloneCampaignAsync(_userId, campaignId, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task CloneCampaignHandler_WithNonExistentCampaign_ReturnsNotFound() {
        var context = CreateHttpContext(_userId);
        var campaignId = Guid.CreateVersion7();
        var error = new Error("NotFound");
        _campaignService.CloneCampaignAsync(_userId, campaignId, Arg.Any<CancellationToken>())
            .Returns(Result.Failure<Campaign>(null!, error));

        var result = await CampaignHandlers.CloneCampaignHandler(context, campaignId, _campaignService);

        result.Should().BeOfType<NotFound>();
        await _campaignService.Received(1).CloneCampaignAsync(_userId, campaignId, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task CloneCampaignHandler_WithUnauthorizedAccess_ReturnsForbid() {
        var context = CreateHttpContext(_userId);
        var campaignId = Guid.CreateVersion7();
        var error = new Error("NotAllowed");
        _campaignService.CloneCampaignAsync(_userId, campaignId, Arg.Any<CancellationToken>())
            .Returns(Result.Failure<Campaign>(null!, error));

        var result = await CampaignHandlers.CloneCampaignHandler(context, campaignId, _campaignService);

        result.Should().BeOfType<ForbidHttpResult>();
        await _campaignService.Received(1).CloneCampaignAsync(_userId, campaignId, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task CloneCampaignHandler_WithValidationErrors_ReturnsValidationProblem() {
        var context = CreateHttpContext(_userId);
        var campaignId = Guid.CreateVersion7();
        var error = new Error("Name", "Name is too long");
        _campaignService.CloneCampaignAsync(_userId, campaignId, Arg.Any<CancellationToken>())
            .Returns(Result.Failure<Campaign>(null!, error));

        var result = await CampaignHandlers.CloneCampaignHandler(context, campaignId, _campaignService);

        result.Should().BeOfType<ProblemHttpResult>();
        await _campaignService.Received(1).CloneCampaignAsync(_userId, campaignId, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task UpdateCampaignHandler_WithValidData_ReturnsNoContent() {
        var context = CreateHttpContext(_userId);
        var campaignId = Guid.CreateVersion7();
        var request = new UpdateCampaignRequest {
            Name = "Updated Campaign",
            Description = "Updated description",
            IsPublished = true,
            IsPublic = false,
        };
        var campaign = new Campaign { Id = campaignId, Name = request.Name.Value, OwnerId = _userId };
        _campaignService.UpdateCampaignAsync(_userId, campaignId, Arg.Any<UpdatedCampaignData>(), Arg.Any<CancellationToken>())
            .Returns(Result.Success(campaign));

        var result = await CampaignHandlers.UpdateCampaignHandler(context, campaignId, request, _campaignService);

        result.Should().BeOfType<NoContent>();
        await _campaignService.Received(1).UpdateCampaignAsync(_userId, campaignId, Arg.Any<UpdatedCampaignData>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task UpdateCampaignHandler_WithNonExistentCampaign_ReturnsNotFound() {
        var context = CreateHttpContext(_userId);
        var campaignId = Guid.CreateVersion7();
        var request = new UpdateCampaignRequest { Name = "Updated Campaign" };
        var error = new Error("NotFound");
        _campaignService.UpdateCampaignAsync(_userId, campaignId, Arg.Any<UpdatedCampaignData>(), Arg.Any<CancellationToken>())
            .Returns(Result.Failure<Campaign>(null!, error));

        var result = await CampaignHandlers.UpdateCampaignHandler(context, campaignId, request, _campaignService);

        result.Should().BeOfType<NotFound>();
        await _campaignService.Received(1).UpdateCampaignAsync(_userId, campaignId, Arg.Any<UpdatedCampaignData>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task UpdateCampaignHandler_WithUnauthorizedAccess_ReturnsForbid() {
        var context = CreateHttpContext(_userId);
        var campaignId = Guid.CreateVersion7();
        var request = new UpdateCampaignRequest { Name = "Updated Campaign" };
        var error = new Error("NotAllowed");
        _campaignService.UpdateCampaignAsync(_userId, campaignId, Arg.Any<UpdatedCampaignData>(), Arg.Any<CancellationToken>())
            .Returns(Result.Failure<Campaign>(null!, error));

        var result = await CampaignHandlers.UpdateCampaignHandler(context, campaignId, request, _campaignService);

        result.Should().BeOfType<ForbidHttpResult>();
        await _campaignService.Received(1).UpdateCampaignAsync(_userId, campaignId, Arg.Any<UpdatedCampaignData>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task UpdateCampaignHandler_WithValidationErrors_ReturnsValidationProblem() {
        var context = CreateHttpContext(_userId);
        var campaignId = Guid.CreateVersion7();
        var request = new UpdateCampaignRequest { Name = "" };
        var error = new Error("Name", "Name is required");
        _campaignService.UpdateCampaignAsync(_userId, campaignId, Arg.Any<UpdatedCampaignData>(), Arg.Any<CancellationToken>())
            .Returns(Result.Failure<Campaign>(null!, error));

        var result = await CampaignHandlers.UpdateCampaignHandler(context, campaignId, request, _campaignService);

        result.Should().BeOfType<ProblemHttpResult>();
        await _campaignService.Received(1).UpdateCampaignAsync(_userId, campaignId, Arg.Any<UpdatedCampaignData>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task DeleteCampaignHandler_WithValidId_ReturnsNoContent() {
        var context = CreateHttpContext(_userId);
        var campaignId = Guid.CreateVersion7();
        _campaignService.DeleteCampaignAsync(_userId, campaignId, Arg.Any<CancellationToken>())
            .Returns(Result.Success());

        var result = await CampaignHandlers.DeleteCampaignHandler(context, campaignId, _campaignService);

        result.Should().BeOfType<NoContent>();
        await _campaignService.Received(1).DeleteCampaignAsync(_userId, campaignId, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task DeleteCampaignHandler_WithNonExistentCampaign_ReturnsNotFound() {
        var context = CreateHttpContext(_userId);
        var campaignId = Guid.CreateVersion7();
        var error = new Error("NotFound");
        _campaignService.DeleteCampaignAsync(_userId, campaignId, Arg.Any<CancellationToken>())
            .Returns(Result.Failure(error));

        var result = await CampaignHandlers.DeleteCampaignHandler(context, campaignId, _campaignService);

        result.Should().BeOfType<NotFound>();
        await _campaignService.Received(1).DeleteCampaignAsync(_userId, campaignId, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task DeleteCampaignHandler_WithUnauthorizedAccess_ReturnsForbid() {
        var context = CreateHttpContext(_userId);
        var campaignId = Guid.CreateVersion7();
        var error = new Error("NotAllowed");
        _campaignService.DeleteCampaignAsync(_userId, campaignId, Arg.Any<CancellationToken>())
            .Returns(Result.Failure(error));

        var result = await CampaignHandlers.DeleteCampaignHandler(context, campaignId, _campaignService);

        result.Should().BeOfType<ForbidHttpResult>();
        await _campaignService.Received(1).DeleteCampaignAsync(_userId, campaignId, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task DeleteCampaignHandler_WithValidationErrors_ReturnsValidationProblem() {
        var context = CreateHttpContext(_userId);
        var campaignId = Guid.CreateVersion7();
        var error = new Error("Campaign", "Campaign has dependencies");
        _campaignService.DeleteCampaignAsync(_userId, campaignId, Arg.Any<CancellationToken>())
            .Returns(Result.Failure(error));

        var result = await CampaignHandlers.DeleteCampaignHandler(context, campaignId, _campaignService);

        result.Should().BeOfType<ProblemHttpResult>();
        await _campaignService.Received(1).DeleteCampaignAsync(_userId, campaignId, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task GetAdventuresHandler_WithOwner_ReturnsAdventures() {
        var context = CreateHttpContext(_userId);
        var campaignId = Guid.CreateVersion7();
        var campaign = new Campaign {
            Id = campaignId,
            Name = "Campaign",
            OwnerId = _userId,
            IsPublished = false,
            IsPublic = false,
        };
        var adventures = new[] {
            new Adventure { Id = Guid.CreateVersion7(), Name = "Adventure 1" },
            new Adventure { Id = Guid.CreateVersion7(), Name = "Adventure 2" },
        };
        _campaignService.GetCampaignByIdAsync(campaignId, Arg.Any<CancellationToken>())
            .Returns(campaign);
        _campaignService.GetAdventuresAsync(campaignId, Arg.Any<CancellationToken>())
            .Returns(adventures);

        var result = await CampaignHandlers.GetAdventuresHandler(context, campaignId, _campaignService);

        var okResult = result.Should().BeOfType<Ok<Adventure[]>>().Subject;
        okResult.Value.Should().BeEquivalentTo(adventures);
        await _campaignService.Received(1).GetCampaignByIdAsync(campaignId, Arg.Any<CancellationToken>());
        await _campaignService.Received(1).GetAdventuresAsync(campaignId, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task GetAdventuresHandler_WithPublicCampaign_ReturnsAdventures() {
        var context = CreateHttpContext(_userId);
        var campaignId = Guid.CreateVersion7();
        var otherUserId = Guid.CreateVersion7();
        var campaign = new Campaign {
            Id = campaignId,
            Name = "Campaign",
            OwnerId = otherUserId,
            IsPublished = true,
            IsPublic = true,
        };
        var adventures = new[] {
            new Adventure { Id = Guid.CreateVersion7(), Name = "Adventure 1" },
        };
        _campaignService.GetCampaignByIdAsync(campaignId, Arg.Any<CancellationToken>())
            .Returns(campaign);
        _campaignService.GetAdventuresAsync(campaignId, Arg.Any<CancellationToken>())
            .Returns(adventures);

        var result = await CampaignHandlers.GetAdventuresHandler(context, campaignId, _campaignService);

        var okResult = result.Should().BeOfType<Ok<Adventure[]>>().Subject;
        okResult.Value.Should().BeEquivalentTo(adventures);
    }

    [Fact]
    public async Task GetAdventuresHandler_WithNonExistentCampaign_ReturnsNotFound() {
        var context = CreateHttpContext(_userId);
        var campaignId = Guid.CreateVersion7();
        _campaignService.GetCampaignByIdAsync(campaignId, Arg.Any<CancellationToken>())
            .Returns((Campaign?)null);

        var result = await CampaignHandlers.GetAdventuresHandler(context, campaignId, _campaignService);

        result.Should().BeOfType<NotFound>();
        await _campaignService.Received(1).GetCampaignByIdAsync(campaignId, Arg.Any<CancellationToken>());
        await _campaignService.DidNotReceive().GetAdventuresAsync(Arg.Any<Guid>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task GetAdventuresHandler_WithUnauthorizedAccess_ReturnsForbid() {
        var context = CreateHttpContext(_userId);
        var campaignId = Guid.CreateVersion7();
        var otherUserId = Guid.CreateVersion7();
        var campaign = new Campaign {
            Id = campaignId,
            Name = "Campaign",
            OwnerId = otherUserId,
            IsPublished = false,
            IsPublic = false,
        };
        _campaignService.GetCampaignByIdAsync(campaignId, Arg.Any<CancellationToken>())
            .Returns(campaign);

        var result = await CampaignHandlers.GetAdventuresHandler(context, campaignId, _campaignService);

        result.Should().BeOfType<ForbidHttpResult>();
        await _campaignService.DidNotReceive().GetAdventuresAsync(Arg.Any<Guid>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task AddNewAdventureHandler_WithValidId_ReturnsOk() {
        var context = CreateHttpContext(_userId);
        var campaignId = Guid.CreateVersion7();
        var adventure = new Adventure {
            Id = Guid.CreateVersion7(),
            Name = "New Adventure",
            OwnerId = _userId,
        };
        _campaignService.AddNewAdventureAsync(_userId, campaignId, Arg.Any<CancellationToken>())
            .Returns(Result.Success(adventure));

        var result = await CampaignHandlers.AddNewAdventureHandler(context, campaignId, _campaignService);

        var okResult = result.Should().BeOfType<Ok<Adventure>>().Subject;
        okResult.Value.Should().BeEquivalentTo(adventure);
        await _campaignService.Received(1).AddNewAdventureAsync(_userId, campaignId, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task AddNewAdventureHandler_WithNonExistentCampaign_ReturnsNotFound() {
        var context = CreateHttpContext(_userId);
        var campaignId = Guid.CreateVersion7();
        var error = new Error("NotFound");
        _campaignService.AddNewAdventureAsync(_userId, campaignId, Arg.Any<CancellationToken>())
            .Returns(Result.Failure<Adventure>(null!, error));

        var result = await CampaignHandlers.AddNewAdventureHandler(context, campaignId, _campaignService);

        result.Should().BeOfType<NotFound>();
    }

    [Fact]
    public async Task AddNewAdventureHandler_WithUnauthorizedAccess_ReturnsForbid() {
        var context = CreateHttpContext(_userId);
        var campaignId = Guid.CreateVersion7();
        var error = new Error("NotAllowed");
        _campaignService.AddNewAdventureAsync(_userId, campaignId, Arg.Any<CancellationToken>())
            .Returns(Result.Failure<Adventure>(null!, error));

        var result = await CampaignHandlers.AddNewAdventureHandler(context, campaignId, _campaignService);

        result.Should().BeOfType<ForbidHttpResult>();
    }

    [Fact]
    public async Task AddClonedAdventureHandler_WithValidIds_ReturnsOk() {
        var context = CreateHttpContext(_userId);
        var campaignId = Guid.CreateVersion7();
        var adventureId = Guid.CreateVersion7();
        var clonedAdventure = new Adventure {
            Id = Guid.CreateVersion7(),
            Name = "Adventure (Copy)",
            OwnerId = _userId,
        };
        _campaignService.AddClonedAdventureAsync(_userId, campaignId, adventureId, Arg.Any<CancellationToken>())
            .Returns(Result.Success(clonedAdventure));

        var result = await CampaignHandlers.AddClonedAdventureHandler(context, campaignId, adventureId, _campaignService);

        var okResult = result.Should().BeOfType<Ok<Adventure>>().Subject;
        okResult.Value.Should().BeEquivalentTo(clonedAdventure);
        await _campaignService.Received(1).AddClonedAdventureAsync(_userId, campaignId, adventureId, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task AddClonedAdventureHandler_WithNonExistentCampaign_ReturnsNotFound() {
        var context = CreateHttpContext(_userId);
        var campaignId = Guid.CreateVersion7();
        var adventureId = Guid.CreateVersion7();
        var error = new Error("NotFound");
        _campaignService.AddClonedAdventureAsync(_userId, campaignId, adventureId, Arg.Any<CancellationToken>())
            .Returns(Result.Failure<Adventure>(null!, error));

        var result = await CampaignHandlers.AddClonedAdventureHandler(context, campaignId, adventureId, _campaignService);

        result.Should().BeOfType<NotFound>();
    }

    [Fact]
    public async Task AddClonedAdventureHandler_WithUnauthorizedAccess_ReturnsForbid() {
        var context = CreateHttpContext(_userId);
        var campaignId = Guid.CreateVersion7();
        var adventureId = Guid.CreateVersion7();
        var error = new Error("NotAllowed");
        _campaignService.AddClonedAdventureAsync(_userId, campaignId, adventureId, Arg.Any<CancellationToken>())
            .Returns(Result.Failure<Adventure>(null!, error));

        var result = await CampaignHandlers.AddClonedAdventureHandler(context, campaignId, adventureId, _campaignService);

        result.Should().BeOfType<ForbidHttpResult>();
    }

    [Fact]
    public async Task RemoveAdventureHandler_WithValidIds_ReturnsNoContent() {
        var context = CreateHttpContext(_userId);
        var campaignId = Guid.CreateVersion7();
        var adventureId = Guid.CreateVersion7();
        _campaignService.RemoveAdventureAsync(_userId, campaignId, adventureId, Arg.Any<CancellationToken>())
            .Returns(Result.Success());

        var result = await CampaignHandlers.RemoveAdventureHandler(context, campaignId, adventureId, _campaignService);

        result.Should().BeOfType<NoContent>();
        await _campaignService.Received(1).RemoveAdventureAsync(_userId, campaignId, adventureId, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task RemoveAdventureHandler_WithNonExistentCampaign_ReturnsNotFound() {
        var context = CreateHttpContext(_userId);
        var campaignId = Guid.CreateVersion7();
        var adventureId = Guid.CreateVersion7();
        var error = new Error("NotFound");
        _campaignService.RemoveAdventureAsync(_userId, campaignId, adventureId, Arg.Any<CancellationToken>())
            .Returns(Result.Failure(error));

        var result = await CampaignHandlers.RemoveAdventureHandler(context, campaignId, adventureId, _campaignService);

        result.Should().BeOfType<NotFound>();
    }

    [Fact]
    public async Task RemoveAdventureHandler_WithUnauthorizedAccess_ReturnsForbid() {
        var context = CreateHttpContext(_userId);
        var campaignId = Guid.CreateVersion7();
        var adventureId = Guid.CreateVersion7();
        var error = new Error("NotAllowed");
        _campaignService.RemoveAdventureAsync(_userId, campaignId, adventureId, Arg.Any<CancellationToken>())
            .Returns(Result.Failure(error));

        var result = await CampaignHandlers.RemoveAdventureHandler(context, campaignId, adventureId, _campaignService);

        result.Should().BeOfType<ForbidHttpResult>();
    }
}