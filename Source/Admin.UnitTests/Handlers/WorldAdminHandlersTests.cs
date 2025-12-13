using VttTools.Admin.Library.Handlers;

namespace VttTools.Admin.UnitTests.Handlers;

public sealed class WorldAdminHandlersTests {
    private readonly IWorldAdminService _mockService;

    public WorldAdminHandlersTests() {
        _mockService = Substitute.For<IWorldAdminService>();
    }

    private static LibraryContentResponse CreateLibraryContentResponse(Guid? id = null, string name = "Test", string description = "Test Description")
        => new() {
            Id = id ?? Guid.CreateVersion7(),
            OwnerId = Guid.CreateVersion7(),
            Name = name,
            Description = description,
            IsPublished = false,
            IsPublic = false,
            CreatedAt = DateTime.UtcNow
        };

    #region SearchHandler Tests

    [Fact]
    public async Task SearchHandler_WithValidRequest_ReturnsOk() {
        var request = new LibrarySearchRequest { Skip = 0, Take = 10 };
        var response = new LibraryContentSearchResponse { Content = [], TotalCount = 0, HasMore = false };

        _mockService.SearchWorldsAsync(Arg.Any<LibrarySearchRequest>(), Arg.Any<CancellationToken>())
            .Returns(response);

        var result = await WorldAdminHandlers.SearchHandler(
            request, _mockService, TestContext.Current.CancellationToken);

        result.Should().BeOfType<Ok<LibraryContentSearchResponse>>();
    }

    [Fact]
    public async Task SearchHandler_WhenExceptionThrown_ReturnsProblem() {
        var request = new LibrarySearchRequest { Skip = 0, Take = 10 };

        _mockService.SearchWorldsAsync(Arg.Any<LibrarySearchRequest>(), Arg.Any<CancellationToken>())
            .ThrowsAsync(new Exception("Test exception"));

        var result = await WorldAdminHandlers.SearchHandler(
            request, _mockService, TestContext.Current.CancellationToken);

        result.Should().BeOfType<ProblemHttpResult>();
    }

    #endregion

    #region GetByIdHandler Tests

    [Fact]
    public async Task GetByIdHandler_WithValidId_ReturnsOk() {
        var id = Guid.CreateVersion7();
        var response = CreateLibraryContentResponse(id, "Test World");

        _mockService.GetWorldByIdAsync(id, Arg.Any<CancellationToken>())
            .Returns(response);

        var result = await WorldAdminHandlers.GetByIdHandler(
            id, _mockService, TestContext.Current.CancellationToken);

        result.Should().BeOfType<Ok<LibraryContentResponse>>();
    }

    [Fact]
    public async Task GetByIdHandler_WhenWorldNotFound_ReturnsNotFound() {
        var id = Guid.CreateVersion7();

        _mockService.GetWorldByIdAsync(id, Arg.Any<CancellationToken>())
            .Returns((LibraryContentResponse?)null);

        var result = await WorldAdminHandlers.GetByIdHandler(
            id, _mockService, TestContext.Current.CancellationToken);

        result.Should().BeOfType<NotFound>();
    }

    [Fact]
    public async Task GetByIdHandler_WhenExceptionThrown_ReturnsProblem() {
        var id = Guid.CreateVersion7();

        _mockService.GetWorldByIdAsync(id, Arg.Any<CancellationToken>())
            .ThrowsAsync(new Exception("Test exception"));

        var result = await WorldAdminHandlers.GetByIdHandler(
            id, _mockService, TestContext.Current.CancellationToken);

        result.Should().BeOfType<ProblemHttpResult>();
    }

    #endregion

    #region CreateHandler Tests

    [Fact]
    public async Task CreateHandler_WithValidRequest_ReturnsCreated() {
        var request = new LibraryAdminHandlers.CreateContentRequest {
            Name = "New World",
            Description = "World Description"
        };
        var response = CreateLibraryContentResponse(name: request.Name, description: request.Description);

        _mockService.CreateWorldAsync(request.Name, request.Description, Arg.Any<CancellationToken>())
            .Returns(response);

        var result = await WorldAdminHandlers.CreateHandler(
            request, _mockService, TestContext.Current.CancellationToken);

        result.Should().BeOfType<Created<LibraryContentResponse>>();
        var createdResult = (Created<LibraryContentResponse>)result;
        createdResult.Location.Should().Contain(response.Id.ToString());
    }

    [Fact]
    public async Task CreateHandler_WithInvalidData_ReturnsBadRequest() {
        var request = new LibraryAdminHandlers.CreateContentRequest {
            Name = "",
            Description = ""
        };

        _mockService.CreateWorldAsync(request.Name, request.Description, Arg.Any<CancellationToken>())
            .ThrowsAsync(new ArgumentException("Name is required"));

        var result = await WorldAdminHandlers.CreateHandler(
            request, _mockService, TestContext.Current.CancellationToken);

        result.Should().BeAssignableTo<IStatusCodeHttpResult>()
            .Which.StatusCode.Should().Be(StatusCodes.Status400BadRequest);
    }

    [Fact]
    public async Task CreateHandler_WhenExceptionThrown_ReturnsProblem() {
        var request = new LibraryAdminHandlers.CreateContentRequest {
            Name = "Test",
            Description = "Test"
        };

        _mockService.CreateWorldAsync(request.Name, request.Description, Arg.Any<CancellationToken>())
            .ThrowsAsync(new Exception("Test exception"));

        var result = await WorldAdminHandlers.CreateHandler(
            request, _mockService, TestContext.Current.CancellationToken);

        result.Should().BeOfType<ProblemHttpResult>();
    }

    #endregion

    #region UpdateHandler Tests

    [Fact]
    public async Task UpdateHandler_WithValidRequest_ReturnsOk() {
        var id = Guid.CreateVersion7();
        var request = new LibraryAdminHandlers.UpdateContentRequest {
            Name = "Updated World",
            Description = "Updated Description",
            IsPublished = true,
            IsPublic = false
        };
        var response = CreateLibraryContentResponse(id, request.Name!, request.Description!);

        _mockService.UpdateWorldAsync(
            id, request.Name, request.Description, request.IsPublished, request.IsPublic,
            Arg.Any<CancellationToken>())
            .Returns(response);

        var result = await WorldAdminHandlers.UpdateHandler(
            id, request, _mockService, TestContext.Current.CancellationToken);

        result.Should().BeOfType<Ok<LibraryContentResponse>>();
    }

    [Fact]
    public async Task UpdateHandler_WhenWorldNotFound_ReturnsNotFound() {
        var id = Guid.CreateVersion7();
        var request = new LibraryAdminHandlers.UpdateContentRequest {
            Name = "Updated World",
            Description = "Updated Description"
        };

        _mockService.UpdateWorldAsync(
            id, request.Name, request.Description, request.IsPublished, request.IsPublic,
            Arg.Any<CancellationToken>())
            .ThrowsAsync(new KeyNotFoundException());

        var result = await WorldAdminHandlers.UpdateHandler(
            id, request, _mockService, TestContext.Current.CancellationToken);

        result.Should().BeOfType<NotFound>();
    }

    [Fact]
    public async Task UpdateHandler_WhenExceptionThrown_ReturnsProblem() {
        var id = Guid.CreateVersion7();
        var request = new LibraryAdminHandlers.UpdateContentRequest {
            Name = "Updated World",
            Description = "Updated Description"
        };

        _mockService.UpdateWorldAsync(
            id, request.Name, request.Description, request.IsPublished, request.IsPublic,
            Arg.Any<CancellationToken>())
            .ThrowsAsync(new Exception("Test exception"));

        var result = await WorldAdminHandlers.UpdateHandler(
            id, request, _mockService, TestContext.Current.CancellationToken);

        result.Should().BeOfType<ProblemHttpResult>();
    }

    #endregion

    #region DeleteHandler Tests

    [Fact]
    public async Task DeleteHandler_WithValidId_ReturnsNoContent() {
        var id = Guid.CreateVersion7();

        _mockService.DeleteWorldAsync(id, Arg.Any<CancellationToken>())
            .Returns(Task.CompletedTask);

        var result = await WorldAdminHandlers.DeleteHandler(
            id, _mockService, TestContext.Current.CancellationToken);

        result.Should().BeOfType<NoContent>();
    }

    [Fact]
    public async Task DeleteHandler_WhenWorldNotFound_ReturnsNotFound() {
        var id = Guid.CreateVersion7();

        _mockService.DeleteWorldAsync(id, Arg.Any<CancellationToken>())
            .ThrowsAsync(new KeyNotFoundException());

        var result = await WorldAdminHandlers.DeleteHandler(
            id, _mockService, TestContext.Current.CancellationToken);

        result.Should().BeOfType<NotFound>();
    }

    [Fact]
    public async Task DeleteHandler_WhenExceptionThrown_ReturnsProblem() {
        var id = Guid.CreateVersion7();

        _mockService.DeleteWorldAsync(id, Arg.Any<CancellationToken>())
            .ThrowsAsync(new Exception("Test exception"));

        var result = await WorldAdminHandlers.DeleteHandler(
            id, _mockService, TestContext.Current.CancellationToken);

        result.Should().BeOfType<ProblemHttpResult>();
    }

    #endregion

    #region TransferOwnershipHandler Tests

    [Fact]
    public async Task TransferOwnershipHandler_WithValidRequest_ReturnsNoContent() {
        var id = Guid.CreateVersion7();
        var request = new TransferOwnershipRequest { Action = "grant", TargetUserId = Guid.CreateVersion7() };

        _mockService.TransferWorldOwnershipAsync(id, request, Arg.Any<CancellationToken>())
            .Returns(Task.CompletedTask);

        var result = await WorldAdminHandlers.TransferOwnershipHandler(
            id, request, _mockService, TestContext.Current.CancellationToken);

        result.Should().BeOfType<NoContent>();
    }

    [Fact]
    public async Task TransferOwnershipHandler_WhenWorldNotFound_ReturnsNotFound() {
        var id = Guid.CreateVersion7();
        var request = new TransferOwnershipRequest { Action = "grant", TargetUserId = Guid.CreateVersion7() };

        _mockService.TransferWorldOwnershipAsync(id, request, Arg.Any<CancellationToken>())
            .ThrowsAsync(new KeyNotFoundException());

        var result = await WorldAdminHandlers.TransferOwnershipHandler(
            id, request, _mockService, TestContext.Current.CancellationToken);

        result.Should().BeOfType<NotFound>();
    }

    [Fact]
    public async Task TransferOwnershipHandler_WithInvalidRequest_ReturnsBadRequest() {
        var id = Guid.CreateVersion7();
        var request = new TransferOwnershipRequest { Action = "invalid" };

        _mockService.TransferWorldOwnershipAsync(id, request, Arg.Any<CancellationToken>())
            .ThrowsAsync(new ArgumentException("Invalid owner ID"));

        var result = await WorldAdminHandlers.TransferOwnershipHandler(
            id, request, _mockService, TestContext.Current.CancellationToken);

        result.Should().BeAssignableTo<IStatusCodeHttpResult>()
            .Which.StatusCode.Should().Be(StatusCodes.Status400BadRequest);
    }

    #endregion

    #region GetCampaignsHandler Tests

    [Fact]
    public async Task GetCampaignsHandler_WithValidWorldId_ReturnsOk() {
        var id = Guid.CreateVersion7();
        var campaigns = new List<LibraryContentResponse> {
            CreateLibraryContentResponse(name: "Campaign 1"),
            CreateLibraryContentResponse(name: "Campaign 2")
        }.AsReadOnly();

        _mockService.GetCampaignsByWorldIdAsync(id, Arg.Any<CancellationToken>())
            .Returns(campaigns);

        var result = await WorldAdminHandlers.GetCampaignsHandler(
            id, _mockService, TestContext.Current.CancellationToken);

        result.Should().BeOfType<Ok<IReadOnlyList<LibraryContentResponse>>>();
        var okResult = (Ok<IReadOnlyList<LibraryContentResponse>>)result;
        okResult.Value.Should().HaveCount(2);
    }

    [Fact]
    public async Task GetCampaignsHandler_WhenExceptionThrown_ReturnsProblem() {
        var id = Guid.CreateVersion7();

        _mockService.GetCampaignsByWorldIdAsync(id, Arg.Any<CancellationToken>())
            .ThrowsAsync(new Exception("Test exception"));

        var result = await WorldAdminHandlers.GetCampaignsHandler(
            id, _mockService, TestContext.Current.CancellationToken);

        result.Should().BeOfType<ProblemHttpResult>();
    }

    #endregion

    #region CreateCampaignHandler Tests

    [Fact]
    public async Task CreateCampaignHandler_WithValidRequest_ReturnsCreated() {
        var worldId = Guid.CreateVersion7();
        var request = new LibraryAdminHandlers.CreateContentRequest {
            Name = "New Campaign",
            Description = "Campaign Description"
        };
        var response = CreateLibraryContentResponse(name: request.Name, description: request.Description);

        _mockService.CreateCampaignForWorldAsync(
            worldId, request.Name, request.Description, Arg.Any<CancellationToken>())
            .Returns(response);

        var result = await WorldAdminHandlers.CreateCampaignHandler(
            worldId, request, _mockService, TestContext.Current.CancellationToken);

        result.Should().BeOfType<Created<LibraryContentResponse>>();
        var createdResult = (Created<LibraryContentResponse>)result;
        createdResult.Location.Should().Contain(worldId.ToString());
        createdResult.Location.Should().Contain(response.Id.ToString());
    }

    [Fact]
    public async Task CreateCampaignHandler_WhenWorldNotFound_ReturnsNotFound() {
        var worldId = Guid.CreateVersion7();
        var request = new LibraryAdminHandlers.CreateContentRequest {
            Name = "New Campaign",
            Description = "Campaign Description"
        };

        _mockService.CreateCampaignForWorldAsync(
            worldId, request.Name, request.Description, Arg.Any<CancellationToken>())
            .ThrowsAsync(new KeyNotFoundException());

        var result = await WorldAdminHandlers.CreateCampaignHandler(
            worldId, request, _mockService, TestContext.Current.CancellationToken);

        result.Should().BeOfType<NotFound>();
    }

    [Fact]
    public async Task CreateCampaignHandler_WithInvalidData_ReturnsBadRequest() {
        var worldId = Guid.CreateVersion7();
        var request = new LibraryAdminHandlers.CreateContentRequest {
            Name = "",
            Description = ""
        };

        _mockService.CreateCampaignForWorldAsync(
            worldId, request.Name, request.Description, Arg.Any<CancellationToken>())
            .ThrowsAsync(new ArgumentException("Name is required"));

        var result = await WorldAdminHandlers.CreateCampaignHandler(
            worldId, request, _mockService, TestContext.Current.CancellationToken);

        result.Should().BeAssignableTo<IStatusCodeHttpResult>()
            .Which.StatusCode.Should().Be(StatusCodes.Status400BadRequest);
    }

    #endregion

    #region CloneCampaignHandler Tests

    [Fact]
    public async Task CloneCampaignHandler_WithValidRequest_ReturnsCreated() {
        var worldId = Guid.CreateVersion7();
        var campaignId = Guid.CreateVersion7();
        var request = new WorldAdminHandlers.CloneCampaignRequest("Cloned Campaign");
        var response = CreateLibraryContentResponse(name: "Cloned Campaign", description: "Cloned Description");

        _mockService.CloneCampaignAsync(worldId, campaignId, request.Name, Arg.Any<CancellationToken>())
            .Returns(response);

        var result = await WorldAdminHandlers.CloneCampaignHandler(
            worldId, campaignId, request, _mockService, TestContext.Current.CancellationToken);

        result.Should().BeOfType<Created<LibraryContentResponse>>();
    }

    [Fact]
    public async Task CloneCampaignHandler_WithNullRequest_ReturnsCreated() {
        var worldId = Guid.CreateVersion7();
        var campaignId = Guid.CreateVersion7();
        var response = CreateLibraryContentResponse(name: "Cloned Campaign", description: "Cloned Description");

        _mockService.CloneCampaignAsync(worldId, campaignId, null, Arg.Any<CancellationToken>())
            .Returns(response);

        var result = await WorldAdminHandlers.CloneCampaignHandler(
            worldId, campaignId, null, _mockService, TestContext.Current.CancellationToken);

        result.Should().BeOfType<Created<LibraryContentResponse>>();
    }

    [Fact]
    public async Task CloneCampaignHandler_WhenCampaignNotFound_ReturnsNotFound() {
        var worldId = Guid.CreateVersion7();
        var campaignId = Guid.CreateVersion7();
        var request = new WorldAdminHandlers.CloneCampaignRequest("Cloned Campaign");

        _mockService.CloneCampaignAsync(worldId, campaignId, request.Name, Arg.Any<CancellationToken>())
            .ThrowsAsync(new KeyNotFoundException());

        var result = await WorldAdminHandlers.CloneCampaignHandler(
            worldId, campaignId, request, _mockService, TestContext.Current.CancellationToken);

        result.Should().BeOfType<NotFound>();
    }

    #endregion

    #region RemoveCampaignHandler Tests

    [Fact]
    public async Task RemoveCampaignHandler_WithValidIds_ReturnsNoContent() {
        var worldId = Guid.CreateVersion7();
        var campaignId = Guid.CreateVersion7();

        _mockService.RemoveCampaignFromWorldAsync(worldId, campaignId, Arg.Any<CancellationToken>())
            .Returns(Task.CompletedTask);

        var result = await WorldAdminHandlers.RemoveCampaignHandler(
            worldId, campaignId, _mockService, TestContext.Current.CancellationToken);

        result.Should().BeOfType<NoContent>();
    }

    [Fact]
    public async Task RemoveCampaignHandler_WhenCampaignNotFound_ReturnsNotFound() {
        var worldId = Guid.CreateVersion7();
        var campaignId = Guid.CreateVersion7();

        _mockService.RemoveCampaignFromWorldAsync(worldId, campaignId, Arg.Any<CancellationToken>())
            .ThrowsAsync(new KeyNotFoundException());

        var result = await WorldAdminHandlers.RemoveCampaignHandler(
            worldId, campaignId, _mockService, TestContext.Current.CancellationToken);

        result.Should().BeOfType<NotFound>();
    }

    [Fact]
    public async Task RemoveCampaignHandler_WhenExceptionThrown_ReturnsProblem() {
        var worldId = Guid.CreateVersion7();
        var campaignId = Guid.CreateVersion7();

        _mockService.RemoveCampaignFromWorldAsync(worldId, campaignId, Arg.Any<CancellationToken>())
            .ThrowsAsync(new Exception("Test exception"));

        var result = await WorldAdminHandlers.RemoveCampaignHandler(
            worldId, campaignId, _mockService, TestContext.Current.CancellationToken);

        result.Should().BeOfType<ProblemHttpResult>();
    }

    #endregion
}
